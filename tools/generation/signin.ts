/** App-owned public OAuth client. No Codex token import, web scraping, or private API route. */
import { createHash, createPublicKey, randomBytes, randomUUID, timingSafeEqual, verify, type JsonWebKey } from 'node:crypto';
import { createServer } from 'node:http';
import { chmod, lstat, mkdir, open, readFile, rename, unlink } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import path from 'node:path';

const ISSUER = 'https://auth.openai.com';
const AUTHORIZE = `${ISSUER}/api/accounts/authorize`;
const TOKEN = `${ISSUER}/api/accounts/oauth/token`;
const DISCOVERY = `${ISSUER}/.well-known/openid-configuration`;
const JWKS = `${ISSUER}/.well-known/jwks.json`;
const SCOPES = 'openid profile email offline_access resource.invoke chatgpt.tokens.use.direct';
export interface AppCredentials {
  version: 1;
  provider: 'chatgpt-plan';
  clientId: string;
  accountSubject: string;
  hostId: string;
  accessToken: string;
  refreshToken?: string;
  idToken: string;
  grantedScopes: string[];
  expiresAt: number;
  validatedAt: number;
  /** Token rotation does not create a new account grant or refresh overflow evidence. */
  refreshedAt?: number;
  /** Retain the authorization nonce even when a rotated ID token omits it. */
  authorizationNonce?: string;
}
type Registration = Pick<AppCredentials, 'clientId' | 'accountSubject' | 'hostId'> & { idToken?: string };
export interface OverflowEvidence {
  disabled: true;
  source: 'owner-observed-chatgpt-usage';
  clientId: string;
  accountSubject: string;
  verifiedAt: number;
}
const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const authDirectory = (root: string) => path.join(path.resolve(root), 'local-data/generation-auth');
async function privateDirectory(root: string): Promise<string> {
  const directory = authDirectory(root);
  // Fail closed on symlinked credential directories or parent data folders.
  await mkdir(path.join(path.resolve(root), 'local-data'), { recursive: true, mode: 0o700 });
  if ((await lstat(path.join(path.resolve(root), 'local-data'))).isSymbolicLink()) throw new Error('Credential parent must not be a symlink.');
  await mkdir(directory, { recursive: true, mode: 0o700 });
  if ((await lstat(directory)).isSymbolicLink()) throw new Error('Credential directory must not be a symlink.');
  await chmod(directory, 0o700);
  return directory;
}
async function readPrivate(root: string, name: string): Promise<unknown | null> {
  const directory = authDirectory(root);
  try {
    for (const entry of [path.join(path.resolve(root), 'local-data'), directory, path.join(directory, name)]) {
      if ((await lstat(entry)).isSymbolicLink()) throw new Error('Credential paths must not be symlinks.');
    }
    const filename = path.join(directory, name);
    const stat = await lstat(filename);
    if ((stat.mode & 0o077) !== 0) throw new Error('Credential file must be mode 0600.');
    return JSON.parse(await readFile(filename, 'utf8'));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    // Do not echo malformed credential JSON into a log through parser errors.
    throw new Error('Cannot safely read app credentials. Check local file permissions and format.');
  }
}
async function writePrivate(root: string, name: string, value: unknown): Promise<void> {
  const directory = await privateDirectory(root);
  const temporary = path.join(directory, `${name}.${randomUUID()}.tmp`);
  const handle = await open(temporary, 'wx', 0o600);
  try { await handle.writeFile(`${JSON.stringify(value, null, 2)}\n`); await handle.sync(); }
  finally { await handle.close(); }
  await rename(temporary, path.join(directory, name));
  const parent = await open(directory, 'r');
  try { await parent.sync(); } finally { await parent.close(); }
}
/** Cross-process exclusion is necessary because refresh tokens rotate after every use. */
async function withCredentialLock<T>(root: string, run: () => Promise<T>): Promise<T> {
  const directory = await privateDirectory(root);
  const filename = path.join(directory, 'renewal.lock');
  const deadline = Date.now() + 35_000;
  let handle;
  while (!handle) {
    try { handle = await open(filename, 'wx', 0o600); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw new CredentialRenewalError('credential_lock_unavailable');
      if (Date.now() >= deadline) throw new CredentialRenewalError('credential_refresh_busy');
      await delay(50);
    }
  }
  try { await handle.writeFile(String(process.pid)); return await run(); }
  finally { await handle.close(); await unlink(filename); }
}
const accountFilename = (c: Registration) => `account-${createHash('sha256').update(`${c.clientId}:${c.accountSubject}`).digest('hex')}.json`;
async function saveCredentials(root: string, c: AppCredentials): Promise<void> {
  // The active file is authoritative. Account history is never read as a token fallback.
  await writePrivate(root, 'credentials.json', c);
  await writePrivate(root, accountFilename(c), c);
}
async function clearUnusableCredentials(root: string, c: AppCredentials): Promise<void> {
  await writePrivate(root, 'registration.json', { clientId: c.clientId, accountSubject: c.accountSubject, hostId: c.hostId });
  for (const name of ['credentials.json', accountFilename(c)]) {
    await unlink(path.join(authDirectory(root), name)).catch(error => { if (error.code !== 'ENOENT') throw new CredentialRenewalError('credential_cleanup_failed'); });
  }
}
/** Safe machine-readable error; token endpoint descriptions/transport messages are never exposed. */
export class CredentialRenewalError extends Error {
  constructor(readonly code: string, readonly reauthorizationRequired = false, readonly retryable = false) {
    super(`ChatGPT credential renewal stopped: ${code}`);
  }
}
const terminalRefreshCodes = new Set(['invalid_grant', 'invalid_refresh_token', 'token_expired', 'refresh_token_expired', 'refresh_token_invalidated', 'refresh_token_reused']);
/** Call before constructing a provider. No inference, no billing fallback, no automatic retries. */
export async function renewCredentials(root: string, options: { fetch?: typeof fetch; now?: () => number; minimumValidityMs?: number } = {}): Promise<AppCredentials | null> {
  const now = options.now ?? Date.now;
  const minimumValidity = options.minimumValidityMs ?? 60_000;
  if (!Number.isFinite(minimumValidity) || minimumValidity < 30_000 || minimumValidity > 300_000) throw new CredentialRenewalError('invalid_renewal_window');
  return withCredentialLock(root, async () => {
    const previous = await loadCredentials(root);
    if (!previous || previous.expiresAt > now() + minimumValidity) return previous;
    if (!previous.grantedScopes.includes('offline_access') || !previous.refreshToken) throw new CredentialRenewalError('offline_access_required', true);
    const fetcher = options.fetch ?? fetch;
    let response: Response;
    let tokens: Record<string, unknown>;
    try {
      response = await fetcher(TOKEN, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, signal: AbortSignal.timeout(30_000), redirect: 'error', body: new URLSearchParams({ grant_type: 'refresh_token', client_id: previous.clientId, refresh_token: previous.refreshToken, resource: 'https://api.openai.com/v1' }).toString() });
      tokens = object(await response.json());
    } catch { throw new CredentialRenewalError('refresh_transport_or_response_error', false, true); }
    if (!response.ok) {
      const code = typeof tokens.error === 'string' ? tokens.error : object(tokens.error).code;
      if (typeof code === 'string' && terminalRefreshCodes.has(code)) {
        await clearUnusableCredentials(root, previous);
        throw new CredentialRenewalError(code, true);
      }
      throw new CredentialRenewalError(code === 'invalid_client' ? 'invalid_client' : `refresh_http_${response.status}`, false, response.status >= 500 || response.status === 429);
    }
    if (typeof tokens.access_token !== 'string' || !tokens.access_token || typeof tokens.refresh_token !== 'string' || !tokens.refresh_token || typeof tokens.token_type !== 'string' || tokens.token_type.toLowerCase() !== 'bearer' || typeof tokens.expires_in !== 'number' || !Number.isFinite(tokens.expires_in) || tokens.expires_in <= 30 || (tokens.scope !== undefined && typeof tokens.scope !== 'string')) throw new CredentialRenewalError('incomplete_refresh_response', true);
    const grantedScopes = tokens.scope === undefined ? previous.grantedScopes : (tokens.scope as string).split(/\s+/).filter(Boolean);
    if (!['openid', 'resource.invoke', 'chatgpt.tokens.use.direct'].every(scope => grantedScopes.includes(scope)) || grantedScopes.some(scope => !previous.grantedScopes.includes(scope)) || previous.grantedScopes.some(scope => !grantedScopes.includes(scope))) throw new CredentialRenewalError('refresh_scope_changed', true);
    let idToken = previous.idToken;
    let authorizationNonce = previous.authorizationNonce;
    if (!authorizationNonce) {
      try { const original = object(JSON.parse(Buffer.from(previous.idToken.split('.')[1], 'base64url').toString('utf8'))); if (typeof original.nonce === 'string') authorizationNonce = original.nonce; }
      catch { /* A refresh without a new ID token can retain a validated legacy token. */ }
    }
    if (tokens.id_token !== undefined) {
      try {
        if (typeof tokens.id_token !== 'string') throw new Error();
        const discoveryResponse = await fetcher(DISCOVERY, { signal: AbortSignal.timeout(30_000), redirect: 'error' });
        const discovery = object(await discoveryResponse.json());
        if (!discoveryResponse.ok || discovery.issuer !== ISSUER || discovery.jwks_uri !== JWKS || discovery.token_endpoint !== TOKEN) throw new Error();
        const keyResponse = await fetcher(JWKS, { signal: AbortSignal.timeout(30_000), redirect: 'error' });
        const jwks = object(await keyResponse.json());
        if (!keyResponse.ok || !Array.isArray(jwks.keys)) throw new Error();
        // The prior ID token was validated during sign-in. Refresh may omit nonce;
        // if returned it must still match the original authorization nonce.
        validateIdToken(tokens.id_token, jwks.keys as JsonWebKey[], { clientId: previous.clientId, accountSubject: previous.accountSubject, nonce: authorizationNonce, nonceOptional: true, now: now() });
        idToken = tokens.id_token;
      } catch { throw new CredentialRenewalError('refresh_identity_validation_failed', true); }
    }
    const at = now();
    const renewed: AppCredentials = { ...previous, accessToken: tokens.access_token, refreshToken: tokens.refresh_token, idToken, grantedScopes, expiresAt: at + tokens.expires_in * 1000, refreshedAt: at, ...(authorizationNonce ? { authorizationNonce } : {}) };
    await saveCredentials(root, renewed);
    return renewed;
  });
}
export async function loadCredentials(root: string): Promise<AppCredentials | null> {
  const value = object(await readPrivate(root, 'credentials.json'));
  if (!Object.keys(value).length) return null;
  if (value.version !== 1 || value.provider !== 'chatgpt-plan' || typeof value.clientId !== 'string' || !value.clientId.startsWith('oaiapp_') || typeof value.accountSubject !== 'string' || typeof value.accessToken !== 'string' || typeof value.idToken !== 'string' || typeof value.hostId !== 'string' || typeof value.expiresAt !== 'number' || !Number.isFinite(value.expiresAt) || typeof value.validatedAt !== 'number' || !Number.isFinite(value.validatedAt) || (value.refreshToken !== undefined && typeof value.refreshToken !== 'string') || (value.authorizationNonce !== undefined && typeof value.authorizationNonce !== 'string') || !Array.isArray(value.grantedScopes) || !value.grantedScopes.every(scope => typeof scope === 'string')) throw new Error('App credentials are incomplete. Continue with ChatGPT again.');
  return value as unknown as AppCredentials;
}
export async function loadOverflowEvidence(root: string): Promise<OverflowEvidence | null> {
  const value = await readPrivate(root, 'overflow-evidence.json');
  return value as OverflowEvidence | null;
}
/** Invoke ONLY after the owner has observed this app's credit overflow disabled in ChatGPT Usage. */
export async function recordOverflowDisabled(root: string): Promise<void> {
  const credentials = await loadCredentials(root);
  if (!credentials) throw new Error('Sign in to this app before recording app-specific overflow evidence.');
  await writePrivate(root, 'overflow-evidence.json', { disabled: true, source: 'owner-observed-chatgpt-usage', clientId: credentials.clientId, accountSubject: credentials.accountSubject, verifiedAt: Date.now() } satisfies OverflowEvidence);
}
export function createHostId(): string { return `urn:uuid:${randomUUID()}`; }
export interface PendingAuthorization {
  state: string;
  nonce: string;
  verifier: string;
  redirectUri: string;
  hostId: string;
  clientId: string;
  accountSubject?: string;
}
export function createAuthorization(redirectUri: string, hostId: string, previous: Registration | null = null): { pending: PendingAuthorization; url: string } {
  const redirect = new URL(redirectUri);
  if (redirect.protocol !== 'http:' || redirect.hostname !== '127.0.0.1' || redirect.pathname !== '/auth/callback' || redirect.search || redirect.hash || redirect.username || redirect.password) throw new Error('Only the fixed loopback callback path is supported.');
  const pending: PendingAuthorization = { state: randomBytes(32).toString('base64url'), nonce: randomBytes(32).toString('base64url'), verifier: randomBytes(48).toString('base64url'), redirectUri, hostId, clientId: previous?.clientId ?? 'dynamic_agent_client', ...(previous ? { accountSubject: previous.accountSubject } : {}) };
  const url = new URL(AUTHORIZE);
  const params = { client_id: pending.clientId, ext_agent_host_id: hostId, response_type: 'code', redirect_uri: redirectUri, scope: SCOPES, resource: 'https://api.openai.com/v1', state: pending.state, nonce: pending.nonce, code_challenge_method: 'S256', code_challenge: createHash('sha256').update(pending.verifier).digest('base64url') };
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  if (previous?.idToken) url.searchParams.set('id_token_hint', previous.idToken);
  if (!previous) url.searchParams.set('agent_name_hint', 'Tour app local generation');
  return { pending, url: url.toString() };
}
export function validateCallback(url: string, pending: PendingAuthorization): { code: string; clientId: string } {
  const callback = new URL(url);
  const expected = new URL(pending.redirectUri);
  if (callback.origin !== expected.origin || callback.pathname !== expected.pathname) throw new Error('Unexpected callback target.');
  for (const key of ['state', 'code', 'client_id', 'error']) if (callback.searchParams.getAll(key).length > 1) throw new Error('Ambiguous authorization callback.');
  const state = callback.searchParams.get('state') ?? '';
  const stateBytes = Buffer.from(state);
  const expectedBytes = Buffer.from(pending.state);
  if (stateBytes.length !== expectedBytes.length || !timingSafeEqual(stateBytes, expectedBytes)) throw new Error('Authorization state mismatch.');
  if (callback.searchParams.has('error')) throw new Error('ChatGPT authorization was not granted.');
  const code = callback.searchParams.get('code');
  const clientId = callback.searchParams.get('client_id') ?? pending.clientId;
  if (!code || !clientId.startsWith('oaiapp_') || (pending.clientId !== 'dynamic_agent_client' && pending.clientId !== clientId)) throw new Error('Authorization registration is incomplete or changed.');
  return { code, clientId };
}
/** Signature verified before claims are used. Built-in crypto avoids a new mobile dependency. */
export function validateIdToken(idToken: string, keys: JsonWebKey[], expected: { clientId: string; nonce?: string; nonceOptional?: boolean; accountSubject?: string; now: number }): { sub: string } {
  try {
    if (!expected.nonceOptional && !expected.nonce) throw new Error();
    const pieces = idToken.split('.');
    if (pieces.length !== 3) throw new Error();
    const header = object(JSON.parse(Buffer.from(pieces[0], 'base64url').toString('utf8')));
    if (header.alg !== 'RS256' || typeof header.kid !== 'string' || header.crit) throw new Error();
    const key = keys.find(item => item.kid === header.kid && item.kty === 'RSA' && (!item.alg || item.alg === 'RS256') && (!item.use || item.use === 'sig'));
    if (!key || !verify('RSA-SHA256', Buffer.from(`${pieces[0]}.${pieces[1]}`), createPublicKey({ key, format: 'jwk' }), Buffer.from(pieces[2], 'base64url'))) throw new Error();
    const claims = object(JSON.parse(Buffer.from(pieces[1], 'base64url').toString('utf8')));
    const audience = typeof claims.aud === 'string' ? [claims.aud] : claims.aud;
    if (claims.iss !== ISSUER || !Array.isArray(audience) || !audience.includes(expected.clientId) || (audience.length > 1 && claims.azp !== expected.clientId) || (claims.azp !== undefined && claims.azp !== expected.clientId) || typeof claims.exp !== 'number' || !Number.isFinite(claims.exp) || claims.exp * 1000 <= expected.now || (typeof claims.nbf === 'number' && claims.nbf * 1000 > expected.now) || typeof claims.sub !== 'string' || !claims.sub || ((!expected.nonceOptional || claims.nonce !== undefined) && claims.nonce !== expected.nonce) || (expected.accountSubject && claims.sub !== expected.accountSubject)) throw new Error();
    return { sub: claims.sub };
  } catch { throw new Error('ChatGPT identity validation failed; saved credentials were not replaced.'); }
}
export async function exchangeAuthorization(callbackUrl: string, pending: PendingAuthorization, fetcher: typeof fetch = fetch, now = Date.now()): Promise<AppCredentials> {
  const { code, clientId } = validateCallback(callbackUrl, pending);
  const getJson = async (url: string): Promise<Record<string, unknown>> => {
    const response = await fetcher(url, { signal: AbortSignal.timeout(30_000), redirect: 'error' });
    if (!response.ok) throw new Error('ChatGPT identity discovery is unavailable.');
    return object(await response.json());
  };
  const discovery = await getJson(DISCOVERY);
  if (discovery.issuer !== ISSUER || discovery.jwks_uri !== JWKS || discovery.token_endpoint !== TOKEN || discovery.authorization_endpoint !== AUTHORIZE) throw new Error('Unexpected ChatGPT identity discovery.');
  const jwks = await getJson(JWKS);
  const response = await fetcher(TOKEN, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, signal: AbortSignal.timeout(30_000), redirect: 'error', body: new URLSearchParams({ grant_type: 'authorization_code', client_id: clientId, code, code_verifier: pending.verifier, redirect_uri: pending.redirectUri, resource: 'https://api.openai.com/v1' }).toString() });
  if (!response.ok) throw new Error('ChatGPT code exchange failed. Start a fresh sign-in; do not reuse the code.');
  const tokens = object(await response.json());
  if (typeof tokens.id_token !== 'string' || typeof tokens.access_token !== 'string' || !tokens.access_token || (typeof tokens.token_type !== 'string' || tokens.token_type.toLowerCase() !== 'bearer') || typeof tokens.expires_in !== 'number' || !Number.isFinite(tokens.expires_in) || tokens.expires_in <= 0 || typeof tokens.scope !== 'string' || !Array.isArray(jwks.keys)) throw new Error('ChatGPT token response is incomplete.');
  const identity = validateIdToken(tokens.id_token, jwks.keys as JsonWebKey[], { clientId, nonce: pending.nonce, accountSubject: pending.accountSubject, now });
  const grantedScopes = tokens.scope.split(/\s+/).filter(Boolean);
  if (!['openid', 'resource.invoke', 'chatgpt.tokens.use.direct'].every(scope => grantedScopes.includes(scope))) throw new Error('ChatGPT plan-usage permission was not granted.');
  return { version: 1, provider: 'chatgpt-plan', clientId, accountSubject: identity.sub, hostId: pending.hostId, accessToken: tokens.access_token, idToken: tokens.id_token, ...(typeof tokens.refresh_token === 'string' ? { refreshToken: tokens.refresh_token } : {}), grantedScopes, expiresAt: now + tokens.expires_in * 1000, validatedAt: now, authorizationNonce: pending.nonce };
}
/** Starts only by explicit CLI action. Pass the URL directly to the system browser; do not log it. */
export async function beginSignIn(root: string, onAuthorizationUrl: (url: string) => Promise<void>, timeoutMs = 180_000): Promise<{ clientId: string; planUsageGranted: true }> {
  const registration = object(await readPrivate(root, 'registration.json'));
  const savedRegistration = typeof registration.clientId === 'string' && registration.clientId.startsWith('oaiapp_') && typeof registration.accountSubject === 'string' && typeof registration.hostId === 'string' ? registration as Registration : null;
  const previous = await loadCredentials(root) ?? savedRegistration;
  const host = object(await readPrivate(root, 'host.json'));
  const storedHost = typeof host.hostId === 'string' ? host.hostId : undefined;
  // Migrate the early prototype's bare UUID only before any successful registration.
  const hostId = storedHost && !previous && /^[0-9a-f-]{36}$/i.test(storedHost) ? `urn:uuid:${storedHost}` : storedHost ?? createHostId();
  if (hostId !== storedHost) await writePrivate(root, 'host.json', { hostId });
  let pending: PendingAuthorization;
  let accepting = true;
  let attemptActive = true;
  let resolveResult!: (result: { clientId: string; planUsageGranted: true }) => void;
  let rejectResult!: (error: Error) => void;
  const completed = new Promise<{ clientId: string; planUsageGranted: true }>((resolve, reject) => { resolveResult = resolve; rejectResult = reject; });
  // Attach a handler immediately: browser launch and callback can overlap.
  void completed.catch(() => undefined);
  const server = createServer((request, response) => {
    if (!accepting || request.method !== 'GET' || !request.url?.startsWith('/auth/callback?')) { response.writeHead(404).end(); return; }
    const callback = new URL(request.url, pending.redirectUri).toString();
    try { validateCallback(callback, pending); } catch (error) {
      response.writeHead(400).end('Authorization callback rejected. Return to the local tool.');
      if (error instanceof Error && error.message === 'ChatGPT authorization was not granted.') {
        accepting = false;
        rejectResult(new Error('ChatGPT authorization was not granted.'));
      }
      return;
    }
    accepting = false;
    void exchangeAuthorization(callback, pending).then(async credentials => {
      if (!attemptActive) throw new Error('Authorization attempt expired.');
      // One active account is sufficient for this prototype; returning sign-in is identity bound.
      // Keep separate registration history so replacing the active pointer never mixes identities.
      await withCredentialLock(root, () => saveCredentials(root, credentials));
      response.writeHead(200, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' }).end('Signed in to Tour app. Return to the local tool.');
      resolveResult({ clientId: credentials.clientId, planUsageGranted: true });
    }).catch(() => { response.writeHead(400).end('Sign-in failed. Return to the local tool.'); rejectResult(new Error('ChatGPT sign-in failed; saved credentials were preserved.')); });
  });
  await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const address = server.address();
  if (!address || typeof address === 'string') { server.close(); throw new Error('Loopback listener unavailable.'); }
  const authorization = createAuthorization(`http://127.0.0.1:${address.port}/auth/callback`, hostId, previous);
  pending = authorization.pending;
  const timer = setTimeout(() => { accepting = false; attemptActive = false; rejectResult(new Error('ChatGPT sign-in timed out; saved credentials were preserved.')); }, timeoutMs);
  try {
    await onAuthorizationUrl(authorization.url);
    return await completed;
  } finally {
    clearTimeout(timer);
    attemptActive = false;
    server.closeAllConnections();
    server.close();
  }
}
