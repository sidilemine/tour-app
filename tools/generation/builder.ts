// Local authoring only. PKG-001/002 and VOICE-001/002: freeze inputs, validate
// actual player transports and decoded media; keep listening/field truth separate.
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { access, mkdir, readFile, writeFile, rename, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { distance, type Fixture } from '../../src/domain/fixture';
import type { Narration, Story } from '../../src/domain/narration';
import { assertTourVersion, parseTourPackage } from '../../src/tours/package';
import type { voiceConfig as georgeConfig } from '../voice-samples/render-tour.mjs';

export type WrittenStory = Omit<Story, 'audio'>;
export interface ChapterInput {
  story: WrittenStory;
  afterStopIndex: number;
  startRouteIndex: number;
  endRouteIndex: number;
  navigationRouteIndex: number;
  fastWalkingMetresPerSecond: number;
  marginSeconds: number;
  maximumAudioSeconds: number;
}
export interface BuilderInput {
  fixture: Omit<Fixture, 'narration'>;
  mapId: string;
  narration: Omit<Narration, 'stories' | 'chapters'>;
  stories: WrittenStory[];
  chapters: ChapterInput[];
  /** Contiguous legs cover the entire saved route, including any final return. */
  legs: { id: string; startRouteIndex: number; endRouteIndex: number; directions: string[]; evidence: string }[];
  timing: { targetSeconds: number; walkingMetresPerSecond: number; allowanceSeconds: number };
}
type VoiceConfig = typeof georgeConfig;
export interface AudioInspection { durationSeconds: number; channels: number; sampleRate: number }
/** Injection is for small deterministic failure tests; production uses the local George renderer. */
export interface BuilderAudioTools {
  voiceConfig: VoiceConfig;
  render(text: string, destination: string): Promise<void>;
  inspect(path: string): Promise<AudioInspection>; // Must include a full decode.
  close(): Promise<void>;
}
export interface BuilderOptions {
  outputDirectory: string;
  cacheDirectory?: string;
  previousPackages?: string[];
  audioTools?: BuilderAudioTools;
}
interface RenderMetadata { voiceConfig: VoiceConfig; chunks: { text: string; durationSeconds: number }[] }
interface Recording {
  id: string; file: string; textSha256: string; sha256: string; cacheKey: string; cacheHit: boolean;
  audio: Story['audio']; chunks: RenderMetadata['chunks'];
}
export interface BuildTiming {
  targetSeconds: number; routeMetres: number; walkingMetresPerSecond: number;
  walkingSeconds: number; stationaryAudioSeconds: number; walkingAudioSeconds: number;
  allowanceSeconds: number; totalSeconds: number; remainingSeconds: number; withinTarget: boolean;
  measuredWalk: false;
  chapters: { id: string; availableSeconds: number; audioSeconds: number; marginSeconds: number }[];
}
export interface BuildResult {
  packagePath: string; preparationPath: string; timing: BuildTiming;
  structuralValid: true; listening: 'pending'; field: 'unverified'; readyForOrdinaryUse: false;
}
interface Preparation {
  schemaVersion: 1; inputSha256: string; packageSha256: string; voiceConfig: VoiceConfig;
  recordings: Recording[]; timing: BuildTiming; preparedAt: string;
  structuralValid: true; listening: 'pending'; field: 'unverified'; readyForOrdinaryUse: false;
  directChargesUsd: 0;
}
const hash = (v: string | Buffer, algorithm = 'sha256') => createHash(algorithm).update(v).digest('hex');
const serialise = (v: unknown) => JSON.stringify(v, null, 2) + '\n';
const exists = async (p: string) => access(p).then(() => true, () => false);
const run = promisify(execFile);
const positive = (n: number, label: string, zero = false) => assert.ok(Number.isFinite(n) && (zero ? n >= 0 : n > 0), label);
const identity = /^[a-z0-9][a-z0-9-]{0,79}$/;

/** ffprobe measures the encoded file; ffmpeg must decode every packet successfully. */
export async function inspectAudio(path: string): Promise<AudioInspection> {
  const { stdout } = await run('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', path]);
  const probe = JSON.parse(stdout) as { format: { duration: string }; streams: { codec_type: string; channels: number; sample_rate: string }[] };
  assert.equal(probe.streams.length, 1, 'Exactly one audio stream');
  assert.equal(probe.streams[0].codec_type, 'audio', 'Audio stream required');
  await run('ffmpeg', ['-v', 'error', '-xerror', '-i', path, '-f', 'null', '-']);
  return { durationSeconds: Number(probe.format.duration), channels: probe.streams[0].channels, sampleRate: Number(probe.streams[0].sample_rate) };
}
async function localAudioTools(): Promise<BuilderAudioTools> {
  // The renderer checks the installed model manifest and sets allowRemoteModels=false.
  const renderer = await import('../voice-samples/render-tour.mjs');
  return { voiceConfig: renderer.voiceConfig, render: renderer.renderGeorge, inspect: inspectAudio, close: renderer.closeRenderer };
}
function clips(input: BuilderInput): WrittenStory[] { return [...input.stories, ...input.chapters.map(c => c.story)]; }
function makeTransport(input: BuilderInput, stories: Story[], chapterStories: Story[], assets: { key: string; base64: string }[]) {
  return { format: 'walking-tour-package' as const, version: 1 as const, mapId: input.mapId,
    fixture: { ...input.fixture, narration: { ...input.narration, stories,
      chapters: chapterStories.map((story, i) => ({ ...story, afterStopIndex: input.chapters[i].afterStopIndex,
        startRouteIndex: input.chapters[i].startRouteIndex, endRouteIndex: input.chapters[i].endRouteIndex })) } }, assets };
}
function routeMetres(input: BuilderInput, start = 0, end = input.fixture.route.length - 1) {
  let metres = 0;
  for (let i = start + 1; i <= end; i++) metres += distance(input.fixture.route[i - 1], input.fixture.route[i]);
  return metres;
}
export function validateBuilderInput(input: BuilderInput) {
  assert.match(input.fixture.id, identity, 'Fixture ID');
  assert.deepEqual(input.stories.map(s => s.id), input.fixture.stops.map(s => s.id), 'Story/stop order');
  assert.ok(input.stories.every(s => s.directions.length && s.directions.every(d => d.trim())), 'Every stop needs written directions');
  positive(input.timing.targetSeconds, 'Target duration');
  positive(input.timing.walkingMetresPerSecond, 'Walking speed');
  positive(input.timing.allowanceSeconds, 'Looking/crossing allowance', true);
  assert.ok(input.legs.length, 'Explicit route legs required');
  let last = 0;
  const legIds = new Set<string>();
  for (const leg of input.legs) {
    assert.ok(leg.id.trim() && !legIds.has(leg.id), 'Unique route leg ID'); legIds.add(leg.id);
    assert.equal(leg.startRouteIndex, last, 'Legs must cover route contiguously');
    assert.ok(Number.isInteger(leg.endRouteIndex) && leg.endRouteIndex > last && leg.endRouteIndex < input.fixture.route.length, 'Leg end index');
    assert.ok(leg.directions.length && leg.directions.every(d => d.trim()) && leg.evidence.trim(), 'Leg directions and evidence required');
    last = leg.endRouteIndex;
  }
  assert.equal(last, input.fixture.route.length - 1, 'Include the entire route, including return');
  for (const c of input.chapters) {
    const to = input.fixture.stops[c.afterStopIndex + 1];
    assert.ok(to && Number.isInteger(c.navigationRouteIndex) && c.navigationRouteIndex > c.endRouteIndex && c.navigationRouteIndex <= to.routeIndex, 'Navigation decision must follow latest launch within onward leg');
    positive(c.fastWalkingMetresPerSecond, 'Fast walking speed');
    positive(c.maximumAudioSeconds, 'Chapter cap'); positive(c.marginSeconds, 'Navigation margin', true);
  }
  // Use the real parser before synthesis, with explicit synthetic header-only
  // placeholders. They never leave this validation function or become artifacts.
  const header = Buffer.from('00000018667479704d34412000000000', 'hex');
  const written = clips(input);
  for (const story of written) {
    assert.match(story.id, identity); assert.match(`${input.fixture.id}-${story.id}`, identity, 'Audio key');
    assert.ok(story.transcript.split(/\n\s*\n/).every(p => p.trim() === p && p.length), 'Clean nonempty paragraphs');
    assert.equal(story.evidence.map(e => e.paragraph).join('\n\n'), story.transcript, `Complete ordered evidence: ${story.id}`);
    assert.ok(story.evidence.every(e => e.basis.trim()), 'Evidence basis required');
  }
  const placeholders = written.map(story => ({ ...story, audio: { key: `${input.fixture.id}-${story.id}`, bytes: header.length, md5: hash(header, 'md5'), durationSeconds: 1 } }));
  parseTourPackage(makeTransport(input, placeholders.slice(0, input.stories.length), placeholders.slice(input.stories.length), placeholders.map(s => ({ key: s.audio.key, base64: header.toString('base64') }))));
}
function measureTiming(input: BuilderInput, stories: Story[], chapters: Story[]): BuildTiming {
  const budgets = input.chapters.map((window, i) => {
    const availableSeconds = routeMetres(input, window.endRouteIndex, window.navigationRouteIndex) / window.fastWalkingMetresPerSecond;
    const audioSeconds = chapters[i].audio.durationSeconds;
    assert.ok(audioSeconds <= window.maximumAudioSeconds, `${window.story.id}: audio exceeds chapter cap`);
    assert.ok(audioSeconds + window.marginSeconds <= availableSeconds, `${window.story.id}: audio exceeds navigation budget`);
    return { id: window.story.id, availableSeconds, audioSeconds, marginSeconds: window.marginSeconds };
  });
  const metres = routeMetres(input), walkingSeconds = metres / input.timing.walkingMetresPerSecond;
  const stationaryAudioSeconds = stories.reduce((n, s) => n + s.audio.durationSeconds, 0);
  const walkingAudioSeconds = chapters.reduce((n, s) => n + s.audio.durationSeconds, 0);
  const totalSeconds = walkingSeconds + stationaryAudioSeconds + input.timing.allowanceSeconds;
  return { ...input.timing, routeMetres: metres, walkingSeconds, stationaryAudioSeconds, walkingAudioSeconds,
    totalSeconds, remainingSeconds: input.timing.targetSeconds - totalSeconds, withinTarget: totalSeconds <= input.timing.targetSeconds, measuredWalk: false, chapters: budgets };
}
async function inspectRecording(file: string, transcript: string, metadata: RenderMetadata, tools: BuilderAudioTools) {
  assert.deepEqual(metadata.voiceConfig, tools.voiceConfig, 'Exact cached voice configuration');
  assert.deepEqual(metadata.chunks.map(c => c.text), transcript.split(/\n\s*\n/), 'Complete rendered text/chunks');
  metadata.chunks.forEach(c => positive(c.durationSeconds, 'Positive chunk duration'));
  const inspection = await tools.inspect(file);
  positive(inspection.durationSeconds, 'Measured audio duration');
  assert.equal(inspection.channels, 1, 'Mono audio'); assert.equal(inspection.sampleRate, 24000, '24 kHz audio');
  const expected = metadata.chunks.reduce((n, c) => n + c.durationSeconds, 0) + (metadata.chunks.length - 1) * tools.voiceConfig.paragraphGapSeconds;
  assert.ok(Math.abs(inspection.durationSeconds - expected) < 0.2, 'Encoded duration does not match all PCM chunks');
  return inspection.durationSeconds;
}
async function versionCheck(paths: string[], fixture: Fixture, mapId: string) {
  const entries = await Promise.all(paths.map(async path => {
    const previous = parseTourPackage(JSON.parse(await readFile(path, 'utf8')));
    return { fixture: previous.fixture, mapId: previous.mapId, importedAt: '', directory: '' };
  }));
  assertTourVersion(entries, fixture, mapId);
}

/** Build a reviewable draft. New versions need new output directories; no existing artifacts are overwritten. */
export async function buildTour(inputValue: BuilderInput, options: BuilderOptions): Promise<BuildResult> {
  const input = structuredClone(inputValue); validateBuilderInput(input);
  const output = resolve(options.outputDirectory), inputBytes = serialise(input);
  if (await exists(output)) {
    assert.equal(await readFile(join(output, 'input.json'), 'utf8'), inputBytes, 'Immutable build directory: use a new version and output directory');
    return checkBuiltTour(output, { audioTools: options.audioTools, previousPackages: options.previousPackages });
  }
  const tools = options.audioTools ?? await localAudioTools();
  const cacheRoot = resolve(options.cacheDirectory ?? 'artifacts/generation-audio');
  const stage = `${output}.staging-${randomUUID()}`;
  const recordings: Recording[] = [], rendered: Story[] = [], assets: { key: string; base64: string }[] = [];
  try {
    await mkdir(join(stage, 'audio'), { recursive: true });
    for (const story of clips(input)) {
      const digest = hash(JSON.stringify(tools.voiceConfig) + '\n' + story.transcript);
      const cache = join(cacheRoot, digest), file = join(cache, 'clip.m4a');
      const cacheHit = await exists(cache);
      if (!cacheHit) {
        const pending = `${cache}.staging-${randomUUID()}`;
        await mkdir(pending, { recursive: true });
        try {
          const pendingFile = join(pending, 'clip.m4a');
          await tools.render(story.transcript, pendingFile);
          const metadata = JSON.parse(await readFile(`${pendingFile}.render.json`, 'utf8')) as RenderMetadata;
          await inspectRecording(pendingFile, story.transcript, metadata, tools);
          await writeFile(join(pending, 'cache.json'), serialise({ key: digest, audioSha256: hash(await readFile(pendingFile)), metadataSha256: hash(await readFile(`${pendingFile}.render.json`)) }));
          await rename(pending, cache);
        } finally { await rm(pending, { recursive: true, force: true }); }
      }
      const receipt = JSON.parse(await readFile(join(cache, 'cache.json'), 'utf8')) as { key: string; audioSha256: string; metadataSha256: string };
      assert.equal(receipt.key, digest, 'Exact cache identity');
      assert.equal(receipt.audioSha256, hash(await readFile(file)), 'Cached audio integrity');
      assert.equal(receipt.metadataSha256, hash(await readFile(`${file}.render.json`)), 'Cached metadata integrity');
      const metadata = JSON.parse(await readFile(`${file}.render.json`, 'utf8')) as RenderMetadata;
      const durationSeconds = await inspectRecording(file, story.transcript, metadata, tools);
      const bytes = await readFile(file), key = `${input.fixture.id}-${story.id}`;
      const audio = { key, bytes: bytes.length, md5: hash(bytes, 'md5'), durationSeconds };
      const relative = `audio/${story.id}.m4a`;
      await writeFile(join(stage, relative), bytes);
      await writeFile(join(stage, `audio/${story.id}.txt`), story.transcript + '\n');
      await writeFile(join(stage, `${relative}.render.json`), serialise(metadata));
      rendered.push({ ...story, audio }); assets.push({ key, base64: bytes.toString('base64') });
      recordings.push({ id: story.id, file: relative, textSha256: hash(story.transcript), sha256: hash(bytes), cacheKey: digest, cacheHit, audio, chunks: metadata.chunks });
    }
    const stories = rendered.slice(0, input.stories.length), chapters = rendered.slice(input.stories.length);
    const transport = makeTransport(input, stories, chapters, assets);
    const parsed = parseTourPackage(transport);
    await versionCheck(options.previousPackages ?? [], parsed.fixture, parsed.mapId);
    const timing = measureTiming(input, stories, chapters);
    const packageBytes = serialise(transport);
    const preparation: Preparation = { schemaVersion: 1, inputSha256: hash(inputBytes), packageSha256: hash(packageBytes),
      voiceConfig: tools.voiceConfig, recordings, timing, preparedAt: new Date().toISOString(),
      structuralValid: true, listening: 'pending', field: 'unverified', readyForOrdinaryUse: false, directChargesUsd: 0 };
    await writeFile(join(stage, 'input.json'), inputBytes);
    await writeFile(join(stage, 'package.json'), packageBytes);
    await writeFile(join(stage, 'preparation.json'), serialise(preparation));
    // Verify staged copies, not only cached originals, before atomic promotion.
    await checkContents(stage, tools, options.previousPackages ?? []);
    await mkdir(dirname(output), { recursive: true });
    await rename(stage, output);
    return result(output, timing);
  } finally {
    await rm(stage, { recursive: true, force: true }); await tools.close();
  }
}
function result(output: string, timing: BuildTiming): BuildResult {
  return { packagePath: join(output, 'package.json'), preparationPath: join(output, 'preparation.json'), timing,
    structuralValid: true, listening: 'pending', field: 'unverified', readyForOrdinaryUse: false };
}
async function checkContents(output: string, tools: BuilderAudioTools, previousPackages: string[]) {
  const inputBytes = await readFile(join(output, 'input.json'), 'utf8');
  const input = JSON.parse(inputBytes) as BuilderInput; validateBuilderInput(input);
  const packageBytes = await readFile(join(output, 'package.json'), 'utf8');
  const p = parseTourPackage(JSON.parse(packageBytes));
  const preparation = JSON.parse(await readFile(join(output, 'preparation.json'), 'utf8')) as Preparation;
  assert.equal(preparation.schemaVersion, 1);
  assert.equal(hash(inputBytes), preparation.inputSha256, 'Frozen input hash');
  assert.equal(hash(packageBytes), preparation.packageSha256, 'Frozen package hash');
  assert.deepEqual(preparation.voiceConfig, tools.voiceConfig, 'Voice revision');
  assert.deepEqual([preparation.structuralValid, preparation.listening, preparation.field, preparation.readyForOrdinaryUse], [true, 'pending', 'unverified', false], 'Draft acceptance boundaries');
  const written = clips(input), packaged = [...p.fixture.narration!.stories, ...p.fixture.narration!.chapters];
  assert.equal(preparation.recordings.length, written.length, 'Complete recording manifest');
  for (const [i, story] of packaged.entries()) {
    const record = preparation.recordings[i], expectedFile = `audio/${story.id}.m4a`;
    assert.equal(record.id, story.id); assert.equal(record.file, expectedFile, 'Bounded asset path');
    assert.deepEqual(record.audio, story.audio);
    assert.equal(record.textSha256, hash(written[i].transcript));
    assert.equal(record.cacheKey, hash(JSON.stringify(tools.voiceConfig) + '\n' + written[i].transcript));
    const bytes = await readFile(join(output, expectedFile));
    assert.equal(bytes.length, story.audio.bytes, 'Actual asset byte count');
    assert.equal(hash(bytes, 'md5'), story.audio.md5, 'Actual asset MD5');
    assert.equal(hash(bytes), record.sha256, 'Actual asset SHA256');
    assert.deepEqual(bytes, Buffer.from(p.assets.find(a => a.key === story.audio.key)!.base64, 'base64'), 'Package/sample identity');
    assert.equal(await readFile(join(output, `audio/${story.id}.txt`), 'utf8'), written[i].transcript + '\n', 'Review transcript identity');
    const metadata = JSON.parse(await readFile(join(output, `${expectedFile}.render.json`), 'utf8')) as RenderMetadata;
    assert.deepEqual(record.chunks, metadata.chunks, 'Retained chunk identity');
    const seconds = await inspectRecording(join(output, expectedFile), written[i].transcript, metadata, tools);
    assert.ok(Math.abs(seconds - story.audio.durationSeconds) < 0.01, 'Packaged duration differs from measured audio');
  }
  const rebuilt = makeTransport(input, packaged.slice(0, input.stories.length), packaged.slice(input.stories.length), p.assets);
  // Written content must agree too; parsed stories above are not trusted inputs.
  rebuilt.fixture.narration.stories = input.stories.map((s, i) => ({ ...s, audio: packaged[i].audio }));
  rebuilt.fixture.narration.chapters = input.chapters.map((c, i) => ({ ...c.story, audio: packaged[input.stories.length + i].audio,
    afterStopIndex: c.afterStopIndex, startRouteIndex: c.startRouteIndex, endRouteIndex: c.endRouteIndex }));
  assert.deepEqual(parseTourPackage(rebuilt), p, 'Package matches written input and route');
  await versionCheck(previousPackages, p.fixture, p.mapId);
  const timing = measureTiming(input, p.fixture.narration!.stories, p.fixture.narration!.chapters);
  assert.deepEqual(preparation.timing, timing, 'Whole-tour timing matches actual audio and route');
  return result(output, timing);
}
/** Rechecks frozen inputs, actual parser, all hashes, encoded duration and full decode. */
export async function checkBuiltTour(outputDirectory: string, options: Pick<BuilderOptions, 'audioTools' | 'previousPackages'> = {}): Promise<BuildResult> {
  const tools = options.audioTools ?? await localAudioTools();
  try { return await checkContents(resolve(outputDirectory), tools, options.previousPackages ?? []); }
  finally { await tools.close(); }
}
