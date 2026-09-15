import { Coordinate, distance, Fixture, project } from './fixture';

export type Fix = Coordinate & { timestamp: number; accuracy: number; speed?: number };
export type Playback = { status: 'idle' | 'loading' | 'playing' | 'paused' | 'failed'; index: number | null; offset: number; token: number };
export type State = {
  active: boolean; hold: string | null; automatic: boolean; diagnostics: boolean; startedAt: number | null;
  stops: ('unplayed' | 'in-progress' | 'completed' | 'skipped')[];
  playback: Playback;
  location: { reason: string; fix?: Fix; crossTrack?: number; along?: number; distance?: number; candidate?: number; since?: number; count: number; arrived?: number };
};
export type Event = { at: number } & (
  | { type: 'start'; diagnostics: boolean }
  | { type: 'pause'; reason?: string } | { type: 'resume' } | { type: 'end' }
  | { type: 'automatic'; enabled: boolean }
  | { type: 'manual'; index: number } | { type: 'skip'; index: number }
  | { type: 'fix'; fix: Fix }
  | { type: 'unavailable'; reason: string }
  | { type: 'audio'; token: number; playing: boolean; finished: boolean; offset: number; buffering: boolean; error?: string | null }
);
export type Effect = { type: 'play'; index: number; offset: number; token: number } | { type: 'pause' };
export const initialState = (): State => ({ active: false, hold: 'not-started', automatic: true, diagnostics: false, startedAt: null, stops: ['unplayed', 'unplayed', 'unplayed'], playback: { status: 'idle', index: null, offset: 0, token: 0 }, location: { reason: 'Waiting for location', count: 0 } });
export const eligible = (s: State) => s.stops.findIndex(x => x === 'unplayed');
// Explanation only: never relax the reducer's fresh-position playback gate.
export function pendingArrivalNeedsFreshFix(s: State, at: number): boolean {
  const i = eligible(s);
  return s.active && s.automatic && !s.hold && s.playback.index === null && i >= 0
    && s.location.arrived === i && (!s.location.fix || at - s.location.fix.timestamp > 15000);
}
export function recovered(state: State): State {
  return { ...state, active: false, hold: state.hold || 'recovery', playback: { ...state.playback, status: state.playback.index === null ? 'idle' : 'paused', token: state.playback.token + 1 }, location: { reason: 'Reopened: fresh location required', count: 0 } };
}

export function reduce(previous: State, event: Event, fixture: Fixture): { state: State; effects: Effect[]; reason: string } {
  const s: State = { ...previous, stops: [...previous.stops], playback: { ...previous.playback }, location: { ...previous.location } }, effects: Effect[] = [];
  let reason: string = event.type;
  const play = (index: number, offset = 0) => {
    if (index < 0 || index > 2) return;
    s.playback = { index, offset, status: 'loading', token: s.playback.token + 1 };
    if (s.stops[index] === 'unplayed') s.stops[index] = 'in-progress';
    effects.push({ type: 'play', index, offset, token: s.playback.token });
  };
  const auto = () => {
    if (!s.active || !s.automatic || s.hold || s.playback.index !== null) return;
    const i = eligible(s), l = s.location;
    if (i >= 0 && l.arrived === i && l.fix && event.at - l.fix.timestamp <= 15000 && distance(l.fix, fixture.stops[i].standing) <= 40) play(i);
  };
  switch (event.type) {
    case 'start':
      s.active = true; s.diagnostics = event.diagnostics;
      s.startedAt ??= event.at;
      // Starting a saved tour never clears a manual/interruption/recovery hold.
      if (s.hold === 'not-started') { s.hold = null; play(0); }
      break;
    case 'pause':
      s.hold = event.reason || 'manual';
      s.playback.status = s.playback.index === null ? 'idle' : 'paused';
      effects.push({ type: 'pause' });
      break;
    case 'resume':
      s.hold = null;
      if (s.playback.index !== null) play(s.playback.index, s.playback.offset); else auto();
      break;
    case 'end':
      s.active = false; s.hold = 'ended';
      s.playback.status = s.playback.index === null ? 'idle' : 'paused';
      effects.push({ type: 'pause' }); break;
    case 'automatic': s.automatic = event.enabled; auto(); break;
    case 'manual': play(event.index); break;
    case 'skip':
      if (event.index < 0 || event.index > 2) break;
      s.stops[event.index] = 'skipped';
      if (s.playback.index === event.index) {
        effects.push({ type: 'pause' });
        s.playback = { status: 'idle', index: null, offset: 0, token: s.playback.token + 1 };
      }
      s.location = { reason: 'Skipped: waiting for fresh arrival', count: 0 }; break;
    case 'unavailable':
      s.location = { reason: event.reason, count: 0 }; reason = event.reason; break;
    case 'fix': {
      const f = event.fix, old = s.location.fix, i = eligible(s);
      const reject = (why: string) => { s.location = { reason: why, fix: old, count: 0 }; reason = why; };
      if (!Number.isFinite(f.timestamp) || !Number.isFinite(f.latitude) || !Number.isFinite(f.longitude) || Math.abs(f.latitude) > 85 || Math.abs(f.longitude) > 180) { reject('invalid-fix'); break; }
      if (event.at - f.timestamp > 15000 || f.timestamp > event.at + 2000) { reject('stale-fix'); break; }
      if (old && f.timestamp <= old.timestamp) { reason = 'duplicate-or-out-of-order-fix'; break; }
      if (!Number.isFinite(f.accuracy) || f.accuracy < 0 || f.accuracy > 35) { reject('poor-accuracy'); break; }
      if ((f.speed ?? 0) > 5.5 || (old && distance(old, f) > 70 + (f.timestamp - old.timestamp) / 1000 * 5.5)) { reject('implausible-speed-or-jump'); break; }
      if (i < 0) { s.location = { reason: 'no-eligible-stop', fix: f, count: 0 }; break; }
      const start = i ? fixture.stops[i - 1].routeIndex : 0;
      const end = Math.max(start + 1, fixture.stops[i].routeIndex);
      const match = project(f, fixture.route, start, end);
      const near = distance(f, fixture.stops[i].standing);
      const reversing = s.location.along !== undefined && match.along < s.location.along - 30;
      const inside = match.crossTrack <= 45 && near <= 30 && !reversing;
      const retained = s.location.arrived === i && near <= 40 && match.crossTrack <= 45 && !reversing;
      const continuing = s.location.candidate === i && old && f.timestamp - old.timestamp <= 15000;
      const since = continuing ? s.location.since! : f.timestamp;
      const count = inside ? (continuing ? s.location.count + 1 : 1) : 0;
      const arrived = retained || (inside && count >= 3 && f.timestamp - since >= 4000);
      reason = reversing ? 'reversal' : match.crossTrack > 45 ? 'off-route' : arrived ? 'arrival-confirmed' : inside ? 'arrival-dwell' : 'between-stops';
      s.location = { reason, fix: f, ...match, distance: near, count, ...(inside ? { candidate: i, since } : {}), ...(arrived ? { arrived: i } : {}) };
      if (arrived && s.hold) reason = `arrival-held:${s.hold}`;
      else if (arrived && s.playback.index !== null) reason = 'arrival-pending-unfinished-clip';
      else if (arrived && !s.automatic) reason = 'arrival-automatic-disabled';
      auto(); break;
    }
    case 'audio':
      if (event.token !== s.playback.token || s.playback.index === null) { reason = 'obsolete-audio-event'; break; }
      // Initial load/seek callbacks can report zero before the saved seek takes
      // effect. Keep the durable target through buffering, failure and a Pause
      // during loading; only a usable playback position may replace it.
      if (!event.buffering && !event.error && (s.playback.status !== 'loading' || event.playing)) {
        s.playback.offset = Math.max(0, event.offset);
      }
      if (event.error) {
        s.playback.status = 'failed'; s.hold = 'audio-error'; effects.push({ type: 'pause' }); reason = event.error;
      } else if (event.finished) {
        const index = s.playback.index;
        if (s.stops[index] !== 'skipped') s.stops[index] = 'completed';
        s.playback = { status: 'idle', index: null, offset: 0, token: s.playback.token + 1 };
        auto();
      } else if (event.playing) {
        // Native auto-resume is never allowed to override a held/paused player.
        if (s.playback.status === 'paused') effects.push({ type: 'pause' });
        else s.playback.status = 'playing';
      } else if (!event.buffering && s.playback.status === 'playing') {
        s.hold = 'native-pause-or-interruption'; s.playback.status = 'paused'; effects.push({ type: 'pause' });
      }
      break;
  }
  return { state: s, effects, reason };
}
