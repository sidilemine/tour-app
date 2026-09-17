import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SQL, Store } from '../src/storage/store';
import { exportReviews, ReviewStore } from '../src/feedback/model';
import { CapturePorts, FeedbackCapture } from '../src/feedback/capture';
function adapter(db: DatabaseSync): SQL {
  return { execSync: sql => db.exec(sql), runSync: (sql, ...p) => db.prepare(sql).run(...p),
    getFirstSync: <T>(sql: string, ...p: (string | number | null)[]) => db.prepare(sql).get(...p) as T || null,
    getAllSync: <T>(sql: string, ...p: (string | number | null)[]) => db.prepare(sql).all(...p) as T[] };
}
const context = { tourId: 'tour-b', tourVersion: 1, storyId: 'meeting-house', storyTitle: 'The Meeting House', storyIndex: 2 };
function setup(ports: Partial<CapturePorts> = {}) {
  const db = new DatabaseSync(':memory:'), store = new ReviewStore(new Store(adapter(db)));
  store.create(context, 1, 'attempt');
  let recorded = 0, stopped = 0;
  const capture = new FeedbackCapture(store, 'attempt', { permission: async () => true, mode: async () => {},
    prepare: async () => 'file:///private/documents/voice.m4a', record: () => { recorded++; }, stop: async () => { stopped++; },
    inspect: async () => ({ bytes: 1234 }), durationMs: () => 12000, foreground: () => true, changed: () => {}, ...ports });
  return { db, store, capture, recorded: () => recorded, stopped: () => stopped };
}
test('real SQLite retains separate attempts, skipped/zero scores, chapter identity and voice history after reopening', () => {
  const directory = mkdtempSync(join(tmpdir(), 'tour-feedback-')), path = join(directory, 'feedback.db');
  try {
    let db = new DatabaseSync(path), sql = new Store(adapter(db)), reviews = new ReviewStore(sql);
    sql.commit('progress', { hold: 'manual', offset: 17 });
    const one = reviews.create(context, 10, 'one');
    reviews.update(one.id, { interest: 0, storytelling: 10, text: 'Good detail', heardBefore: true });
    reviews.voice(one.id, { id: 'voice-1', uri: 'file:///documents/a.m4a', createdAt: 11, status: 'saved', durationMs: 2000, bytes: 1200, error: null });
    reviews.voice(one.id, { id: 'voice-2', uri: 'file:///documents/b.m4a', createdAt: 12, status: 'failed', durationMs: 0, bytes: 0, error: 'permission interrupted' });
    reviews.create({ ...context, storyId: 'walking-chapter', storyIndex: 6 }, 20, 'two');
    db.close(); db = new DatabaseSync(path); sql = new Store(adapter(db)); reviews = new ReviewStore(sql);
    assert.equal(reviews.all().length, 2); assert.equal(reviews.all()[0].interest, 0); assert.equal(reviews.all()[0].placeValue, null);
    assert.equal(reviews.all()[0].voices.length, 2); assert.equal(reviews.all()[1].storyIndex, 6);
    assert.deepEqual(reviews.all().map(r => r.presentationSequence), [1, 2]);
    assert.deepEqual(sql.read('progress'), { hold: 'manual', offset: 17 });
    assert.throws(() => reviews.update('one', { interest: 11 })); assert.throws(() => reviews.update('one', { storytelling: 2.5 }));
    assert.equal(reviews.all()[0].interest, 0); db.close();
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
test('failed atomic feedback update preserves all earlier attempts and voice URI', () => {
  const h = setup();
  h.store.update('attempt', { interest: 8 });
  h.db.exec("CREATE TRIGGER reject_feedback BEFORE UPDATE ON kv BEGIN SELECT RAISE(ABORT, 'disk failure'); END;");
  assert.throws(() => h.store.update('attempt', { interest: 2 }), /disk failure/);
  assert.equal(h.store.all()[0].interest, 8); h.db.close();
});
test('JSON feedback export contains neither audio nor private file paths', async () => {
  const h = setup(); await h.capture.start(); await h.capture.stop();
  const data = exportReviews(h.store.all()), text = JSON.stringify(data);
  assert.equal(data.reviews[0].voices[0].status, 'saved'); assert.equal(data.reviews[0].voices[0].bytes, 1234);
  assert.equal(text.includes('file:///'), false); assert.equal(text.includes('voice.m4a'), false); h.db.close();
});
test('permission denial preserves ratings without creating or starting an audio note', async () => {
  const h = setup({ permission: async () => false }); h.store.update('attempt', { placeValue: 7 });
  await h.capture.start(); assert.equal(h.recorded(), 0); assert.equal(h.store.all()[0].placeValue, 7);
  assert.equal(h.store.all()[0].voices.length, 0); assert.equal(h.capture.phase, 'idle'); h.db.close();
});
test('closing during permission request cancels a delayed grant before capture begins', async () => {
  let grant!: (value: boolean) => void;
  const h = setup({ permission: () => new Promise(resolve => { grant = resolve; }) });
  const start = h.capture.start(), close = h.capture.stop('close'); grant(true);
  await Promise.all([start, close]); assert.equal(h.recorded(), 0); assert.equal(h.store.all()[0].voices.length, 0); h.db.close();
});
test('background during preparation stops prepared native recorder and prevents capture', async () => {
  let prepared!: (value: string) => void, announce!: () => void;
  const entered = new Promise<void>(resolve => { announce = resolve; });
  const h = setup({ prepare: () => { announce(); return new Promise(resolve => { prepared = resolve; }); } });
  const start = h.capture.start(); await entered; const background = h.capture.stop('background'); prepared('file:///documents/voice.m4a');
  await Promise.all([start, background]); assert.equal(h.recorded(), 0); assert.ok(h.stopped() > 0); h.db.close();
});
test('background saves active voice once while metadata records URI before native record', async () => {
  let h: ReturnType<typeof setup>;
  h = setup({ record: () => { assert.equal(h.store.all()[0].voices[0].status, 'recording'); } });
  await h.capture.start(); await Promise.all([h.capture.stop('background'), h.capture.stop('close')]);
  assert.equal(h.store.all()[0].voices[0].status, 'saved'); assert.equal(h.store.all()[0].voices[0].durationMs, 12000);
  assert.equal(h.stopped(), 1); h.db.close();
});
test('file verification failure retains ratings and all prior voice attempts', async () => {
  let fail = false;
  const h = setup({ inspect: async () => { if (fail) throw Error('missing file'); return { bytes: 1234 }; } });
  h.store.update('attempt', { storytelling: 9 }); await h.capture.start(); await h.capture.stop();
  fail = true; await h.capture.start(); await h.capture.stop();
  assert.deepEqual(h.store.all()[0].voices.map(v => v.status), ['saved', 'failed']);
  assert.equal(h.store.all()[0].storytelling, 9); assert.match(h.store.all()[0].voices[1].uri, /^file:/); h.db.close();
});

test('saved voice playback is cancelled before native creation when close/background interrupts file inspection', async () => {
  const { VoicePlayback } = await import('../src/feedback/playback');
  let resolve!: () => void, created = 0;
  const preview = new VoicePlayback({ inspect: () => new Promise<void>(r => { resolve = r; }), foreground: () => true, changed: () => {},
    create: () => { created++; return { play() {}, pause() {}, release() {}, listen: () => () => {} }; } });
  const opening = preview.play('one', 'file:///documents/one.m4a'); preview.stop(); resolve(); await opening;
  assert.equal(created, 0);
});
test('switching or finishing a saved note pauses and releases its player without any tour commands', async () => {
  const { VoicePlayback } = await import('../src/feedback/playback');
  const events: string[] = [], finish: (() => void)[] = [];
  const preview = new VoicePlayback({ inspect: async () => {}, foreground: () => true, changed: () => {},
    create: uri => ({ play: () => events.push(`play:${uri}`), pause: () => events.push(`pause:${uri}`), release: () => events.push(`release:${uri}`),
      listen: done => { finish.push(done); return () => events.push(`unsubscribe:${uri}`); } }) });
  await preview.play('one', 'file:///one'); await preview.play('two', 'file:///two'); finish[1]();
  assert.deepEqual(events, ['play:file:///one', 'unsubscribe:file:///one', 'pause:file:///one', 'release:file:///one', 'play:file:///two', 'unsubscribe:file:///two', 'pause:file:///two', 'release:file:///two']);
});
test('voice playback inspection failure does not create audio and reports an error', async () => {
  const { VoicePlayback } = await import('../src/feedback/playback');
  let message = '';
  const preview = new VoicePlayback({ inspect: async () => { throw Error('missing'); }, foreground: () => true, changed: (_id, text) => { message = text; },
    create: () => { throw Error('unexpected player'); } });
  await preview.play('one', 'file:///documents/one.m4a'); assert.match(message, /original file is retained/);
});
test('a native record-start failure still stops the prepared microphone and retains draft ratings', async () => {
  const h = setup({ record: () => { throw Error('native start failed'); } });
  h.store.update('attempt', { interest: 6 }); await h.capture.start();
  assert.equal(h.stopped(), 1); assert.equal(h.capture.phase, 'idle');
  assert.equal(h.store.all()[0].interest, 6); assert.equal(h.store.all()[0].voices[0].status, 'failed'); h.db.close();
});

test('closing during microphone-route verification saves capture without entering recording UI', async () => {
  let finishStart!: () => void, entered!: () => void;
  const waiting = new Promise<void>(resolve => { entered = resolve; });
  const phases: string[] = [];
  const h = setup({ record: () => { entered(); return new Promise<void>(resolve => { finishStart = resolve; }); },
    changed: phase => phases.push(phase) });
  const start = h.capture.start(); await waiting;
  const close = h.capture.stop('close'); finishStart(); await Promise.all([start, close]);
  assert.equal(phases.includes('recording'), false);
  assert.equal(h.store.all()[0].voices[0].status, 'saved'); assert.equal(h.stopped(), 1); h.db.close();
});

test('audio/input interruption finalises the existing note once and leaves earlier ratings intact', async () => {
  let message = '';
  const h = setup({ changed: (_phase, value) => { message = value; } });
  h.store.update('attempt', { interest: 9 }); await h.capture.start();
  await Promise.all([h.capture.stop('interruption'), h.capture.stop('background')]);
  assert.equal(h.stopped(), 1); assert.equal(h.store.all()[0].voices[0].status, 'saved');
  assert.equal(h.store.all()[0].interest, 9); assert.match(message, /interrupted.*saved/); h.db.close();
});
