// Private local preparation only. Never invent or move a standing position.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { parseFixture } from '../../src/domain/fixture';
import { edgeFixture } from '../../src/testing/edgeFixture';

const [input, output] = process.argv.slice(2);
if (!input || !output) throw Error('Usage: node --import tsx tools/testing/prepare-field-fixtures.ts <original fixture JSON> <new private output directory>');
const original = parseFixture(readFileSync(input, 'utf8'));
const edge = edgeFixture(original);
mkdirSync(resolve(output), { recursive: true });
for (const [name, fixture] of [['01-standard-walk.json', original], ['02-edge-tests-long-A.json', edge]] as const) {
  // An existing export is never overwritten, even on a repeated invocation.
  writeFileSync(join(resolve(output), name), JSON.stringify(fixture, null, 2) + '\n', { flag: 'wx' });
}
console.log('Prepared two local fixtures. Geometry and verification are unchanged; only edge identity/title/audio profile differ.');
