import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from './helpers';
import { initialState, reduce, Event } from '../src/domain/engine';
import { replay, Transition } from '../src/domain/replay';
const events: Event[] = [
  {type:'start',at:0,diagnostics:true},
  {type:'audio',at:12000,token:1,playing:false,finished:true,offset:12,buffering:false},
  ...[200000,202000,204000].map(at=>({type:'fix' as const,at,fix:{...fixture.stops[1].standing,accuracy:5,timestamp:at}})),
];
function capture() { let state=initialState();return events.map(event=>{ const before=state,result=reduce(state,event,fixture);state=result.state;return {kind:'transition',event,before,after:state,effects:result.effects,reason:result.reason} as Transition; }); }
test('serialized diagnostics reproduce the full silent arrival transition',()=>{
  const entries=JSON.parse(JSON.stringify(capture()));const first=replay(fixture,entries),second=replay(fixture,entries);
  assert.deepEqual(first,second);assert.equal(first.transitions,5);assert.equal(first.state?.playback.index,1);assert.equal(first.segments,1);
});
test('replay identifies a changed policy result instead of trusting logged after state',()=>{
  const entries=capture();entries[4].after={...entries[4].after,hold:'incorrect'};
  assert.throws(()=>replay(fixture,entries),/divergence/);
});
test('first stale location after reopening replays without an undefined saved fix',()=>{
  const event: Event = {type:'fix',at:210000,fix:{...fixture.stops[1].standing,accuracy:5,timestamp:190000}};
  const before=capture()[1].after;
  const result=reduce(before,event,fixture);
  assert.equal(result.reason,'stale-fix');
  assert.ok(Object.hasOwn(result.state.location,'fix'));
  assert.equal(result.state.location.fix,undefined);
  const entry: Transition={kind:'transition',event,before,after:result.state,effects:result.effects,reason:result.reason};
  assert.equal(replay(fixture,JSON.parse(JSON.stringify([entry]))).transitions,1);
  const corrupted=JSON.parse(JSON.stringify([entry]));corrupted[0].after.location.count=999;
  assert.throws(()=>replay(fixture,corrupted),/divergence/);
});
