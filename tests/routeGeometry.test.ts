import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFixture } from '../src/domain/fixture';
import { initialState, reduce } from '../src/domain/engine';

// Synthetic coordinates only: reproduce a curved path represented by a chord.
// This is a route-data regression, not a change to radius or playback policy.
const a = { latitude: 0, longitude: 0 }, b = { latitude: 0, longitude: 0.002 };
const c = { latitude: 0.001, longitude: 0.003 };
const bend1 = { latitude: 0.0009, longitude: 0.0007 };
const bend2 = { latitude: 0.0009, longitude: 0.0017 };
const make = (curved: boolean) => parseFixture(JSON.stringify({
  schemaVersion: 1, id: curved ? 'synthetic-curved' : 'synthetic-chord', version: 1,
  title: 'Synthetic route geometry regression; not for walking',
  verification: { status: 'unverified', note: 'Invented test coordinates, no physical route.' },
  route: curved ? [a, bend1, bend2, b, c] : [a, b, c],
  stops: [a, b, c].map((standing, i) => ({ id: String(i), title: String(i), standing,
    routeIndex: (curved ? [0, 3, 4] : [0, 1, 2])[i], approach: 'Synthetic', viewpoint: 'Unverified', access: 'Not for walking' })),
}));

test('fresh fixes on a curved walking path remain falsely off-route when its fixture is a straight chord', () => {
  const f = make(false);
  let s = reduce(initialState(), { type: 'start', at: 0, diagnostics: true }, f).state;
  for (const [at, point] of [[100000, bend1], [160000, bend2]] as const) {
    const r = reduce(s, { type: 'fix', at, fix: { ...point, timestamp: at, accuracy: 5 } }, f);
    assert.equal(r.reason, 'off-route');
    assert.ok(r.state.location.crossTrack! > 90);
    s = r.state;
  }
});

test('correct curved geometry recognises rejoin on a fresh fix without a timer or clearing manual pause', () => {
  const f = make(true);
  let s = reduce(initialState(), { type: 'start', at: 0, diagnostics: true }, f).state;
  s = reduce(s, { type: 'pause', at: 2000 }, f).state;
  const outside = { latitude: 0.0016, longitude: bend2.longitude };
  for (const [at, point, expected] of [[100000, outside, 'off-route'], [160000, bend2, 'between-stops']] as const) {
    const r = reduce(s, { type: 'fix', at, fix: { ...point, timestamp: at, accuracy: 5 } }, f);
    assert.equal(r.reason, expected);
    assert.equal(r.state.hold, 'manual');
    assert.deepEqual(r.effects, []);
    s = r.state;
  }
});
