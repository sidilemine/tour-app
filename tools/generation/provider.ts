/** Local-only Responses adapter. It never reads Codex credentials or API-key environment variables. */
import type { AppCredentials, OverflowEvidence } from './signin';

export const DEFAULT_MODEL = 'gpt-6.1-sol';
export const DEFAULT_EFFORT = 'medium';
export const RESPONSES_URL = 'https://api.openai.com/v1/responses';
export type JsonRecord = Record<string, unknown>;
export type ProviderStatus = 'completed' | 'blocked' | 'failed' | 'incomplete' | 'interrupted';
export interface ObservedUsage {
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  source: 'response.completed' | 'terminal-response' | 'unavailable';
  cachedInputTokens?: number | null;
}
export interface ProviderResult {
  status: ProviderStatus;
  contextId: string;
  model: string;
  effort: string;
  text: string;
  output: JsonRecord[];
  usage: ObservedUsage;
  elapsedMs: number;
  evidenceKind: 'live' | 'fixture';
  diagnostic: ProviderDiagnostic;
  /** Included usage is not an API-price observation. No guessed API-equivalent charge. */
  directChargeUsd: 0;
  estimatedApiEquivalentUsd: number | null;
  apiEquivalentEstimate?: { lowerUsd: number | null; upperUsd: number | null; reason: string; priceDate?: string; sourceUrl?: string };
}
export interface ProviderDiagnostic {
  code: string; httpStatus?: number; retryable: boolean; automaticRetries: 0;
  param?: string; requestId?: string; bodyShape?: Record<string, string>; contentType?: string; responseStatus?: string;
}
export interface ApiPriceQuote {
  model: string; date: string; sourceUrl: string; inputPerMillionUsd: number; cachedInputPerMillionUsd: number; outputPerMillionUsd: number;
  cacheWritePerMillionUsd?: number; longContextThreshold?: number; longContextInputMultiplier?: number; longContextOutputMultiplier?: number;
}
export const DEFAULT_API_PRICE_QUOTE: ApiPriceQuote = {
  model: DEFAULT_MODEL, date: '2026-10-06', sourceUrl: 'https://developers.openai.com/api/docs/models/gpt-6.1-sol',
  inputPerMillionUsd: 2, cachedInputPerMillionUsd: 0.1, outputPerMillionUsd: 10, cacheWritePerMillionUsd: 2.5,
  longContextThreshold: 272_000, longContextInputMultiplier: 2, longContextOutputMultiplier: 1.5,
};
export interface InferenceRequest {
  contextId: string;
  instructions: string;
  input: JsonRecord[];
  model?: string;
  effort?: string;
  tools?: JsonRecord[];
  jsonSchema?: { name: string; schema: JsonRecord };
  signal?: AbortSignal;
}
export interface ReasoningProvider {
  request(request: InferenceRequest): Promise<ProviderResult>;
}
export interface ModelCatalogResult {
  status: 'completed' | 'blocked' | 'failed';
  models: string[];
  code: string;
  evidenceKind: 'live' | 'fixture';
  diagnostic?: ProviderDiagnostic;
}
const KNOWN_CODES = new Set([
  'subscription_sharing_usage_limit_exceeded', 'subscription_sharing_usage_unavailable',
  'subscription_sharing_user_not_eligible', 'subscription_sharing_unsupported_capability',
  'subscription_sharing_route_not_supported', 'subscription_sharing_invalid_user',
  'chatpass_v2_scope_not_authorized', 'chatpass_v2_invalid_authorization_context', 'subscription_sharing_user_unavailable',
  'insufficient_quota', 'rate_limit_exceeded', 'invalid_api_key', 'permission_denied',
  'model_not_found', 'invalid_request_error', 'server_error', 'unsupported_parameter',
]);
const record = (value: unknown): JsonRecord => value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : {};
const finiteCount = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
function usage(value: unknown, source: ObservedUsage['source']): ObservedUsage {
  const data = record(value);
  return { inputTokens: finiteCount(data.input_tokens), outputTokens: finiteCount(data.output_tokens), totalTokens: finiteCount(data.total_tokens), source: Object.keys(data).length ? source : 'unavailable', cachedInputTokens: finiteCount(record(data.input_tokens_details).cached_tokens) };
}
function errorCode(value: unknown, fallback: string): string {
  const code = record(value).code;
  return typeof code === 'string' && KNOWN_CODES.has(code) ? code : fallback;
}
function textFromOutput(output: JsonRecord[]): string {
  return output.flatMap(item => Array.isArray(item.content) ? item.content : [])
    .map(item => record(item)).filter(item => item.type === 'output_text' && typeof item.text === 'string')
    .map(item => item.text).join('');
}

export class SubscriptionProvider implements ReasoningProvider {
  private readonly fetcher: typeof fetch;
  private readonly now: () => number;
  private readonly evidenceKind: 'live' | 'fixture';
  private catalog: { models: string[]; at: number } | undefined;
  constructor(private readonly options: {
    credentials: AppCredentials | null;
    overflowEvidence: OverflowEvidence | null;
    /** Injection is ALWAYS fixture evidence; it cannot establish account access. */
    fetch?: typeof fetch;
    now?: () => number;
    timeoutMs?: number;
    apiPriceQuote?: ApiPriceQuote;
  }) {
    this.fetcher = options.fetch ?? fetch;
    this.now = options.now ?? Date.now;
    this.evidenceKind = options.fetch ? 'fixture' : 'live';
  }
  private gate(): string | null {
    const credentials = this.options.credentials;
    if (!credentials) return 'app_sign_in_required';
    if (credentials.version !== 1 || credentials.provider !== 'chatgpt-plan' || !credentials.clientId.startsWith('oaiapp_') || !credentials.accountSubject || !credentials.accessToken) return 'invalid_app_credentials';
    if (!Number.isFinite(credentials.expiresAt) || credentials.expiresAt <= this.now() + 30_000) return 'app_sign_in_expired';
    if (!['resource.invoke', 'chatgpt.tokens.use.direct'].every(scope => credentials.grantedScopes.includes(scope))) return 'plan_usage_consent_required';
    const proof = this.options.overflowEvidence;
    if (!proof || proof.disabled !== true || proof.source !== 'owner-observed-chatgpt-usage' || proof.clientId !== credentials.clientId || proof.accountSubject !== credentials.accountSubject) return 'overflow_disabled_evidence_required';
    if (!Number.isFinite(proof.verifiedAt) || proof.verifiedAt > this.now() || this.now() - proof.verifiedAt > 24 * 60 * 60 * 1000) return 'overflow_evidence_stale';
    return null;
  }
  private diagnostics(payload: unknown, response: Response, fallback: string): ProviderDiagnostic {
    const body = record(payload);
    const error = record(body.error);
    const secrets = [this.options.credentials?.accessToken, this.options.credentials?.refreshToken, this.options.credentials?.idToken].filter((value): value is string => Boolean(value));
    const safe = (value: unknown, pattern: RegExp): value is string => typeof value === 'string' && pattern.test(value) && !secrets.some(secret => value.includes(secret));
    const code = safe(error.code, /^[a-z][a-z0-9_]{0,95}$/) ? error.code : errorCode(error, fallback);
    const param = safe(error.param, /^(model|reasoning|input|tools|text|stream|store|instructions|service_tier|previous_response_id)([.\[\]a-zA-Z_0-9-]*)$/) ? error.param : undefined;
    const requestId = response.headers.get('x-request-id');
    const bodyShape: Record<string, string> = {};
    for (const key of ['error', 'detail', 'type', 'status', 'object', 'output', 'usage']) if (key in body) bodyShape[key] = Array.isArray(body[key]) ? 'array' : body[key] === null ? 'null' : typeof body[key];
    for (const key of ['code', 'param', 'message', 'type']) if (key in error) bodyShape[`error.${key}`] = error[key] === null ? 'null' : typeof error[key];
    if (Object.keys(body).some(key => !['error', 'detail', 'type', 'status', 'object', 'output', 'usage'].includes(key))) bodyShape.otherFields = 'present';
    return { code, httpStatus: response.status, retryable: false, automaticRetries: 0, ...(param ? { param } : {}), ...(safe(requestId, /^[A-Za-z0-9_-]{1,128}$/) ? { requestId } : {}), bodyShape };
  }
  async listModels(): Promise<ModelCatalogResult> {
    const blocked = this.gate();
    if (blocked) return { status: 'blocked', models: [], code: blocked, evidenceKind: this.evidenceKind };
    try {
      const response = await this.fetcher('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${this.options.credentials!.accessToken}` },
        signal: AbortSignal.timeout(this.options.timeoutMs ?? 60_000), redirect: 'error',
      });
      if (!response.ok) {
        let payload: unknown;
        try { payload = await response.json(); } catch { /* Body shape remains unknown. */ }
        const diagnostic = this.diagnostics(payload, response, `models_http_${response.status}`);
        return { status: 'failed', models: [], code: diagnostic.code, evidenceKind: this.evidenceKind, diagnostic };
      }
      const data = record(await response.json());
      const models = (Array.isArray(data.models) ? data.models : []).map(record)
        .filter(model => model.visibility === 'list' && typeof model.slug === 'string').map(model => model.slug as string);
      this.catalog = { models, at: this.now() };
      return { status: 'completed', models, code: 'models_listed', evidenceKind: this.evidenceKind };
    } catch {
      return { status: 'failed', models: [], code: 'models_transport_error', evidenceKind: this.evidenceKind };
    }
  }
  async request(request: InferenceRequest): Promise<ProviderResult> {
    const started = this.now();
    const result: ProviderResult = {
      status: 'blocked', contextId: request.contextId, model: request.model ?? DEFAULT_MODEL, effort: request.effort ?? DEFAULT_EFFORT,
      text: '', output: [], usage: usage(null, 'unavailable'), elapsedMs: 0, evidenceKind: this.evidenceKind,
      diagnostic: { code: 'not_dispatched', retryable: false, automaticRetries: 0 }, directChargeUsd: 0, estimatedApiEquivalentUsd: null,
      apiEquivalentEstimate: { lowerUsd: null, upperUsd: null, reason: 'Observed token usage and a dated model price quote are required; no production cost inferred.' },
    };
    const finish = (status: ProviderStatus, code: string, httpStatus?: number): ProviderResult => {
      result.status = status;
      result.elapsedMs = Math.max(0, this.now() - started);
      result.diagnostic = { ...result.diagnostic, code, ...(httpStatus ? { httpStatus } : {}), retryable: ['rate_limit_exceeded', 'server_error', 'subscription_sharing_usage_unavailable', 'subscription_sharing_user_unavailable'].includes(code), automaticRetries: 0 };
      const quote = this.options.apiPriceQuote ?? (result.model === DEFAULT_MODEL ? DEFAULT_API_PRICE_QUOTE : undefined);
      const u = result.usage;
      if (quote && quote.model === result.model && /^\d{4}-\d{2}-\d{2}$/.test(quote.date) && /^https:\/\/(developers|platform)\.openai\.com\//.test(quote.sourceUrl) && [quote.inputPerMillionUsd, quote.cachedInputPerMillionUsd, quote.outputPerMillionUsd].every(n => Number.isFinite(n) && n >= 0) && u.inputTokens !== null && u.outputTokens !== null) {
        const longContext = u.inputTokens > (quote.longContextThreshold ?? Infinity);
        const inputMultiplier = longContext ? (quote.longContextInputMultiplier ?? 1) : 1;
        const outputCost = u.outputTokens * quote.outputPerMillionUsd * (longContext ? (quote.longContextOutputMultiplier ?? 1) : 1) / 1_000_000;
        const inputRate = quote.inputPerMillionUsd * inputMultiplier;
        const cacheRate = quote.cachedInputPerMillionUsd * inputMultiplier;
        const writeRate = (quote.cacheWritePerMillionUsd ?? quote.inputPerMillionUsd) * inputMultiplier;
        const cached = u.cachedInputTokens;
        const knownCache = cached !== null && cached !== undefined && cached <= u.inputTokens;
        const lower = outputCost + (knownCache ? (u.inputTokens - cached) * Math.min(inputRate, writeRate) + cached * cacheRate : u.inputTokens * Math.min(cacheRate, inputRate, writeRate)) / 1_000_000;
        const upper = outputCost + (knownCache ? (u.inputTokens - cached) * Math.max(inputRate, writeRate) + cached * cacheRate : u.inputTokens * Math.max(cacheRate, inputRate, writeRate)) / 1_000_000;
        result.estimatedApiEquivalentUsd = knownCache && lower === upper ? lower : null;
        result.apiEquivalentEstimate = { lowerUsd: lower, upperUsd: upper, priceDate: quote.date, sourceUrl: quote.sourceUrl, reason: knownCache ? 'Token-only API-equivalent range from observed usage; cache writes unknown. Subscription accounting, image tokenization parity, taxes and tool charges are not production billing evidence.' : 'Cache usage/writes unavailable: token-only range assumes all input cached through all written to cache. Image tokenization parity, taxes and tool charges are unknown.' };
      }
      return result;
    };
    const blocked = this.gate();
    if (blocked) return finish('blocked', blocked);
    if (!request.contextId || !request.instructions || !Array.isArray(request.input) || request.input.some(item => item.role === 'system')) return finish('blocked', 'invalid_explicit_context');
    if (request.tools?.some(tool => !['namespace', 'web_search'].includes(String(tool.type)))) return finish('blocked', 'unsupported_tool_shape');
    if (!this.catalog || this.now() - this.catalog.at > 300_000) {
      const catalog = await this.listModels();
      if (catalog.status !== 'completed') {
        if (catalog.diagnostic) result.diagnostic = catalog.diagnostic;
        return finish(catalog.status, catalog.code);
      }
    }
    if (!this.catalog!.models.includes(result.model)) return finish('blocked', 'requested_model_unavailable');
    const signal = request.signal ? AbortSignal.any([request.signal, AbortSignal.timeout(this.options.timeoutMs ?? 60_000)]) : AbortSignal.timeout(this.options.timeoutMs ?? 60_000);
    try {
      const response = await this.fetcher(RESPONSES_URL, {
        method: 'POST', headers: { Authorization: `Bearer ${this.options.credentials!.accessToken}`, 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        redirect: 'error', signal,
        body: JSON.stringify({ model: result.model, reasoning: { effort: result.effort }, instructions: request.instructions,
          input: request.input, store: false, stream: true,
          ...(request.tools ? { tools: request.tools } : {}),
          ...(request.jsonSchema ? { text: { format: { type: 'json_schema', name: request.jsonSchema.name, schema: request.jsonSchema.schema, strict: true } } } : {}),
        }),
      });
      if (!response.ok) {
        let payload: unknown;
        try { payload = await response.json(); } catch { /* Never retain server bodies or headers as diagnostics. */ }
        result.diagnostic = this.diagnostics(payload, response, `responses_http_${response.status}`);
        return finish('failed', result.diagnostic.code, response.status);
      }
      result.diagnostic = this.diagnostics(null, response, 'stream_opened');
      if (!response.body || !response.headers.get('content-type')?.includes('text/event-stream')) {
        // Retain bounded shape/usage diagnostics, never an arbitrary server body or a success claim.
        const contentType=response.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
        result.diagnostic.contentType=['application/json','text/html','text/plain'].includes(contentType??'')?contentType:'other-or-missing';
        if(response.body&&contentType==='application/json') {
          const reader=response.body.getReader();let bytes=0;let body='';const decoder=new TextDecoder();
          try {
            while(true){const chunk=await reader.read();if(chunk.done)break;bytes+=chunk.value.byteLength;if(bytes>65536){body='';break;}body+=decoder.decode(chunk.value,{stream:true});}
            if(body){const payload=record(JSON.parse(body));result.diagnostic={...result.diagnostic,...this.diagnostics(payload,response,'expected_event_stream')};
              if(['completed','failed','incomplete','queued','in_progress'].includes(String(payload.status)))result.diagnostic.responseStatus=String(payload.status);
              result.usage=usage(payload.usage,'terminal-response');
            }
          } catch { /* Keep only the safe transport diagnosis. */ }
          finally {await reader.cancel().catch(()=>undefined);reader.releaseLock();}
        } else await response.body?.cancel().catch(()=>undefined);
        return finish('failed',result.diagnostic.code==='stream_opened'?'expected_event_stream':result.diagnostic.code);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let receivedBytes = 0;
      const consume = (frame: string): ProviderResult | undefined => {
        const data = frame.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
        if (!data || data === '[DONE]') return;
        const event = record(JSON.parse(data));
        if (event.type === 'response.output_text.delta' && typeof event.delta === 'string') result.text += event.delta;
        const terminal = record(event.response);
        if (['response.completed', 'response.failed', 'response.incomplete'].includes(String(event.type))) {
          result.output = (Array.isArray(terminal.output) ? terminal.output : []).map(record);
          result.usage = usage(terminal.usage, event.type === 'response.completed' ? 'response.completed' : 'terminal-response');
          if (event.type === 'response.completed' && terminal.status === 'completed') {
            result.text = textFromOutput(result.output) || result.text;
            return finish('completed', 'response_completed');
          }
          if (event.type === 'response.incomplete') return finish('incomplete', 'response_incomplete');
          result.diagnostic = { ...result.diagnostic, ...this.diagnostics(terminal, response, 'response_failed') };
          return finish('failed', result.diagnostic.code);
        }
        if (event.type === 'error') {
          result.diagnostic = { ...result.diagnostic, ...this.diagnostics({ error: event }, response, 'stream_error') };
          return finish('failed', result.diagnostic.code);
        }
      };
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          receivedBytes += value.byteLength;
          if (receivedBytes > 8 * 1024 * 1024) return finish('interrupted', 'stream_size_limit');
          buffer += decoder.decode(value, { stream: true });
          buffer = buffer.replace(/\r\n/g, '\n');
          let boundary: number;
          while ((boundary = buffer.indexOf('\n\n')) !== -1) {
            const frame = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);
            const terminal = consume(frame);
            if (terminal) return terminal;
          }
        }
        // An unterminated SSE frame is not dispatched; partial data is only a draft.
        return finish('interrupted', 'stream_ended_without_completed');
      } finally {
        await reader.cancel().catch(() => undefined);
        reader.releaseLock();
      }
    } catch {
      return finish('interrupted', signal.aborted ? 'request_aborted_or_timed_out' : 'stream_or_transport_error');
    }
  }
}

/** Deliberately non-dispatching seam: adding a paid implementation requires explicit funding. */
export class GatedApiKeyProvider implements ReasoningProvider {
  async request(request: InferenceRequest): Promise<ProviderResult> {
    return { status: 'blocked', contextId: request.contextId, model: request.model ?? DEFAULT_MODEL, effort: request.effort ?? DEFAULT_EFFORT,
      text: '', output: [], usage: usage(null, 'unavailable'), elapsedMs: 0, evidenceKind: 'fixture',
      diagnostic: { code: 'separately_funded_api_route_not_enabled', retryable: false, automaticRetries: 0 }, directChargeUsd: 0, estimatedApiEquivalentUsd: null };
  }
}

export interface CapabilityPreflight {
  schemaVersion: 1;
  model: string;
  effort: string;
  checks: Record<string, { status: 'passed' | 'failed' | 'unavailable'; evidenceKind: 'live' | 'fixture' | 'not-run'; code: string }>;
  results: ProviderResult[];
  faithfulWorkflowReady: boolean;
}
/** T43 probes exercise actual capability rather than treating listing/sign-in as inference. */
export async function runCapabilityPreflight(provider: ReasoningProvider, options: { model?: string; effort?: string; imageDataUrl?: string } = {}): Promise<CapabilityPreflight> {
  const model = options.model ?? DEFAULT_MODEL;
  const effort = options.effort ?? DEFAULT_EFFORT;
  const report: CapabilityPreflight = { schemaVersion: 1, model, effort, checks: {}, results: [], faithfulWorkflowReady: false };
  const probe = async (name: string, req: Omit<InferenceRequest, 'contextId' | 'model' | 'effort'>, validate: (result: ProviderResult) => boolean) => {
    const result = await provider.request({ ...req, contextId: `preflight-${name}`, model, effort });
    report.results.push(result);
    report.checks[name] = { status: result.status === 'completed' && validate(result) ? 'passed' : 'failed', evidenceKind: result.evidenceKind, code: result.diagnostic.code };
    return result;
  };
  await probe('instructions-and-text', { instructions: 'Reply with exactly PREFLIGHT_OK.', input: [{ role: 'user', content: 'Confirm readiness.' }] }, result => result.text.trim() === 'PREFLIGHT_OK');
  if (report.checks['instructions-and-text'].status !== 'passed') return report;
  const input: JsonRecord[] = [{ role: 'user', content: 'Call the preflight echo function with value "history-token-47". Do not answer without calling the function.' }];
  const tools: JsonRecord[] = [{ type: 'namespace', name: 'preflight', description: 'Local harmless capability test.', tools: [{ type: 'function', name: 'echo', description: 'Echo a string.', parameters: { type: 'object', properties: { value: { type: 'string' } }, required: ['value'], additionalProperties: false }, strict: true }] }];
  const tool = await probe('function-call', { instructions: 'Use the requested local function.', input, tools }, result => result.output.some(item => item.type === 'function_call' && item.name === 'echo' && item.namespace === 'preflight' && typeof item.call_id === 'string'));
  if (report.checks['function-call'].status !== 'passed') return report;
  const call = tool.status === 'completed' ? tool.output.find(item => item.type === 'function_call' && item.name === 'echo' && item.namespace === 'preflight' && typeof item.call_id === 'string') : undefined;
  let echoed: string | undefined;
  if (call && typeof call.arguments === 'string') {
    try {
      const args = record(JSON.parse(call.arguments));
      // A bounded, local function dispatch. No network tool can be invoked by the model.
      if (Object.keys(args).length === 1 && args.value === 'history-token-47') echoed = args.value;
    } catch { /* Invalid arguments never dispatch. */ }
  }
  if (call && echoed) {
    await probe('explicit-tool-history', { instructions: 'Reply exactly with the value from the function result.', input: [...input, ...tool.output, { type: 'function_call_output', call_id: call.call_id, output: JSON.stringify({ value: echoed }) }], tools }, result => result.text.trim() === 'history-token-47');
  } else report.checks['explicit-tool-history'] = { status: 'unavailable', evidenceKind: 'not-run', code: 'function_call_required' };
  if (report.checks['explicit-tool-history'].status !== 'passed') return report;
  await probe('structured-output', { instructions: 'Return a JSON object with ok true.', input: [{ role: 'user', content: 'Run the check.' }], jsonSchema: { name: 'preflight', schema: { type: 'object', properties: { ok: { type: 'boolean' } }, required: ['ok'], additionalProperties: false } } }, result => { try { return JSON.parse(result.text).ok === true; } catch { return false; } });
  if (report.checks['structured-output'].status !== 'passed') return report;
  if (options.imageDataUrl) {
    await probe('image-input', { instructions: 'Identify the dominant color in the supplied image. Reply exactly RED if red.', input: [{ role: 'user', content: [{ type: 'input_text', text: 'Which color?' }, { type: 'input_image', image_url: options.imageDataUrl }] }] }, result => result.text.trim() === 'RED');
  } else report.checks['image-input'] = { status: 'unavailable', evidenceKind: 'not-run', code: 'known_red_test_image_required' };
  report.faithfulWorkflowReady = Object.values(report.checks).every(check => check.status === 'passed' && check.evidenceKind === 'live');
  return report;
}
