import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createCipheriv, createHash, randomBytes } from 'node:crypto';
import handler from '../api/editor.js';
import initialContent from '../src/data/site-content.json' with { type: 'json' };
const originalFetch = globalThis.fetch;
const secret = 'test-secret-only-not-for-production-123456789';
Object.assign(process.env, { EDITOR_CLIENT_ID: 'test', EDITOR_CLIENT_SECRET: 'test', EDITOR_SESSION_SECRET: secret, EDITOR_ORIGIN: 'https://example.test', EDITOR_USERS: 'hhllbao93' });
function session(data = { token: 'private-test-token', exp: Date.now() + 60000 }) {
  const iv = randomBytes(12); const cipher = createCipheriv('aes-256-gcm', createHash('sha256').update(secret).digest(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data)), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64url');
}
async function request(action, { method = 'GET', body, authenticated = true, origin = 'https://example.test', cookie } = {}) {
  const headers = { host: 'example.test', origin, 'content-type': 'application/json' };
  if (authenticated) headers.cookie = `__Host-site_editor=${cookie || session()}`;
  const req = { url: `/api/editor?action=${action}`, method, headers, body };
  const res = { headers: {}, statusCode: 200, setHeader(k,v) { this.headers[k] = v; }, status(c) { this.statusCode = c; return this; }, json(v) { this.body = v; return this; }, redirect(c,v) { this.statusCode=c;this.location=v;return this; } };
  await handler(req,res);return res;
}
function mockGitHub({ push = true, login = 'hhllbao93' } = {}) {
  const calls=[];
  globalThis.fetch=async (url,options={})=>{
    calls.push({url,options});
    let data;
    if(url.endsWith('/user'))data={login};
    else if(url.endsWith('/repos/hhllbao93/huilin-huang-site'))data={permissions:{push}};
    else if(options.method==='PUT')data={content:{sha:'new-sha'},commit:{sha:'commit-sha'}};
    else data={sha:'current-sha',content:Buffer.from(JSON.stringify(initialContent)).toString('base64')};
    return {ok:true,status:200,json:async()=>data};
  };return calls;
}
afterEach(()=>{globalThis.fetch=originalFetch;});
test('public visitor cannot read editor content or publish',async()=>{
  const calls=mockGitHub();assert.equal((await request('content',{authenticated:false})).statusCode,401);
  assert.equal((await request('save',{method:'POST',authenticated:false,body:{}})).statusCode,401);assert.equal(calls.length,0);
});
test('rejects cross-origin writes before contacting GitHub',async()=>{
  const calls=mockGitHub();assert.equal((await request('save',{method:'POST',origin:'https://attacker.test'})).statusCode,403);assert.equal(calls.length,0);
});
test('rejects tampered or expired session cookies',async()=>{
  mockGitHub();assert.equal((await request('content',{cookie:'tampered'})).statusCode,401);
  assert.equal((await request('content',{cookie:session({token:'x',exp:1})})).statusCode,401);
});
test('requires both allowlisted account and repository write permission',async()=>{
  mockGitHub({login:'someone-else'});assert.equal((await request('content')).statusCode,403);
  mockGitHub({push:false});assert.equal((await request('content')).statusCode,403);
});
test('loads existing text and revision without exposing credentials',async()=>{
  mockGitHub();const r=await request('content');assert.equal(r.statusCode,200);assert.equal(r.body.sha,'current-sha');assert.deepEqual(r.body.content,initialContent);assert.ok(!JSON.stringify(r.body).includes('private-test-token'));
});
test('rejects stale revisions and unknown fields',async()=>{
  const calls=mockGitHub();
  assert.equal((await request('save',{method:'POST',body:{sha:'old',changes:{'Research.text004':'new'}}})).statusCode,409);
  assert.equal((await request('save',{method:'POST',body:{sha:'current-sha',changes:{'../../api/editor.js':'new'}}})).statusCode,400);
  assert.ok(!calls.some(c=>c.options.method==='PUT'));
});
test('publishes plain text only to the fixed content file and branch',async()=>{
  const calls=mockGitHub();const text='Quoted "text", <script>markup</script>, Unicode 火灾, and\nnew lines.';
  const r=await request('save',{method:'POST',body:{sha:'current-sha',changes:{'Research.text004':text}}});
  assert.equal(r.statusCode,200);const write=calls.find(c=>c.options.method==='PUT');assert.ok(write.url.endsWith('/contents/src/data/site-content.json'));
  const payload=JSON.parse(write.options.body);assert.equal(payload.branch,'main');assert.equal(payload.sha,'current-sha');
  const saved=JSON.parse(Buffer.from(payload.content,'base64'));assert.equal(saved['Research.text004'],text);assert.equal(Object.keys(saved).length,Object.keys(initialContent).length);
});
test('OAuth login uses expiring secure state, PKCE and canonical callback',async()=>{
  const r=await request('login',{authenticated:false});assert.equal(r.statusCode,302);const url=new URL(r.location);
  assert.equal(url.hostname,'github.com');assert.equal(url.searchParams.get('code_challenge_method'),'S256');
  assert.equal(url.searchParams.get('redirect_uri'),'https://example.test/api/editor?action=callback');
  assert.match(r.headers['Set-Cookie'],/HttpOnly; Secure; SameSite=Lax; Max-Age=600/);
});
test('OAuth callback without matching state cannot create a session',async()=>{
  const calls=mockGitHub();const r=await request('callback',{authenticated:false});assert.equal(r.statusCode,302);assert.equal(r.location,'/?editor_error=signin');assert.equal(calls.length,0);
});
