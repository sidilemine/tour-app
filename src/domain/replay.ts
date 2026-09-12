import { isDeepStrictEqual } from 'node:util';
import { Fixture } from './fixture';
import { Event, State, reduce, Effect } from './engine';

// Node-only replay runner; the matcher/reducer themselves have no Node dependency.
export type Transition = { kind: 'transition'; event: Event; before: State; after: State; effects: Effect[]; reason: string };
export function replay(fixture: Fixture, entries: Transition[]) {
  let state: State | undefined;
  let segments = 0;
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    // Recovery/fixture changes and bounded log retention can start a new segment.
    if (!state || !isDeepStrictEqual(state, entry.before)) { state = entry.before; segments++; }
    const result = reduce(state, entry.event, fixture);
    if (!isDeepStrictEqual(result.state, entry.after) || !isDeepStrictEqual(result.effects, entry.effects) || result.reason !== entry.reason) throw Error(`Replay divergence at transition ${i}, ${entry.event.type}`);
    state = result.state;
  }
  return { transitions: entries.length, segments, state };
}
