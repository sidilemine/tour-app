import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { createJob } from '../tools/generation/engine';
import { benchmarkJob, benchmarkRuns } from '../tools/generation/factory/benchmark';
import { factoryReport } from '../tools/generation/factory/report';
import type { Job, Operation } from '../tools/generation/records';

const at = (seconds: number) => new Date(Date.UTC(2026, 9, 7, 12, 0, seconds)).toISOString();
const knownUsage = { inputTokens: 100, outputTokens: 20, cachedInputTokens: 40, reasoningTokens: 10, totalTokens: 120, subscription: true, apiEquivalentUsd: null, uncertainty: null, priceDate: null, apiEquivalentRangeUsd: { lower: 0.001, upper: 0.002 } };
function write(directory: string, file: string, value: unknown) { const path = join(directory, file); mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, JSON.stringify(value)); }
function fixture(id = 'synthetic-benchmark') {
  const directory = mkdtempSync(join(tmpdir(), 'tour-benchmark-'));
  const job = createJob(id, at(0), 'fixture'); job.conditions.model = 'gpt-6-astra'; job.conditions.startingEvidence = 'a'.repeat(64);
  return { directory, job, save: () => write(directory, 'job.json', job), cleanup: () => rmSync(directory, { recursive: true, force: true }) };
}
function operation(id: string, extra: Partial<Operation> = {}): Operation { return { id, taskId: 'task-' + id, stage: 'research', state: 'settled', reservedUsd: 0, chargedUsd: 0, startedAt: at(20), endedAt: at(70), usage: knownUsage, ...extra }; }
function terminate(job: Job, atSeconds = 80) { job.status = 'blocked'; job.updatedAt = at(atSeconds); job.events.push({ at: at(atSeconds), type: 'terminal', detail: 'blocked' }); }
const call = (id: string, name = 'read_page') => ({ type: 'function_call', namespace: 'factory', name, call_id: id, arguments: '{"private":"never-export"}' });

test('benchmark separates paused elapsed, overlapping provider sums and unknown token/duration usage', () => {
  const f = fixture(); try {
    f.job.costLedger.operations = [operation('operation-1'), operation('operation-2', { usage: undefined, chargedUsd: null, startedAt: at(25) })];
    terminate(f.job); f.save();
    write(f.directory, 'requests/operation-1-result.json', { elapsedMs: 100000, status: 'completed', output: [] });
    write(f.directory, 'requests/operation-2-result.json', { elapsedMs: 100000, status: 'completed', output: [] });
    const report = benchmarkJob(f.directory);
    assert.equal(report.elapsed.createdToTerminalSeconds, 80); assert.equal(report.elapsed.firstDispatchToTerminalSeconds, 60);
    assert.equal(report.providerActivity.completeSummedSeconds, 200); assert.equal(report.providerActivity.requestsWithoutDuration, 0);
    const role = report.usage.byRole[0]; assert.equal(role.operations, 2); assert.equal(role.observedInputTokens, 100); assert.equal(role.observedOutputTokens, 20); assert.equal(role.observedReasoningTokens, 10);
    assert.equal(role.operationsWithUnknownTokens, 1); assert.equal(role.operationsWithUnknownCache, 1); assert.equal(role.operationsWithUnknownCharge, 1); assert.equal(role.operationsWithoutEstimate, 1);
    rmSync(join(f.directory, 'requests/operation-2-result.json'));
    const missing = benchmarkJob(f.directory); assert.equal(missing.providerActivity.observedSummedSeconds, 100); assert.equal(missing.providerActivity.completeSummedSeconds, null); assert.equal(missing.providerActivity.requestsWithoutDuration, 1);
  } finally { f.cleanup(); }
});

test('only actual matching local receipts count as executed; failed validation stays unexecuted', () => {
  const f = fixture(); try {
    f.job.costLedger.operations = [operation('operation-1')]; terminate(f.job); f.save();
    write(f.directory, 'requests/operation-1-result.json', { elapsedMs: 10, status: 'completed', text: 'PRIVATE MODEL OUTPUT', output: [call('success'), call('failure'), call('validation'), { ...call('foreign'), namespace: 'other' }, call('../unsafe')] });
    write(f.directory, 'requests/operation-1-success.json', { name: 'read_page', result: { text: 'PRIVATE SOURCE BODY', credential: 'SECRET' } });
    write(f.directory, 'requests/operation-1-failure.json', { name: 'read_page', result: { error: 'PRIVATE TRACE AND PATH' } });
    const report = benchmarkJob(f.directory);
    assert.deepEqual(report.localTools.read_page, { requested: 5, executedReceipts: 2, succeeded: 1, failed: 1, receiptOutcomeUnknown: 0, withoutExecutionReceipt: 3 });
    assert.doesNotMatch(JSON.stringify(report), /PRIVATE|SECRET|never-export|unsafe/);
  } finally { f.cleanup(); }
});

test('draft stage, actual timing, recorded freshness and interventions stay separate from acceptance', () => {
  const f = fixture(); try {
    f.job.costLedger.operations = [operation('operation-1')]; f.job.status = 'awaiting-decision'; f.job.updatedAt = at(90);
    f.job.events = [
      { at: at(40), type: 'factory-technical-retry-permit', detail: 'SECRET CONTEXT' },
      { at: at(41), type: 'factory-technical-retry-used', detail: 'operation-1' },
      { at: at(42), type: 'owner-time-allowance-amendment', detail: 'PRIVATE OWNER TEXT' },
      { at: at(85), type: 'terminal', detail: 'awaiting-decision' },
    ]; f.save();
    write(f.directory, 'starting-inputs.json', { freshContentOnly: true, authoredInputs: [], briefSha256: 'b'.repeat(64), implementationSha256: { 'runtime.ts': 'c'.repeat(64) }, brief: { private: 'SECRET' } });
    write(f.directory, 'phases/tester.json', { binding: 'hidden', completedAt: at(84), operationId: 'operation-1', result: { private: 'SECRET' } });
    write(f.directory, 'build-result.json', { structuralValid: true, listening: 'pending', field: 'unverified', readyForOrdinaryUse: false, packagePath: '/private/secret/package.json', timing: { targetSeconds: 3600, totalSeconds: 2800, remainingSeconds: 800, withinTarget: true, stationaryAudioSeconds: 500, walkingSeconds: 1900, allowanceSeconds: 400, measuredWalk: false } });
    write(f.directory, 'handoff.json', { status: 'awaiting-listening', durationAcceptance: { status: 'unconfirmed' } });
    const report = benchmarkJob(f.directory);
    assert.equal(report.successStage, 'offline-draft-tested'); assert.equal(report.elapsed.createdToTerminalSeconds, 85);
    assert.equal(report.package.shortfallSeconds, 800); assert.equal(report.package.durationAcceptance, 'unconfirmed'); assert.equal(report.package.listening, 'pending'); assert.equal(report.package.walkingMeasured, false); assert.equal(report.package.readyForOrdinaryUse, false);
    assert.equal(report.interventions.recoveryEventCount, 2); assert.equal(report.interventions.timeAmendments, 1); assert.match(report.benchmarkContext, /supervised/);
    assert.equal(report.freshness.authoredInputsEmpty, true); assert.equal(report.freshness.startingEvidenceSha256, 'a'.repeat(64));
    assert.doesNotMatch(JSON.stringify(report), /SECRET|PRIVATE|\/private/);
  } finally { f.cleanup(); }
});

test('comparison emits deltas only for matching completion stages and known terminal/duration times', () => {
  const a = fixture('before'), b = fixture('after'); try {
    a.job.costLedger.operations = [operation('operation-1')]; b.job.costLedger.operations = [operation('operation-1')]; terminate(a.job, 80); terminate(b.job, 60); a.save(); b.save();
    for (const f of [a, b]) write(f.directory, 'requests/operation-1-result.json', { elapsedMs: 10000, output: [], status: 'completed' });
    let comparison = benchmarkRuns([a.directory, b.directory]).comparisons[0];
    assert.equal(comparison.createdToTerminalSecondsDelta, -20); assert.equal(comparison.providerSummedSecondsDelta, 0); assert.equal(comparison.causalImprovementEstablished, false);
    write(b.directory, 'research-validated.json', {}); comparison = benchmarkRuns([a.directory, b.directory]).comparisons[0];
    assert.equal(comparison.sameSuccessStage, false); assert.equal(comparison.createdToTerminalSecondsDelta, null); assert.equal(comparison.providerSummedSecondsDelta, null); assert.equal(comparison.requestCountDelta, null);
    b.job.status = 'running'; b.job.updatedAt = at(100); b.save(); const running = benchmarkJob(b.directory);
    assert.equal(running.elapsed.terminalAt, null); assert.equal(running.elapsed.createdToTerminalSeconds, null); assert.equal(running.elapsed.createdToSnapshotSeconds, 100);
  } finally { a.cleanup(); b.cleanup(); }
});

test('corrective render counters are distinct from initial/final package recording counts', () => {
  const f = fixture(); try {
    f.job.counters.render = { 'clip-a': 1, 'clip-b': 1 }; f.save();
    let report = benchmarkJob(f.directory);
    assert.equal(report.automaticAllowances.correctiveRenders, 2); assert.equal(Object.hasOwn(report.automaticAllowances, 'renders'), false);
    assert.equal(report.recordingCounts.initial, null); assert.equal(report.recordingCounts.final, null);
    write(f.directory, 'build-result-10.json', { validation: { recordingCount: 3 } });
    write(f.directory, 'build-result-2.json', { validation: { recordingCount: 4 } });
    write(f.directory, 'build-result.json', { validation: { recordingCount: 3 } });
    report = benchmarkJob(f.directory);
    assert.equal(report.recordingCounts.initial, 4); assert.equal(report.recordingCounts.final, 3); assert.equal(report.recordingCounts.initialEvidenceFile, 'build-result-2.json');
    write(f.directory, 'build-result-1.json', { structuralValid: true });
    assert.equal(benchmarkJob(f.directory).recordingCounts.initial, null, 'Do not backfill unknown first-build count from later validation');
  } finally { f.cleanup(); }
});

test('every subsequent run compares to the first baseline even after an intermediate different-stage failure', () => {
  const baseline = fixture('hampstead-baseline'), middle = fixture('highgate-blocked'), final = fixture('highgate-fresh-v2');
  try {
    for (const [i, f] of [baseline, middle, final].entries()) {
      f.job.costLedger.operations = [operation('operation-1', { failure: i === 1 ? 'route-safety' : undefined })];
      f.job.events.push({ at: at(30), type: 'factory-local-fix', detail: 'Synthetic retained intervention' });
      terminate(f.job, [80, 70, 60][i]); f.save();
      write(f.directory, 'requests/operation-1-result.json', { elapsedMs: [10000, 8000, 5000][i], output: [], status: i === 1 ? 'failed' : 'completed' });
    }
    write(middle.directory, 'research-validated.json', {});
    const report = benchmarkRuns([baseline.directory, middle.directory, final.directory]);
    assert.equal(report.jobs.length, 3);
    assert.deepEqual(report.comparisons.map(c => [c.before, c.after]), [['hampstead-baseline', 'highgate-blocked'], ['hampstead-baseline', 'highgate-fresh-v2']]);
    assert.equal(report.comparisons[0].sameSuccessStage, false); assert.equal(report.comparisons[0].createdToTerminalSecondsDelta, null);
    assert.equal(report.comparisons[1].sameSuccessStage, true); assert.equal(report.comparisons[1].createdToTerminalSecondsDelta, -20); assert.equal(report.comparisons[1].providerSummedSecondsDelta, -5);
    assert.equal(report.jobs[1].requests.recordedOperationFailures, 1); assert.equal(report.jobs[1].usage.byRole[0].observedInputTokens, 100); assert.equal(report.jobs[1].interventions.recoveryEventCount, 1);
    assert.deepEqual(report.jobs.map(j => j.requests.count), [1, 1, 1]);
  } finally { baseline.cleanup(); middle.cleanup(); final.cleanup(); }
});

test('redacted factory report retains allowlisted build validation and final package-check review outcome', () => {
  const f = fixture(); try {
    f.save();
    const validation = { schemaVersion: 1, checkedAt: at(80), inputSha256: 'a'.repeat(64), packageSha256: 'b'.repeat(64), recordingCount: 4, audioCheckMode: 'local-ffmpeg-ffprobe', checks: ['Actual audio fully decoded'], privateTrace: '/private/SECRET' };
    write(f.directory, 'build-result.json', { validation, packagePath: '/private/SECRET/package.json', structuralValid: true });
    write(f.directory, 'phases/package-check-review.json', { operationId: 'operation-7', completedAt: at(90), result: { verdict: 'accepted', issues: [], rawContext: 'SECRET' } });
    const report = factoryReport(f.directory, join(f.directory, 'redacted-report.json'));
    assert.ok(report.observed.build?.validation);
    assert.equal(report.observed.build.validation.recordingCount, 4); assert.equal(report.observed.build.validation.packageSha256, 'b'.repeat(64));
    assert.deepEqual(report.observed.phaseOutcomes, [{ id: 'package-check-review', operationId: 'operation-7', completedAt: at(90), verdict: 'accepted', requiredIssues: 0 }]);
    assert.doesNotMatch(JSON.stringify(report), /SECRET|privateTrace|rawContext|packagePath/);
  } finally { f.cleanup(); }
});


test('confirmed local setup failure is zero provider activity, not a missing inference duration',()=>{
 const f=fixture();try{
  f.job.costLedger.operations=[operation('operation-1',{failure:'provider_initialization_not_dispatched',usage:{...knownUsage,inputTokens:0,outputTokens:0,totalTokens:0,cachedInputTokens:0,reasoningTokens:0,subscription:false,apiEquivalentRangeUsd:{lower:0,upper:0}}})];terminate(f.job);f.save();
  write(f.directory,'requests/operation-1-not-dispatched.json',{stage:'provider-initialization',inferenceDispatched:false});
  const r=benchmarkJob(f.directory);assert.equal(r.requests.count,1);assert.equal(r.requests.inferenceAttempts,0);assert.equal(r.requests.notDispatchedConfirmed,1);
  assert.equal(r.providerActivity.completeSummedSeconds,0);assert.equal(r.providerActivity.requestsWithoutDuration,0);
  assert.equal(r.requests.byProviderStatus.not_dispatched,1);
 }finally{f.cleanup();}
});


test('underlength rendered draft remains visible without being promoted to a final accepted build',()=>{
 const f=fixture();try{
  terminate(f.job);f.save();
  write(f.directory,'build-result-2.json',{structuralValid:true,packagePath:'/private/SECRET',timing:{targetSeconds:3600,totalSeconds:3045.12,withinTarget:true},validation:{recordingCount:4,packageSha256:'b'.repeat(64)}});
  const benchmark=benchmarkJob(f.directory),report=factoryReport(f.directory,join(f.directory,'report.json'));
  assert.equal(benchmark.successStage,'offline-draft-built');assert.equal(benchmark.package.promotedToFinalBuild,false);assert.equal(benchmark.package.testerCompleted,false);
  assert.equal(benchmark.package.timing?.totalSeconds,3045.12);assert.equal(benchmark.recordingCounts.final,4);
  assert.equal(report.observed.build?.promotedToFinalBuild,false);assert.equal(report.observed.build?.evidenceFile,'build-result-2.json');assert.equal(report.observed.build?.validation?.recordingCount,4);
  assert.equal(report.observed.durationAcceptance,null);assert.doesNotMatch(JSON.stringify([benchmark,report]),/SECRET|packagePath/);
 }finally{f.cleanup();}
});
