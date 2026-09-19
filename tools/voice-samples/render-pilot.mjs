// Two original desk-review samples. No tour preparation, upload or playback.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { renderNarration, closeRenderer, voiceConfig } from './render-tour.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const pilot = 'docs/content/authoring/pilot-2026-09-19';
const source = `${pilot}/REVIEW-PACKET.md`;
const output = resolve(root, process.argv[2] || `${pilot}/audio`);
const work = resolve(root, 'artifacts/authoring-pilot-audio-2026-09-19');
const packet = await readFile(resolve(root, source), 'utf8');
const sha = data => createHash('sha256').update(data).digest('hex');
const normalize = text => text.replace(/\s+/g, ' ').trim();
const sourceGitCommit = command('git', ['-C', root, 'rev-parse', 'HEAD']).trim();
assert.equal(command('git', ['-C', root, 'show', `${sourceGitCommit}:${source}`]), packet,
  'Commit the reviewed packet before recording, so the exact input version is retained');
function passage(start, end) {
  assert.equal(packet.split(start).length, 2, `Unique start: ${start}`);
  const remainder = packet.slice(packet.indexOf(start));
  assert.ok(remainder.includes(end), `Missing end: ${end}`);
  return remainder.slice(0, remainder.indexOf(end)).trim();
}
const samples = [
  { id: 'artsdepot-george', voice: 'bm_george', title: 'Artsdepot — George', expectedWords: 317,
    text: passage('Here on Nether Street,', '\n### A more concrete ending'),
    treatment: 'Main artsdepot story with the warmer ending.' },
  { id: 'alexandra-grove-emma', voice: 'bf_emma', title: 'Alexandra Grove — Emma', expectedWords: 266,
    text: passage('As you walk along Alexandra Grove,', '\n### Candidate orientation') + '\n\n'
      + passage('Continue along Alexandra Grove towards', '\n\nThis wording is included'),
    treatment: 'Main street-led walking chapter, including the candidate orientation.' },
];
for (const sample of samples) assert.equal(sample.text.split(/\s+/).length, sample.expectedWords);
// A reviewed recording is immutable: choose a different output directory for another run.
await mkdir(output);
await mkdir(work, { recursive: true });
function command(program, args) {
  const result = spawnSync(program, args, { encoding: 'utf8' });
  if (result.status !== 0) throw Error(result.error?.message || result.stderr || `${program} failed`);
  return result.stdout;
}
const recordings = [];
try {
  for (const sample of samples) {
    console.log(`Rendering ${sample.title} (${sample.expectedWords} words)…`);
    const intermediate = resolve(work, `${sample.id}.m4a`);
    // This walking paragraph exceeds the guarded model capacity. Preserve every
    // word and split it at this sentence boundary, adding the usual 0.25 s pause.
    const renderText = sample.id === 'alexandra-grove-emma'
      ? sample.text.replace('separate building projects. Nearby', 'separate building projects.\n\nNearby')
      : sample.text;
    assert.equal(normalize(renderText), normalize(sample.text));
    if (existsSync(`${intermediate}.render.json`) && existsSync(`${intermediate}.wav`)) {
      const cached = JSON.parse(await readFile(`${intermediate}.render.json`, 'utf8'));
      assert.equal(cached.chunks.map(chunk => chunk.text).join('\n\n'), renderText, 'Cached input must match');
      assert.deepEqual(cached.voiceConfig, { ...voiceConfig, voice: sample.voice }, 'Cached settings must match');
    } else {
      await renderNarration(renderText, intermediate, sample.voice);
    }
    const render = JSON.parse(await readFile(`${intermediate}.render.json`, 'utf8'));
    assert.equal(normalize(render.chunks.map(chunk => chunk.text).join('\n\n')), normalize(sample.text));
    const file = `${sample.id}.mp3`;
    const destination = resolve(output, file);
    command('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-n', '-i', `${intermediate}.wav`,
      '-af', 'loudnorm=I=-19:TP=-2:LRA=11', '-ar', '24000', '-ac', '1',
      '-codec:a', 'libmp3lame', '-b:a', '96k', destination]);
    const probe = JSON.parse(command('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', destination]));
    const durationSeconds = Number(probe.format.duration);
    const pcmSeconds = render.chunks.reduce((sum, chunk) => sum + chunk.durationSeconds, 0)
      + (render.chunks.length - 1) * voiceConfig.paragraphGapSeconds;
    assert.ok(Math.abs(durationSeconds - pcmSeconds) < 0.2, 'Encoded duration matches all paragraphs');
    assert.equal(probe.streams.length, 1);
    assert.equal(probe.streams[0].sample_rate, '24000');
    assert.equal(probe.streams[0].channels, 1);
    command('ffmpeg', ['-hide_banner', '-v', 'error', '-xerror', '-i', destination, '-f', 'null', '-']);
    const bytes = await readFile(destination);
    await writeFile(resolve(output, `${sample.id}.txt`), `${sample.text}\n`, { flag: 'wx' });
    recordings.push({ file, title: sample.title, treatment: sample.treatment, voice: sample.voice,
      words: sample.expectedWords, durationSeconds, bytes: bytes.length, sha256: sha(bytes),
      textFile: `${sample.id}.txt`, textSha256: sha(sample.text), chunks: render.chunks,
      renderTextSha256: sha(renderText),
      checks: { allParagraphsRendered: true, fullDecode: true, sampleRate: 24000, channels: 1 } });
    console.log(`${file}: ${durationSeconds.toFixed(3)} seconds; full decode passed`);
  }
  await writeFile(resolve(output, 'metadata.json'), JSON.stringify({ generatedAt: new Date().toISOString(),
    source, sourceGitCommit, sourceSha256: sha(packet), synthesis: { ...voiceConfig, voice: 'Per recording below', encoding: 'MP3 mono 24 kHz 96 kb/s' },
    modelHashReference: 'docs/content/voice-samples/metadata.json',
    recordingScope: 'Desk listening only; editorial alternatives remain open and candidate directions are not installed.',
    audibleReview: 'Not performed by the renderer; owner listening is pending.', recordings }, null, 2) + '\n', { flag: 'wx' });
} finally {
  await closeRenderer();
}
