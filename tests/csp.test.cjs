const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { webcrypto } = require('node:crypto');
const { NextRequest } = require('next/server');

function load(file, mocks = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    require: (name) => Object.prototype.hasOwnProperty.call(mocks, name) ? mocks[name] : require(name),
    crypto: webcrypto,
    btoa,
    Uint8Array,
    Headers,
    Response,
    process,
  }, { filename: file });
  return module.exports;
}

test('production CSP uses a nonce and strict-dynamic without unsafe script sources', () => {
  const { buildCsp } = load('lib/csp.ts');
  const policy = buildCsp('unit-test-nonce', false);
  const scriptSrc = policy.split('; ').find((directive) => directive.startsWith('script-src '));
  assert.equal(scriptSrc, "script-src 'self' 'nonce-unit-test-nonce' 'strict-dynamic' https://va.vercel-scripts.com");
  assert.ok(!scriptSrc.includes("'unsafe-inline'"));
  assert.ok(!scriptSrc.includes("'unsafe-eval'"));
  for (const directive of [
    "default-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self' https://va.vercel-scripts.com",
    "frame-src 'self' https://discord.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ]) assert.ok(policy.includes(directive), `missing directive: ${directive}`);
});

test('development CSP adds unsafe-eval only to script-src', () => {
  const { buildCsp } = load('lib/csp.ts');
  const policy = buildCsp('dev-nonce', true);
  const scriptSrc = policy.split('; ').find((directive) => directive.startsWith('script-src '));
  assert.ok(scriptSrc.includes("'unsafe-eval'"));
  assert.ok(!scriptSrc.includes("'unsafe-inline'"));
});

test('proxy forwards its per-request nonce CSP and returns the same policy', () => {
  let forwardedHeaders;
  const nextServer = {
    NextResponse: {
      next({ request }) {
        forwardedHeaders = new Headers(request.headers);
        return new Response(null, { status: 200 });
      },
    },
  };
  const { proxy, config } = load('proxy.ts', {
    'next/server': nextServer,
    './lib/csp': load('lib/csp.ts'),
  });
  const request = new NextRequest('https://site.test/');
  const first = proxy(request);
  const firstPolicy = first.headers.get('Content-Security-Policy');
  assert.ok(firstPolicy);
  assert.equal(firstPolicy, forwardedHeaders.get('Content-Security-Policy'));
  const firstNonce = firstPolicy.match(/'nonce-([^']+)'/)[1];
  assert.match(firstNonce, /^[A-Za-z0-9+/]+=*$/);
  assert.equal(first.headers.get('x-nonce'), null);

  const second = proxy(request);
  const secondPolicy = second.headers.get('Content-Security-Policy');
  const secondNonce = secondPolicy.match(/'nonce-([^']+)'/)[1];
  assert.notEqual(firstNonce, secondNonce);
  assert.equal(secondPolicy, forwardedHeaders.get('Content-Security-Policy'));
  assert.equal(config.matcher[0].missing[0].key, 'next-router-prefetch');
  assert.equal(config.matcher[0].missing[1].type, 'header');
  assert.equal(config.matcher[0].missing[1].key, 'purpose');
  assert.equal(config.matcher[0].missing[1].value, 'prefetch');
  assert.ok(config.matcher[0].source.includes('_next/static'));
  assert.ok(config.matcher[0].source.includes('_next/image'));
  assert.ok(config.matcher[0].source.includes('favicon\\.ico'));
});
