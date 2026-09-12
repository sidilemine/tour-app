import test from 'node:test';
import assert from 'node:assert/strict';
import { nativeAudioGeneration } from '../src/session/nativeAudio';

test('rejects stock/precompiled and outdated audio binaries before issuing playback', () => {
  for (const status of [{ playing: false }, { tourGeneration: 1 }, { tourAdapterVersion: 2, tourGeneration: 1 }, { tourAdapterVersion: 1 }, null]) {
    assert.throws(() => nativeAudioGeneration(status), /APK is missing the required audio adapter/);
  }
});

test('accepts the patched binary and retains its media generation for stale callback rejection', () => {
  assert.equal(nativeAudioGeneration({ tourAdapterVersion: 1, tourGeneration: 2 }), 2);
});
