// Tests for the vercel-claim CLI. Run with: node --test tools/vercel-claim/
// The HTTP layer is injected (fetchImpl), so NO test makes a live network call.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  run,
  EXIT,
  buildEndpoint,
  buildClaimUrl,
} from './claim.mjs';

// A sentinel token used to prove it is never echoed to stdout/stderr.
const TOKEN = 'SENTINEL_TOKEN_do_not_print_abc123';
const BASE_ENV = { VERCEL_TOKEN: TOKEN };

// Minimal Response-like object. Each response is only read once by the code,
// but json()/text() are independent here so test ordering never matters.
function mockResponse({ status = 200, body = undefined, json = undefined } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      if (json !== undefined) return json;
      if (typeof body === 'string') return JSON.parse(body);
      return body;
    },
    async text() {
      if (typeof body === 'string') return body;
      if (body === undefined) return '';
      return JSON.stringify(body);
    },
  };
}

// fetch spy: records every call; `handler` is either a response object or a
// function (which may throw to simulate a network failure).
function makeFetch(handler) {
  const calls = [];
  async function fetchImpl(url, options) {
    calls.push({ url: String(url), options });
    return typeof handler === 'function' ? handler(url, options) : handler;
  }
  fetchImpl.calls = calls;
  return fetchImpl;
}

function makeWriter() {
  const chunks = [];
  return {
    chunks,
    write(s) {
      chunks.push(String(s));
      return true;
    },
    text() {
      return chunks.join('');
    },
  };
}

async function invoke(argv, { env = BASE_ENV, fetchImpl } = {}) {
  const out = makeWriter();
  const err = makeWriter();
  const spy = fetchImpl ?? makeFetch(mockResponse({ json: { code: 'c' } }));
  const code = await run(argv, { env, fetchImpl: spy, stdout: out, stderr: err });
  return { code, out: out.text(), err: err.text(), calls: spy.calls };
}

// 1. Mocked 200 with a code → exact claim URL, exact request shape.
test('200 with code → exact claim URL + 24h note and correct request', async () => {
  const fetchImpl = makeFetch(mockResponse({ status: 200, json: { code: 'CODE-123' } }));
  const { code, out, calls } = await invoke(
    ['--project', 'my-proj', '--return-url', 'https://example.com/done'],
    { fetchImpl },
  );

  assert.equal(code, EXIT.SUCCESS);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.vercel.com/v9/projects/my-proj/transfer-request');
  assert.equal(calls[0].options.method, 'POST');
  assert.equal(calls[0].options.headers.Authorization, `Bearer ${TOKEN}`);
  assert.equal(calls[0].options.body, undefined); // no request body
  assert.ok(
    out.includes(
      'https://vercel.com/claim-deployment?code=CODE-123&returnUrl=https%3A%2F%2Fexample.com%2Fdone',
    ),
    out,
  );
  assert.match(out, /24 hours/);
});

// 2. --team present → query param included (teamId vs slug); absent/blank → omitted.
test('--team maps to teamId (team_*) or slug; omitted when absent/blank', async () => {
  let f = makeFetch(mockResponse({ json: { code: 'c' } }));
  let r = await invoke(['--project', 'p', '--team', 'team_abc'], { fetchImpl: f });
  assert.equal(r.calls[0].url, 'https://api.vercel.com/v9/projects/p/transfer-request?teamId=team_abc');

  f = makeFetch(mockResponse({ json: { code: 'c' } }));
  r = await invoke(['--project', 'p', '--team', 'my-team'], { fetchImpl: f });
  assert.equal(r.calls[0].url, 'https://api.vercel.com/v9/projects/p/transfer-request?slug=my-team');

  f = makeFetch(mockResponse({ json: { code: 'c' } }));
  r = await invoke(['--project', 'p'], { fetchImpl: f });
  assert.equal(r.calls[0].url, 'https://api.vercel.com/v9/projects/p/transfer-request');
  assert.ok(!r.calls[0].url.includes('teamId'));
  assert.ok(!r.calls[0].url.includes('slug'));

  f = makeFetch(mockResponse({ json: { code: 'c' } }));
  r = await invoke(['--project', 'p', '--team', '   '], { fetchImpl: f });
  assert.equal(r.calls[0].url, 'https://api.vercel.com/v9/projects/p/transfer-request');
});

// 3. --return-url URL-encoded into the claim URL; empty omitted.
test('--return-url is URL-encoded into the claim URL; empty omitted', async () => {
  const f = makeFetch(mockResponse({ json: { code: 'c' } }));
  const r = await invoke(['--project', 'p', '--return-url', 'https://x.com/a b?q=1&r=2'], { fetchImpl: f });
  assert.ok(
    r.out.includes(
      'https://vercel.com/claim-deployment?code=c&returnUrl=https%3A%2F%2Fx.com%2Fa+b%3Fq%3D1%26r%3D2',
    ),
    r.out,
  );

  const f2 = makeFetch(mockResponse({ json: { code: 'c' } }));
  const r2 = await invoke(['--project', 'p', '--return-url', ''], { fetchImpl: f2 });
  assert.ok(r2.out.includes('https://vercel.com/claim-deployment?code=c'), r2.out);
  assert.ok(!r2.out.includes('returnUrl='), r2.out);
});

// 4/5/6. 401 / 403 / 404 → mapped message + specific non-zero exit.
test('401 → invalid/expired token, EXIT.UNAUTHORIZED', async () => {
  const f = makeFetch(mockResponse({ status: 401, body: { error: { message: 'x' } } }));
  const r = await invoke(['--project', 'p'], { fetchImpl: f });
  assert.equal(r.code, EXIT.UNAUTHORIZED);
  assert.equal(r.calls.length, 1);
  assert.match(r.err, /token/i);
  assert.match(r.err, /invalid|expired/i);
});

test('403 → must be an owner of the team, EXIT.FORBIDDEN', async () => {
  const f = makeFetch(mockResponse({ status: 403, body: { error: { message: 'x' } } }));
  const r = await invoke(['--project', 'p'], { fetchImpl: f });
  assert.equal(r.code, EXIT.FORBIDDEN);
  assert.match(r.err, /owner/i);
});

test('404 → project not found, check team scope, EXIT.NOT_FOUND', async () => {
  const f = makeFetch(mockResponse({ status: 404, body: { error: { message: 'x' } } }));
  const r = await invoke(['--project', 'p'], { fetchImpl: f });
  assert.equal(r.code, EXIT.NOT_FOUND);
  assert.match(r.err, /not found/i);
  assert.match(r.err, /team/i);
});

// 7. Other non-2xx → status code + response message; non-JSON handled.
test('other non-2xx → status + parsed message, and raw body when not JSON', async () => {
  const f = makeFetch(mockResponse({ status: 500, body: { error: { message: 'boom' } } }));
  const r = await invoke(['--project', 'p'], { fetchImpl: f });
  assert.equal(r.code, EXIT.HTTP_OTHER);
  assert.match(r.err, /500/);
  assert.match(r.err, /boom/);

  const f2 = makeFetch(mockResponse({ status: 502, body: '<html>Bad Gateway</html>' }));
  const r2 = await invoke(['--project', 'p'], { fetchImpl: f2 });
  assert.equal(r2.code, EXIT.HTTP_OTHER);
  assert.match(r2.err, /502/);
  assert.match(r2.err, /Bad Gateway/);
});

// 8. Missing/empty VERCEL_TOKEN → non-zero exit, zero network calls.
test('missing/empty VERCEL_TOKEN → EXIT.NO_TOKEN and zero network calls', async () => {
  for (const env of [{}, { VERCEL_TOKEN: '' }, { VERCEL_TOKEN: '   ' }]) {
    const f = makeFetch(mockResponse({ json: { code: 'c' } }));
    const r = await invoke(['--project', 'p'], { env, fetchImpl: f });
    assert.equal(r.code, EXIT.NO_TOKEN);
    assert.equal(r.calls.length, 0);
    assert.match(r.err, /VERCEL_TOKEN/);
  }
});

// 9. --dry-run → zero network calls; previews endpoint/method/auth; still needs a token.
test('--dry-run → zero network calls, previews request, redacts auth', async () => {
  const f = makeFetch(mockResponse({ json: { code: 'c' } }));
  const r = await invoke(['--project', 'p', '--team', 'team_x', '--dry-run'], { fetchImpl: f });
  assert.equal(r.code, EXIT.SUCCESS);
  assert.equal(r.calls.length, 0);
  assert.match(r.out, /POST/);
  assert.match(r.out, /v9\/projects\/p\/transfer-request/);
  assert.match(r.out, /teamId=team_x/);
  assert.match(r.out, /Bearer <redacted>/);

  const f2 = makeFetch(mockResponse({ json: { code: 'c' } }));
  const r2 = await invoke(['--project', 'p', '--dry-run'], { env: {}, fetchImpl: f2 });
  assert.equal(r2.code, EXIT.NO_TOKEN);
  assert.equal(f2.calls.length, 0);
});

// 10. The token string must never appear in captured stdout/stderr.
test('token never appears in stdout/stderr across success, dry-run, http error, and network throw', async () => {
  const scenarios = [
    { argv: ['--project', 'p', '--return-url', 'https://e.com'], handler: mockResponse({ json: { code: 'c' } }) },
    { argv: ['--project', 'p', '--dry-run'], handler: mockResponse({ json: { code: 'c' } }) },
    { argv: ['--project', 'p'], handler: mockResponse({ status: 401, body: { error: { message: 'x' } } }) },
    { argv: ['--project', 'p'], handler: () => { throw new Error('ECONNREFUSED'); } },
  ];
  for (const s of scenarios) {
    const r = await invoke(s.argv, { fetchImpl: makeFetch(s.handler) });
    assert.ok(!r.out.includes(TOKEN), `token leaked to stdout: ${r.out}`);
    assert.ok(!r.err.includes(TOKEN), `token leaked to stderr: ${r.err}`);
  }
});

// 11. Usage errors → non-zero exit, zero network calls, and run never throws.
test('missing --project → usage error, zero network calls', async () => {
  const f = makeFetch(mockResponse({ json: { code: 'c' } }));
  const r = await invoke([], { fetchImpl: f });
  assert.equal(r.code, EXIT.USAGE);
  assert.equal(r.calls.length, 0);
  assert.match(r.err, /project/i);
});

test('unknown flag → usage error, zero network calls (parseArgs never throws past run)', async () => {
  const f = makeFetch(mockResponse({ json: { code: 'c' } }));
  const r = await invoke(['--project', 'p', '--bogus', 'x'], { fetchImpl: f });
  assert.equal(r.code, EXIT.USAGE);
  assert.equal(r.calls.length, 0);
});

// 12. Malformed success and network failure paths.
test('200 without a code → EXIT.BAD_SUCCESS', async () => {
  const f = makeFetch(mockResponse({ status: 200, json: {} }));
  const r = await invoke(['--project', 'p'], { fetchImpl: f });
  assert.equal(r.code, EXIT.BAD_SUCCESS);
  assert.equal(r.calls.length, 1);
  assert.match(r.err, /code/i);
});

test('fetch rejects → EXIT.NETWORK and run does not throw', async () => {
  const f = makeFetch(() => { throw new Error('ECONNREFUSED boom'); });
  const r = await invoke(['--project', 'p'], { fetchImpl: f });
  assert.equal(r.code, EXIT.NETWORK);
  assert.match(r.err, /ECONNREFUSED|network/i);
});

// --help prints usage without needing a token or a network call.
test('--help → usage to stdout, exit 0, zero network calls, no token needed', async () => {
  const f = makeFetch(mockResponse({ json: { code: 'c' } }));
  const r = await invoke(['--help'], { env: {}, fetchImpl: f });
  assert.equal(r.code, EXIT.SUCCESS);
  assert.equal(r.calls.length, 0);
  assert.match(r.out, /--project/);
  assert.match(r.out, /VERCEL_TOKEN/);
});

// Direct unit checks of the pure helpers (localize failures).
test('buildEndpoint encodes project and applies team heuristic', () => {
  assert.equal(
    buildEndpoint({ project: 'a b/c' }).url,
    'https://api.vercel.com/v9/projects/a%20b%2Fc/transfer-request',
  );
  assert.equal(
    buildEndpoint({ project: 'p', team: 'team_1' }).url,
    'https://api.vercel.com/v9/projects/p/transfer-request?teamId=team_1',
  );
  assert.equal(
    buildEndpoint({ project: 'p', team: 'acme' }).url,
    'https://api.vercel.com/v9/projects/p/transfer-request?slug=acme',
  );
  assert.equal(buildEndpoint({ project: 'p' }).method, 'POST');
});

test('buildClaimUrl encodes returnUrl and omits it when blank', () => {
  assert.equal(buildClaimUrl('abc'), 'https://vercel.com/claim-deployment?code=abc');
  assert.equal(
    buildClaimUrl('abc', 'https://h.test/x?y=1'),
    'https://vercel.com/claim-deployment?code=abc&returnUrl=https%3A%2F%2Fh.test%2Fx%3Fy%3D1',
  );
});
