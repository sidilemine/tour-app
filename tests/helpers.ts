import { Fixture } from '../src/domain/fixture';
import { Event, initialState, reduce } from '../src/domain/engine';
export const fixture: Fixture = {
  schemaVersion: 1, id: 'synthetic-linear', version: 1, title: 'Synthetic replay only — not a real walking route',
  verification: { status: 'unverified', note: 'Synthetic coordinates for automated tests; never use for physical walking.' },
  route: Array.from({ length: 21 }, (_, i) => ({ latitude: i * 0.00045, longitude: 0 })),
  stops: [0, 10, 20].map((routeIndex, index) => ({ id: ['a','b','c'][index], title: ['A','B','C'][index], standing: { latitude: routeIndex * 0.00045, longitude: 0 }, routeIndex, approach: 'Synthetic', viewpoint: 'Unverified', access: 'Not a physical route' })),
};
export function harness() {
  let state = initialState();
  const history: ReturnType<typeof reduce>[] = [];
  const send = (event: Event) => { const result = reduce(state, event, fixture); state = result.state; history.push(result); return result; };
  const fix = (index: number, at: number, extra = {}) => send({ type: 'fix', at, fix: { ...fixture.stops[index].standing, accuracy: 5, timestamp: at, ...extra } });
  const arrive = (index: number, at: number) => { fix(index, at); fix(index, at+2000); return fix(index, at+4000); };
  const finish = (at: number) => send({ type: 'audio', at, token: state.playback.token, offset: 12, playing: false, finished: true, buffering: false });
  return { send, fix, arrive, finish, history, get state() { return state; } };
}
