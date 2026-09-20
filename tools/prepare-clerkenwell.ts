// Bounded authoring for the reviewed Clerkenwell walk, using cached local George.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { distance, type Fixture } from '../src/domain/fixture';
import type { Narration, Story } from '../src/domain/narration';
import { assertTourVersion, parseTourPackage } from '../src/tours/package';
import catalog from '../src/map/clerkenwell.json';
import { closeRenderer, renderGeorge, voiceConfig } from './voice-samples/render-tour.mjs';

type Written = Omit<Story, 'audio'>;
type Window = { id: string; afterStopIndex: number; startRouteIndex: number; endRouteIndex: number;
  navigationRouteIndex: number; fastWalkingMetresPerSecond: number; marginSeconds: number };
type Plan = { fixture: Omit<Fixture, 'narration'>; narration: Omit<Narration, 'stories' | 'chapters'>;
  chapters: Window[]; routeEvidence: string };
const root = 'content/clerkenwell';
const sha = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
function command(program: string, args: string[]) {
  const result = spawnSync(program, args, { encoding: 'utf8' });
  if (result.error || result.status !== 0) throw Error(result.error?.message ?? result.stderr ?? `${program} failed`);
  return result.stdout;
}
async function main() {
  const storyPath = `${root}/stories.json`, planPath = `${root}/plan.json`;
  const writtenBytes = readFileSync(storyPath), planBytes = readFileSync(planPath);
  const written = JSON.parse(writtenBytes.toString()) as { stories: Written[]; chapters: Written[] };
  const plan = JSON.parse(planBytes.toString()) as Plan;
  assert.match(plan.fixture.id, /^[a-z0-9][a-z0-9-]{0,79}$/);
  assert.deepEqual(written.stories.map(s => s.id), plan.fixture.stops.map(s => s.id), 'Story/stop order');
  assert.deepEqual(written.chapters.map(s => s.id), plan.chapters.map(s => s.id), 'Chapter order');
  const assets: { key: string; base64: string }[] = [], recordings: unknown[] = [];
  async function render(story: Written): Promise<Story> {
    assert.match(story.id, /^[a-z0-9][a-z0-9-]{0,79}$/);
    const paragraphs = story.transcript.split(/\n\s*\n/);
    assert.ok(paragraphs.every(p => p.trim() === p && p.length > 0), `${story.id}: clean paragraphs`);
    assert.deepEqual(story.evidence.map(e => e.paragraph), paragraphs, `${story.id}: complete ordered evidence`);
    const sourceUrls = new Set(story.sources.map(s => s.url));
    for (const e of story.evidence) {
      assert.ok(e.basis.trim(), `${story.id}: evidence basis`);
      assert.ok(e.kind === 'editorial' || e.sourceUrls.length > 0, `${story.id}: factual sources`);
      assert.ok(e.sourceUrls.every(url => sourceUrls.has(url)), `${story.id}: known sources`);
    }
    const key = `${plan.fixture.id}-${story.id}`;
    assert.match(key, /^[a-z0-9][a-z0-9-]{0,79}$/);
    const digest = sha(JSON.stringify(voiceConfig) + '\n' + story.transcript);
    const cache = resolve('artifacts/clerkenwell-audio', digest);
    mkdirSync(cache, { recursive: true });
    const audioPath = `${cache}/${story.id}.m4a`;
    if (!existsSync(audioPath) || !existsSync(`${audioPath}.render.json`)) {
      writeFileSync(`${cache}/transcript.txt`, story.transcript + '\n');
      console.log(`Rendering George: ${story.title}`);
      await renderGeorge(story.transcript, audioPath);
    }
    const metadata = JSON.parse(readFileSync(`${audioPath}.render.json`, 'utf8')) as {
      voiceConfig: typeof voiceConfig; chunks: { text: string; durationSeconds: number }[] };
    assert.deepEqual(metadata.voiceConfig, voiceConfig, 'Cached voice settings');
    assert.deepEqual(metadata.chunks.map(c => c.text), paragraphs, 'All text rendered without truncation');
    const probe = JSON.parse(command('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', audioPath]));
    const durationSeconds = Number(probe.format.duration);
    const pcmSeconds = metadata.chunks.reduce((sum, c) => sum + c.durationSeconds, 0)
      + (metadata.chunks.length - 1) * voiceConfig.paragraphGapSeconds;
    assert.ok(Number.isFinite(durationSeconds) && Math.abs(durationSeconds - pcmSeconds) < 0.2, 'All PCM chunks retained');
    assert.equal(probe.streams.length, 1); assert.equal(probe.streams[0].channels, 1);
    assert.equal(probe.streams[0].sample_rate, '24000');
    command('ffmpeg', ['-v', 'error', '-xerror', '-i', audioPath, '-f', 'null', '-']);
    const bytes = readFileSync(audioPath);
    const audio = { key, bytes: bytes.length, md5: createHash('md5').update(bytes).digest('hex'), durationSeconds };
    assets.push({ key, base64: bytes.toString('base64') });
    recordings.push({ id: story.id, ...audio, sha256: sha(bytes), textSha256: sha(story.transcript), cache,
      words: story.transcript.split(/\s+/).length, chunks: metadata.chunks,
      verification: 'Complete text/chunks, mono 24 kHz, duration and full decode checked; subjective listening separate.' });
    console.log(`${story.id}: ${durationSeconds.toFixed(3)} seconds; full decode passed`);
    return { ...story, audio };
  }
  const stories: Story[] = [], chapters: Narration['chapters'] = [], budgets: unknown[] = [];
  for (const story of written.stories) stories.push(await render(story));
  for (let i = 0; i < written.chapters.length; i++) {
    const chapter = await render(written.chapters[i]), window = plan.chapters[i], route = plan.fixture.route;
    assert.ok(Number.isInteger(window.navigationRouteIndex) && window.navigationRouteIndex < route.length
      && window.navigationRouteIndex > window.endRouteIndex, 'Navigation decision beyond launch interval');
    assert.ok(window.fastWalkingMetresPerSecond > 0 && window.marginSeconds >= 0, 'Explicit timing assumptions');
    let metres = 0;
    for (let p = window.endRouteIndex + 1; p <= window.navigationRouteIndex; p++) metres += distance(route[p - 1], route[p]);
    const availableSeconds = metres / window.fastWalkingMetresPerSecond;
    assert.ok(chapter.audio.durationSeconds + window.marginSeconds <= availableSeconds,
      `${chapter.id}: latest launch leaves ${availableSeconds.toFixed(1)}s; needs ${(chapter.audio.durationSeconds + window.marginSeconds).toFixed(1)}s`);
    budgets.push({ ...window, metresAfterLatestLaunch: metres, availableSeconds, audioSeconds: chapter.audio.durationSeconds });
    chapters.push({ ...chapter, afterStopIndex: window.afterStopIndex, startRouteIndex: window.startRouteIndex, endRouteIndex: window.endRouteIndex });
  }
  const fixture: Fixture = { ...plan.fixture, narration: { ...plan.narration, stories, chapters } };
  const transport = { format: 'walking-tour-package' as const, version: 1 as const, mapId: catalog.id, fixture, assets };
  parseTourPackage(transport);
  const packagePath = `${root}/packages/working-lives.json`;
  if (existsSync(packagePath)) {
    const previous = parseTourPackage(JSON.parse(readFileSync(packagePath, 'utf8')));
    assertTourVersion([{ fixture: previous.fixture, mapId: previous.mapId, directory: '', importedAt: '' }], fixture, catalog.id);
  }
  assert.deepEqual(readFileSync(storyPath), writtenBytes, 'Stories remained frozen');
  assert.deepEqual(readFileSync(planPath), planBytes, 'Route remained frozen');
  mkdirSync(`${root}/packages`, { recursive: true });
  writeFileSync(packagePath, JSON.stringify(transport) + '\n');
  writeFileSync(`${root}/manifest.json`, JSON.stringify({ ...transport, assets: assets.map(a => ({ key: a.key, base64: '[in companion package]' })) }, null, 2) + '\n');
  // Cache paths are project-relative in retained metadata, never workstation paths.
  const retainedRecordings = recordings.map(value => {
    const record = value as { cache: string }; return { ...record, cache: record.cache.replace(resolve('.') + '/', '') };
  });
  writeFileSync(`${root}/preparation.json`, JSON.stringify({ preparedAt: new Date().toISOString(),
    inputs: [{ path: storyPath, sha256: sha(writtenBytes) }, { path: planPath, sha256: sha(planBytes) }],
    mapId: catalog.id, routeEvidence: plan.routeEvidence, synthesis: voiceConfig,
    stationaryAudioSeconds: stories.reduce((sum, s) => sum + s.audio.durationSeconds, 0),
    walkingAudioSeconds: chapters.reduce((sum, s) => sum + s.audio.durationSeconds, 0),
    budgets, recordings: retainedRecordings }, null, 2) + '\n');
  console.log(`Prepared ${stories.length} stops and ${chapters.length} walking chapters; no phone or playback action.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(closeRenderer);
