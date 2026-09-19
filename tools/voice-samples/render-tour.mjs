// Authoring only: George was selected from the saved local audition.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { KokoroTTS } from 'kokoro-js';
import { env, RawAudio } from '@huggingface/transformers';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const voiceConfig = Object.freeze({ provider: 'Kokoro', voice: 'bm_george', model: 'onnx-community/Kokoro-82M-v1.0-ONNX',
  revision: '1939ad2a8e416c0acfeecc08a694d14ef25f2231', dtype: 'fp32', device: 'cpu', speed: 1,
  kokoroJs: '1.2.1', paragraphGapSeconds: 0.25, loudnessLufs: -19, encoding: 'AAC mono 24 kHz 64 kb/s', rendererRevision: 2 });
let instance;
async function model() {
  if (instance) return instance;
  const manifest = JSON.parse(await readFile(resolve(root, 'docs/content/voice-samples/metadata.json'), 'utf8'));
  const directory = resolve(root, '.cache/kokoro', voiceConfig.revision);
  for (const entry of manifest.modelFiles) {
    const bytes = await readFile(resolve(directory, entry.name));
    if (bytes.length !== entry.bytes || createHash('sha256').update(bytes).digest('hex') !== entry.sha256) throw Error(`Kokoro model mismatch: ${entry.name}`);
  }
  env.allowRemoteModels = false;
  env.allowLocalModels = true;
  instance = await KokoroTTS.from_pretrained(directory, { dtype: 'fp32', device: 'cpu' });
  const tokenizer = instance.tokenizer;
  // Guard the actual phonemes produced by Kokoro, before inference can truncate.
  instance.tokenizer = (text, options) => {
    const result = tokenizer(text, { ...options, truncation: false });
    if (result.input_ids.dims.at(-1) > 512) throw Error('Narration paragraph exceeds 512 model tokens; split at a sentence boundary.');
    return result;
  };
  return instance;
}
export async function renderGeorge(text, destination) {
  return renderNarration(text, destination, 'bm_george');
}
export async function renderNarration(text, destination, voice) {
  if (!['bm_george', 'bf_emma'].includes(voice)) throw Error('Unsupported audition voice');
  const config = { ...voiceConfig, voice };
  const tts = await model(), parts = [], chunks = [];
  // Paragraphs retain the audition's multi-sentence intonation; the tokenizer
  // guard rejects oversized passages before any incomplete audio is published.
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean);
  for (let p = 0; p < paragraphs.length; p++) {
    const audio = await tts.generate(paragraphs[p], { voice, speed: config.speed });
    if (audio.sampling_rate !== 24000 || !audio.audio.length || audio.audio.some(n => !Number.isFinite(n))) throw Error('Invalid generated audio');
    parts.push(audio.audio);
    chunks.push({ paragraph: p, text: paragraphs[p], durationSeconds: audio.audio.length / 24000 });
    if (p < paragraphs.length - 1) parts.push(new Float32Array(voiceConfig.paragraphGapSeconds * 24000));
  }
  const pcm = new Float32Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) { pcm.set(part, offset); offset += part.length; }
  await new RawAudio(pcm, 24000).save(`${destination}.wav`);
  const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', `${destination}.wav`,
    '-af', 'loudnorm=I=-19:TP=-2:LRA=11', '-ar', '24000', '-ac', '1', '-c:a', 'aac', '-b:a', '64k', destination], { encoding: 'utf8' });
  if (result.status !== 0) throw Error(result.stderr || 'Narration encode failed');
  await writeFile(`${destination}.render.json`, JSON.stringify({ voiceConfig: config, chunks }, null, 2) + '\n');
}
export async function closeRenderer() { if (instance) { await instance.model.dispose(); instance = undefined; } }
