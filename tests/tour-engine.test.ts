import test from 'node:test';
import assert from 'node:assert/strict';
import { Event, Fix, initialState, recovered, reduce, State } from '../src/domain/engine';
import { Fixture, parseFixture } from '../src/domain/fixture';
import { Story } from '../src/domain/narration';

const story = (id: string): Story => ({ id, title: id, transcript: 'Synthetic test story.',
  audio: { key: id, bytes: 1, md5: '0'.repeat(32), durationSeconds: 60 },
  sources: [{ title: 'Synthetic', url: 'https://example.com' }],
  evidence: [{ paragraph: 'Synthetic test story.', kind: 'editorial', basis: 'Synthetic fixture', sourceUrls: [] }], directions: [] });
const route = Array.from({ length: 51 }, (_, i) => ({ latitude: i * 0.00045, longitude: 0 }));
const fixture: Fixture = parseFixture(JSON.stringify({ schemaVersion: 1, id: 'synthetic-six-stop-tour', version: 1,
  title: 'Synthetic six-stop tour', verification: { status: 'unverified', note: 'Never use outdoors.' }, route,
  stops: [0, 10, 20, 30, 40, 50].map((routeIndex, i) => ({ id: `stop-${i}`, title: `Stop ${i}`, standing: route[routeIndex], routeIndex,
    approach: 'Synthetic', viewpoint: 'Synthetic', access: 'Not a real route' })),
  narration: { description: 'Synthetic', introduction: 'Synthetic', finishInstructions: 'Synthetic', reviewNote: 'Synthetic', rightsNote: 'Synthetic',
    stories: Array.from({ length: 6 }, (_, i) => story(`story-${i}`)),
    chapters: [{ ...story('chapter'), afterStopIndex: 0, startRouteIndex: 2, endRouteIndex: 8 }] } }));
function harness(initial?: State) {
  let state = initial ?? initialState(fixture);
  const results: ReturnType<typeof reduce>[] = [];
  const send = (event: Event) => { const result = reduce(state, event, fixture); state = result.state; results.push(result); return result; };
  const fix = (point: number, at: number, extra: Partial<Fix> = {}) => send({ type: 'fix', at, fix: { ...route[point], timestamp: at, accuracy: 5, ...extra } });
  const dwell = (point: number, at: number) => { fix(point, at); fix(point, at + 2000); return fix(point, at + 4000); };
  const finish = (at: number) => send({ type: 'audio', at, token: state.playback.token, offset: 60, playing: false, finished: true, buffering: false });
  const start = () => send({ type: 'start', at: 0, diagnostics: false });
  return { get state() { return state; }, send, fix, dwell, finish, start, results };
}

test('six physical stops remain distinct from appended walking audio and all finish', () => {
  const h = harness(); h.start(); h.finish(1000);
  assert.equal(h.state.stops.length, 6); assert.deepEqual(h.state.chapters, ['unplayed']);
  h.dwell(3, 20000); assert.equal(h.state.playback.index, 6); h.finish(25000);
  for (let i = 1; i < 6; i++) { h.dwell(i * 10, i * 200000); assert.equal(h.state.playback.index, i); h.finish(i * 200000 + 5000); }
  assert.deepEqual(h.state.stops, Array(6).fill('completed')); assert.deepEqual(h.state.chapters, ['completed']);
});

test('stationary previous stop, one departed fix and duplicate timestamps cannot launch a chapter', () => {
  const h = harness(); h.start(); h.finish(1000); h.dwell(0, 20000);
  assert.equal(Boolean(h.state.chapterCandidate), false); h.fix(3, 100000); h.fix(3, 100000); h.fix(3, 100000);
  assert.equal(h.state.chapterCandidate?.count, 1); assert.equal(h.state.playback.index, null);
  h.fix(3, 102000); assert.equal(h.state.playback.index, null); h.fix(3, 104000); assert.equal(h.state.playback.index, 6);
});

test('manual hold persists through departure; Resume releases only fresh eligible chapter', () => {
  const h = harness(); h.start(); h.finish(1000); h.send({ type: 'pause', at: 2000 }); h.dwell(3, 20000);
  assert.equal(h.state.playback.index, null); assert.equal(h.state.hold, 'manual');
  h.send({ type: 'resume', at: 25000 }); assert.equal(h.state.playback.index, 6);
});

test('automatic disabled and ended tour suppress prepared walking chapters', () => {
  for (const event of [{ type: 'automatic', enabled: false, at: 2000 }, { type: 'end', at: 2000 }] as Event[]) {
    const h = harness(); h.start(); h.finish(1000); h.send(event); h.dwell(3, 20000); h.send({ type: 'resume', at: 25000 });
    assert.equal(h.state.playback.index, null);
  }
});

test('stale, off-route and poor fixes break departure persistence', () => {
  for (const bad of [{ timestamp: 0 }, { accuracy: 90 }, { longitude: 0.001 }] as Partial<Fix>[]) {
    const h = harness(); h.start(); h.finish(1000); h.fix(3, 20000); h.fix(3, 22000, bad); h.fix(3, 24000);
    assert.equal(h.state.playback.index, null); assert.equal(h.state.chapterCandidate?.count, 1);
  }
  const h = harness(); h.start(); h.finish(1000); h.send({ type: 'pause', at: 2000 }); h.dwell(3, 20000);
  h.send({ type: 'resume', at: 50000 }); assert.equal(h.state.playback.index, null);
  h.fix(3, 52000); assert.equal(h.state.chapterCandidate?.count, 1);
});

test('chapter requires preceding completion or skip and cannot cut off unfinished narration', () => {
  const h = harness(); h.start(); h.dwell(3, 20000); assert.equal(h.state.playback.index, 0); assert.equal(h.state.chapterCandidate, undefined);
  h.finish(25000); assert.equal(h.state.playback.index, null);
  h.dwell(3, 26000); assert.equal(h.state.playback.index, 6);
  const skipped = harness(); skipped.start(); skipped.send({ type: 'skip', index: 0, at: 1000 }); skipped.dwell(3, 20000);
  assert.equal(skipped.state.playback.index, 6); assert.equal(skipped.state.stops[0], 'skipped');
});

test('passing interval while held expires chapter permanently but manual replay remains available', () => {
  const h = harness(); h.start(); h.finish(1000); h.send({ type: 'pause', at: 2000 }); h.dwell(3, 20000); h.fix(8, 100000);
  assert.deepEqual(h.state.chapters, ['expired']); h.send({ type: 'resume', at: 101000 }); h.dwell(3, 200000);
  assert.equal(h.state.playback.index, null); h.send({ type: 'manual', index: 6, at: 205000 }); assert.equal(h.state.playback.index, 6);
  h.finish(206000); assert.deepEqual(h.state.chapters, ['completed']);
});

test('early next-stop arrival takes precedence over unstarted chapter and does not create backlog', () => {
  const h = harness(); h.start(); h.dwell(10, 200000); assert.equal(h.state.playback.index, 0); assert.deepEqual(h.state.chapters, ['expired']);
  h.finish(205000); assert.equal(h.state.playback.index, 1); h.finish(206000);
  h.dwell(3, 300000); assert.equal(h.state.playback.index, null);
});

test('next arrival waits for walking chapter completion and revalidates fresh location', () => {
  for (const stale of [false, true]) {
    const h = harness(); h.start(); h.finish(1000); h.dwell(3, 20000); h.dwell(10, 200000);
    assert.equal(h.state.playback.index, 6); assert.equal(h.results.at(-1)?.reason, 'arrival-pending-unfinished-clip');
    h.finish(stale ? 230000 : 205000); assert.equal(h.state.playback.index, stale ? null : 1);
    assert.deepEqual(h.state.chapters, ['completed']);
  }
});

test('completed chapter cannot trigger twice; explicit chapter skip invalidates obsolete completion', () => {
  const h = harness(); h.start(); h.finish(1000); h.dwell(3, 20000); h.finish(25000); h.dwell(3, 26000);
  assert.equal(h.state.playback.index, null);
  const skipped = harness(); skipped.start(); skipped.finish(1000); skipped.dwell(3, 20000); const token = skipped.state.playback.token;
  skipped.send({ type: 'skip', index: 6, at: 25000 }); skipped.send({ type: 'audio', at: 26000, token, offset: 60, playing: false, finished: true, buffering: false });
  assert.deepEqual(skipped.state.chapters, ['skipped']); assert.equal(skipped.state.stops.length, 6); skipped.dwell(3, 30000); assert.equal(skipped.state.playback.index, null);
});

test('chapter recovery retains seek target through loading, but clears departure evidence', () => {
  const h = harness(); h.start(); h.finish(1000); h.dwell(3, 20000);
  h.send({ type: 'audio', at: 25000, token: h.state.playback.token, offset: 17, playing: true, finished: false, buffering: false });
  const saved = recovered(h.state); assert.equal(saved.playback.offset, 17); assert.deepEqual(saved.chapters, ['in-progress']); assert.equal(saved.chapterCandidate, undefined);
  const r = harness(saved); r.send({ type: 'start', at: 30000, diagnostics: false }); assert.equal(r.state.hold, 'recovery');
  const resumed = r.send({ type: 'resume', at: 31000 }); assert.equal(resumed.effects[0]?.type, 'play');
  r.send({ type: 'audio', at: 32000, token: r.state.playback.token, offset: 0, playing: false, finished: false, buffering: true });
  assert.equal(r.state.playback.offset, 17); assert.equal(r.state.playback.index, 6);
});

test('manual selection restores interrupted stop eligibility and does not strand chapter', () => {
  const h = harness(); h.start(); h.send({ type: 'manual', index: 4, at: 1000 });
  assert.equal(h.state.stops[0], 'unplayed'); assert.equal(h.state.stops[4], 'in-progress');
  h.send({ type: 'manual', index: 0, at: 2000 }); assert.equal(h.state.stops[4], 'unplayed'); h.finish(3000); h.dwell(3, 20000);
  assert.equal(h.state.playback.index, 6); h.send({ type: 'manual', index: 1, at: 25000 });
  assert.deepEqual(h.state.chapters, ['skipped']); assert.equal(h.state.stops[1], 'in-progress');
});

test('fractional/nonfinite/out-of-range manual and skip indices cannot mutate state or emit audio', () => {
  for (const index of [-1, 0.5, 6.5, 7, 1000, NaN, Infinity]) for (const type of ['manual', 'skip'] as const) {
    const h = harness(); h.start(); const before = structuredClone(h.state); const result = h.send({ type, index, at: 1000 });
    assert.deepEqual(result.state, before); assert.deepEqual(result.effects, []); assert.equal(result.reason, 'invalid-event');
  }
  const h = harness(); h.start(); const before = structuredClone(h.state);
  h.send({ type: 'audio', at: 1000, token: h.state.playback.token, offset: NaN, playing: true, finished: false, buffering: false }); assert.deepEqual(h.state, before);
});

test('tour reducers preserve caller snapshots and legacy states retain no chapter properties', () => {
  const h = harness(); h.start(); h.finish(1000); h.fix(3, 20000); const before = h.state; const copy = structuredClone(before); h.fix(3, 22000);
  assert.deepEqual(before, copy); assert.equal('chapters' in initialState(), false); assert.equal('chapterCandidate' in recovered(initialState()), false);
});
