// The September 20 desk samples. Uses only the cached free local voices.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { renderNarration, closeRenderer, voiceConfig } from './render-tour.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const folder = 'docs/content/authoring/revision-2026-09-20';
const source = `${folder}/SCRIPTS.md`;
const output = resolve(root, process.argv[2] || `${folder}/audio`);
const sha = data => createHash('sha256').update(data).digest('hex');
const packet = await readFile(resolve(root, source), 'utf8');
const sourceSha256 = sha(packet);
const work = resolve(root, 'artifacts/authoring-revision-audio', sourceSha256);
function command(program, args) {
  const result = spawnSync(program, args, { encoding: 'utf8' });
  if (result.status !== 0) throw Error(result.error?.message || result.stderr || `${program} failed`);
  return result.stdout;
}
function passage(id) {
  const start = `<!-- narration:${id}:start -->`;
  const end = `<!-- narration:${id}:end -->`;
  assert.equal(packet.split(start).length, 2, `Unique start: ${id}`);
  assert.equal(packet.split(end).length, 2, `Unique end: ${id}`);
  const from = packet.indexOf(start) + start.length;
  const to = packet.indexOf(end);
  assert.ok(to > from, `Ordered markers: ${id}`);
  const text = packet.slice(from, to).trim();
  assert.ok(text.length > 0, `Nonempty narration: ${id}`);
  return text;
}
const samples = [
  { id: 'artsdepot-george', marker: 'artsdepot', title: 'Artsdepot — George', voice: 'bm_george' },
  { id: 'alexandra-grove-emma', marker: 'alexandra-grove', title: 'Alexandra Grove — Emma', voice: 'bf_emma' },
].map(sample => ({ ...sample, text: passage(sample.marker) }));

// Exclusive directory creation prevents replacing an earlier review recording.
// The exact source snapshot is retained even when it precedes the final commit.
await mkdir(output);
await mkdir(work, { recursive: true });
await writeFile(resolve(output, 'script-source.txt'), packet, { flag: 'wx' });
const recordings = [];
try {
  for (const sample of samples) {
    const words = sample.text.split(/\s+/).length;
    console.log(`Rendering ${sample.title} (${words} words)…`);
    const intermediate = resolve(work, `${sample.id}.m4a`);
    const config = { ...voiceConfig, voice: sample.voice };
    if (existsSync(`${intermediate}.render.json`) && existsSync(`${intermediate}.wav`)) {
      const cached = JSON.parse(await readFile(`${intermediate}.render.json`, 'utf8'));
      assert.equal(cached.chunks.map(chunk => chunk.text).join('\n\n'), sample.text, 'Cached input must match');
      assert.deepEqual(cached.voiceConfig, config, 'Cached settings must match');
    } else {
      await renderNarration(sample.text, intermediate, sample.voice);
    }
    const render = JSON.parse(await readFile(`${intermediate}.render.json`, 'utf8'));
    assert.equal(render.chunks.map(chunk => chunk.text).join('\n\n'), sample.text, 'Every paragraph rendered');
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
    recordings.push({ file, title: sample.title, voice: sample.voice, words, durationSeconds,
      bytes: bytes.length, sha256: sha(bytes), textFile: `${sample.id}.txt`, textSha256: sha(sample.text),
      chunks: render.chunks, checks: { allParagraphsRendered: true, fullDecode: true, sampleRate: 24000, channels: 1 } });
    console.log(`${file}: ${durationSeconds.toFixed(3)} seconds; full decode passed`);
  }
  assert.equal(await readFile(resolve(root, source), 'utf8'), packet, 'Source stayed frozen during rendering');
  await writeFile(resolve(output, 'metadata.json'), JSON.stringify({ generatedAt: new Date().toISOString(),
    source, sourceSha256, sourceSnapshot: 'script-source.txt',
    synthesis: { ...voiceConfig, voice: 'Per recording below', encoding: 'MP3 mono 24 kHz 96 kb/s' },
    modelHashReference: 'docs/content/voice-samples/metadata.json',
    recordingScope: 'Desk listening only; candidate walking direction is not installed or physically verified.',
    audibleReview: 'Not performed by the renderer; owner listening is pending.', recordings }, null, 2) + '\n', { flag: 'wx' });
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await closeRenderer();
}
