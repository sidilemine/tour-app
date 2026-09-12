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
