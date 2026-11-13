const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Next's server testing entry point expects the runtime's AsyncLocalStorage.
globalThis.AsyncLocalStorage = require('node:async_hooks').AsyncLocalStorage;
const { unstable_doesMiddlewareMatch } = require('next/experimental/testing/server');
const proxyModule = { exports: {} };
const code = ts.transpileModule(
  fs.readFileSync(path.join(__dirname, '..', 'proxy.ts'), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;
vm.runInNewContext(code, { module: proxyModule, exports: proxyModule.exports, require });

test('CSP covers document and lookalike paths while excluding framework assets', () => {
  for (const pathname of [
    '/', '/events', '/missing', '/faviconXico', '/favicon.ico-extra',
    '/favicon.ico/extra', '/_next/static-extra', '/_next/image-extra',
  ]) {
    assert.equal(unstable_doesMiddlewareMatch({
      config: proxyModule.exports.config, url: `https://site.test${pathname}`,
    }), true, pathname);
  }
  for (const pathname of [
    '/favicon.ico', '/favicon.ico?v=1', '/_next/static',
    '/_next/static/chunks/app.js', '/_next/image', '/_next/image?url=%2Fbadge.png&w=64&q=75',
  ]) {
    assert.equal(unstable_doesMiddlewareMatch({
      config: proxyModule.exports.config, url: `https://site.test${pathname}`,
    }), false, pathname);
  }
});
