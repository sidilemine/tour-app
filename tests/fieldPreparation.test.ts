import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from './helpers';
import { parseFixture } from '../src/domain/fixture';
import { edgeFixture } from '../src/testing/edgeFixture';
import { clipNames } from '../src/session/clipPlan';

test('edge fixture preserves geometry/verification and isolates identity and audio', () => {
  const before = JSON.stringify(fixture), edge = edgeFixture(fixture);
  assert.equal(JSON.stringify(fixture), before);
  assert.deepEqual(edge.route, fixture.route);
  assert.deepEqual(edge.stops, fixture.stops);
  assert.deepEqual(edge.verification, fixture.verification);
  assert.notEqual(edge.id, fixture.id);
  assert.deepEqual(clipNames(edge), ['edge-a-v1', '1', '2']);
  assert.deepEqual(clipNames(fixture), ['0', '1', '2']);
  assert.deepEqual(clipNames(edgeFixture(fixture)), clipNames(edge));
  assert.throws(() => edgeFixture(edge), /original/);
});
test('original fixture recovery identity stays unchanged and unsupported profiles fail', () => {
  const parsed = parseFixture(JSON.stringify(fixture));
  assert.equal(JSON.stringify(parseFixture(JSON.stringify(parsed))), JSON.stringify(parsed));
  assert.equal(Object.hasOwn(parsed, 'audioProfile'), false);
  assert.throws(() => parseFixture(JSON.stringify({ ...fixture, audioProfile: 'unknown' })));
});
