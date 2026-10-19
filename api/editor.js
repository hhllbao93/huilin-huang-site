import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import defaultContent from '../src/data/site-content.json' with { type: 'json' };

const filePath = 'src/data/site-content.json';
const sessionCookie = '__Host-site_editor';
const stateCookie = '__Host-site_editor_state';
const lifetime = 4 * 60 * 60;
function config() {
  const { EDITOR_CLIENT_ID: clientId, EDITOR_CLIENT_SECRET: clientSecret, EDITOR_SESSION_SECRET: secret, EDITOR_ORIGIN: origin, EDITOR_USERS: users } = process.env;
  if (!clientId || !clientSecret || !secret || secret.length < 32 || !origin || !users) return null;
  const url = new URL(origin);
  if (url.protocol !== 'https:' || url.origin !== origin) throw new Error('Invalid editor origin');
  const repo = process.env.EDITOR_REPOSITORY || 'hhllbao93/huilin-huang-site';
  const branch = process.env.EDITOR_BRANCH || 'main';
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error('Invalid repository');
  return { clientId, clientSecret, secret, origin, repo, branch, users: users.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean) };
}
function cookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').map((s) => s.trim().split(/=(.*)/s).slice(0, 2)).filter((pair) => pair.length === 2));
}
function cookie(name, value, age) { return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`; }
function seal(value, secret) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', createHash('sha256').update(secret).digest(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(value)), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64url');
}
function unseal(value, secret) {
  try {
    const bytes = Buffer.from(value || '', 'base64url');
    const decipher = createDecipheriv('aes-256-gcm', createHash('sha256').update(secret).digest(), bytes.subarray(0, 12));
    decipher.setAuthTag(bytes.subarray(12, 28));
    const result = JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString());
    return result.exp > Date.now() ? result : null;
  } catch { return null; }
}
function same(a, b) { return typeof a === 'string' && typeof b === 'string' && a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b)); }
function json(res, status, data) { return res.status(status).json(data); }
async function github(cfg, token, path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options, signal: AbortSignal.timeout(15000),
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', ...options.headers },
  });
  if (!response.ok) {
    const error = new Error(response.status === 409 || response.status === 422 ? 'Content changed or the branch is protected. Reload the editor before saving; ask the repository owner if the problem persists.' : 'GitHub could not complete the request. Check repository access and sign in again.');
    error.status = response.status === 409 || response.status === 422 ? 409 : 502;
    throw error;
  }
  return response.json();
}
async function authorize(cfg, token) {
  const user = await github(cfg, token, '/user');
  if (!cfg.users.includes(user.login.toLowerCase())) return null;
  const repo = await github(cfg, token, `/repos/${cfg.repo}`);
  return repo.permissions?.push ? user.login : null;
}
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  try {
    const cfg = config();
    const action = new URL(req.url, 'https://editor.invalid').searchParams.get('action');
    if (!cfg) return json(res, action === 'session' ? 200 : 503, action === 'session' ? { configured: false, authenticated: false } : { error: 'The editor needs one-time configuration.' });
    // A preview deployment must never accept production editor credentials.
    if (req.headers.host !== new URL(cfg.origin).host) return json(res, 403, { error: 'Open the editor on its configured website address.' });
    const expectedMethod = action === 'save' || action === 'logout' ? 'POST' : 'GET';
    if (req.method !== expectedMethod) { res.setHeader('Allow', expectedMethod); return json(res, 405, { error: 'Method not allowed.' }); }
    if (req.method === 'POST' && req.headers.origin !== cfg.origin) return json(res, 403, { error: 'Request origin rejected.' });
    const jar = cookies(req);
    if (action === 'login') {
      const state = randomBytes(32).toString('base64url');
      // PKCE protects the authorization-code exchange as well as the state cookie.
      const verifier = randomBytes(32).toString('base64url');
      const pending = seal({ state, verifier, exp: Date.now() + 10 * 60 * 1000 }, cfg.secret);
      res.setHeader('Set-Cookie', cookie(stateCookie, pending, 600));
      const url = new URL('https://github.com/login/oauth/authorize');
      url.search = new URLSearchParams({ client_id: cfg.clientId, redirect_uri: `${cfg.origin}/api/editor?action=callback`, scope: 'public_repo', state, code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: 'S256' }).toString();
      return res.redirect(302, url.toString());
    }
    if (action === 'callback') {
      const query = new URL(req.url, cfg.origin).searchParams;
      const pending = unseal(jar[stateCookie], cfg.secret);
      res.setHeader('Set-Cookie', cookie(stateCookie, '', 0));
      if (!pending || !same(query.get('state'), pending.state) || !query.get('code')) return res.redirect(302, '/?editor_error=signin');
      const exchange = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST', signal: AbortSignal.timeout(15000), headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: cfg.clientId, client_secret: cfg.clientSecret, code: query.get('code'), redirect_uri: `${cfg.origin}/api/editor?action=callback`, code_verifier: pending.verifier }),
      });
      const result = await exchange.json();
      if (!exchange.ok || !result.access_token || !await authorize(cfg, result.access_token)) return res.redirect(302, '/?editor_error=access');
      const session = seal({ token: result.access_token, exp: Date.now() + lifetime * 1000 }, cfg.secret);
      res.setHeader('Set-Cookie', [cookie(stateCookie, '', 0), cookie(sessionCookie, session, lifetime)]);
      return res.redirect(302, '/?edit=1');
    }
    const session = unseal(jar[sessionCookie], cfg.secret);
    if (action === 'session') return json(res, 200, { configured: true, authenticated: Boolean(session) });
    if (action === 'logout') { res.setHeader('Set-Cookie', cookie(sessionCookie, '', 0)); return json(res, 200, { ok: true }); }
    if (!session) return json(res, 401, { error: 'Please sign in to edit this website.' });
    if (!await authorize(cfg, session.token)) return json(res, 403, { error: 'This account is not allowed to edit this website.' });
    const endpoint = `/repos/${cfg.repo}/contents/${filePath}`;
    const current = await github(cfg, session.token, `${endpoint}?ref=${encodeURIComponent(cfg.branch)}`);
    const content = JSON.parse(Buffer.from(current.content, 'base64').toString('utf8'));
    if (action === 'content') return json(res, 200, { content, sha: current.sha });
    if (action !== 'save') return json(res, 404, { error: 'Unknown editor action.' });
    if (!req.headers['content-type']?.startsWith('application/json')) return json(res, 415, { error: 'JSON required.' });
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (Buffer.byteLength(JSON.stringify(body || {})) > 300000) return json(res, 413, { error: 'Too much text in one save.' });
    if (!body || body.sha !== current.sha) return json(res, 409, { error: 'Someone updated the website. Copy your changes, reload the editor, and try again.' });
    if (!body.changes || Array.isArray(body.changes) || typeof body.changes !== 'object' || !Object.keys(body.changes).length) return json(res, 400, { error: 'No text changes supplied.' });
    for (const [key, value] of Object.entries(body.changes)) {
      if (!Object.hasOwn(defaultContent, key) || !Object.hasOwn(content, key) || typeof value !== 'string' || value.length > 20000) return json(res, 400, { error: 'Only existing website text fields may be changed.' });
    }
    const updated = { ...content, ...body.changes };
    const saved = await github(cfg, session.token, endpoint, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ branch: cfg.branch, sha: current.sha, message: 'Update website text with visual editor', content: Buffer.from(JSON.stringify(updated, null, 2) + '\n').toString('base64') }),
    });
    return json(res, 200, { sha: saved.content.sha, commit: saved.commit.sha });
  } catch (error) { return json(res, error.status || 500, { error: error.status ? error.message : 'The editor could not complete the request. Please try again.' }); }
}
