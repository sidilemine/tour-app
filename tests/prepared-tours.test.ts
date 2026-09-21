import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { Coordinate, distance, Fixture } from '../src/domain/fixture';
import { Event, initialState, reduce } from '../src/domain/engine';
import { narrationAt } from '../src/domain/narration';
import { parseTourPackage } from '../src/tours/package';

const packages = [
  { variant: 'A', path: 'content/north-finchley/packages/A.json', stops: 5, chapterIds: [] as string[], mapId: 'north-finchley-abc1a7e4d563d305' },
  { variant: 'B', path: 'content/north-finchley/packages/B.json', stops: 6, chapterIds: ['walking-neighbourhood'], mapId: 'north-finchley-abc1a7e4d563d305' },
  { variant: 'H', path: 'content/hampstead/packages/room-to-breathe.json', stops: 5, chapterIds: ['walking-conversation', 'keeping-the-heath'], mapId: 'hampstead-0abcc26a600e0718' },
  { variant: 'C', path: 'content/clerkenwell/packages/working-lives.json', stops: 8, chapterIds: ['many-hands', 'next-days-stock'], mapId: 'clerkenwell-8f45f13ad1755318' },
  { variant: 'Q', path: 'content/queensway/packages/behind-the-fronts.json', stops: 3, chapterIds: ['bayswater-terraces'], mapId: 'queensway-105db6bcbdfce45f' },
];
type PreparedPackage = typeof packages[number];
// Read inside each test so an absent new artifact cannot prevent the existing
// packages' checks from running. Every listed authored package is required.
function loadPackage(definition: PreparedPackage) {
  const p = parseTourPackage(JSON.parse(readFileSync(definition.path, 'utf8')));
  assert.equal(p.mapId, definition.mapId, `${definition.variant}: intended offline map`);
  assert.equal(p.fixture.stops.length, definition.stops, `${definition.variant}: physical stop count`);
  assert.deepEqual(p.fixture.narration!.chapters.map(c => c.id), definition.chapterIds, `${definition.variant}: ordered walking chapters`);
  assert.equal(p.assets.length, definition.stops + definition.chapterIds.length, `${definition.variant}: complete clip count`);
  return p;
}
function simulate(fixture: Fixture, walking?: { metresPerSecond: number; fixEveryMilliseconds: number }) {
  let state = initialState(fixture), at = 0;
  let chapterEnd: { at: number; index: number; token: number } | undefined;
  const plays: { index: number; at: number; point?: Coordinate; along?: number }[] = [];
  const send = (event: Event) => {
    const result = reduce(state, event, fixture); state = result.state;
    for (const effect of result.effects) {
      if (effect.type === 'pause') chapterEnd = undefined;
      if (effect.type === 'play') {
        plays.push({ index: effect.index, at: event.at, point: state.location.fix, along: state.location.along });
        chapterEnd = effect.index < fixture.stops.length ? undefined : {
          at: event.at + (narrationAt(fixture, effect.index)!.audio.durationSeconds - effect.offset) * 1000,
          index: effect.index, token: effect.token,
        };
      }
    }
    return result;
  };
  const fix = (point: Coordinate, milliseconds = 2000) => {
    const next = at + milliseconds;
    if (chapterEnd !== undefined && chapterEnd.at <= next) {
      const finish = chapterEnd; chapterEnd = undefined;
      assert.equal(state.playback.index, finish.index, 'Simulator must complete the active chapter');
      assert.equal(state.playback.token, finish.token, 'Simulator must complete the active playback attempt');
      const duration = narrationAt(fixture, finish.index)!.audio.durationSeconds;
      send({ type: 'audio', at: finish.at, token: finish.token, offset: duration, finished: true, playing: false, buffering: false });
    }
    at = next; return send({ type: 'fix', at, fix: { ...point, accuracy: 7, timestamp: at, speed: walking?.metresPerSecond ?? 1.25 } });
  };
  const dwell = (point: Coordinate) => { for (let i = 0; i < 4; i++) fix(point); };
  const finishStory = () => {
    assert.ok(state.playback.index !== null && state.playback.index < fixture.stops.length,
      `Expected a stationary story to finish, got ${state.playback.index}; ${state.location.reason}`);
    const duration = fixture.narration!.stories[state.playback.index].audio.durationSeconds;
    at += duration * 1000;
    send({ type: 'audio', at, token: state.playback.token, offset: duration, finished: true, playing: false, buffering: false });
  };
  const walk = (start: number, end: number) => {
    if (walking) {
      const offsets = [0];
      for (let i = start + 1; i <= end; i++) offsets.push(offsets.at(-1)! + distance(fixture.route[i - 1], fixture.route[i]));
      const total = offsets.at(-1)!, metresPerFix = walking.metresPerSecond * walking.fixEveryMilliseconds / 1000;
      let segment = 1;
      // Carry the distance between route vertices. Emitting an extra fix at
      // every vertex would give short launch windows unrealistically dense GPS.
      for (let sample = 1; sample <= Math.ceil(total / metresPerFix); sample++) {
        const along = Math.min(total, sample * metresPerFix);
        while (segment < offsets.length - 1 && offsets[segment] < along) segment++;
        const from = fixture.route[start + segment - 1], to = fixture.route[start + segment];
        const segmentMetres = offsets[segment] - offsets[segment - 1];
        const fraction = segmentMetres ? (along - offsets[segment - 1]) / segmentMetres : 0;
        // The last sample can include a partial interval stationary at the stop.
        fix({ latitude: from.latitude + (to.latitude - from.latitude) * fraction,
          longitude: from.longitude + (to.longitude - from.longitude) * fraction }, walking.fixEveryMilliseconds);
      }
      return;
    }
    for (let i = start + 1; i <= end; i++) {
      const from = fixture.route[i - 1], to = fixture.route[i], metres = distance(from, to), steps = Math.max(1, Math.ceil(metres / 2.5));
      for (let n = 1; n <= steps; n++) fix({ latitude: from.latitude + (to.latitude - from.latitude) * n / steps, longitude: from.longitude + (to.longitude - from.longitude) * n / steps }, Math.max(1, metres / steps / 1.25 * 1000));
    }
  };
  return { get state() { return state; }, get at() { return at; }, send, fix, dwell, finishStory, walk, plays };
}
function completeThroughStop(fixture: Fixture, h: ReturnType<typeof simulate>, lastStop: number) {
  h.send({ type: 'start', at: 0, diagnostics: false }); h.dwell(fixture.stops[0].standing); h.finishStory();
  for (let stop = 1; stop <= lastStop; stop++) {
    h.walk(fixture.stops[stop - 1].routeIndex, fixture.stops[stop].routeIndex); h.dwell(fixture.stops[stop].standing);
    assert.equal(h.state.playback.index, stop, `${fixture.id} arrival ${stop}: ${h.state.location.reason}, ${JSON.stringify(h.state.stops)}`);
    h.finishStory();
  }
}

for (const definition of packages) {
  const { variant } = definition;
  test(`prepared ${variant}: every ideal route arrival and walking chapter completes in order including retraced streets`, () => {
    const fixture = loadPackage(definition).fixture, h = simulate(fixture);
    completeThroughStop(fixture, h, fixture.stops.length - 1);
    assert.deepEqual(h.state.stops, fixture.stops.map(() => 'completed'), `${variant}: every stop completed`);
    assert.deepEqual(h.state.chapters, fixture.narration!.chapters.map(() => 'completed'), `${variant}: every chapter completed`);
    const expectedPlays = fixture.stops.flatMap((_, stopIndex) => [stopIndex,
      ...fixture.narration!.chapters.flatMap((chapter, chapterIndex) => chapter.afterStopIndex === stopIndex ? [fixture.stops.length + chapterIndex] : []),
    ]);
    assert.deepEqual(h.plays.map(p => p.index), expectedPlays, `${variant}: each story/chapter must play once, in the complete interleaved order`);
  });

  test(`prepared ${variant}: audio bytes and durations match manifests before any phone preparation`, () => {
    const p = loadPackage(definition);
    for (const story of [...p.fixture.narration!.stories, ...p.fixture.narration!.chapters]) {
      const bytes = Buffer.from(p.assets.find(a => a.key === story.audio.key)!.base64, 'base64');
      assert.equal(bytes.length, story.audio.bytes, `${variant}/${story.id}: audio byte count`);
      assert.equal(createHash('md5').update(bytes).digest('hex'), story.audio.md5, `${variant}/${story.id}: audio MD5`);
      assert.ok(Number.isFinite(story.audio.durationSeconds) && story.audio.durationSeconds > 0, `${variant}/${story.id}: finite measured duration`);
    }
  });

  for (const [chapterIndex, chapterId] of definition.chapterIds.entries()) {
    test(`prepared ${variant}: held departure and expired ${chapterId} never force a chapter after its opportunity`, () => {
      const fixture = loadPackage(definition).fixture, chapter = fixture.narration!.chapters[chapterIndex], h = simulate(fixture);
      completeThroughStop(fixture, h, chapter.afterStopIndex);
      const playbackIndex = fixture.stops.length + chapterIndex;
      h.send({ type: 'pause', at: h.at + 1 });
      const heldPlays = h.plays.length;
      h.walk(fixture.stops[chapter.afterStopIndex].routeIndex, chapter.startRouteIndex); h.dwell(fixture.route[chapter.startRouteIndex]);
      assert.equal(h.state.playback.index, null, `${variant}/${chapterId}: departure stays silent while held`);
      assert.equal(h.state.hold, 'manual', `${variant}/${chapterId}: departure preserves manual pause`);
      assert.equal(h.state.chapters?.[chapterIndex], 'unplayed', `${variant}/${chapterId}: launch opportunity remains available while held`);
      h.walk(chapter.startRouteIndex, fixture.stops[chapter.afterStopIndex + 1].routeIndex); h.dwell(fixture.stops[chapter.afterStopIndex + 1].standing);
      assert.equal(h.state.chapters?.[chapterIndex], 'expired', `${variant}/${chapterId}: missed launch expires`);
      assert.equal(h.state.hold, 'manual', `${variant}/${chapterId}: arrival does not release manual pause`);
      assert.equal(h.plays.length, heldPlays, `${variant}/${chapterId}: neither chapter nor arrival plays while held`);
      assert.equal(h.plays.some(p => p.index === playbackIndex), false, `${variant}/${chapterId}: expired chapter was never started`);
      h.send({ type: 'resume', at: h.at + 1 });
      assert.equal(h.state.playback.index, chapter.afterStopIndex + 1, `${variant}/${chapterId}: Resume starts the freshly reached stop`);
      assert.equal(h.state.chapters?.[chapterIndex], 'expired', `${variant}/${chapterId}: Resume does not resurrect the missed chapter`);
    });
  }
}

test('prepared B: latest chapter launch leaves full measured narration and navigation margin before Moss Hall turn', () => {
  const fixture = loadPackage(packages.find(p => p.variant === 'B')!).fixture, chapter = fixture.narration!.chapters[0];
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

type ChapterWindow = {
  id: string; afterStopIndex: number; startRouteIndex: number; endRouteIndex: number;
  navigationRouteIndex: number; fastWalkingMetresPerSecond: number; marginSeconds: number;
};
for (const variant of ['C', 'H', 'Q']) {
 const definition = packages.find(p => p.variant === variant)!;
 const planPath = ({ C: 'content/clerkenwell/plan.json', H: 'content/hampstead/plan.json',
   Q: 'content/queensway/plan.json' } as Record<string, string>)[variant];
 for (const [chapterIndex, chapterId] of definition.chapterIds.entries()) {
  test(`prepared ${variant}: latest ${chapterId} launch fits measured audio and authored navigation margin`, () => {
    const fixture = loadPackage(definition).fixture;
    const plan = JSON.parse(readFileSync(planPath, 'utf8')) as {
      fixture: Pick<Fixture, 'route' | 'stops'>; chapters: ChapterWindow[];
    };
    assert.deepEqual(plan.fixture.route, fixture.route, 'Authored budget plan and packaged route must agree');
    assert.deepEqual(plan.fixture.stops.map(s => s.routeIndex), fixture.stops.map(s => s.routeIndex), 'Authored budget plan and packaged stop indices must agree');
    assert.deepEqual(plan.chapters.map(c => c.id), fixture.narration!.chapters.map(c => c.id), 'Authored plan includes each packaged chapter in order');
    const window = plan.chapters[chapterIndex], chapter = fixture.narration!.chapters[chapterIndex];
    for (const key of ['afterStopIndex', 'startRouteIndex', 'endRouteIndex'] as const) {
      assert.equal(window[key], chapter[key], `${chapterId}: plan/package ${key} agrees`);
    }
    assert.ok(Number.isInteger(window.navigationRouteIndex) && window.navigationRouteIndex > chapter.endRouteIndex
      && window.navigationRouteIndex <= fixture.stops[chapter.afterStopIndex + 1].routeIndex,
    `${chapterId}: navigation decision must follow the latest launch and precede or reach the next stop`);
    assert.ok(Number.isFinite(window.fastWalkingMetresPerSecond) && window.fastWalkingMetresPerSecond > 0,
      `${chapterId}: explicit positive fast walking speed`);
    assert.ok(Number.isFinite(window.marginSeconds) && window.marginSeconds >= 0, `${chapterId}: explicit nonnegative navigation margin`);
    let remainingMetres = 0;
    for (let i = chapter.endRouteIndex + 1; i <= window.navigationRouteIndex; i++) remainingMetres += distance(fixture.route[i - 1], fixture.route[i]);
    // The engine starts strictly before endRouteIndex. Budget from the boundary
    // conservatively, using the authored faster pace and the measured recording.
    const availableSeconds = remainingMetres / window.fastWalkingMetresPerSecond;
    assert.ok(availableSeconds >= chapter.audio.durationSeconds + window.marginSeconds,
      `${chapterId}: latest launch leaves ${remainingMetres.toFixed(1)} m / ${availableSeconds.toFixed(1)} s at ${window.fastWalkingMetresPerSecond} m/s before navigation; audio needs ${chapter.audio.durationSeconds.toFixed(1)} s plus ${window.marginSeconds} s margin`);
  });
}
}

for (const { variant, planPath, expectedOrder } of [
  { variant: 'C', planPath: 'content/clerkenwell/plan.json', expectedOrder: ['charterhouse', 'smithfield', 'booths', 'stjohn-gate', 'green', 'many-hands', 'flowers', 'ingersoll', 'next-days-stock', 'exmouth'] },
  { variant: 'H', planPath: 'content/hampstead/plan.json', expectedOrder: ['highgate-station', 'pond-square', 'walking-conversation', 'highgate-ponds', 'keeping-the-heath', 'willow-road', 'keats-house'] },
  { variant: 'Q', planPath: 'content/queensway/plan.json', expectedOrder: ['queens-rink', 'whiteleys', 'bayswater-terraces', 'leinster-gardens'] },
]) test(`prepared ${variant}: brisk 6 km/h walk with two-second fixes catches chapters and leaves navigation quiet`, t => {
  const fixture = loadPackage(packages.find(p => p.variant === variant)!).fixture;
  const speed = 6 / 3.6, h = simulate(fixture, { metresPerSecond: speed, fixEveryMilliseconds: 2000 });
  completeThroughStop(fixture, h, fixture.stops.length - 1);
  assert.deepEqual(h.plays.map(p => narrationAt(fixture, p.index)!.id), expectedOrder, 'Brisk cadence must launch each chapter once in its intended place among the stops');
  assert.deepEqual(h.state.stops, fixture.stops.map(() => 'completed'), 'Brisk replay completes every stop');
  assert.deepEqual(h.state.chapters, fixture.narration!.chapters.map(() => 'completed'), 'Brisk replay completes every chapter');
  const plan = JSON.parse(readFileSync(planPath, 'utf8')) as { chapters: ChapterWindow[] };
  const offsets = [0];
  for (let i = 1; i < fixture.route.length; i++) offsets.push(offsets.at(-1)! + distance(fixture.route[i - 1], fixture.route[i]));
  for (const [index, chapter] of fixture.narration!.chapters.entries()) {
    const play = h.plays.find(p => p.index === fixture.stops.length + index)!;
    assert.ok(play.along !== undefined && play.along >= offsets[chapter.startRouteIndex] && play.along < offsets[chapter.endRouteIndex],
      `${chapter.id}: brisk replay launch must fall inside its actual interval`);
    const window = plan.chapters.find(c => c.id === chapter.id)!;
    const reserveSeconds = (offsets[window.navigationRouteIndex] - play.along) / speed - chapter.audio.durationSeconds;
    assert.ok(reserveSeconds >= window.marginSeconds,
      `${chapter.id}: brisk replay leaves only ${reserveSeconds.toFixed(2)} seconds after audio before the navigation decision`);
    t.diagnostic(`${chapter.id}: launch ${(play.along - offsets[chapter.startRouteIndex]).toFixed(2)} m into interval; ${reserveSeconds.toFixed(2)} s remain after narration before navigation`);
  }
});
