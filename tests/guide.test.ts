import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Store, SQL } from '../src/storage/store';
import { Journal, guide, AttemptContext, availability } from '../src/testing/journal';
const context: AttemptContext = { sourceId: 'test-source', variant: 'offline-release', model: 'Synthetic', os: 'Test', fixtureKey: 'synthetic@1', walkStartedAt: null };
function adapter(db: DatabaseSync): SQL { return { execSync: s => db.exec(s), runSync: (s, ...p) => db.prepare(s).run(...p), getFirstSync: <T>(s: string, ...p: (string|number|null)[]) => db.prepare(s).get(...p) as T ?? null, getAllSync: <T>(s: string, ...p: (string|number|null)[]) => db.prepare(s).all(...p) as T[] }; }
function memory(fn: (j: Journal, db: DatabaseSync, store: Store) => void) { const db = new DatabaseSync(':memory:'), store = new Store(adapter(db)); try { fn(new Journal(store), db, store); } finally { db.close(); } }
test('guide covers full field matrix with explicit preparation and build distinctions', () => {
  assert.equal(new Set(guide.cases.map(c => c.id)).size, 20);
  for (const id of ['pause-silence','pause-narration','remote-pause','development-1','development-2','development-3','offline-baseline','interruption','output-disconnect','location-permission','off-route','early-arrival','pass-pending','offline-recovery','swipe-away','development-recovery','process-kill','battery-saver','offline-map','curated-tour-feedback']) {
    const item = guide.cases.find(c => c.id === id)!; assert.ok(item); assert.ok(item.steps.length >= 3 && item.expected.length > 20 && item.needs.length > 10);
  }
  assert.equal(guide.cases.find(c => c.id === 'early-arrival')!.preparation, 'engineer');
  assert.ok(availability(guide.cases.find(c => c.id === 'development-1')!, 'offline-release'));
});
test('actual SQLite reopen retains selected case, active notes and original context', () => {
  const dir = mkdtempSync(join(tmpdir(), 'guide-sqlite-')), file = join(dir, 'guide.db');
  try {
    let db = new DatabaseSync(file), j = new Journal(new Store(adapter(db)));
    j.begin('pause-silence', 100, context); j.edit({ notes: 'Paused at B; waiting', conditions: 'Data off; speaker' }); db.close();
    db = new DatabaseSync(file); j = new Journal(new Store(adapter(db)));
    assert.equal(j.read().selectedCase, 'pause-silence'); assert.equal(j.read().active!.notes, 'Paused at B; waiting'); assert.deepEqual(j.read().active!.start, context);
    j.finish('inconclusive', 200, { ...context, walkStartedAt: 120 }); db.close();
    db = new DatabaseSync(file); j = new Journal(new Store(adapter(db))); assert.equal(j.read().active, null); assert.equal(j.read().attempts[0].finish!.walkStartedAt, 120); db.close();
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
test('attempts append without overwriting earlier failures and do not touch tour progress/logs', () => memory((j, db, store) => {
  store.commit('progress', { hold: 'manual', stops: ['completed'] }, { reason: 'retained diagnostic' });
  j.begin('pause-silence', 100, context); j.edit({ notes: 'Unexpected speech' }); j.finish('observed-fail', 200, context);
  j.begin('pause-silence', 300, context); j.edit({ notes: 'No speech until Resume' }); j.finish('observed-pass', 400, context);
  assert.deepEqual(j.read().attempts.map(a => a.outcome), ['observed-fail','observed-pass']);
  assert.deepEqual(store.read('progress'), { hold: 'manual', stops: ['completed'] }); assert.equal(store.events().length, 1);
}));
test('wrong build, unknown cases, overlapping attempts and empty observations are rejected', () => memory(j => {
  assert.throws(() => j.begin('development-1', 100, context), /development/); assert.throws(() => j.select('invented'), /Unknown/);
  j.begin('offline-recovery', 100, context); assert.throws(() => j.begin('pause-silence', 200, context), /current attempt/);
  assert.throws(() => j.finish('observed-pass', 200, context), /observation/); assert.equal(j.read().attempts.length, 0);
}));
test('build or route changes cannot be recorded as an observed pass for the same attempt', () => memory(j => {
  j.begin('offline-recovery', 100, context); j.edit({ notes: 'New APK installed mid-check' });
  assert.throws(() => j.finish('observed-pass', 200, { ...context, sourceId: 'different' }), /changed/);
  assert.throws(() => j.finish('observed-pass', 200, { ...context, fixtureKey: 'different@1' }), /changed/);
  j.finish('inconclusive', 200, { ...context, sourceId: 'different' }); assert.equal(j.read().attempts.length, 1);
}));
test('failed note save keeps the durable record; corrupt data is never silently reset', () => memory((j, db, store) => {
  j.begin('pause-silence', 100, context); j.edit({ notes: 'Saved before failure' });
  db.exec("CREATE TRIGGER fail_guide BEFORE UPDATE ON kv BEGIN SELECT RAISE(ABORT, 'injected failure'); END;");
  assert.throws(() => j.edit({ notes: 'Unsaved' }), /injected/); assert.equal(j.read().active!.notes, 'Saved before failure');
  db.exec('DROP TRIGGER fail_guide'); store.commit('test-guide', { version: 99 }); assert.throws(() => j.read()); assert.deepEqual(store.read('test-guide'), { version: 99 });
}));
