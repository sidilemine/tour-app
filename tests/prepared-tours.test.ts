import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { Coordinate, distance, Fixture } from '../src/domain/fixture';
import { Event, initialState, reduce } from '../src/domain/engine';
import { parseTourPackage } from '../src/tours/package';

const packages = ['A', 'B'].map(variant => ({ variant, package: parseTourPackage(JSON.parse(readFileSync(`content/north-finchley/packages/${variant}.json`, 'utf8'))) }));
function simulate(fixture: Fixture) {
  let state = initialState(fixture), at = 0, chapterEnds: number | undefined;
  const plays: { index: number; at: number; point?: Coordinate }[] = [];
  const send = (event: Event) => {
    const result = reduce(state, event, fixture); state = result.state;
    for (const effect of result.effects) if (effect.type === 'play') {
      plays.push({ index: effect.index, at: event.at, point: state.location.fix });
      if (effect.index >= fixture.stops.length) chapterEnds = event.at + fixture.narration!.chapters[effect.index - fixture.stops.length].audio.durationSeconds * 1000;
    }
    return result;
  };
  const fix = (point: Coordinate, milliseconds = 2000) => {
    const next = at + milliseconds;
    if (chapterEnds !== undefined && chapterEnds <= next) {
      const finish = chapterEnds; chapterEnds = undefined;
      send({ type: 'audio', at: finish, token: state.playback.token, offset: fixture.narration!.chapters[0].audio.durationSeconds, finished: true, playing: false, buffering: false });
    }
    at = next; return send({ type: 'fix', at, fix: { ...point, accuracy: 7, timestamp: at, speed: 1.25 } });
  };
  const dwell = (point: Coordinate) => { for (let i = 0; i < 4; i++) fix(point); };
  const finishStory = () => {
    assert.ok(state.playback.index !== null && state.playback.index < fixture.stops.length);
    const duration = fixture.narration!.stories[state.playback.index].audio.durationSeconds;
    at += duration * 1000;
    send({ type: 'audio', at, token: state.playback.token, offset: duration, finished: true, playing: false, buffering: false });
  };
  const walk = (start: number, end: number) => {
    for (let i = start + 1; i <= end; i++) {
      const from = fixture.route[i - 1], to = fixture.route[i], metres = distance(from, to), steps = Math.max(1, Math.ceil(metres / 2.5));
      for (let n = 1; n <= steps; n++) fix({ latitude: from.latitude + (to.latitude - from.latitude) * n / steps, longitude: from.longitude + (to.longitude - from.longitude) * n / steps }, Math.max(1, metres / steps / 1.25 * 1000));
    }
  };
  return { get state() { return state; }, get at() { return at; }, send, fix, dwell, finishStory, walk, plays };
}

for (const { variant, package: p } of packages) test(`prepared ${variant}: every ideal route arrival completes in order including retraced streets`, () => {
  const fixture = p.fixture, h = simulate(fixture);
  h.send({ type: 'start', at: 0, diagnostics: false }); h.dwell(fixture.stops[0].standing); h.finishStory();
  for (let stop = 1; stop < fixture.stops.length; stop++) {
    h.walk(fixture.stops[stop - 1].routeIndex, fixture.stops[stop].routeIndex); h.dwell(fixture.stops[stop].standing);
    assert.equal(h.state.playback.index, stop, `${variant} arrival ${stop}: ${h.state.location.reason}, ${JSON.stringify(h.state.stops)}`);
    h.finishStory();
  }
  assert.deepEqual(h.state.stops, fixture.stops.map(() => 'completed'));
  assert.deepEqual(h.plays.filter(p => p.index < fixture.stops.length).map(p => p.index), fixture.stops.map((_, i) => i));
  assert.deepEqual(h.state.chapters, fixture.narration!.chapters.map(() => 'completed'));
  assert.equal(h.plays.filter(p => p.index >= fixture.stops.length).length, fixture.narration!.chapters.length);
});

test('prepared audio bytes and durations match manifests before any phone preparation', () => {
  for (const { package: p } of packages) for (const story of [...p.fixture.narration!.stories, ...p.fixture.narration!.chapters]) {
    const bytes = Buffer.from(p.assets.find(a => a.key === story.audio.key)!.base64, 'base64');
    assert.equal(bytes.length, story.audio.bytes);
    assert.equal(createHash('md5').update(bytes).digest('hex'), story.audio.md5);
    assert.ok(story.audio.durationSeconds > 0);
  }
});

test('prepared B: held departure and expired opportunity never force a walking chapter after the turn', () => {
  const fixture = packages.find(p => p.variant === 'B')!.package.fixture, chapter = fixture.narration!.chapters[0], h = simulate(fixture);
  h.send({ type: 'start', at: 0, diagnostics: false }); h.finishStory();
  for (let stop = 1; stop <= chapter.afterStopIndex; stop++) {
    h.walk(fixture.stops[stop - 1].routeIndex, fixture.stops[stop].routeIndex); h.dwell(fixture.stops[stop].standing); h.finishStory();
  }
  h.send({ type: 'pause', at: h.at + 1 });
  h.walk(fixture.stops[chapter.afterStopIndex].routeIndex, chapter.startRouteIndex); h.dwell(fixture.route[chapter.startRouteIndex]);
  assert.equal(h.state.playback.index, null); assert.equal(h.state.hold, 'manual');
  h.walk(chapter.startRouteIndex, fixture.stops[chapter.afterStopIndex + 1].routeIndex); h.dwell(fixture.stops[chapter.afterStopIndex + 1].standing);
  assert.equal(h.state.chapters?.[0], 'expired'); assert.equal(h.plays.some(p => p.index === fixture.stops.length), false);
  h.send({ type: 'resume', at: h.at + 1 }); assert.equal(h.state.playback.index, chapter.afterStopIndex + 1);
});

test('prepared B: latest chapter launch leaves full measured narration and navigation margin before Moss Hall turn', () => {
  const fixture = packages.find(p => p.variant === 'B')!.package.fixture, chapter = fixture.narration!.chapters[0];
  // Saved B Valhalla response, leg 3, maneuver 1: turn off Alexandra Grove.
  // This is the navigation decision, earlier than the destination standing point.
  const turn = { latitude: 51.610632, longitude: -0.180452 };
  const turnIndex = fixture.route.findIndex((point, index) => index > chapter.endRouteIndex && distance(point, turn) < 1);
  assert.ok(turnIndex > chapter.endRouteIndex, 'Saved turn must still be on the onward leg.');
  let remainingMetres = 0;
  for (let i = chapter.endRouteIndex + 1; i <= turnIndex; i++) remainingMetres += distance(fixture.route[i - 1], fixture.route[i]);
  // Walking at 4.5 km/h; the engine launches strictly before endRouteIndex.
  assert.ok(remainingMetres >= 200, `Only ${remainingMetres.toFixed(1)} m remains before turning.`);
  assert.ok(remainingMetres / 1.25 >= chapter.audio.durationSeconds + 15,
    `Narration ${chapter.audio.durationSeconds.toFixed(1)} s does not fit ${remainingMetres.toFixed(1)} m with a useful margin.`);
});
