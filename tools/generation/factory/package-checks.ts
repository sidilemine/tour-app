/** Package-specific, non-audible desk checks. No import, playback, provider or package mutation. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initialState, reduce } from '../../../src/domain/engine';
import { narrationAt } from '../../../src/domain/narration';
import { parseTourPackage } from '../../../src/tours/package';

const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
export function checkPackageValues(packageBytes: Uint8Array, inputBytes: Uint8Array) {
  const raw: unknown = JSON.parse(Buffer.from(packageBytes).toString('utf8'));
  const p = parseTourPackage(raw), fixture = p.fixture, narration = fixture.narration!;
  JSON.parse(Buffer.from(inputBytes).toString('utf8')); // Presence/identity only; builder checks its complete contract.
  const checks: { id: string; status: 'passed'; evidence: string }[] = [];
  const pass = (id: string, evidence: string) => checks.push({ id, status: 'passed', evidence });
  pass('actual-player-parser', 'Actual saved bytes accepted by parseTourPackage, including offline-map bounds, narration and asset metadata.');
  for (const kind of ['missing-asset', 'corrupt-base64', 'unsupported-transport-version'] as const) {
    const copy = structuredClone(p);
    if (kind === 'missing-asset') copy.assets.pop();
    else if (kind === 'corrupt-base64') copy.assets[0].base64 = '!!!!';
    else Object.assign(copy, { version: 999 });
    assert.throws(() => parseTourPackage(copy), `${kind} must be rejected`);
    pass(kind, 'In-memory clone rejected by actual player parser; saved package unchanged.');
  }
  let state = initialState(fixture), at = 0;
  state = reduce(state, { type: 'start', at: at++, diagnostics: false }, fixture).state;
  state = reduce(state, { type: 'automatic', enabled: false, at: at++ }, fixture).state;
  state = reduce(state, { type: 'unavailable', reason: 'Synthetic location unavailable', at: at++ }, fixture).state;
  const clips = [...narration.stories, ...narration.chapters];
  for (let index = 0; index < clips.length; index++) {
    assert.equal(narrationAt(fixture, index)?.audio.key, clips[index].audio.key);
    const manual = reduce(state, { type: 'manual', index, at: at++ }, fixture);
    assert.equal(manual.effects.filter(effect => effect.type === 'play' && effect.index === index).length, 1);
    const paused = reduce(manual.state, { type: 'pause', at: at++ }, fixture);
    assert.equal(paused.state.hold, 'manual'); assert.equal(paused.state.playback.status, 'paused'); assert.deepEqual(paused.effects, [{ type: 'pause' }]);
    const unavailable = reduce(paused.state, { type: 'unavailable', reason: 'Synthetic location still unavailable', at: at++ }, fixture);
    assert.equal(unavailable.state.hold, 'manual'); assert.ok(!unavailable.effects.some(effect => effect.type === 'play'));
    const resume = reduce(unavailable.state, { type: 'resume', at: at++ }, fixture);
    assert.ok(resume.effects.some(effect => effect.type === 'play' && effect.index === index));
    state = resume.state;
  }
  const ended = reduce(state, { type: 'end', at: at++ }, fixture); assert.equal(ended.state.active, false); assert.equal(ended.state.hold, 'ended'); assert.deepEqual(ended.effects, [{ type: 'pause' }]);
  pass('actual-fixture-manual-controls', `Deterministic reducer selected, paused and resumed each of ${clips.length} actual clip indices with automatic mode disabled and no location. End emitted pause. Effects were inspected, never played.`);
  assert.ok(narration.introduction.trim()); assert.ok(narration.finishInstructions.trim());
  assert.ok(narration.stories.every(story => story.directions.length > 0 && story.directions.every(direction => direction.trim())));
  pass('saved-navigation-fallback-data', 'Actual package has a bundled-map reference, parsed in-bounds route/standing points, introduction, return instructions and onward directions for every stop. This checks availability, not physical correctness or rendered UI.');
  return {
    schemaVersion: 1, checkedAt: new Date().toISOString(), packageSha256: sha256(packageBytes), inputSha256: sha256(inputBytes),
    packageIdentity: { id: fixture.id, version: fixture.version, transportVersion: p.version, mapId: p.mapId, stops: fixture.stops.length, chapters: narration.chapters.length, assets: p.assets.length },
    executedPackageSpecificChecks: checks,
    reusedCoreEvidence: [] as string[],
    limitations: ['No audio playback, phone UI, device import, physical walk or listening observation was performed.', 'Reducer play/pause effects are software assertions, not audible or native playback evidence.', 'Invalid base64 rejection is not a decoder or arbitrary content-corruption test. Actual full audio decode, hashes and durations are separate builder checks.', 'Input hash identifies supplied bytes; this helper does not establish input/package equivalence or immutable-version acceptance.', 'Saved navigation instructions and route presence do not prove safe access, current crossings or usable physical directions.'],
  };
}

export function checkPackageFile(packagePath: string, inputPath = join(dirname(packagePath), 'input.json')) {
  const packageBytes = readFileSync(packagePath), inputBytes = readFileSync(inputPath);
  const receipt = checkPackageValues(packageBytes, inputBytes);
  assert.equal(sha256(readFileSync(packagePath)), receipt.packageSha256, 'Saved package unchanged during checks');
  assert.equal(sha256(readFileSync(inputPath)), receipt.inputSha256, 'Saved input unchanged during checks');
  return receipt;
}
export const checkPackageForHandoff = (packagePath: string) => checkPackageFile(packagePath);
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [packagePath, inputPath] = process.argv.slice(2); if (!packagePath) throw Error('Usage: package-checks <package.json> [input.json]');
  process.stdout.write(JSON.stringify(checkPackageFile(packagePath, inputPath), null, 2) + '\n');
}
