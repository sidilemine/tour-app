import test from 'node:test';
import assert from 'node:assert/strict';
import { pendingArrivalNeedsFreshFix } from '../src/domain/engine';
import { harness } from './helpers';

// Synthetic coordinates from helpers, with the failure pattern from the
// 14 September walks: recognised B, long stationary wait, then explicit Resume.
test('a stationary delivery gap explains a blocked Resume without trusting an old fix', () => {
  const h = harness();
  h.send({ type: 'start', at: 0, diagnostics: true }); h.finish(12000);
  h.send({ type: 'pause', at: 13000 }); h.arrive(1, 200000);
  assert.equal(pendingArrivalNeedsFreshFix(h.state, 280000), false); // Still held.
  assert.deepEqual(h.send({ type: 'resume', at: 280000 }).effects, []);
  assert.equal(pendingArrivalNeedsFreshFix(h.state, 280000), true);
  assert.deepEqual(h.fix(1, 281000, { timestamp: 205000 }).effects, []);
  h.arrive(1, 282000);
  assert.equal(h.state.playback.index, 1);
});

for (const unfinished of [false, true]) test(`fresh stationary updates permit prompt ordered release; unfinished A=${unfinished}`, () => {
  const h = harness(); h.send({ type: 'start', at: 0, diagnostics: true });
  if (unfinished) h.send({ type: 'audio', at: 4000, token: h.state.playback.token, offset: 4, playing: true, finished: false, buffering: false });
  else h.finish(12000);
  h.send({ type: 'pause', at: 13000 }); h.arrive(1, 200000);
  for (let at = 206000; at <= 280000; at += 2000) {
    assert.deepEqual(h.fix(1, at).effects, []); // Same position, newer timestamp.
    assert.equal(h.state.hold, 'manual');
  }
  const r = h.send({ type: 'resume', at: 281000 });
  assert.equal(r.effects[0]?.type, 'play');
  assert.equal(h.state.playback.index, unfinished ? 0 : 1);
  if (unfinished) {
    assert.equal(h.state.playback.offset, 4);
    for (let at = 282000; at <= 288000; at += 2000) assert.deepEqual(h.fix(1, at).effects, []);
    h.finish(289000); assert.equal(h.state.playback.index, 1);
  }
  assert.equal(pendingArrivalNeedsFreshFix(h.state, 289000), false);
  assert.equal(h.history.flatMap(x => x.effects).filter(x => x.type === 'play' && x.index === 1).length, 1);
});

test('a fix can be fresh at Resume but expire while the rest of A plays', () => {
  const h = harness(); h.send({ type: 'start', at: 0, diagnostics: true });
  h.send({ type: 'pause', at: 4000 }); h.arrive(1, 200000);
  h.send({ type: 'resume', at: 217000 });
  assert.equal(pendingArrivalNeedsFreshFix(h.state, 217000), false); // A owns playback.
  assert.deepEqual(h.finish(225000).effects, []);
  assert.equal(pendingArrivalNeedsFreshFix(h.state, 225000), true);
  h.fix(1, 226000); assert.equal(h.state.playback.index, 1);
});

for (const action of ['pause', 'end', 'disable'] as const) test(`fresh stationary callbacks cannot override ${action}`, () => {
  const h = harness(); h.send({ type: 'start', at: 0, diagnostics: true }); h.finish(12000);
  h.send({ type: 'pause', at: 13000 }); h.arrive(1, 200000);
  h.send({ type: 'resume', at: 280000 });
  assert.equal(pendingArrivalNeedsFreshFix(h.state, 280000), true);
  h.send(action === 'disable' ? { type: 'automatic', enabled: false, at: 281000 } : { type: action, at: 281000 });
  assert.equal(pendingArrivalNeedsFreshFix(h.state, 281000), false);
  for (let at = 282000; at <= 350000; at += 2000) assert.deepEqual(h.fix(1, at).effects, []);
  assert.equal(h.state.stops[1], 'unplayed');
});
