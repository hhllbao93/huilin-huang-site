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

test('paragraph deletion and font size are persistent settings without erasing text', async () => {
  const { readBlockSettings, withBlockSetting, withDeletedBlocksRestored } = await import('../src/editor/block-settings.js');
  const key = 'Research.Research.text004';
  const sized = withBlockSetting(initialContent, key, { size: 24 });
  const hidden = withBlockSetting(sized, key, { hidden: true });
  assert.deepEqual(readBlockSettings(hidden)[key], { size: 24, hidden: true });
  assert.equal(hidden['Research.text004'], initialContent['Research.text004']);
  const restored = withDeletedBlocksRestored(hidden);
  assert.deepEqual(readBlockSettings(restored)[key], { size: 24 });
  const reset = withBlockSetting(restored, key, { size: null });
  assert.equal(reset.__blockSettings, '{}');
  assert.equal(initialContent.__blockSettings, '{}');
});
test('save accepts known paragraph settings and rejects unknown blocks or arbitrary styles', async () => {
  const calls = mockGitHub();
  const settings = JSON.stringify({ 'Research.Research.text004': { hidden: true, size: 24 } });
  const saved = await request('save', { method: 'POST', body: { sha: 'current-sha', changes: { __blockSettings: settings } } });
  assert.equal(saved.statusCode, 200);
  const write = calls.find((call) => call.options.method === 'PUT');
  const content = JSON.parse(Buffer.from(JSON.parse(write.options.body).content, 'base64'));
  assert.equal(content.__blockSettings, settings);
  for (const invalid of [
    { 'not-a-real-block': { hidden: true } },
    { 'Research.Research.text004': { size: 9999 } },
    { 'Research.Research.text004': { style: 'position:fixed' } },
    { 'Research.Research.text004': { hidden: 'true' } },
    [],
  ]) {
    assert.equal((await request('save', { method: 'POST', body: { sha: 'current-sha', changes: { __blockSettings: JSON.stringify(invalid) } } })).statusCode, 400);
  }
});

test('formatting persists, resets independently, and preserves deleted state and original text', async () => {
  const { withBlockSetting, readBlockSettings, blockStyle } = await import('../src/editor/block-settings.js');
  const key = 'Research.Research.text004';
  const styled = withBlockSetting(initialContent, key, { color: '#AA0088', italic: true, width: 65, align: 'center', hidden: true });
  const settings = readBlockSettings(styled)[key];
  assert.equal(blockStyle(settings).fontStyle, 'italic');
  assert.equal(blockStyle(settings).width, '65%');
  assert.equal(blockStyle(settings).marginLeft, 'auto');
  assert.equal(styled['Research.text004'], initialContent['Research.text004']);
  const reset = withBlockSetting(styled, key, { color: null, italic: null, width: null, align: null });
  assert.deepEqual(readBlockSettings(reset)[key], { hidden: true });
});
test('reorder moves both directions, survives reload, preserves text and skips deleted paragraphs', async () => {
  const { withMovedBlock, orderedGroup, groupForBlock, withBlockSetting } = await import('../src/editor/block-settings.js');
  const from = 'Home.Home.text025'; const group = groupForBlock(from);
  const order = orderedGroup(initialContent, group); const to = order.at(-1);
  const moved = withMovedBlock(initialContent, group, from, to);
  assert.equal(orderedGroup(JSON.parse(JSON.stringify(moved)), group).at(-1), from);
  assert.deepEqual(orderedGroup(withMovedBlock(moved, group, from, order[1]), group), order);
  assert.equal(moved['Home.text025'], initialContent['Home.text025']);
  assert.throws(() => withMovedBlock(initialContent, group, from, 'Research.Research.text004'));
  assert.throws(() => withMovedBlock(withBlockSetting(initialContent, to, { hidden: true }), group, from, to));
});
test('API accepts formatting and rejects malformed layout, colors, and style injection', async () => {
  const { groupForBlock, orderedGroup } = await import('../src/editor/block-settings.js');
  const key = 'Research.Research.text004'; mockGitHub();
  const save = (settings) => request('save', { method: 'POST', body: { sha: 'current-sha', changes: { __blockSettings: JSON.stringify({ [key]: settings }) } } });
  assert.equal((await save({ color: '#336699', italic: true, width: 75, align: 'right', order: 0 })).statusCode, 200);
  for (const invalid of [{ color: 'red;position:fixed' }, { color: '#123' }, { italic: 'true' }, { width: -50 }, { width: 200 }, { align: 'fixed' }, { order: -1 }, { order: 1.5 }, { order: orderedGroup(initialContent, groupForBlock(key)).length }]) {
    assert.equal((await save(invalid)).statusCode, 400);
  }
});
test('layout manifest uses real, unique blocks and every group supports independent ordering', async () => {
  const { default: groups } = await import('../src/data/editable-groups.json', { with: { type: 'json' } });
  const { default: blocks } = await import('../src/data/editable-blocks.json', { with: { type: 'json' } });
  const seen = new Set();
  for (const keys of Object.values(groups)) {
    assert.ok(keys.length >= 2);
    for (const key of keys) { assert.ok(blocks.includes(key)); assert.ok(!seen.has(key)); seen.add(key); }
  }
});

test('selected-word color and italic leave surrounding words and block style unchanged', async () => {
  const { withInlineStyle, readInlineStyles, textSegments } = await import('../src/editor/inline-styles.js');
  const key = 'Home.text002'; const content = { ...initialContent, [key]: 'Understanding a changing climate' };
  const selected = [{ key, start: 16, end: 24 }];
  const colored = withInlineStyle(content, selected, { color: '#aa2244' });
  const italic = withInlineStyle(colored, selected, { italic: true });
  assert.equal(italic[key], content[key]); assert.equal(italic.__blockSettings, content.__blockSettings);
  assert.deepEqual(textSegments(italic[key], readInlineStyles(italic)[key]), [
    { text: 'Understanding a ' }, { text: 'changing', color: '#aa2244', italic: true }, { text: ' climate' },
  ]);
  assert.deepEqual(readInlineStyles(JSON.parse(JSON.stringify(italic))), readInlineStyles(italic));
});
test('overlapping selections retain other styles and clear only the selected characters', async () => {
  const { withInlineStyle, readInlineStyles } = await import('../src/editor/inline-styles.js');
  const key = 'Home.text002'; const content = { ...initialContent, [key]: 'abcdefghij' };
  const colored = withInlineStyle(content, [{ key, start: 1, end: 8 }], { color: '#123456' });
  const italic = withInlineStyle(colored, [{ key, start: 3, end: 10 }], { italic: true });
  const cleared = withInlineStyle(italic, [{ key, start: 4, end: 6 }], { color: null, italic: null });
  assert.deepEqual(readInlineStyles(cleared)[key], [
    { start: 1, end: 3, color: '#123456' }, { start: 3, end: 4, color: '#123456', italic: true },
    { start: 6, end: 8, color: '#123456', italic: true }, { start: 8, end: 10, italic: true },
  ]);
});
test('formatting spans multiple text fields and safely tracks insertion, replacement and deletion', async () => {
  const { withInlineStyle, withEditedText, readInlineStyles, validInlineStyles } = await import('../src/editor/inline-styles.js');
  const key = 'Home.text002'; const second = 'Home.text003';
  let content = { ...initialContent, [key]: 'abc def ghi', [second]: 'climate' };
  content = withInlineStyle(content, [{ key, start: 4, end: 7 }, { key: second, start: 0, end: 7 }], { color: '#abcdef' });
  content = withEditedText(content, key, 'XX abc def ghi');
  assert.deepEqual(readInlineStyles(content)[key], [{ start: 7, end: 10, color: '#abcdef' }]);
  content = withEditedText(content, key, 'XX abc dYf ghi');
  assert.deepEqual(readInlineStyles(content)[key], [{ start: 7, end: 10, color: '#abcdef' }]);
  content = withEditedText(content, key, 'XX abc  ghi');
  assert.equal(readInlineStyles(content)[key], undefined);
  assert.equal(readInlineStyles(content)[second][0].color, '#abcdef');
  assert.ok(validInlineStyles(content.__inlineStyles, content));
});
test('API saves inline styles without a migration and rejects HTML, unknown keys and invalid ranges', async () => {
  const key = 'Home.text002'; const calls = mockGitHub();
  const styles = JSON.stringify({ [key]: [{ start: 0, end: 2, color: '#112233', italic: true }] });
  const result = await request('save', { method: 'POST', body: { sha: 'current-sha', changes: { __inlineStyles: styles } } });
  assert.equal(result.statusCode, 200);
  const write = calls.find((c) => c.options.method === 'PUT');
  const saved = JSON.parse(Buffer.from(JSON.parse(write.options.body).content, 'base64'));
  assert.equal(saved.__inlineStyles, styles);
  const invalid = [
    { unknown: [{ start: 0, end: 1, color: '#112233' }] },
    { [key]: [{ start: -1, end: 1, italic: true }] },
    { [key]: [{ start: 0, end: initialContent[key].length + 1, italic: true }] },
    { [key]: [{ start: 0, end: 1, color: '<script>' }] },
    { [key]: [{ start: 0, end: 1, style: 'position:fixed' }] },
    { [key]: [{ start: 0, end: 2, italic: true }, { start: 1, end: 3, italic: false }] },
    { [key]: [{ start: 0, end: 1, italic: 'true' }] },
    [],
  ];
  for (const value of invalid) assert.equal((await request('save', { method: 'POST', body: { sha: 'current-sha', changes: { __inlineStyles: JSON.stringify(value) } } })).statusCode, 400);
  // A text update that invalidates previously valid ranges must not be published.
  assert.equal((await request('save', { method: 'POST', body: { sha: 'current-sha', changes: { __inlineStyles: styles, [key]: '' } } })).statusCode, 400);
});
