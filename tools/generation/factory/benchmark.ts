/** Read-only, redacted comparison of retained factory runs; never dispatches providers or tools. */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadJob } from '../store';
import { roleUsage } from '../usage';

type ObjectValue = Record<string, unknown>;
const object = (value: unknown): ObjectValue => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as ObjectValue : {};
const number = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
const safeId = (value: unknown) => typeof value === 'string' && /^[a-zA-Z0-9_.:-]{1,160}$/.test(value) ? value : 'unavailable';
const hash = (value: unknown) => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value) ? value : null;
const seconds = (start: string | null, end: string | null) => start && end && Number.isFinite(Date.parse(start)) && Number.isFinite(Date.parse(end)) && Date.parse(end) >= Date.parse(start) ? (Date.parse(end) - Date.parse(start)) / 1000 : null;
const read = (path: string): ObjectValue | null => existsSync(path) ? object(JSON.parse(readFileSync(path, 'utf8'))) : null;
const recoveryTypes = new Set(['factory-technical-retry-permit', 'factory-technical-retry-used', 'factory-retained-output-permit', 'factory-retained-output-used', 'factory-finalization-permit', 'factory-finalization-used', 'factory-tool-completion-permit', 'factory-tool-completion-used', 'factory-local-fix', 'factory-local-fix-resume', 'technical-retry-queued', 'reconciled']);

export function benchmarkJob(directory: string) {
  const job = loadJob(join(directory, 'job.json')), usage = roleUsage(job);
  const starting = read(join(directory, 'starting-inputs.json')), build = read(join(directory, 'build-result.json')), handoff = read(join(directory, 'handoff.json'));
  const initialBuildFile = readdirSync(directory).filter(name => /^build-result-\d+\.json$/.test(name)).sort((a, b) => Number(a.match(/\d+/)![0]) - Number(b.match(/\d+/)![0]))[0];
  const initialBuild = initialBuildFile ? read(join(directory, initialBuildFile)) : null;
  const operations = job.costLedger.operations;
  const notDispatchedConfirmed=operations.filter(o=>o.failure==='provider_initialization_not_dispatched'&&o.usage?.totalTokens===0&&read(join(directory,'requests',safeId(o.id)+'-not-dispatched.json'))?.inferenceDispatched===false).length;
  const firstDispatchAt = operations.map(o => o.startedAt).sort()[0] ?? null;
  const latestDispatch = operations.map(o => o.startedAt).sort().at(-1) ?? job.createdAt;
  const terminal = job.events.filter(e => e.type === 'terminal' && e.detail === job.status && e.at >= latestDispatch).sort((a, b) => a.at.localeCompare(b.at)).at(-1);
  const terminalAt = job.status === 'running' ? null : terminal?.at ?? null;
  let providerSeconds = 0, missingProviderDuration = 0, archivedProviderResults = 0;
  const providerStatuses: Record<string, number> = {};
  const tools: Record<string, { requested: number; executedReceipts: number; succeeded: number; failed: number; receiptOutcomeUnknown: number; withoutExecutionReceipt: number }> = {};
  for (const operation of operations) {
    const result = read(join(directory, 'requests', safeId(operation.id) + '-result.json'));
    if (result) archivedProviderResults++;
    const elapsedMs = number(result?.elapsedMs);
    if (elapsedMs === null) missingProviderDuration++; else providerSeconds += elapsedMs / 1000;
    const status = safeId(result?.status); providerStatuses[status] = (providerStatuses[status] ?? 0) + 1;
    for (const raw of Array.isArray(result?.output) ? result.output : []) {
      const call = object(raw); if (call.type !== 'function_call') continue;
      const name = safeId(call.name), summary = tools[name] ??= { requested: 0, executedReceipts: 0, succeeded: 0, failed: 0, receiptOutcomeUnknown: 0, withoutExecutionReceipt: 0 };
      summary.requested++;
      const callId = typeof call.call_id === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(call.call_id) ? call.call_id : null;
      const receipt = call.namespace === 'factory' && callId ? read(join(directory, 'requests', `${safeId(operation.id)}-${callId}.json`)) : null;
      if (!receipt || receipt.name !== call.name) { summary.withoutExecutionReceipt++; continue; }
      summary.executedReceipts++;
      if (!Object.hasOwn(receipt, 'result')) summary.receiptOutcomeUnknown++;
      else if (Object.hasOwn(object(receipt.result), 'error')) summary.failed++;
      else summary.succeeded++;
    }
  }
  const eventCounts: Record<string, number> = {};
  for (const event of job.events) if (recoveryTypes.has(event.type) || event.type === 'owner-time-allowance-amendment') eventCounts[event.type] = (eventCounts[event.type] ?? 0) + 1;
  const recoveryEventCount = Object.entries(eventCounts).filter(([type]) => recoveryTypes.has(type)).reduce((sum, [, count]) => sum + count, 0);
  const phasesDirectory = join(directory, 'phases');
  const completedPhases = existsSync(phasesDirectory) ? readdirSync(phasesDirectory).filter(name => /^[a-zA-Z0-9_-]+\.json$/.test(name)).flatMap(name => {
    const phase = read(join(phasesDirectory, name));
    return phase && typeof phase.completedAt === 'string' && Object.hasOwn(phase, 'result') ? [{ phase: name.slice(0, -5), completedAt: phase.completedAt, operationId: safeId(phase.operationId) }] : [];
  }).sort((a, b) => a.completedAt.localeCompare(b.completedAt)) : [];
  const timing = object(build?.timing), durationAcceptance = object(handoff?.durationAcceptance);
  const timingFields = ['targetSeconds', 'routeMetres', 'walkingMetresPerSecond', 'walkingSeconds', 'stationaryAudioSeconds', 'walkingAudioSeconds', 'allowanceSeconds', 'totalSeconds', 'remainingSeconds'] as const;
  const timingSummary = Object.fromEntries(timingFields.map(key => [key, key === 'remainingSeconds' && typeof timing[key] === 'number' && Number.isFinite(timing[key]) ? timing[key] : number(timing[key])]));
  const structurallyValid = build?.structuralValid === true;
  const testerCompleted = completedPhases.some(p => p.phase === 'tester');
  const successStage = structurallyValid && handoff && testerCompleted ? 'offline-draft-tested' : structurallyValid ? 'offline-draft-built' : existsSync(join(directory, 'route-accepted.json')) ? 'route-accepted' : existsSync(join(directory, 'research-validated.json')) ? 'research-validated' : completedPhases.length ? 'phase-output-only' : 'no-completed-phase';
  const authoredInputs = starting?.authoredInputs;
  const estimatedSeconds = number(timing.totalSeconds), targetSeconds = number(timing.targetSeconds);
  return {
    id: safeId(job.id), model: job.conditions.model, effort: job.conditions.effort,
    status: job.status, successStage, result: successStage === 'offline-draft-tested' ? 'reviewable-draft; duration/listening/field acceptance separate' : 'partial',
    elapsed: { createdAt: job.createdAt, firstDispatchAt, terminalAt, snapshotUpdatedAt: job.updatedAt, createdToTerminalSeconds: seconds(job.createdAt, terminalAt), firstDispatchToTerminalSeconds: seconds(firstDispatchAt, terminalAt), createdToSnapshotSeconds: seconds(job.createdAt, job.updatedAt), includesPauses: true, terminalTimestampKnown: terminalAt !== null },
    providerActivity: { observedSummedSeconds: providerSeconds, requestsWithoutDuration: missingProviderDuration, completeSummedSeconds: missingProviderDuration === 0 ? providerSeconds : null, note: 'Sum of provider-result elapsedMs; overlapping requests count separately. Not elapsed wall time or local-tool time.' },
    requests: { count: operations.length, notDispatchedConfirmed, inferenceAttempts:operations.length-notDispatchedConfirmed, archivedProviderResults, byProviderStatus: providerStatuses, pending: operations.filter(o => o.state === 'pending').length, unknownOutcome: operations.filter(o => o.state === 'unknown').length, recordedOperationFailures: operations.filter(o => o.failure).length, blockedTasks: job.tasks.filter(t => t.execution === 'blocked').length },
    usage: { byRole: usage.byRole, estimateBasis: usage.estimateBasis, limitations: usage.limitations },
    localTools: tools,
    interventions: { eventCounts, recoveryEventCount, timeAmendments: eventCounts['owner-time-allowance-amendment'] ?? 0, note: 'Counts events, not unique human actions; permit/use pairs remain distinct. Unrecorded interventions are unknown.' },
    automaticAllowances: { research: job.counters.research, route: job.counters.route, correction: job.counters.correction, correctiveRenders: Object.values(job.counters.render).reduce((a, b) => a + b, 0) },
    recordingCounts: { initial: number(object(initialBuild?.validation).recordingCount), final: number(object(build?.validation).recordingCount), initialEvidenceFile: initialBuildFile ?? null, note: 'Initial means the earliest retained successful build receipt; counts recordings in a package, not synthesis calls or cache misses. Missing validation remains unknown.' },
    phases: { completed: completedPhases, count: completedPhases.length },
    package: { structurallyValid, testerCompleted, timing: build ? timingSummary : null, durationAcceptance: safeId(durationAcceptance.status), shortfallSeconds: estimatedSeconds !== null && targetSeconds !== null ? Math.max(0, targetSeconds - estimatedSeconds) : null, withinMaximum: typeof timing.withinTarget === 'boolean' ? timing.withinTarget : null, walkingMeasured: timing.measuredWalk === true, listening: safeId(build?.listening), field: safeId(build?.field), readyForOrdinaryUse: build?.readyForOrdinaryUse === true },
    freshness: { declaredFreshContentOnly: starting?.freshContentOnly === true, authoredInputsCount: Array.isArray(authoredInputs) ? authoredInputs.length : null, authoredInputsEmpty: Array.isArray(authoredInputs) ? authoredInputs.length === 0 : null, startingEvidenceSha256: hash(job.conditions.startingEvidence), briefSha256: hash(starting?.briefSha256), implementationSha256: Object.fromEntries(Object.entries(object(starting?.implementationSha256)).filter(([, value]) => hash(value)).map(([key, value]) => [safeId(key.replaceAll('/', ':')), value])), note: 'Recorded input provenance; an empty authored-input list alone does not prove every generated claim is fresh.' },
    benchmarkContext: recoveryEventCount || eventCounts['owner-time-allowance-amendment'] ? 'supervised run with recorded intervention; elapsed includes engineering/owner pauses' : 'fresh-run candidate; no recovery/time-amendment events recorded, unrecorded intervention unknown',
  };
}

export function benchmarkRuns(directories: string[]) {
  const jobs = directories.map(benchmarkJob);
  const comparisons = jobs.slice(1).map(after => {
    const before = jobs[0], sameStage = before.successStage === after.successStage;
    const delta = (a: number | null, b: number | null) => sameStage && a !== null && b !== null ? b - a : null;
    return { before: before.id, after: after.id, sameSuccessStage: sameStage, createdToTerminalSecondsDelta: delta(before.elapsed.createdToTerminalSeconds, after.elapsed.createdToTerminalSeconds), providerSummedSecondsDelta: delta(before.providerActivity.completeSummedSeconds, after.providerActivity.completeSummedSeconds), requestCountDelta: sameStage ? after.requests.count - before.requests.count : null, causalImprovementEstablished: false };
  });
  return { schemaVersion: 1, recordedAt: new Date().toISOString(), jobs, comparisons, limitations: ['Different neighbourhoods, evidence availability, route complexity and implementation revisions confound causal speed comparisons.', 'Hampstead supervised engineering elapsed and a fresh Highgate run are distinct conditions; report interventions and completion stage alongside any deltas.', 'Known token subtotals exclude unknown usage; reasoning tokens are included in output tokens, never added twice.', 'Implementation assistant/helper usage is unavailable and excluded, never zero.', 'Direct subscription charges and token-only API-equivalent estimates are distinct; hosted-tool fees/parity are not measured.', 'No credentials, provider/context text, fetched page bodies, image data or private file paths are exported.', 'A tested structural draft does not prove target-duration acceptance, human listening or physical access.'] };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arguments_ = process.argv.slice(2), destination = arguments_.pop();
  if (!destination || !arguments_.length) throw Error('Usage: benchmark <job-directory...> <output.json>');
  const report = benchmarkRuns(arguments_); mkdirSync(dirname(resolve(destination)), { recursive: true }); writeFileSync(destination, JSON.stringify(report, null, 2) + '\n');
}
