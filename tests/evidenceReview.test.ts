import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewExports } from '../tools/testing/review';
import { fixture } from './helpers';
import { initialState, reduce } from '../src/domain/engine';
const ctx = { sourceId: 'source', fixtureKey: `${fixture.id}@1` };
const attempt = { id: 'attempt', caseId: 'pause-silence', startedAt: 100, finishedAt: 300, outcome: 'observed-pass', start: ctx, finish: ctx, notes: 'PRIVATE NOTE' };
const result = (attempts: unknown[] = [attempt]) => ({ schemaVersion: 1, exportedAt: new Date(400).toISOString(), journal: { attempts, active: null } });
function diagnostic() {
  const before = initialState(), event = { type: 'start' as const, at: 200, diagnostics: true }, r = reduce(before, event, fixture);
  return { schemaVersion: 1, exportedAt: new Date(500).toISOString(), build: { sourceId: 'source' }, fixture, events: [{ kind: 'transition', event, before, after: r.state, effects: r.effects, reason: r.reason }] };
}
test('cumulative result exports deduplicate attempts and replay candidates without certifying acceptance', () => {
  const r = reviewExports([{name:'one.json',value:result()},{name:'two.json',value:result()},{name:'log.json',value:diagnostic()}]);
  assert.equal(r.attempts.length,1); assert.deepEqual(r.attempts[0].files,['one.json','two.json']); assert.deepEqual(r.attempts[0].candidateDiagnostics,['log.json']);
  assert.equal(r.diagnostics[0].replay,'reproduced'); assert.equal(r.attempts[0].reviewRequired,true);
  assert.ok(!JSON.stringify(r).includes('PRIVATE NOTE')); assert.ok(!JSON.stringify(r).includes('latitude'));
});
test('wrong source, route, export time or event window cannot match an attempt', () => {
  for (const change of ['source','route','export-time','window']) {
    const d=diagnostic(); if(change==='source')d.build.sourceId='other'; if(change==='route')d.fixture={...d.fixture,id:'other'};
    if(change==='export-time')d.exportedAt=new Date(250).toISOString();
    const a=change==='window'?{...attempt,startedAt:301,finishedAt:400}:attempt;
    const r=reviewExports([{name:'result.json',value:result([a])},{name:'log.json',value:d}]);
    assert.deepEqual(r.attempts[0].candidateDiagnostics,[]); assert.ok(r.attempts[0].warnings.length);
  }
});
test('conflicting completed copies and context changes require review without silent selection', () => {
  const r=reviewExports([{name:'a.json',value:result()},{name:'b.json',value:result([{...attempt,notes:'changed'}])},{name:'log.json',value:diagnostic()}]);
  assert.equal(r.attempts[0].conflict,true); assert.deepEqual(r.attempts[0].candidateDiagnostics,[]);
  const changed=reviewExports([{name:'a.json',value:result([{...attempt,finish:{...ctx,sourceId:'different'}}])}]); assert.equal(changed.attempts[0].contextChanged,true);
});
test('replay divergence and missing transitions remain visible', () => {
  const d=diagnostic();d.events[0].after={...d.events[0].after,hold:'corrupted'};
  const r=reviewExports([{name:'r.json',value:result()},{name:'bad.json',value:d},{name:'empty.json',value:{...diagnostic(),events:[]}}]);
  assert.equal(r.diagnostics[0].replay,'failed');assert.equal(r.errors.length,1);assert.equal(r.diagnostics[1].replay,'no-transitions');assert.ok(r.attempts[0].warnings.some(w=>w.includes('not reproduced')));
});
test('bad envelopes/attempts are errors, plain fixtures ignored and unfinished observations never become passes', () => {
  const r=reviewExports([{name:'route.json',value:fixture},{name:'bad.json',value:{journal:{}}},{name:'invalid.json',value:result([{...attempt,finishedAt:50}])},{name:'draft.json',value:{...result([]),journal:{attempts:[],active:attempt}}}]);
  assert.deepEqual(r.ignored,['route.json']);assert.equal(r.errors.length,2);assert.equal(r.attempts.length,0);assert.equal(r.unfinishedSnapshots,1);
});
