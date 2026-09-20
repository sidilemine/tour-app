import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm, rename, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { validateStyleMin } from '@maplibre/maplibre-gl-style-spec';
import { prepareMapFiles, type MapFiles } from '../src/map/files';
import { bounds, covered, makeMapStyle, visibleFix } from '../src/map/style';
import { mapArea, mapCentre } from '../src/map/areas';
import clerkenwell from '../src/map/clerkenwell.json';

const data = Buffer.from('test tile bytes'), hash = createHash('md5').update(data).digest('hex');
const inventory = [{ path: 'basemap.pmtiles', bytes: data.length, md5: hash }, { path: 'fonts/regular/0.pbf', bytes: data.length, md5: hash }];
async function disk(run: (fs: MapFiles, root: string) => Promise<void>) {
  const path = await mkdtemp(`${tmpdir()}/map-files-`), root = `${pathToFileURL(path).href}/`;
  const local = (uri: string) => fileURLToPath(uri);
  const fs: MapFiles = {
    async info(uri) {
      try {
        const s = await stat(local(uri));
        return { exists: true, bytes: s.size, md5: s.isFile() ? createHash('md5').update(await readFile(local(uri))).digest('hex') : undefined };
      } catch (e) { if ((e as NodeJS.ErrnoException).code === 'ENOENT') return { exists: false }; throw e; }
    },
    async mkdir(uri) { await mkdir(local(uri), { recursive: true }); },
    remove: uri => rm(local(uri), { recursive: true, force: true }),
    copyAsset: (_, uri) => writeFile(local(uri), data),
    move: (from, to) => rename(local(from), local(to)),
  };
  try { await run(fs, root); } finally { await rm(path, { recursive: true, force: true }); }
}
test('map publication uses readback and cold reopen needs no bundled-asset access', () => disk(async (fs, root) => {
  const dir = await prepareMapFiles(fs, root, 'v1', inventory);
  await fs.mkdir(root + 'v1.staging/'); // An interrupted rebuild left a partial copy.
  fs.copyAsset = async () => { throw Error('No download allowed'); };
  assert.equal(await prepareMapFiles(fs, root, 'v1', inventory), dir);
  assert.equal((await fs.info(root + 'v1.staging/')).exists, false);
}));
test('missing file and same-size corruption fail visibly without deleting other data', () => disk(async (fs, root) => {
  await writeFile(new URL('progress', root), 'manual pause');
  const dir = await prepareMapFiles(fs, root, 'v1', inventory);
  await writeFile(new URL('basemap.pmtiles', dir), Buffer.alloc(data.length));
  await assert.rejects(prepareMapFiles(fs, root, 'v1', inventory), /damaged/);
  await fs.remove(dir + inventory[1].path);
  await assert.rejects(prepareMapFiles(fs, root, 'v1', inventory), /damaged/);
  assert.equal(await readFile(new URL('progress', root), 'utf8'), 'manual pause');
  await prepareMapFiles(fs, root, 'v1', inventory, true);
  assert.equal((await fs.info(dir + inventory[1].path)).md5, hash);
}));
test('failed copy and failed readback never publish an incomplete map', () => disk(async (fs, root) => {
  const copy = fs.copyAsset;
  fs.copyAsset = async (p, uri) => { if (p.startsWith('fonts')) throw Error('disk full'); await copy(p, uri); };
  await assert.rejects(prepareMapFiles(fs, root, 'v1', inventory), /disk full/);
  assert.equal((await fs.info(root + 'v1/')).exists, false);
  fs.copyAsset = (_, uri) => writeFile(new URL(uri), 'truncated');
  await assert.rejects(prepareMapFiles(fs, root, 'v1', inventory), /damaged/);
  assert.equal((await fs.info(root + 'v1/')).exists, false);
}));
test('failed replacement preserves old installation and interrupted staging is recovered', () => disk(async (fs, root) => {
  const dir = await prepareMapFiles(fs, root, 'v1', inventory);
  const copy = fs.copyAsset;
  fs.copyAsset = async () => { throw Error('interrupted'); };
  await assert.rejects(prepareMapFiles(fs, root, 'v1', inventory, true), /interrupted/);
  assert.equal((await fs.info(dir + inventory[0].path)).md5, hash);
  await fs.mkdir(root + 'v2.staging/');
  await writeFile(new URL('v2.staging/partial', root), 'abandoned');
  fs.copyAsset = copy;
  await prepareMapFiles(fs, root, 'v2', inventory);
  assert.equal((await fs.info(root + 'v2/partial')).exists, false);
  assert.equal((await fs.info(dir + inventory[0].path)).md5, hash);
}));
test('failed promotion can retry; asset paths cannot escape map storage', () => disk(async (fs, root) => {
  const move = fs.move;
  fs.move = async () => { throw Error('rename failed'); };
  await assert.rejects(prepareMapFiles(fs, root, 'v1', inventory), /rename/);
  fs.move = move;
  await prepareMapFiles(fs, root, 'v1', inventory);
  await assert.rejects(prepareMapFiles(fs, root, 'v2', [{ ...inventory[0], path: '../progress' }]), /path/);
}));
test('repair promotion failure retains the previous copy and interrupted promotion recovers', () => disk(async (fs, root) => {
  const dir = await prepareMapFiles(fs, root, 'v1', inventory), move = fs.move;
  fs.move = async (from, to) => { if (from.endsWith('.staging/')) throw Error('promotion failed'); await move(from, to); };
  await assert.rejects(prepareMapFiles(fs, root, 'v1', inventory, true), /promotion failed/);
  assert.equal((await fs.info(dir + inventory[0].path)).md5, hash);
  fs.move = move;
  await fs.move(dir, root + 'v1.previous/'); // Process died just before publication.
  fs.copyAsset = async () => { throw Error('source unavailable'); };
  assert.equal(await prepareMapFiles(fs, root, 'v1', inventory), dir);
  assert.equal((await fs.info(dir + inventory[1].path)).md5, hash);
}));
test('style validates and every resource URL is local; outside coverage is masked', () => {
  const style = makeMapStyle('file:///private/maps/v1/');
  assert.deepEqual(validateStyleMin(style), []);
  assert.ok(!JSON.stringify(style).match(/https?:/));
  assert.equal(style.sprite, undefined);
  assert.equal(style.glyphs, 'file:///private/maps/v1/fonts/{fontstack}/{range}.pbf');
  assert.equal(style.layers.at(-1)?.id, 'outside-coverage');
  assert.throws(() => makeMapStyle('https://map.example/'), /local/);
  assert.equal(covered(bounds[0], bounds[1]), true);
  assert.equal(covered(bounds[0] - 0.00001, bounds[1]), false);
});
test('second area selects its own camera, coverage mask and position without widening Finchley', () => {
  const area = mapArea(clerkenwell.id), center = mapCentre(area.catalog);
  assert.ok(Math.abs(center[0] + 0.1035) < 1e-10 && Math.abs(center[1] - 51.5255) < 1e-10);
  assert.throws(() => mapArea('not-installed'), /not bundled/);
  const fix = { longitude: center[0], latitude: center[1], timestamp: 1000, accuracy: 7, speed: 0 };
  assert.equal(visibleFix(fix, true, 1500), null);
  assert.equal(visibleFix(fix, true, 1500, area.catalog), fix);
  const style = makeMapStyle('file:///maps/clerkenwell/', area.catalog);
  assert.deepEqual(validateStyleMin(style), []);
  assert.ok(!/https?:/.test(JSON.stringify(style)));
  const source = style.sources.basemap;
  assert.equal(source.type, 'vector');
  if (source.type === 'vector') assert.deepEqual(source.bounds, clerkenwell.bounds);
  assert.ok(JSON.stringify(style.sources.outside).includes('51.536'));
});
test('repairing the second area leaves the first area and progress intact', () => disk(async (fs, root) => {
  const first = await prepareMapFiles(fs, root, 'finchley', inventory);
  const second = await prepareMapFiles(fs, root, 'clerkenwell', inventory);
  await writeFile(new URL('progress', root), 'saved Finchley offset');
  await writeFile(new URL('basemap.pmtiles', second), Buffer.alloc(data.length));
  await prepareMapFiles(fs, root, 'clerkenwell', inventory, true);
  assert.equal((await fs.info(first + inventory[0].path)).md5, hash);
  assert.equal(await readFile(new URL('progress', root), 'utf8'), 'saved Finchley offset');
}));
test('map position hides stale, stopped, inaccurate, future and outside-area fixes', () => {
  const fix = { longitude: -0.178, latitude: 51.613, timestamp: 1000, accuracy: 10 };
  assert.equal(visibleFix(fix, true, 16000), fix);
  for (const [value, active, at] of [[fix, true, 16001], [fix, false, 1000], [{ ...fix, accuracy: 36 }, true, 1000], [{ ...fix, timestamp: 4000 }, true, 1000], [{ ...fix, longitude: 0 }, true, 1000]] as const) assert.equal(visibleFix(value, active, at), null);
});
