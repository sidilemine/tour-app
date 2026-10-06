import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { mkdtemp, mkdir, writeFile, chmod, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { DEFAULT_MODEL, GatedApiKeyProvider, RESPONSES_URL, SubscriptionProvider, runCapabilityPreflight, type InferenceRequest } from '../tools/generation/provider';
import { createAuthorization, createHostId, exchangeAuthorization, loadCredentials, validateCallback, validateIdToken, type AppCredentials, type OverflowEvidence } from '../tools/generation/signin';

const now = 1_800_000_000_000;
const credentials: AppCredentials = { version: 1, provider: 'chatgpt-plan', clientId: 'oaiapp_fixture', accountSubject: 'fixture-account', hostId: 'fixture-host', accessToken: 'fixture-secret-never-log', idToken: 'fixture-id', grantedScopes: ['openid', 'resource.invoke', 'chatgpt.tokens.use.direct'], expiresAt: now + 3_600_000, validatedAt: now };
const overflow: OverflowEvidence = { disabled: true, source: 'owner-observed-chatgpt-usage', clientId: credentials.clientId, accountSubject: credentials.accountSubject, verifiedAt: now };
const request: InferenceRequest = { contextId: 'writer-1', instructions: 'Use only the supplied evidence.', input: [{ role: 'user', content: 'Write the draft.' }] };
const catalog = () => Response.json({ models: [{ slug: DEFAULT_MODEL, visibility: 'list' }] });
const completed = (text = 'draft') => ({ type: 'response.completed', response: { status: 'completed', output: [{ type: 'message', role: 'assistant', content: [{ type: 'output_text', text }] }], usage: { input_tokens: 10, output_tokens: 4, total_tokens: 14 } } });
const sse = (events: unknown[], crlf = false) => new Response(events.map(event => `data: ${JSON.stringify(event)}\n\n`).join('').replaceAll('\n', crlf ? '\r\n' : '\n'), { headers: { 'Content-Type': 'text/event-stream' } });
function fixture(handler: typeof fetch, changes: Partial<ConstructorParameters<typeof SubscriptionProvider>[0]> = {}) {
  return new SubscriptionProvider({ credentials, overflowEvidence: overflow, now: () => now, fetch: handler, ...changes });
}

test('subscription fails closed before network without app consent, expiry or app-scoped overflow proof', async () => {
  let calls = 0;
  const fetcher: typeof fetch = async () => { calls++; return catalog(); };
  for (const options of [
    { credentials: null }, { credentials: { ...credentials, expiresAt: now } },
    { credentials: { ...credentials, grantedScopes: ['openid'] } }, { overflowEvidence: null },
    { overflowEvidence: { ...overflow, clientId: 'oaiapp_other' } },
    { overflowEvidence: { ...overflow, verifiedAt: now - 86_400_001 } },
    { overflowEvidence: { ...overflow, verifiedAt: now + 1 } },
  ]) assert.equal((await fixture(fetcher, options).request(request)).status, 'blocked');
  assert.equal(calls, 0);
});

test('faithful request uses public route, medium model, explicit isolated history and no unsupported fields', async () => {
  const bodies: Record<string, unknown>[] = [];
  const provider = fixture(async (url, init) => {
    if (String(url).endsWith('/models')) return catalog();
    assert.equal(url, RESPONSES_URL);
    assert.equal(init?.redirect, 'error');
    bodies.push(JSON.parse(String(init?.body)));
    return sse([completed()]);
  });
  const first = await provider.request(request);
  const second = await provider.request({ ...request, contextId: 'independent-reviewer', input: [{ role: 'user', content: 'Review only this.' }] });
  assert.equal(first.status, 'completed');
  assert.equal(second.status, 'completed');
  assert.deepEqual(bodies[0], { model: DEFAULT_MODEL, reasoning: { effort: 'medium' }, instructions: request.instructions, input: request.input, store: false, stream: true });
  assert.deepEqual(bodies[1].input, [{ role: 'user', content: 'Review only this.' }]);
  assert.equal(first.evidenceKind, 'fixture');
  assert.equal(first.directChargeUsd, 0);
  assert.equal(first.estimatedApiEquivalentUsd, null);
  assert.equal(first.usage.totalTokens, 14);
});

test('requested model unavailable never dispatches inference or substitutes another model', async () => {
  let requests = 0;
  const result = await fixture(async () => { requests++; return Response.json({ models: [{ slug: 'other', visibility: 'list' }] }); }).request(request);
  assert.equal(requests, 1);
  assert.equal(result.diagnostic.code, 'requested_model_unavailable');
});

test('interrupted, incomplete and failed streams retain drafts and never report success or retry', async () => {
  for (const [terminal, expected] of [
    [null, 'interrupted'],
    [{ type: 'response.incomplete', response: { status: 'incomplete' } }, 'incomplete'],
    [{ type: 'response.failed', response: { error: { code: 'subscription_sharing_usage_limit_exceeded', message: 'sensitive-server-details' } } }, 'failed'],
    [{ type: 'response.completed', response: { status: 'incomplete' } }, 'failed'],
    [{ type: 'error', code: 'server_error', message: credentials.accessToken }, 'failed'],
  ] as const) {
    let inferenceCalls = 0;
    const result = await fixture(async url => {
      if (String(url).endsWith('/models')) return catalog();
      inferenceCalls++;
      return sse([{ type: 'response.output_text.delta', delta: 'partial draft' }, ...(terminal ? [terminal] : [])]);
    }).request(request);
    assert.equal(result.status, expected);
    assert.equal(result.text, 'partial draft');
    assert.equal(inferenceCalls, 1);
    assert.equal(result.diagnostic.automaticRetries, 0);
    assert.ok(!JSON.stringify(result).includes('sensitive-server-details'));
    assert.ok(!JSON.stringify(result).includes(credentials.accessToken));
  }
});

test('HTTP error bodies and thrown network errors never leak secrets', async () => {
  for (const throwError of [false, true]) {
    const result = await fixture(async url => {
      if (String(url).endsWith('/models')) return catalog();
      if (throwError) throw new Error(credentials.accessToken);
      return Response.json({ error: { code: credentials.accessToken, message: credentials.accessToken } }, { status: 429 });
    }).request(request);
    assert.ok(!JSON.stringify(result).includes(credentials.accessToken));
    assert.notEqual(result.status, 'completed');
  }
});

test('chunked CRLF frames and UTF-8 output complete only with dispatched terminal event', async () => {
  const encoded = new TextEncoder().encode(`data: ${JSON.stringify(completed('café'))}\r\n\r\n`);
  const body = new ReadableStream({ start(controller) { for (const byte of encoded) controller.enqueue(new Uint8Array([byte])); controller.close(); } });
  const result = await fixture(async url => String(url).endsWith('/models') ? catalog() : new Response(body, { headers: { 'Content-Type': 'text/event-stream' } })).request(request);
  assert.equal(result.status, 'completed');
  assert.equal(result.text, 'café');
});

test('JSON response, malformed frame and unterminated terminal do not pass', async () => {
  for (const response of [Response.json(completed()), new Response('data: {bad}\n\n', { headers: { 'Content-Type': 'text/event-stream' } }), new Response(`data: ${JSON.stringify(completed())}`, { headers: { 'Content-Type': 'text/event-stream' } })]) {
    assert.notEqual((await fixture(async url => String(url).endsWith('/models') ? catalog() : response).request(request)).status, 'completed');
  }
});

test('API-key boundary cannot dispatch at any implicit allowance', async () => {
  const result = await new GatedApiKeyProvider().request(request);
  assert.equal(result.status, 'blocked');
  assert.equal(result.directChargeUsd, 0);
});

test('T43 fixture probes never masquerade as live account or faithful workflow evidence', async () => {
  const report = await runCapabilityPreflight(fixture(async (url, init) => {
    if (String(url).endsWith('/models')) return catalog();
    const body = JSON.parse(String(init?.body));
    if (body.instructions.includes('PREFLIGHT_OK')) return sse([completed('PREFLIGHT_OK')]);
    if (body.instructions.includes('requested local function')) return sse([{ type: 'response.completed', response: { status: 'completed', output: [{ type: 'function_call', namespace: 'preflight', name: 'echo', call_id: 'test-call', arguments: '{"value":"history-token-47"}' }] } }]);
    if (body.instructions.includes('function result')) { assert.equal(body.input.at(-1).call_id, 'test-call'); return sse([completed('history-token-47')]); }
    return sse([completed('{"ok":true}')]);
  }));
  assert.equal(report.checks['explicit-tool-history'].status, 'passed');
  assert.equal(report.checks['structured-output'].status, 'passed');
  assert.equal(report.checks['image-input'].status, 'unavailable');
  assert.equal(report.faithfulWorkflowReady, false);
  assert.equal(report.results.length, 4);
});

test('OAuth creates fresh state/nonce/PKCE and requires issued client plus exact callback state', () => {
  const one = createAuthorization('http://127.0.0.1:54321/auth/callback', 'host');
  const two = createAuthorization('http://127.0.0.1:54321/auth/callback', 'host');
  assert.notEqual(one.pending.state, two.pending.state);
  assert.notEqual(one.pending.verifier, two.pending.verifier);
  assert.notEqual(one.pending.nonce, two.pending.nonce);
  assert.equal(new URL(one.url).searchParams.get('client_id'), 'dynamic_agent_client');
  assert.equal(new URL(one.url).searchParams.get('code_challenge_method'), 'S256');
  assert.throws(() => validateCallback(`${one.pending.redirectUri}?state=wrong&code=x&client_id=oaiapp_new`, one.pending));
  assert.throws(() => validateCallback(`${one.pending.redirectUri}?state=${one.pending.state}&code=x`, one.pending));
  assert.throws(() => validateCallback(`${one.pending.redirectUri}?state=${one.pending.state}&error=access_denied`, one.pending));
  assert.deepEqual(validateCallback(`${one.pending.redirectUri}?state=${one.pending.state}&code=x&client_id=oaiapp_new`, one.pending), { code: 'x', clientId: 'oaiapp_new' });
  const returning = createAuthorization('http://127.0.0.1:54321/auth/callback', 'host', credentials);
  assert.equal(new URL(returning.url).searchParams.has('agent_name_hint'), false);
  assert.throws(() => validateCallback(`${returning.pending.redirectUri}?state=${returning.pending.state}&code=x&client_id=oaiapp_different`, returning.pending));
});

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'test-key', alg: 'RS256', use: 'sig' };
function token(claims: Record<string, unknown>, header = { alg: 'RS256', kid: 'test-key' }) {
  const data = `${Buffer.from(JSON.stringify(header)).toString('base64url')}.${Buffer.from(JSON.stringify(claims)).toString('base64url')}`;
  return `${data}.${sign('RSA-SHA256', Buffer.from(data), privateKey).toString('base64url')}`;
}
const claims = { iss: 'https://auth.openai.com', aud: credentials.clientId, sub: credentials.accountSubject, exp: now / 1000 + 3600, nonce: 'nonce' };
test('ID token rejects signature, issuer, audience, nonce, expiry and account substitution', () => {
  const expected = { clientId: credentials.clientId, nonce: 'nonce', accountSubject: credentials.accountSubject, now };
  assert.deepEqual(validateIdToken(token(claims), [jwk], expected), { sub: credentials.accountSubject });
  for (const changed of [{ iss: 'https://other.invalid' }, { aud: 'oaiapp_other' }, { nonce: 'wrong' }, { exp: now / 1000 }, { sub: 'other-person' }]) assert.throws(() => validateIdToken(token({ ...claims, ...changed }), [jwk], expected));
  const valid = token(claims);
  assert.throws(() => validateIdToken(`${valid.slice(0, -10)}AAAAAAAAAA`, [jwk], expected));
  assert.throws(() => validateIdToken(token(claims, { alg: 'none', kid: 'test-key' }), [jwk], expected));
});

test('authorization exchange uses discovery, public issued registration and explicitly granted token scopes', async () => {
  const { pending } = createAuthorization('http://127.0.0.1:54321/auth/callback', 'host');
  const callback = `${pending.redirectUri}?state=${pending.state}&code=fixture-code&client_id=${credentials.clientId}&scope=chatgpt.tokens.use.direct`;
  const fetcher = (scope: string): typeof fetch => async (url, init) => {
    if (String(url).endsWith('openid-configuration')) return Response.json({ issuer: 'https://auth.openai.com', jwks_uri: 'https://auth.openai.com/.well-known/jwks.json', token_endpoint: 'https://auth.openai.com/api/accounts/oauth/token', authorization_endpoint: 'https://auth.openai.com/api/accounts/authorize' });
    if (String(url).endsWith('jwks.json')) return Response.json({ keys: [jwk] });
    const body = new URLSearchParams(String(init?.body));
    assert.equal(body.get('client_id'), credentials.clientId);
    assert.equal(body.get('redirect_uri'), pending.redirectUri);
    assert.equal(body.get('code_verifier'), pending.verifier);
    assert.equal(body.has('client_secret'), false);
    return Response.json({ id_token: token({ ...claims, nonce: pending.nonce }), access_token: 'fixture', token_type: 'Bearer', expires_in: 3600, scope });
  };
  await assert.rejects(exchangeAuthorization(callback, pending, fetcher('openid'), now), /permission was not granted/);
  const result = await exchangeAuthorization(callback, pending, fetcher('openid resource.invoke chatgpt.tokens.use.direct'), now);
  assert.equal(result.accountSubject, credentials.accountSubject);
  assert.equal(result.expiresAt, now + 3_600_000);
});

test('credentials only load from app-owned protected local file and malformed data does not echo content', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tour-provider-test-'));
  try {
    assert.equal(await loadCredentials(root), null);
    const directory = path.join(root, 'local-data/generation-auth');
    await mkdir(directory, { recursive: true });
    const file = path.join(directory, 'credentials.json');
    await writeFile(file, JSON.stringify(credentials), { mode: 0o600 });
    assert.equal((await loadCredentials(root))?.clientId, credentials.clientId);
    await chmod(file, 0o644);
    await assert.rejects(loadCredentials(root), /Cannot safely read/);
    await chmod(file, 0o600);
    await writeFile(file, credentials.accessToken);
    await assert.rejects(loadCredentials(root), error => error instanceof Error && !error.message.includes(credentials.accessToken));
  } finally { await rm(root, { recursive: true, force: true }); }
});


test('new host IDs use the documented URN UUID format', () => {
  assert.match(createHostId(), /^urn:uuid:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test('safe subscription diagnostics preserve code, param, request ID and body shape without server text', async () => {
  const result = await fixture(async url => String(url).endsWith('/models') ? catalog() : Response.json({ error: { code: 'subscription_sharing_unsupported_capability', param: 'tools[0].type', message: credentials.accessToken } }, { status: 400, headers: { 'x-request-id': 'req_fixture_123' } })).request(request);
  assert.equal(result.diagnostic.code, 'subscription_sharing_unsupported_capability');
  assert.equal(result.diagnostic.param, 'tools[0].type');
  assert.equal(result.diagnostic.requestId, 'req_fixture_123');
  assert.equal(result.diagnostic.bodyShape?.['error.message'], 'string');
  assert.ok(!JSON.stringify(result).includes(credentials.accessToken));
  const admission = await fixture(async () => Response.json({ detail: 'private denial' }, { status: 403 })).request(request);
  assert.equal(admission.diagnostic.bodyShape?.detail, 'string');
  assert.ok(!JSON.stringify(admission).includes('private denial'));
});

test('preflight stops immediately on a quota failure after first completed probe', async () => {
  let count = 0;
  const report = await runCapabilityPreflight(fixture(async url => {
    if (String(url).endsWith('/models')) return catalog();
    count++;
    return count === 1 ? sse([completed('PREFLIGHT_OK')]) : sse([{ type: 'response.failed', response: { error: { code: 'subscription_sharing_usage_limit_exceeded' } } }]);
  }));
  assert.equal(count, 2);
  assert.equal(report.results.length, 2);
  assert.equal(report.faithfulWorkflowReady, false);
});

test('dated API-equivalent range preserves cache uncertainty and does not invent observed charge', async () => {
  const result = await fixture(async url => String(url).endsWith('/models') ? catalog() : sse([completed()])).request(request);
  assert.equal(result.apiEquivalentEstimate?.priceDate, '2026-10-06');
  assert.equal(result.apiEquivalentEstimate?.lowerUsd, (10 * 0.1 + 4 * 10) / 1_000_000);
  assert.ok(Math.abs(result.apiEquivalentEstimate!.upperUsd! - (10 * 2.5 + 4 * 10) / 1_000_000) < 1e-12);
  assert.equal(result.estimatedApiEquivalentUsd, null);
  assert.equal(result.directChargeUsd, 0);
});
