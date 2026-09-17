import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, harness } from './helpers';
import { initialState, recovered, reduce } from '../src/domain/engine';
import { parseFixture, project } from '../src/domain/fixture';
import { PlayGate } from '../src/session/playGate';

test('two genuine 3-minute silent gaps produce exactly one next arrival each', () => {
  const h=harness(); h.send({ type:'start',at:0,diagnostics:true }); h.finish(12000);
  assert.equal(h.state.playback.index,null);
  h.arrive(1,200000); assert.equal(h.state.playback.index,1);
  for(let at=206000;at<220000;at+=2000) h.fix(1,at);
  h.finish(220000); h.arrive(2,410000); h.finish(426000);
  assert.deepEqual(h.history.flatMap(x=>x.effects).filter(x=>x.type==='play').map(x=>x.index),[0,1,2]);
  assert.deepEqual(h.state.stops,['completed','completed','completed']);
});
for(const order of ['pause-first','arrival-first']) test(`manual pause wins ${order}`, () => {
  const h=harness();h.send({type:'start',at:0,diagnostics:true});h.finish(12000);
  if(order==='pause-first')h.send({type:'pause',at:199000});
  h.arrive(1,200000);
  if(order==='arrival-first')h.send({type:'pause',at:205000});
  h.fix(1,260000);
  assert.equal(h.state.hold,'manual');assert.notEqual(h.state.playback.status,'playing');
  assert.ok(h.history.at(-1)?.effects.every(x=>x.type!=='play'));
});
test('pause during silence persists through arrival and explicit resume plays eligible clip',()=>{
  const h=harness();h.send({type:'start',at:0,diagnostics:true});h.finish(12000);h.send({type:'pause',at:13000});h.arrive(1,200000);
  assert.equal(h.state.playback.index,null);h.send({type:'resume',at:205000});assert.equal(h.state.playback.index,1);
});
test('automatic disabled remains disabled after resume',()=>{
  const h=harness();h.send({type:'start',at:0,diagnostics:true});h.finish(12000);h.send({type:'automatic',enabled:false,at:13000});h.send({type:'pause',at:14000});h.arrive(1,200000);h.send({type:'resume',at:205000});
  assert.equal(h.state.automatic,false);assert.equal(h.state.playback.index,null);
});
test('early arrival waits for actual end, then revalidates the latest fix',()=>{
  const h=harness();h.send({type:'start',at:0,diagnostics:true});h.arrive(1,200000);
  assert.equal(h.state.playback.index,0);assert.equal(h.history.at(-1)?.reason,'arrival-pending-unfinished-clip');
  h.finish(205000);assert.equal(h.state.playback.index,1);
});
test('passing a pending stop does not play a stale backlog',()=>{
  const h=harness();h.send({type:'start',at:0,diagnostics:true});h.arrive(1,200000);
  h.send({type:'fix',at:245000,fix:{latitude:fixture.stops[1].standing.latitude+0.001,longitude:0,accuracy:5,timestamp:245000}});
  h.finish(246000);assert.equal(h.state.playback.index,null);assert.equal(h.state.stops[1],'unplayed');
});
test('old pending arrival is not used when finishing after signal loss',()=>{
  const h=harness();h.send({type:'start',at:0,diagnostics:true});h.arrive(1,200000);h.finish(230000);assert.equal(h.state.playback.index,null);
});
test('single GPS jump, stale fixes and poor accuracy cannot establish arrival',()=>{
  const h=harness();h.send({type:'start',at:0,diagnostics:true});h.finish(12000);h.fix(0,190000);
  assert.equal(h.fix(1,191000).reason,'implausible-speed-or-jump');
  assert.equal(h.fix(1,250000,{timestamp:200000}).reason,'stale-fix');
  assert.equal(h.fix(1,252000,{accuracy:90}).reason,'poor-accuracy');
  assert.equal(h.state.playback.index,null);
});
test('same callback timestamp cannot accumulate dwell',()=>{
  const h=harness();h.send({type:'start',at:0,diagnostics:true});h.finish(12000);
  h.fix(1,200000);h.fix(1,200000);h.fix(1,200000);assert.equal(h.state.location.count,1);assert.equal(h.state.playback.index,null);
});
test('out-of-order sample does not roll location back',()=>{
  const h=harness();h.send({type:'start',at:0,diagnostics:false});h.finish(12000);h.fix(1,200000);h.fix(1,199000);
  assert.equal(h.state.location.fix?.timestamp,200000);assert.equal(h.state.location.count,1);
});
test('missing accuracy, future and nonfinite coordinates reject safely',()=>{
  const h=harness();h.send({type:'start',at:0,diagnostics:false});h.finish(12000);
  assert.equal(h.fix(1,200000,{accuracy:Infinity}).reason,'poor-accuracy');
  assert.equal(h.fix(1,200000,{latitude:NaN}).reason,'invalid-fix');
  assert.equal(h.fix(1,200000,{timestamp:210000}).reason,'stale-fix');
});
test('implausible speed and off-route fix cannot trigger',()=>{
  const h=harness();h.send({type:'start',at:0,diagnostics:false});h.finish(12000);
  assert.equal(h.fix(1,200000,{speed:20}).reason,'implausible-speed-or-jump');
  assert.equal(h.fix(1,230000,{longitude:0.002}).reason,'off-route');
});
test('walking backwards rejects the current candidate',()=>{
  const h=harness();h.send({type:'start',at:0,diagnostics:false});h.finish(12000);h.fix(1,200000);
  const r=h.send({type:'fix',at:220000,fix:{latitude:0.0035,longitude:0,accuracy:5,timestamp:220000}});
  assert.equal(r.reason,'reversal');assert.equal(h.state.location.arrived,undefined);
});
test('system pause and focus return do not override the hold',()=>{
  const h=harness();h.send({type:'start',at:0,diagnostics:true});
  const token=h.state.playback.token;
  h.send({type:'audio',at:1000,token,offset:1,playing:true,finished:false,buffering:false});
  h.send({type:'audio',at:5000,token,offset:5,playing:false,finished:false,buffering:false});
  const resumed=h.send({type:'audio',at:6000,token,offset:5,playing:true,finished:false,buffering:false});
  assert.equal(h.state.hold,'native-pause-or-interruption');assert.deepEqual(resumed.effects,[{type:'pause'}]);
  assert.equal(h.send({type:'resume',at:7000}).effects[0]?.type,'play');
});
test('manual play is allowed while hold stays set, replay does not undo completion',()=>{
  const h=harness();h.send({type:'start',at:0,diagnostics:true});h.finish(12000);h.send({type:'pause',at:14000});
  h.send({type:'manual',index:0,at:15000});assert.equal(h.state.hold,'manual');assert.equal(h.state.stops[0],'completed');h.finish(30000);assert.equal(h.state.stops[0],'completed');
});
test('skip invalidates old player completion and does not pretend a stop was heard',()=>{
  const h=harness();h.send({type:'start',at:0,diagnostics:true});const token=h.state.playback.token;
  h.send({type:'skip',index:0,at:5000});const stale=h.send({type:'audio',token,at:6000,offset:12,finished:true,playing:false,buffering:false});
  assert.equal(stale.reason,'obsolete-audio-event');assert.equal(h.state.stops[0],'skipped');
});
test('audio failure keeps content unfinished and suppresses automatic playback',()=>{
  const h=harness();h.send({type:'start',at:0,diagnostics:true});h.send({type:'audio',at:2000,token:h.state.playback.token,offset:0,playing:false,finished:false,buffering:false,error:'decoder failed'});
  assert.equal(h.state.stops[0],'in-progress');assert.equal(h.state.hold,'audio-error');assert.equal(h.state.playback.status,'failed');
});
test('recovery preserves hold, offset and completion but needs fresh fix and Start',()=>{
  const h=harness();h.send({type:'start',at:0,diagnostics:true});h.finish(12000);h.arrive(1,200000);
  h.send({type:'audio',at:210000,token:h.state.playback.token,offset:6,playing:true,finished:false,buffering:false});h.send({type:'pause',at:211000});
  const r=recovered(h.state);assert.equal(r.active,false);assert.equal(r.hold,'manual');assert.equal(r.playback.offset,6);assert.equal(r.stops[0],'completed');assert.equal(r.location.fix,undefined);
  assert.equal(reduce(r,{type:'start',at:240000,diagnostics:true},fixture).state.hold,'manual');
});
test('ambiguous loading state after process death is held, never replayed automatically',()=>{
  const h=harness();h.send({type:'start',at:0,diagnostics:true});const r=recovered(h.state);
  assert.equal(r.hold,'recovery');assert.equal(r.playback.status,'paused');assert.deepEqual(reduce(r,{type:'start',at:5000,diagnostics:true},fixture).effects,[]);
});
test('End stops automatic arrival even when resume is used for manual listening',()=>{
  const h=harness();h.send({type:'start',at:0,diagnostics:true});h.finish(12000);h.send({type:'end',at:15000});h.send({type:'resume',at:16000});h.arrive(1,200000);assert.equal(h.state.active,false);assert.equal(h.state.playback.index,null);
});
test('asynchronous play gate cancels earlier Resume/Manual/arrival when later Pause arrives',()=>{
  for(const earlier of ['resume','manual','fix']) { const gate=new PlayGate();const epoch=gate.receive(earlier);gate.receive('pause');assert.equal(gate.allows(epoch),false);assert.equal(gate.allows(gate.receive('resume')),true); }
});
test('fixture parser rejects duplicate IDs, reversed indices and impossible straight segments',()=>{
  assert.equal(parseFixture(JSON.stringify(fixture)).stops.length,3);
  const duplicate=structuredClone(fixture);duplicate.stops[1].id='a';assert.throws(()=>parseFixture(JSON.stringify(duplicate)),/unique/);
  const reversed=structuredClone(fixture);reversed.stops[1].routeIndex=0;assert.throws(()=>parseFixture(JSON.stringify(reversed)));
  const distant=structuredClone(fixture);distant.route[5].latitude=20;assert.throws(()=>parseFixture(JSON.stringify(distant)),/250/);
});
test('physical geometry and required metadata stay separate and unverified',()=>{
  const f=parseFixture(JSON.stringify(fixture));assert.equal(f.verification.status,'unverified');assert.equal(f.stops[0].landmark,undefined);assert.ok(f.stops[0].access);
});
test('route projection respects expected leg at a crossing',()=>{
  const route=[{latitude:0,longitude:0},{latitude:0.001,longitude:0.001},{latitude:0,longitude:0.001},{latitude:0.001,longitude:0}];
  const p={latitude:0.0005,longitude:0.0005};const early=project(p,route,0,1),late=project(p,route,2,3);
  assert.ok(early.crossTrack<1);assert.ok(late.crossTrack<1);assert.ok(late.along>early.along+100);
});
test('reducer never mutates input snapshots',()=>{const before=initialState(),copy=structuredClone(before);reduce(before,{type:'start',at:0,diagnostics:true},fixture);assert.deepEqual(before,copy);});

test('passing B on the onward route keeps it unplayed until a fresh return arrival',()=>{
  // Synthetic counterpart of the long-A field walk. Full-route proximity must
  // never become permission to play a missed stop or jump directly to C.
  const h=harness();h.send({type:'start',at:0,diagnostics:true});h.arrive(1,200000);
  assert.equal(h.history.at(-1)?.reason,'arrival-pending-unfinished-clip');
  const beyond={latitude:fixture.stops[1].standing.latitude+0.001,longitude:0};
  assert.ok(project(beyond,fixture.route).crossTrack<1e-9);
  assert.ok(project(beyond,fixture.route,0,fixture.stops[1].routeIndex).crossTrack>45);
  h.send({type:'fix',at:245000,fix:{...beyond,accuracy:5,timestamp:245000}});
  assert.equal(h.state.location.arrived,undefined);
  h.finish(381000);
  assert.equal(h.state.playback.index,null);assert.equal(h.state.stops[1],'unplayed');
  h.fix(1,430000);assert.equal(h.state.playback.index,null);
  h.fix(1,432000);assert.equal(h.state.playback.index,null);
  h.fix(1,434000);assert.equal(h.state.playback.index,1);
  h.fix(1,436000);
  assert.deepEqual(h.history.flatMap(x=>x.effects).filter(x=>x.type==='play').map(x=>x.index),[0,1]);
  assert.equal(h.state.stops[2],'unplayed');
});

test('explicit review close resumes saved narration at its offset', () => {
  const h = harness(); h.send({ type: 'start', at: 0, diagnostics: false });
  h.send({ type: 'audio', at: 5000, token: h.state.playback.token, playing: true, finished: false, offset: 5, buffering: false });
  h.send({ type: 'pause', at: 5100, reason: 'review' });
  const result = h.send({ type: 'review-close', at: 10000 });
  assert.equal(h.state.hold, null);
  assert.ok(result.effects.some(e => e.type === 'play' && e.index === 0 && e.offset === 5));
});
test('review close re-enables subsequent location arrivals without replaying the completed stop', () => {
  const h = harness(); h.send({ type: 'start', at: 0, diagnostics: false }); h.finish(12000);
  h.send({ type: 'pause', at: 13000, reason: 'review' });
  assert.deepEqual(h.send({ type: 'review-close', at: 14000 }).effects, []);
  h.arrive(1, 20000); assert.equal(h.state.playback.index, 1);
});
test('review close preserves automatic-off and never restarts an ended walk', () => {
  const h = harness(); h.send({ type: 'start', at: 0, diagnostics: false }); h.finish(12000);
  h.send({ type: 'pause', at: 13000, reason: 'review' });
  h.send({ type: 'automatic', at: 14000, enabled: false }); h.arrive(1, 20000);
  assert.deepEqual(h.send({ type: 'review-close', at: 25000 }).effects, []);
  assert.equal(h.state.automatic, false);
  h.send({ type: 'end', at: 26000 });
  const result = h.send({ type: 'review-close', at: 27000 });
  assert.deepEqual(result.effects, []); assert.equal(h.state.active, false); assert.equal(h.state.hold, 'ended');
});
test('review close still requires fresh position for a pending arrival', () => {
  const h = harness(); h.send({ type: 'start', at: 0, diagnostics: false }); h.finish(12000);
  h.send({ type: 'pause', at: 13000, reason: 'review' }); h.arrive(1, 20000);
  assert.deepEqual(h.send({ type: 'review-close', at: 60000 }).effects, []);
  h.fix(1, 62000); assert.equal(h.state.playback.index, 1);
});
