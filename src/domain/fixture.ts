import { z } from 'zod';
import { narrationSchema } from './narration';

const coordinate = z.object({ latitude: z.number().min(-85).max(85), longitude: z.number().min(-180).max(180) });
const stop = z.object({
  id: z.string().min(1).max(80), title: z.string().min(1).max(120),
  standing: coordinate, landmark: coordinate.optional(), routeIndex: z.number().int().nonnegative(),
  approach: z.string().max(1000), viewpoint: z.string().max(1000), access: z.string().max(1000),
});
export const fixtureSchema = z.object({
  schemaVersion: z.literal(1), id: z.string().min(1).max(80), version: z.number().int().positive(),
  title: z.string().min(1).max(120),
  // Absent on all original fixtures: retain byte-for-byte recovery identity.
  audioProfile: z.enum(['edge-long-a']).optional(),
  verification: z.object({ status: z.enum(['unverified', 'user_checked']), note: z.string().max(2000) }),
  route: z.array(coordinate).min(3).max(10000), stops: z.array(stop).min(3).max(12),
  narration: narrationSchema.optional(),
});
export type Coordinate = z.infer<typeof coordinate>;
export type Fixture = z.infer<typeof fixtureSchema>;
export function distance(a: Coordinate, b: Coordinate): number {
  const lat = (a.latitude + b.latitude) * Math.PI / 360;
  return Math.hypot((b.latitude - a.latitude) * 111195, (b.longitude - a.longitude) * 111195 * Math.cos(lat));
}
export function parseFixture(text: string): Fixture {
  if (text.length > 2_000_000) throw new Error('Fixture exceeds 2 MB.');
  const f = fixtureSchema.parse(JSON.parse(text));
  if (new Set(f.stops.map(s => s.id)).size !== f.stops.length) throw new Error('Stop IDs must be unique.');
  f.stops.forEach((s, i) => {
    if (!f.route[s.routeIndex] || distance(s.standing, f.route[s.routeIndex]) > 10) throw new Error(`${s.title}: standing position must meet its route point (within 10 m).`);
    if (i && s.routeIndex <= f.stops[i - 1].routeIndex) throw new Error('Stop route indices must increase in tour order.');
  });
  for (let i = 1; i < f.route.length; i++) if (distance(f.route[i - 1], f.route[i]) > 250) throw new Error('Route segments must be under 250 m. Include path bends and intermediate points.');
  if (!f.narration && f.stops.length !== 3) throw Error('Lab fixtures need exactly three stops.');
  if (f.narration) {
    if (f.audioProfile) throw Error('Tour narration cannot use laboratory audio.');
    if (f.narration.stories.length !== f.stops.length) throw Error('Each stop needs its own story.');
    const stories = [...f.narration.stories, ...f.narration.chapters];
    if (new Set(stories.map(s => s.id)).size !== stories.length || new Set(stories.map(s => s.audio.key)).size !== stories.length) throw Error('Story IDs and audio keys must be unique.');
    for (const c of f.narration.chapters) {
      const from = f.stops[c.afterStopIndex], to = f.stops[c.afterStopIndex + 1];
      if (!from || !to || c.startRouteIndex <= from.routeIndex || c.endRouteIndex <= c.startRouteIndex || c.endRouteIndex >= to.routeIndex) throw Error('Walking chapter must have a bounded interval within its onward leg.');
    }
  }
  return f;
}

export function project(point: Coordinate, route: Coordinate[], start = 0, end = route.length - 1) {
  let along = 0;
  let best = { crossTrack: Infinity, along: 0 };
  const scaleX = 111195 * Math.cos(point.latitude * Math.PI / 180);
  for (let i = 1; i < route.length; i++) {
    const a = route[i - 1], b = route[i];
    const ax = (a.longitude - point.longitude) * scaleX, ay = (a.latitude - point.latitude) * 111195;
    const dx = (b.longitude - a.longitude) * scaleX, dy = (b.latitude - a.latitude) * 111195;
    const length = Math.hypot(dx, dy);
    const t = length ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (length * length))) : 0;
    const crossTrack = Math.hypot(ax + t * dx, ay + t * dy);
    if (i > start && i <= end && crossTrack < best.crossTrack) best = { crossTrack, along: along + t * length };
    along += length;
  }
  return best;
}
