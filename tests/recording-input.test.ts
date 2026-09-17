import test from 'node:test';
import assert from 'node:assert/strict';
import { recordingAdapter, RecordingInputStatus, startVerifiedRecording } from '../src/feedback/recordingInput';
const pending: RecordingInputStatus = { revision: 1, verified: false, kind: 'phone', name: 'Phone', interruption: null };
const headset: RecordingInputStatus = { ...pending, verified: true, kind: 'headset', name: 'Test headset' };
test('waits for actual route confirmation instead of labelling a preferred input as active', async () => {
  let checks = 0, waits = 0, selected: boolean | undefined, ready: RecordingInputStatus | null = null;
  await startVerifiedRecording({ startTourRecording: value => { selected = value; },
    getTourRecordingStatus: () => ++checks < 3 ? pending : headset }, true, () => true,
    value => { ready = value; }, async () => { waits++; });
  assert.equal(selected, true); assert.equal(waits, 2); assert.deepEqual(ready, headset);
});
test('route timeout fails visibly without declaring the phone to be the headset', async () => {
  let ready = false;
  await assert.rejects(startVerifiedRecording({ startTourRecording() {}, getTourRecordingStatus: () => pending }, true,
    () => true, () => { ready = true; }, async () => {}), /could not confirm/);
  assert.equal(ready, false);
});
test('focus denial and interruption never signal recording readiness', async () => {
  const ready = () => { assert.fail('No input is ready'); };
  await assert.rejects(startVerifiedRecording({ startTourRecording() { throw Error('focus denied'); },
    getTourRecordingStatus: () => headset }, true, () => true, ready), /focus denied/);
  await assert.rejects(startVerifiedRecording({ startTourRecording() {},
    getTourRecordingStatus: () => ({ ...headset, interruption: 'headset disconnected' }) }, true, () => true, ready), /disconnected/);
});
test('background during route acquisition returns to capture coordinator for finalisation', async () => {
  let foreground = true;
  await startVerifiedRecording({ startTourRecording() {}, getTourRecordingStatus: () => pending }, true,
    () => foreground, () => assert.fail('Must not enter recording UI'), async () => { foreground = false; });
});
test('an old APK is rejected before starting any microphone', () => {
  assert.throws(() => recordingAdapter({ record() {} }), /needs the microphone update/);
});
