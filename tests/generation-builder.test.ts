import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { buildTour, checkBuiltTour, inspectAudio, validateBuilderInput, type BuilderInput, type BuilderAudioTools } from '../tools/generation/builder';
import { mapAreas } from '../src/map/areas';
import { parseTourPackage } from '../src/tours/package';

const sha = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
function input(): BuilderInput {
  const route = Array.from({ length: 9 }, (_, i) => ({ latitude: 51.55 + i * 0.0002, longitude: -0.16 }));
  const ids = ['first', 'second', 'third'];
  const stories = ids.map(id => ({ id, title: id, transcript: `Synthetic test account for ${id}.`,
    sources: [{ title: 'Synthetic evidence', url: 'https://example.com/test' }],
    evidence: [{ paragraph: `Synthetic test account for ${id}.`, kind: 'source_checked' as const, basis: 'Synthetic test source only.', sourceUrls: ['https://example.com/test'] }],
    directions: ['Synthetic test directions.'] }));
  return { fixture: { schemaVersion: 1, id: 'builder-synthetic', version: 1, title: 'Synthetic builder fixture',
    verification: { status: 'unverified', note: 'Synthetic coordinates; not a walking route.' }, route,
    stops: ids.map((id, i) => ({ id, title: id, routeIndex: i * 4, standing: route[i * 4], approach: 'Synthetic approach', viewpoint: 'Synthetic view', access: 'Unverified' })) },
    mapId: mapAreas.find(a => a.title === 'Highgate / Hampstead')!.catalog.id,
    narration: { description: 'Synthetic fixture', introduction: 'Synthetic introduction', finishInstructions: 'Finish', reviewNote: 'Not listened', rightsNote: 'Synthetic' },
    stories, chapters: [], legs: [{ id: 'all', startRouteIndex: 0, endRouteIndex: 8, directions: ['Synthetic entire route'], evidence: 'Synthetic geometry only' }],
    timing: { targetSeconds: 600, walkingMetresPerSecond: 1, allowanceSeconds: 30 } };
}
function fakeAudio() {
  let renders = 0;
  const voiceConfig = { provider: 'test', voice: 'bm_george', model: 'synthetic', revision: 'synthetic', dtype: 'fp32', device: 'cpu', speed: 1,
    kokoroJs: 'synthetic', paragraphGapSeconds: 0.25, loudnessLufs: -19, encoding: 'synthetic M4A header', rendererRevision: 2 };
  const tools: BuilderAudioTools = { voiceConfig,
    async render(text, path) {
      renders++;
      await writeFile(path, Buffer.concat([Buffer.from('00000018667479704d34412000000000', 'hex'), Buffer.from(text)]));
      await writeFile(`${path}.render.json`, JSON.stringify({ voiceConfig, chunks: text.split(/\n\s*\n/).map(text => ({ text, durationSeconds: 2 })) }));
    },
    async inspect(path) {
      const bytes = await readFile(path);
      assert.ok(bytes.subarray(16).toString().startsWith('Synthetic'), 'Synthetic decoder rejected corruption');
      const metadata = JSON.parse(await readFile(`${path}.render.json`, 'utf8'));
      return { durationSeconds: metadata.chunks.length * 2 + (metadata.chunks.length - 1) * 0.25, sampleRate: 24000, channels: 1 };
    }, async close() {} };
  return { tools, renders: () => renders };
}
async function sandbox(t: TestContext) {
  const root = await mkdtemp(join(tmpdir(), 'generation-builder-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return { root, outputDirectory: join(root, 'v1'), cacheDirectory: join(root, 'cache') };
}

test('builder uses actual parser before rendering: map, source references and complete evidence', async t => {
  const paths = await sandbox(t), fake = fakeAudio();
  for (const mutate of [
    (x: BuilderInput) => { x.mapId = 'not-bundled'; },
    (x: BuilderInput) => { x.stories[0].evidence[0].sourceUrls = ['https://example.com/unknown']; },
    (x: BuilderInput) => { x.stories[0].evidence = []; },
    (x: BuilderInput) => { x.fixture.stops[0].standing.latitude += 1; },
    (x: BuilderInput) => { x.legs[0].endRouteIndex = 7; },
  ]) {
    const value = input(); mutate(value);
    await assert.rejects(buildTour(value, { ...paths, audioTools: fake.tools }));
  }
  assert.equal(fake.renders(), 0, 'Invalid candidates do not synthesize audio');
});

test('builder caches identical text/voice across IDs, checks draft independently of listening, and measures whole route', async t => {
  const paths = await sandbox(t), fake = fakeAudio(), value = input();
  value.stories[1].transcript = value.stories[0].transcript;
  value.stories[1].evidence = structuredClone(value.stories[0].evidence);
  const built = await buildTour(value, { ...paths, audioTools: fake.tools });
  assert.equal(fake.renders(), 2, 'Exact identical text rendered only once');
  assert.equal(built.listening, 'pending'); assert.equal(built.field, 'unverified');
  assert.equal(built.structuralValid, true); assert.equal(built.readyForOrdinaryUse, false);
  assert.equal(built.timing.stationaryAudioSeconds, 6);
  assert.equal(built.timing.totalSeconds, built.timing.walkingSeconds + 6 + 30);
  const checked=await checkBuiltTour(paths.outputDirectory, { audioTools: fake.tools });
  assert.ok(Date.parse(checked.validation.checkedAt)>=Date.parse(built.validation.checkedAt));
  assert.equal(checked.validation.audioCheckMode,'injected-test-tools');
  assert.equal(checked.validation.recordingCount,3);
  assert.deepEqual({...checked,validation:{...checked.validation,checkedAt:built.validation.checkedAt}},built,'Recheck preserves every result except its actual check timestamp');
  await buildTour(value, { ...paths, audioTools: fake.tools });
  assert.equal(fake.renders(), 2, 'Recheck never re-renders');
  const frozen = await readFile(built.packagePath);
  value.fixture.version = 2; value.stories[2].transcript = 'Synthetic revised third account.';
  value.stories[2].evidence[0].paragraph = value.stories[2].transcript;
  await buildTour(value, { ...paths, outputDirectory: join(paths.root, 'v2'), previousPackages: [built.packagePath], audioTools: fake.tools });
  assert.equal(fake.renders(), 3, 'Only changed clip rendered for a new version');
  assert.deepEqual(await readFile(built.packagePath), frozen, 'Prior package preserved');
});

test('builder refuses changed immutable directories and changed content with same ID/version elsewhere', async t => {
  const paths = await sandbox(t), fake = fakeAudio(), value = input();
  const built = await buildTour(value, { ...paths, audioTools: fake.tools });
  const original = await readFile(built.packagePath);
  value.fixture.title = 'Changed title';
  await assert.rejects(buildTour(value, { ...paths, audioTools: fake.tools }), /Immutable build directory/);
  await assert.rejects(buildTour(value, { ...paths, outputDirectory: join(paths.root, 'conflict'), previousPackages: [built.packagePath], audioTools: fake.tools }), /already names different content/);
  assert.deepEqual(await readFile(built.packagePath), original);
});

test('builder exposes over-budget draft, and does not double count walking chapters', async t => {
  const paths = await sandbox(t), fake = fakeAudio(), value = input();
  value.timing.targetSeconds = 10;
  value.chapters = [{ story: { ...structuredClone(value.stories[0]), id: 'walking' }, afterStopIndex: 0, startRouteIndex: 1, endRouteIndex: 2,
    navigationRouteIndex: 4, fastWalkingMetresPerSecond: 1.5, marginSeconds: 5, maximumAudioSeconds: 10 }];
  const built = await buildTour(value, { ...paths, audioTools: fake.tools });
  assert.equal(built.timing.withinTarget, false);
  assert.equal(built.timing.walkingAudioSeconds, 2);
  assert.equal(built.timing.totalSeconds, built.timing.walkingSeconds + built.timing.stationaryAudioSeconds + value.timing.allowanceSeconds);
  value.fixture.version = 2; value.chapters[0].maximumAudioSeconds = 1;
  await assert.rejects(buildTour(value, { ...paths, outputDirectory: join(paths.root, 'too-long'), audioTools: fake.tools }), /chapter cap/);
  value.chapters[0].maximumAudioSeconds = 10; value.chapters[0].marginSeconds = 100;
  await assert.rejects(buildTour(value, { ...paths, outputDirectory: join(paths.root, 'no-margin'), audioTools: fake.tools }), /navigation budget/);
});

test('builder rejects wrong PCM duration and changed voice metadata before publishing', async t => {
  const paths = await sandbox(t), fake = fakeAudio();
  const bad: BuilderAudioTools = { ...fake.tools, async inspect(path) { return { ...await fake.tools.inspect(path), durationSeconds: 20 }; } };
  await assert.rejects(buildTour(input(), { ...paths, audioTools: bad }), /PCM chunks/);
  const good = await buildTour(input(), { ...paths, audioTools: fake.tools });
  await assert.rejects(checkBuiltTour(paths.outputDirectory, { audioTools: { ...fake.tools, voiceConfig: { ...fake.tools.voiceConfig, speed: 2 } } }), /Voice revision/);
  assert.ok(good.structuralValid);
});

test('checker rejects missing and same-length corrupt local assets', async t => {
  const paths = await sandbox(t), fake = fakeAudio();
  await buildTour(input(), { ...paths, audioTools: fake.tools });
  const file = join(paths.outputDirectory, 'audio/first.m4a'), original = await readFile(file);
  await unlink(file);
  await assert.rejects(checkBuiltTour(paths.outputDirectory, { audioTools: fake.tools }), /ENOENT/);
  const corrupt = Buffer.from(original); corrupt[corrupt.length - 1] ^= 1;
  await writeFile(file, corrupt);
  await assert.rejects(checkBuiltTour(paths.outputDirectory, { audioTools: fake.tools }), /Actual asset MD5/);
  await writeFile(file, original);
  assert.equal((await checkBuiltTour(paths.outputDirectory, { audioTools: fake.tools })).structuralValid, true);
});

test('checker independently catches false packaged duration, timing and rejected transport', async t => {
  const paths = await sandbox(t), fake = fakeAudio();
  const built = await buildTour(input(), { ...paths, audioTools: fake.tools });
  const packageText = await readFile(built.packagePath, 'utf8'), prepText = await readFile(built.preparationPath, 'utf8');
  const pkg = JSON.parse(packageText), prep = JSON.parse(prepText);
  pkg.fixture.narration.stories[0].audio.durationSeconds = 30;
  prep.recordings[0].audio.durationSeconds = 30;
  const changed = JSON.stringify(pkg);
  prep.packageSha256 = sha(changed);
  await writeFile(built.packagePath, changed); await writeFile(built.preparationPath, JSON.stringify(prep));
  await assert.rejects(checkBuiltTour(paths.outputDirectory, { audioTools: fake.tools }), /Packaged duration/);
  await writeFile(built.packagePath, packageText);
  const badTiming = JSON.parse(prepText); badTiming.timing.totalSeconds = 1;
  await writeFile(built.preparationPath, JSON.stringify(badTiming));
  await assert.rejects(checkBuiltTour(paths.outputDirectory, { audioTools: fake.tools }), /Whole-tour timing/);
  const badPackage = JSON.parse(packageText); badPackage.assets.pop();
  assert.throws(() => parseTourPackage(badPackage), /Missing|Too small/);
  await writeFile(built.packagePath, JSON.stringify(badPackage));
  await assert.rejects(checkBuiltTour(paths.outputDirectory, { audioTools: fake.tools }));
});

test('production audio inspector fully decodes a tiny encoded fixture and rejects truncated bytes without synthesis', async t => {
  const paths = await sandbox(t), file = join(paths.root, 'tiny.m4a');
  execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', '0.1', '-c:a', 'aac', file]);
  const result = await inspectAudio(file);
  assert.equal(result.channels, 1); assert.equal(result.sampleRate, 24000); assert.ok(result.durationSeconds > 0);
  const bytes = await readFile(file); await writeFile(file, bytes.subarray(0, 32));
  await assert.rejects(inspectAudio(file));
});

test('zero-render validation is reusable for schema and route-contract checks', () => {
  assert.doesNotThrow(() => validateBuilderInput(input()));
  const value = input(); value.timing.walkingMetresPerSecond = NaN;
  assert.throws(() => validateBuilderInput(value), /Walking speed/);
});

test('changed but decodable cached bytes are rejected without re-rendering or publishing', async t => {
  const paths = await sandbox(t), fake = fakeAudio(), value = input();
  const built = await buildTour(value, { ...paths, audioTools: fake.tools });
  const prep = JSON.parse(await readFile(built.preparationPath, 'utf8'));
  const cacheFile = join(paths.cacheDirectory, prep.recordings[0].cacheKey, 'clip.m4a');
  const bytes = await readFile(cacheFile); bytes[bytes.length - 1] ^= 1;
  await writeFile(cacheFile, bytes);
  value.fixture.version = 2;
  await assert.rejects(buildTour(value, { ...paths, outputDirectory: join(paths.root, 'v2'), audioTools: fake.tools }), /Cached audio integrity/);
  assert.equal(fake.renders(), 3, 'Corrupt cache does not silently spend another render');
  assert.equal((await checkBuiltTour(paths.outputDirectory, { audioTools: fake.tools })).structuralValid, true, 'Previously staged copy remains intact');
});
