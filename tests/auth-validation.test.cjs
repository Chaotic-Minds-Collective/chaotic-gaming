const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { NextRequest } = require('next/server');
const { renderToStaticMarkup } = require('react-dom/server');
const { createHash } = require('node:crypto');

// Compile the actual server modules with isolated provider and cookie fixtures.
function load(file, mocks = {}, globals = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(code, {
    module, exports: module.exports,
    require: (name) => name in mocks ? mocks[name] : require(name),
    Buffer, URL, Headers, Response, AbortSignal, process, ...globals,
  }, { filename: file });
  return module.exports;
}
const cookieMock = (values) => ({ cookies: async () => ({ get: (name) => values[name] ? { value: values[name] } : undefined }) });
const core = load('lib/core-api.ts', { 'server-only': {} });
const authRequest = load('lib/auth-request.ts');
const request = (headers = {}, body = '{}') => new NextRequest('https://site.test/api/auth/login', {
  method: 'POST', headers, body,
});

test('login and registration reject unsafe requests before reading credentials or contacting Core', async () => {
  for (const route of ['login', 'register']) {
    let calls = 0;
    const { POST } = load(`app/api/auth/${route}/route.ts`, {
      '@/lib/auth-request': authRequest,
      '@/lib/core-api': { ...core, coreApiFetch: async () => { calls++; return Response.json({ data: { session: { token: 'synthetic' } } }); } },
    });
    for (const [headers, status] of [
      [{ origin: 'https://attacker.test', 'content-type': 'application/json' }, 403],
      [{ origin: 'null', 'content-type': 'application/json' }, 403],
      [{ 'sec-fetch-site': 'cross-site', 'content-type': 'application/json' }, 403],
      [{ 'content-type': 'text/plain' }, 415],
      [{ 'content-type': 'application/x-www-form-urlencoded' }, 415],
    ]) {
      const req = request(headers);
      req.json = () => { throw Error('credentials must not be read'); };
      const result = await POST(req);
      assert.equal(result.status, status);
      assert.equal(result.cookies.get('cg_session'), undefined);
    }
    assert.equal(calls, 0);
    const result = await POST(request({ origin: 'https://site.test', 'content-type': 'application/json; charset=utf-8' }));
    assert.equal(result.status, 200);
    assert.equal(result.cookies.get('cg_session').value, 'synthetic');
    assert.equal(calls, 1);
  }
});

test('Core requests reject redirects even when a caller asks to follow them', async () => {
  let options;
  const client = load('lib/core-api.ts', { 'server-only': {} }, {
    process: { env: { CORE_API_BASE_URL: 'https://core.test' } },
    fetch: async (_url, init) => { options = init; return new Response(); },
  });
  await client.coreApiFetch('/auth/login', { method: 'POST', body: 'credentials', redirect: 'follow' });
  assert.equal(options.redirect, 'error');
  assert.equal(options.cache, 'no-store');
});

test('me and entitlements expose invalid JSON as 502 and preserve valid upstream statuses', async () => {
  for (const file of ['auth/me', 'account/entitlements']) {
    for (const [text, upstreamStatus, expected] of [['<html>', 200, 502], ['{"data":[]}', 200, 200], ['{"error":{"code":"DENIED"}}', 403, 403]]) {
      const { GET } = load(`app/api/${file}/route.ts`, {
        'next/headers': cookieMock({ cg_session: 'synthetic' }),
        '@/lib/core-api': { ...core, coreApiFetch: async () => new Response(text, { status: upstreamStatus }) },
      });
      const result = await GET();
      assert.equal(result.status, expected);
      assert.deepEqual(await result.json(), expected === 502 ? { error: { code: 'INVALID_CORE_RESPONSE', message: 'The account service returned an invalid response.' } } : JSON.parse(text));
    }
  }
});

test('logout always expires the browser session and warns when Core revocation is unconfirmed', async () => {
  for (const outcome of [200, 204, 400, 401, 403, 429, 500, 503, 'unreachable', 'no-cookie']) {
    const calls = [];
    const { POST } = load('app/api/auth/logout/route.ts', {
      'next/headers': cookieMock(outcome === 'no-cookie' ? {} : { cg_session: 'synthetic' }),
      '@/lib/core-api': { coreApiFetch: async (url, init, token) => {
        calls.push([url, init.method, token]);
        if (outcome === 'unreachable') throw Error('timeout');
        return new Response(null, { status: outcome });
      } },
    });
    const result = await POST(request());
    const unconfirmed = [400, 403, 429, 500, 503, 'unreachable'].includes(outcome);
    assert.equal(result.status, 303);
    assert.equal(result.headers.get('location'), unconfirmed ? 'https://site.test/account?logout=unconfirmed' : 'https://site.test/account');
    const cookie = result.cookies.get('cg_session');
    assert.equal(cookie.maxAge, 0);
    assert.equal(cookie.value, '');
    assert.equal(cookie.path, '/');
    assert.equal(cookie.httpOnly, true);
    assert.equal(cookie.sameSite, 'lax');
    assert.deepEqual(calls, outcome === 'no-cookie' ? [] : [['/auth/logout', 'POST', 'synthetic']]);
  }
});

const pageMocks = (fetch, values = {}) => ({
  '@/lib/core-api': { ...core, coreApiFetch: fetch },
  'next/headers': cookieMock(values),
  'next/link': ({ href, children, ...props }) => require('react').createElement('a', { href, ...props }, children),
});
test('list pages distinguish malformed data from valid empty arrays', async () => {
  for (const [page, empty] of [['servers', 'No public servers'], ['store', 'catalog is being prepared'], ['mods', 'catalogue is being built']]) {
    for (const data of [undefined, {}, 'invalid', []]) {
      const Page = load(`app/${page}/page.tsx`, pageMocks(async () => Response.json({ data }))).default;
      const html = renderToStaticMarkup(await Page());
      assert.equal(html.includes('unavailable'), !Array.isArray(data));
      assert.equal(html.includes(empty), Array.isArray(data));
    }
  }
});

test('account shows the unconfirmed logout notice only for the explicit outcome', async () => {
  for (const logout of [undefined, 'unconfirmed', 'other', ['unconfirmed']]) {
    const Page = load('app/account/page.tsx', pageMocks(async () => { throw Error('Core must not be called without a session'); })).default;
    const html = renderToStaticMarkup(await Page({ searchParams: Promise.resolve({ logout }) }));
    assert.equal(html.includes('could not confirm session revocation'), logout === 'unconfirmed');
    assert.equal(html.includes('may still be active elsewhere'), logout === 'unconfirmed');
    assert.match(html, /Sign in or create an account/);
  }
});

test('account outages retain sign out and retry; malformed arrays are unavailable; Steam verification reflects verifiedAt', async () => {
  const render = async (fetch) => renderToStaticMarkup(await load('app/account/page.tsx', pageMocks(fetch, { cg_session: 'synthetic' })).default({ searchParams: Promise.resolve({}) }));
  const outage = await render(async () => { throw Error('timeout'); });
  assert.match(outage, /temporarily unavailable/);
  assert.match(outage, /Retry/);
  assert.match(outage, /Sign out/);
  assert.doesNotMatch(outage, /Sign in or create/);
  const unauthenticated = await render(async (url) => url === '/auth/me' ? new Response(null, { status: 401 }) : new Response(null, { status: 503 }));
  assert.match(unauthenticated, /Your session has expired/);
  assert.match(unauthenticated, /Sign in/);
  assert.match(unauthenticated, /Create account/);
  assert.match(unauthenticated, /Sign out/);
  const profile = { data: { username: 'player', status: 'active' } };
  const malformed = await render(async (url) => Response.json(url === '/auth/me' ? profile : { data: {} }));
  assert.match(malformed, /entitlements are temporarily unavailable/);
  assert.match(malformed, /Linked account information is temporarily unavailable/);
  for (const verifiedAt of [null, '2026-01-01']) {
    const html = await render(async (url) => Response.json(url === '/auth/me' ? profile : { data: url === '/auth/linked-accounts' ? [{ provider: 'steam', externalId: 'synthetic', verifiedAt }] : [] }));
    assert.match(html, verifiedAt === null ? /PENDING/ : /VERIFIED/);
    assert.match(html, /do not have any active items/);
  }
});

test('Steam callback rejects unequal UTF-8 byte lengths safely and accepts cancellation without return_to', async () => {
  const binding = createHash('sha256').update('synthetic').digest('hex');
  for (const [state, stored, expected] of [['é', 'a', 'state-error'], ['a', 'é', 'state-error'], ['abc', 'abc', 'cancelled']]) {
    const { GET } = load('app/api/account/link/steam/callback/route.ts', {
      'next/headers': cookieMock({ cg_session: 'synthetic', cg_steam_link_state: `${stored}.${binding}` }),
      '@/lib/core-api': { coreApiFetch: () => { throw Error('must not contact Core'); } },
    }, { process: { env: { STEAM_OPENID_RETURN_URL: 'https://site.test/api/account/link/steam/callback' } } });
    const result = await GET(new NextRequest(`https://site.test/api/account/link/steam/callback?state=${encodeURIComponent(state)}&openid.mode=cancel`));
    assert.equal(new URL(result.headers.get('location')).searchParams.get('steam'), expected);
    assert.equal(result.cookies.get('cg_steam_link_state').value, '');
  }
});
