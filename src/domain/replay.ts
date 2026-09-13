import { isDeepStrictEqual } from 'node:util';
import { Fixture } from './fixture';
import { Event, State, reduce, Effect } from './engine';

// Node-only replay runner; the matcher/reducer themselves have no Node dependency.
export type Transition = { kind: 'transition'; event: Event; before: State; after: State; effects: Effect[]; reason: string };
// Compare the persisted JSON representation: optional undefined fields are omitted
// by SQLite diagnostic serialization and must not create false divergences.
const persisted = <T>(value: T): T => JSON.parse(JSON.stringify(value));
function sameState(actual: State, expected: State) {
  const location = { ...actual.location };
  // Hermes and V8 can differ in the last bits of trig-derived metre values.
  // Permit at most one nanometre here only; intent, fixes, timestamps, dwell,
  // playback, reasons and effects must still match exactly.
  for (const key of ['distance', 'crossTrack', 'along'] as const) {
    const a = location[key], b = expected.location[key];
    if (typeof a === 'number' && typeof b === 'number' && Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= 1e-9) location[key] = b;
  }
  return isDeepStrictEqual({ ...actual, location }, expected);
}
export function replay(fixture: Fixture, entries: Transition[]) {
  let state: State | undefined;
  let segments = 0;
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    // Recovery/fixture changes and bounded log retention can start a new segment.
    if (!state || !sameState(state, entry.before)) { state = entry.before; segments++; }
    const result = persisted(reduce(state, entry.event, fixture));
    if (!sameState(result.state, entry.after) || !isDeepStrictEqual(result.effects, entry.effects) || result.reason !== entry.reason) throw Error(`Replay divergence at transition ${i}, ${entry.event.type}`);
    state = result.state;
  }
  return { transitions: entries.length, segments, state };
}
