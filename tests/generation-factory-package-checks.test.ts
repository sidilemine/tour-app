import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { checkPackageFile, checkPackageValues } from '../tools/generation/factory/package-checks';
import catalog from '../src/map/catalog.json';

function fixture() {
  // A container header only: deliberately no decodable audio and no real narration.
  const audio = Buffer.from([0, 0, 0, 16, ...Buffer.from('ftypM4A '), 0, 0, 0, 0]);
  const route = Array.from({ length: 21 }, (_, i) => ({ latitude: 51.610 + i * 0.0001, longitude: -0.18 }));
  const stories = [0, 1, 2].map(i => ({ id: `story-${i}`, title: `Story ${i}`, transcript: 'Synthetic fixture statement.', audio: { key: `audio-${i}`, bytes: audio.length, md5: createHash('md5').update(audio).digest('hex'), durationSeconds: 12 }, sources: [{ title: 'Synthetic source', url: 'https://example.org/source' }], evidence: [{ paragraph: 'Synthetic fixture statement.', kind: 'source_checked', basis: 'Synthetic fixture only', sourceUrls: ['https://example.org/source'] }], directions: ['Synthetic onward direction.'] }));
  return { format: 'walking-tour-package', version: 1, mapId: catalog.id, fixture: { schemaVersion: 1, id: 'package-check-fixture', version: 1, title: 'Synthetic checks', verification: { status: 'unverified', note: 'Synthetic only' }, route, stops: [0, 10, 20].map((routeIndex, i) => ({ id: `stop-${i}`, title: `Stop ${i}`, routeIndex, standing: route[routeIndex], approach: 'Synthetic', viewpoint: 'Synthetic', access: 'Synthetic' })), narration: { description: 'Synthetic', introduction: 'Synthetic start', finishInstructions: 'Synthetic return', reviewNote: 'Synthetic', rightsNote: 'Synthetic', stories, chapters: [] } }, assets: stories.map(story => ({ key: story.audio.key, base64: audio.toString('base64') })) };
}
const bytes = (value: unknown) => Buffer.from(JSON.stringify(value));

test('package receipt binds exact bytes and executes parser rejection/manual checks without changing files', () => {
  const directory = mkdtempSync(join(tmpdir(), 'tour-package-checks-')); try {
    const packagePath = join(directory, 'package.json'), inputPath = join(directory, 'input.json'), packageBytes = bytes(fixture()), inputBytes = bytes({ synthetic: true });
    writeFileSync(packagePath, packageBytes); writeFileSync(inputPath, inputBytes);
    const receipt = checkPackageFile(packagePath);
    assert.equal(receipt.packageSha256, createHash('sha256').update(packageBytes).digest('hex')); assert.equal(receipt.inputSha256, createHash('sha256').update(inputBytes).digest('hex'));
    assert.equal(receipt.executedPackageSpecificChecks.length, 6); assert.ok(receipt.executedPackageSpecificChecks.every(check => check.status === 'passed')); assert.deepEqual(receipt.reusedCoreEvidence, []);
    assert.deepEqual(readFileSync(packagePath), packageBytes); assert.deepEqual(readFileSync(inputPath), inputBytes); assert.match(receipt.limitations.join(' '), /not a decoder/);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
test('invalid real input and absent stop fallback are rejected, not reported as passes', () => {
  const invalid = fixture(); invalid.version = 999; assert.throws(() => checkPackageValues(bytes(invalid), bytes({})));
  const missing = fixture(); missing.fixture.narration.stories[1].directions = []; assert.throws(() => checkPackageValues(bytes(missing), bytes({})));
  assert.throws(() => checkPackageValues(bytes(fixture()), Buffer.from('not json')));
});
