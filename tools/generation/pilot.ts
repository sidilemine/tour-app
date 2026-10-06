// Explicit offline-only supervised pilot assembly. No provider dispatch or phone changes.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { parseTourPackage, assertTourVersion } from '../../src/tours/package';
import type { Fixture } from '../../src/domain/fixture';
import type { Story, Narration } from '../../src/domain/narration';
import catalog from '../../src/map/clerkenwell.json';
import { closeRenderer, renderGeorge, voiceConfig } from '../voice-samples/render-tour.mjs';
const root = 'content/generation-pilot';
const sha = (v: string | Buffer) => createHash('sha256').update(v).digest('hex');
function cmd(program: string, args: string[]) {
  const r = spawnSync(program, args, { encoding: 'utf8' });
  if (r.error || r.status !== 0) throw Error(r.error?.message ?? r.stderr ?? `${program} failed`);
  return r.stdout;
}
async function main() {
  const start = Date.now();
  assert.ok(process.argv.slice(2).every(a => a === '--check'), 'Usage: pilot.ts [--check]');
  if (process.argv.includes('--check')) {
    const p = parseTourPackage(JSON.parse(readFileSync(`${root}/package.json`, 'utf8')));
    const preparation = JSON.parse(readFileSync(`${root}/preparation.json`, 'utf8')) as { inputs: { path: string; sha256: string }[]; packageSha256: string };
    for (const input of preparation.inputs) assert.equal(sha(readFileSync(input.path)), input.sha256, `Stale pilot input: ${input.path}`);
    assert.equal(sha(readFileSync(`${root}/package.json`)), preparation.packageSha256, 'Package changed after preparation');
    for (const story of p.fixture.narration!.stories) {
      const encoded = p.assets.find(a => a.key === story.audio.key)!;
      const data = Buffer.from(encoded.base64, 'base64');
      assert.equal(createHash('md5').update(data).digest('hex'), story.audio.md5, 'Actual asset hash');
      assert.deepEqual(data, readFileSync(`${root}/audio/${story.id}.m4a`), 'Package/sample identity');
    }
    console.log(`Actual player parser and ${p.assets.length} audio hashes passed; physical acceptance remains unverified.`);
    return;
  }
  const inputFiles = [`${root}/plan.json`, `${root}/stories.json`, `${root}/evidence.json`, `${root}/encounters.json`];
  const bytes = inputFiles.map(p => readFileSync(p));
  const plan = JSON.parse(bytes[0].toString()) as { fixture: Fixture; narration: Omit<Narration, 'stories' | 'chapters'>; authoring: { routeMetres: number } };
  const written = JSON.parse(bytes[1].toString()) as { stories: Omit<Story, 'audio'>[]; chapters: unknown[] };
  assert.equal(written.chapters.length, 0, 'This version uses quiet walking legs');
  assert.deepEqual(plan.fixture.stops.map(s => s.id), written.stories.map(s => s.id));
  const assets: { key: string; base64: string }[] = [], stories: Story[] = [], records = [];
  mkdirSync(`${root}/audio`, { recursive: true });
  for (const story of written.stories) {
    const paragraphs = story.transcript.split(/\n\s*\n/);
    // Evidence can cover two adjacent paragraphs, as the established importer permits.
    assert.equal(story.evidence.map(e => e.paragraph).join('\n\n'), story.transcript, 'Complete ordered evidence coverage');
    const digest = sha(JSON.stringify(voiceConfig) + '\n' + story.transcript);
    const cache = resolve('artifacts/generation-pilot-audio', digest);
    mkdirSync(cache, { recursive: true });
    const file = `${cache}/${story.id}.m4a`;
    const cacheHit = existsSync(file) && existsSync(`${file}.render.json`);
    if (!cacheHit) { console.log(`Rendering ${story.id}`); await renderGeorge(story.transcript, file); }
    const metadata = JSON.parse(readFileSync(`${file}.render.json`, 'utf8')) as { voiceConfig: typeof voiceConfig; chunks: { text: string; durationSeconds: number }[] };
    assert.deepEqual(metadata.voiceConfig, voiceConfig);
    assert.deepEqual(metadata.chunks.map(c => c.text), paragraphs, 'No dropped or truncated paragraphs');
    const probe = JSON.parse(cmd('ffprobe', ['-v','error','-show_format','-show_streams','-of','json',file]));
    const durationSeconds = Number(probe.format.duration);
    const expected = metadata.chunks.reduce((n,c) => n+c.durationSeconds,0) + (paragraphs.length-1)*voiceConfig.paragraphGapSeconds;
    assert.ok(Number.isFinite(durationSeconds) && Math.abs(durationSeconds-expected)<0.2);
    assert.equal(probe.streams.length,1); assert.equal(probe.streams[0].sample_rate,'24000'); assert.equal(probe.streams[0].channels,1);
    cmd('ffmpeg',['-v','error','-xerror','-i',file,'-f','null','-']);
    const audioBytes = readFileSync(file), key = `clerkenwell-balanced-pilot-${story.id}`;
    const audio = { key, bytes: audioBytes.length, md5:createHash('md5').update(audioBytes).digest('hex'), durationSeconds };
    stories.push({...story,audio}); assets.push({key,base64:audioBytes.toString('base64')});
    copyFileSync(file,`${root}/audio/${story.id}.m4a`);
    writeFileSync(`${root}/audio/${story.id}.txt`,story.transcript+'\n');
    records.push({id:story.id,path:`${root}/audio/${story.id}.m4a`,...audio,sha256:sha(audioBytes),textSha256:sha(story.transcript),words:story.transcript.split(/\s+/).length,chunks:metadata.chunks,cacheHit,checks:['all paragraphs retained','full decode','mono 24 kHz','encoded duration vs PCM'],listening:'not performed'});
    console.log(`${story.id}: ${durationSeconds.toFixed(3)}s, decode passed`);
  }
  const fixture: Fixture = {...plan.fixture,narration:{...plan.narration,stories,chapters:[]}};
  const transport = {format:'walking-tour-package' as const,version:1 as const,mapId:catalog.id,fixture,assets};
  const validated = parseTourPackage(transport);
  const packagePath = `${root}/package.json`;
  if (existsSync(packagePath)) {
    const previous = parseTourPackage(JSON.parse(readFileSync(packagePath,'utf8')));
    assertTourVersion([{fixture:previous.fixture,mapId:previous.mapId,directory:'',importedAt:''}],validated.fixture,catalog.id);
  }
  inputFiles.forEach((p,i) => assert.deepEqual(readFileSync(p),bytes[i]));
  writeFileSync(packagePath,JSON.stringify(transport)+'\n');
  const audioMinutes = stories.reduce((n,s) => n+s.audio.durationSeconds,0)/60;
  const walkingMinutes = plan.authoring.routeMetres/75;
  const run = { startedAt: new Date(start).toISOString(), finishedAt: new Date().toISOString(), elapsedSeconds:(Date.now()-start)/1000, directChargesUsd:0, cacheHits:records.filter(r=>r.cacheHit).length, recordings:records.length };
  const runsPath = `${root}/render-runs.json`;
  const runs = existsSync(runsPath) ? JSON.parse(readFileSync(runsPath,'utf8')) as unknown[] : [];
  runs.push(run); writeFileSync(runsPath,JSON.stringify(runs,null,2)+'\n');
  const preparationPath = `${root}/preparation.json`;
  const previousPreparation = existsSync(preparationPath) ? JSON.parse(readFileSync(preparationPath,'utf8')) as { inputs: {path:string;sha256:string}[]; packageSha256:string } : null;
  const unchangedPreparation = previousPreparation?.packageSha256 === sha(readFileSync(packagePath)) && JSON.stringify(previousPreparation.inputs) === JSON.stringify(inputFiles.map((p,i)=>({path:p,sha256:sha(bytes[i])})));
  if (!unchangedPreparation) writeFileSync(preparationPath,JSON.stringify({preparedAt:new Date().toISOString(),mode:'supervised manual calibration, not subscription workflow baseline',inputs:inputFiles.map((p,i)=>({path:p,sha256:sha(bytes[i])})),mapId:catalog.id,packageSha256:sha(readFileSync(packagePath)),synthesis:voiceConfig,modelHashReference:'docs/content/voice-samples/metadata.json',directChargesUsd:0,subscriptionModelUsage:null,renderAndValidateElapsedSeconds:(Date.now()-start)/1000,recordings:records,timing:{targetMinutes:60,routeMetres:plan.authoring.routeMetres,walkingMinutesAt4_5KmH:walkingMinutes,stationaryAudioMinutes:audioMinutes,lookingSettlingCrossingAllowanceMinutes:60-walkingMinutes-audioMinutes,measuredWalk:false},acceptance:{packageParse:'passed',audioDecode:'passed',field:'not performed',listening:'not performed',independentCurrentReview:'pending',readyForOrdinaryUse:false}},null,2)+'\n');
  console.log('Pilot package validated; acceptance remains blocked on documented route/review gaps.');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(closeRenderer);
