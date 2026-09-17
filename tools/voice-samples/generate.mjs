// Local audition only. Never imports or changes a mobile tour package.
import { mkdir, readFile, writeFile, rename, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { KokoroTTS } from 'kokoro-js';
import { env } from '@huggingface/transformers';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const revision = '1939ad2a8e416c0acfeecc08a694d14ef25f2231';
const modelId = 'onnx-community/Kokoro-82M-v1.0-ONNX';
const modelDir = resolve(root, '.cache/kokoro', revision);
const output = resolve(root, 'docs/content/voice-samples');
const work = resolve(root, 'artifacts/voice-samples');
await mkdir(work, { recursive: true });
await mkdir(resolve(modelDir, 'onnx'), { recursive: true });
await mkdir(output, { recursive: true });
const sha = data => createHash('sha256').update(data).digest('hex');
const modelFiles = [];
for (const name of ['config.json', 'tokenizer.json', 'tokenizer_config.json', 'onnx/model.onnx']) {
  const path = resolve(modelDir, name);
  try { await access(path); } catch {
    console.log(`Downloading pinned public model file: ${name}`);
    const result = await fetch(`https://huggingface.co/${modelId}/resolve/${revision}/${name}`);
    if (!result.ok) throw Error(`Download failed: ${name}: ${result.status}`);
    const bytes = Buffer.from(await result.arrayBuffer());
    if (!bytes.length) throw Error(`Empty model file: ${name}`);
    await writeFile(`${path}.partial`, bytes);
    await rename(`${path}.partial`, path);
  }
  const bytes = await readFile(path);
  modelFiles.push({ name, bytes: bytes.length, sha256: sha(bytes) });
}
// Text and inference never leave the machine. Only the public files above download.
env.allowRemoteModels = false;
env.allowLocalModels = true;
const stories = JSON.parse(await readFile(resolve(root, 'content/north-finchley/stories.json'), 'utf8')).stories;
const text = stories.find(s => s.id === 'tally-ho').paragraphs[0].text;
await writeFile(resolve(output, 'sample-text.txt'), `${text}\n`);
console.log('Loading the local full-precision model on CPU…');
const tts = await KokoroTTS.from_pretrained(modelDir, { dtype: 'fp32', device: 'cpu' });
const samples = [];
for (const [voice, name] of [['bf_emma', 'emma'], ['bm_george', 'george']]) {
  const start = performance.now();
  const audio = await tts.generate(text, { voice, speed: 1 });
  const wav = resolve(work, `${name}.wav`), mp3 = resolve(output, `${name}.mp3`);
  await audio.save(wav);
  // A common loudness target makes the comparison less about output volume.
  const encoded = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', wav,
    '-af', 'loudnorm=I=-19:TP=-2:LRA=11', '-ar', '24000', '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '96k', mp3], { encoding: 'utf8' });
  if (encoded.status !== 0) throw Error(encoded.stderr || 'MP3 encoding failed');
  const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', mp3], { encoding: 'utf8' });
  const durationSeconds = Number(probe.stdout.trim());
  if (probe.status !== 0 || !Number.isFinite(durationSeconds) || durationSeconds < 10 || durationSeconds > 40) throw Error('Unexpected sample duration');
  const bytes = await readFile(mp3);
  samples.push({ voice, file: `${name}.mp3`, durationSeconds, bytes: bytes.length, sha256: sha(bytes), generationAndEncodeSeconds: +(performance.now() - start).toFixed(0) / 1000 });
  console.log(`${name}: ${durationSeconds.toFixed(1)} seconds; written without playback`);
}
const metadata = { modelId, revision, dtype: 'fp32', device: 'cpu', speed: 1, text,
  textSha256: sha(text), source: 'content/north-finchley/stories.json: tally-ho paragraph 1', modelFiles, samples };
await writeFile(resolve(output, 'metadata.json'), JSON.stringify(metadata, null, 2) + '\n');
console.log('Samples ready. No device installation or audio playback performed.');
await tts.model.dispose();
