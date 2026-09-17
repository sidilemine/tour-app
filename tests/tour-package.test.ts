import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LibraryEntry, parseTourPackage, publishTour, stageTour, TourFiles } from '../src/tours/package';
import { Store, SQL } from '../src/storage/store';
import { initialState, recovered } from '../src/domain/engine';
import catalog from '../src/map/catalog.json';

const audio = readFileSync('assets/audio/a.m4a');
const md5 = (bytes: Uint8Array) => createHash('md5').update(bytes).digest('hex');
function payload() {
  const route = Array.from({ length: 21 }, (_, i) => ({ latitude: 51.610 + i * 0.0001, longitude: -0.18 }));
  const source = { title: 'Synthetic source', url: 'https://example.com/source' };
  return { format: 'walking-tour-package', version: 1, mapId: catalog.id,
    fixture: { schemaVersion: 1, id: 'synthetic-import', version: 1, title: 'Synthetic import',
      verification: { status: 'unverified', note: 'Not a physical route.' }, route,
      stops: [0, 10, 20].map((routeIndex, i) => ({ id: `stop-${i}`, title: `Stop ${i}`, routeIndex, standing: route[routeIndex], approach: 'Synthetic', viewpoint: 'Synthetic', access: 'Synthetic' })),
      narration: { description: 'Synthetic', introduction: 'Synthetic', finishInstructions: 'Synthetic', reviewNote: 'Synthetic', rightsNote: 'Owned lab audio, synthetic prose.', chapters: [],
        stories: [0, 1, 2].map(i => ({ id: `story-${i}`, title: `Story ${i}`, transcript: 'Synthetic fact.\n\nSynthetic direction.',
          audio: { key: `audio-${i}`, bytes: audio.length, md5: md5(audio), durationSeconds: 12 }, sources: [source],
          evidence: [{ paragraph: 'Synthetic fact.', kind: 'source_checked', basis: 'Synthetic evidence.', sourceUrls: [source.url] },
            { paragraph: 'Synthetic direction.', kind: 'editorial', basis: 'Synthetic direction.', sourceUrls: [] }], directions: ['Synthetic direction.'] })) } },
    assets: [0, 1, 2].map(i => ({ key: `audio-${i}`, base64: audio.toString('base64') })) };
}
function adapter(db: DatabaseSync): SQL {
  return { execSync: sql => db.exec(sql), runSync: (sql, ...p) => db.prepare(sql).run(...p),
    getFirstSync: <T>(sql: string, ...p: (string | number | null)[]) => db.prepare(sql).get(...p) as T || null,
    getAllSync: <T>(sql: string, ...p: (string | number | null)[]) => db.prepare(sql).all(...p) as T[] };
}
function files(): TourFiles {
  return { write: async (path, base64) => { writeFileSync(path, Buffer.from(base64, 'base64')); },
    inspect: async path => { const bytes = readFileSync(path); return { bytes: bytes.length, md5: md5(bytes) }; } };
}

test('tour stages real owned M4A files by key, checks all readbacks and publishes only after success', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'tour-package-')), db = new DatabaseSync(':memory:');
  try {
    const store = new Store(adapter(db)), input = payload(); input.assets.reverse();
    const p = parseTourPackage(input), directory = `${dir}/`;
    await stageTour(p, directory, files()); assert.equal(store.read('catalogue'), null);
    publishTour(store, { fixture: p.fixture, directory, importedAt: 'synthetic' });
    assert.equal(store.read<LibraryEntry[]>('catalogue')?.length, 1);
    for (const asset of p.assets) assert.equal(md5(readFileSync(`${directory}${asset.key}.m4a`)), md5(audio));
  } finally { db.close(); rmSync(dir, { recursive: true, force: true }); }
});

test('checksum failure and mid-stage disk failure leave installed version, progress and files intact', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'tour-failed-stage-')), db = new DatabaseSync(':memory:');
  try {
    const store = new Store(adapter(db)), p = parseTourPackage(payload()), directory = `${dir}/old-`;
    await stageTour(p, directory, files()); publishTour(store, { fixture: p.fixture, directory, importedAt: 'before' });
    store.commit('progress', { version: 1, offset: 7, hold: 'manual' }); const before = store.read('catalogue');
    for (const failure of ['checksum', 'write']) {
      let writes = 0; const real = files();
      const failing: TourFiles = { write: async (path, base64) => {
        if (failure === 'write' && ++writes === 2) throw Error('disk full');
        await real.write(path, base64);
      }, inspect: async path => {
        const result = await real.inspect(path); return failure === 'checksum' ? { ...result, md5: '0'.repeat(32) } : result;
      } };
      await assert.rejects(stageTour(p, `${dir}/${failure}-`, failing).then(() => publishTour(store, { fixture: p.fixture, directory: 'bad', importedAt: 'after' })), /Corrupt audio|disk full/);
      assert.deepEqual(store.read('catalogue'), before); assert.deepEqual(store.read('progress'), { version: 1, offset: 7, hold: 'manual' });
      assert.equal(md5(readFileSync(`${directory}audio-0.m4a`)), md5(audio));
    }
  } finally { db.close(); rmSync(dir, { recursive: true, force: true }); }
});

test('publication retains concurrently imported tours and pins each ID/version during repair', () => {
  const db = new DatabaseSync(':memory:');
  try {
    const store = new Store(adapter(db)), a = parseTourPackage(payload()).fixture, b = { ...a, id: 'other-tour' };
    publishTour(store, { fixture: a, directory: 'a-old/', importedAt: 'first' });
    // B completes while an A repair is still staging. A must reread B at publish.
    publishTour(store, { fixture: b, directory: 'b/', importedAt: 'second' });
    publishTour(store, { fixture: a, directory: 'a-repaired/', importedAt: 'third' });
    assert.deepEqual(store.read<LibraryEntry[]>('catalogue')?.map(e => e.directory), ['b/', 'a-repaired/']);
    const before = store.read('catalogue');
    assert.throws(() => publishTour(store, { fixture: { ...a, title: 'Different same-version content' }, directory: 'bad/', importedAt: 'fourth' }), /different content/);
    assert.deepEqual(store.read('catalogue'), before);
    publishTour(store, { fixture: { ...a, version: 2 }, directory: 'a-v2/', importedAt: 'fifth' });
    assert.equal(store.read<LibraryEntry[]>('catalogue')?.length, 3);
  } finally { db.close(); }
});

test('package map identity and both route and standing positions must fit actual bundled coverage', () => {
  const wrongMap = payload(); wrongMap.mapId = 'north-finchley-v1'; assert.throws(() => parseTourPackage(wrongMap));
  const outside = payload(); outside.fixture.route.forEach(p => { p.longitude = -0.2; }); outside.fixture.stops.forEach(s => { s.standing.longitude = -0.2; });
  assert.throws(() => parseTourPackage(outside), /offline map/);
  assert.equal(parseTourPackage(payload()).mapId, catalog.id);
});

test('malformed package assets reject before writes: wrong container, count, key, length and duplicate', () => {
  for (const mutate of [
    (p: ReturnType<typeof payload>) => { p.assets[0].base64 = Buffer.alloc(audio.length).toString('base64'); },
    (p: ReturnType<typeof payload>) => { p.assets.pop(); },
    (p: ReturnType<typeof payload>) => { p.assets[0].key = '../escape'; },
    (p: ReturnType<typeof payload>) => { p.assets[0].base64 = p.assets[0].base64.slice(4); },
    (p: ReturnType<typeof payload>) => { p.assets[1].key = p.assets[0].key; },
  ]) { const p = payload(); mutate(p); assert.throws(() => parseTourPackage(p)); }
});

test('evidence rejects dangling/nonweb sources, absent paragraphs and unsourced factual claims', () => {
  for (const mutate of [
    (p: ReturnType<typeof payload>) => { p.fixture.narration.stories[0].evidence[0].sourceUrls = ['https://example.com/unknown']; },
    (p: ReturnType<typeof payload>) => { p.fixture.narration.stories[0].sources[0].url = 'file:///private/file'; },
    (p: ReturnType<typeof payload>) => { p.fixture.narration.stories[0].evidence[0].paragraph = 'Not in transcript'; },
    (p: ReturnType<typeof payload>) => { p.fixture.narration.stories[0].evidence[0].sourceUrls = []; },
  ]) { const p = payload(); mutate(p); assert.throws(() => parseTourPackage(p)); }
  assert.equal(parseTourPackage(payload()).fixture.narration?.stories[0].evidence[1].sourceUrls.length, 0);
});

test('real SQLite atomic tour switch rolls fixture, matching progress and outgoing archive back together', () => {
  const db = new DatabaseSync(':memory:');
  try {
    const store = new Store(adapter(db)), first = parseTourPackage(payload()).fixture, second = { ...first, id: 'second-tour' };
    const state = { ...initialState(first), hold: 'manual', playback: { ...initialState(first).playback, index: 1, offset: 21, status: 'paused' as const } };
    const progress = { fixture: JSON.stringify(first), state };
    store.commitMany([['fixture', first], ['progress', progress]]);
    db.exec("CREATE TRIGGER reject_archive BEFORE INSERT ON kv WHEN NEW.key LIKE 'archive:%' BEGIN SELECT RAISE(ABORT, 'archive write failed'); END;");
    const next = { fixture: JSON.stringify(second), state: initialState(second) };
    assert.throws(() => store.commitMany([['fixture', second], ['progress', next], ['archive:first@1', progress]]), /archive write failed/);
    assert.deepEqual(store.read('fixture'), first); assert.deepEqual(store.read('progress'), progress); assert.equal(store.read('archive:first@1'), null);
    db.exec('DROP TRIGGER reject_archive');
    store.commitMany([['fixture', second], ['progress', next], ['archive:first@1', progress]]);
    assert.deepEqual(store.read('fixture'), second); assert.deepEqual(store.read('progress'), next);
    const archive = store.read<typeof progress>('archive:first@1')!;
    assert.equal(recovered(archive.state).playback.offset, 21); assert.equal(archive.fixture, JSON.stringify(first));
  } finally { db.close(); }
});
