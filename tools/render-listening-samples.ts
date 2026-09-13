// Local E1 desk listening only. No app import, paid service or walk-readiness claim.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { z } from 'zod';
import { packageSchema } from './content/package';
const manifest = packageSchema.parse(JSON.parse(readFileSync('content/finchley/manifest.json', 'utf8')));
const source = z.object({ stage: z.literal('desk-listening-draft'), variants: z.array(z.object({
  id: z.enum(['design', 'people']), samples: z.array(z.object({
    id: z.string().regex(/^[a-z][a-z0-9-]*$/), paragraphs: packageSchema.shape.clips.element.shape.paragraphs,
  }).strict()).length(3),
}).strict()).length(2) }).strict().parse(JSON.parse(readFileSync('content/finchley/listening-samples.json', 'utf8')));
const names = new Set<string>();
const prepared = source.variants.flatMap(variant => variant.samples.map(sample => {
  const name = `${variant.id}-${sample.id}`;
  if (names.has(name)) throw Error(`Duplicate sample: ${name}`);
  names.add(name);
  for (const p of sample.paragraphs) for (const id of p.claimIds) {
    if (!manifest.claims.some(c => c.id === id && c.status === 'source_checked')) throw Error(`Unreviewed/missing claim: ${id}`);
  }
  return { name, text: sample.paragraphs.map(p => p.text).join('\n\n') };
}));
if (new Set(source.variants.map(v => v.id)).size !== 2) throw Error('Need both contrasting variants');
const output = resolve('artifacts/listening-drafts');
mkdirSync(output, { recursive: true });
for (const sample of prepared) {
  const transcript = resolve(output, `${sample.name}.txt`), audio = resolve(output, `${sample.name}.aiff`);
  writeFileSync(transcript, sample.text + '\n');
  const result = spawnSync('/usr/bin/say', ['-v', 'Daniel', '-r', '145', '-f', transcript, '-o', audio], { encoding: 'utf8' });
  if (result.error || result.status !== 0) throw Error(`Local voice failed: ${result.error ?? result.stderr}`);
  console.log(audio);
}
