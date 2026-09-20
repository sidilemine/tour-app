import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { PMTiles, type Source } from 'pmtiles';
import { VectorTile } from '@mapbox/vector-tile';
import { PbfReader } from 'pbf';
import { validateStyleMin } from '@maplibre/maplibre-gl-style-spec';
import { mapAreas } from '../../src/map/areas';
import notices from '../../src/map/notices.json';
import { makeMapStyle } from '../../src/map/style';

async function main() {
  const sharedRoot = 'assets/maps/north-finchley/';
  const registry = readFileSync('src/map/bundledAssets.ts', 'utf8') + readFileSync('src/map/bundledAreas.ts', 'utf8');
  for (const { catalog } of mapAreas) {
  const root = catalog.id.startsWith('clerkenwell-') ? 'assets/maps/clerkenwell/' : sharedRoot;
  const glyphIds = new Set<number>();
  for (const file of catalog.files) {
    const assetPath = (file.path.startsWith('fonts/') ? sharedRoot : root) + file.path;
    const bytes = readFileSync(assetPath);
    assert.equal(bytes.length, file.bytes, `${file.path}: size`);
    for (const algorithm of ['md5', 'sha256'] as const) assert.equal(createHash(algorithm).update(bytes).digest('hex'), file[algorithm], `${file.path}: ${algorithm}`);
    assert.ok(registry.includes(`require(${JSON.stringify(`../../${assetPath}`)})`), `${file.path}: Metro registry`);
    if (file.path.endsWith('.pbf')) {
      new PbfReader(bytes).readFields((tag, ids, pbf) => {
        if (tag === 1) pbf.readMessage((field, result, stack) => {
          if (field === 3) stack.readMessage((key, out, glyph) => { if (key === 1) out.add(glyph.readVarint()); }, result);
        }, ids);
      }, glyphIds);
    }
  }
  assert.equal(catalog.files.length, 257);
  assert.equal(notices.fontLicense, readFileSync(sharedRoot + 'FONT-LICENSE.txt', 'utf8'));
  const bytes = readFileSync(root + 'basemap.pmtiles');
  const source: Source = { getKey: () => catalog.id, async getBytes(offset, length) {
    const slice = bytes.subarray(offset, offset + length);
    return { data: slice.buffer.slice(slice.byteOffset, slice.byteOffset + slice.byteLength) };
  } };
  const archive = new PMTiles(source);
  const header = await archive.getHeader();
  assert.equal(header.specVersion, 3);
  assert.equal(header.tileType, 1); // MVT
  assert.equal(header.minZoom, catalog.minTileZoom);
  assert.equal(header.maxZoom, catalog.maxTileZoom);
  const style = makeMapStyle('file:///checked-map/', catalog);
  assert.deepEqual(validateStyleMin(style), []);
  assert.ok(!/https?:/.test(JSON.stringify(style)), 'No online style dependency');
  const layers = new Set<string>(), roadKinds = new Set<string>(), missingGlyphs = new Set<string>();
  let tiles = 0, features = 0;
  const perZoom: Record<number, number> = {};
  function x(lng: number, z: number) { return Math.floor((lng + 180) / 360 * 2 ** z); }
  function y(lat: number, z: number) { return Math.floor((1 - Math.asinh(Math.tan(lat * Math.PI / 180)) / Math.PI) / 2 * 2 ** z); }
  const [w, s, e, n] = catalog.bounds;
  for (let z = 0; z <= catalog.maxTileZoom; z++) {
    perZoom[z] = 0;
    for (let tx = x(w, z); tx <= x(e, z); tx++) for (let ty = y(n, z); ty <= y(s, z); ty++) {
      const raw = await archive.getZxy(z, tx, ty);
      assert.ok(raw, `Missing coverage tile ${z}/${tx}/${ty}`);
      const tile = new VectorTile(new PbfReader(raw.data));
      tiles++; perZoom[z]++;
      for (const [name, layer] of Object.entries(tile.layers)) {
        layers.add(name);
        for (let i = 0; i < layer.length; i++) {
          const feature = layer.feature(i); feature.loadGeometry(); features++;
          if (z >= 14 && name === 'roads') roadKinds.add(String(feature.properties.kind));
          if (z >= 14 && (name === 'roads' || name === 'places')) {
            const label = feature.properties['name:en'] ?? feature.properties.name;
            if (typeof label === 'string') for (const char of label) if (!/\s/.test(char) && !glyphIds.has(char.codePointAt(0)!)) missingGlyphs.add(char);
          }
        }
      }
    }
  }
  assert.equal(tiles, header.numAddressedTiles, 'Every archived tile must be decoded');
  assert.equal(missingGlyphs.size, 0, `Missing glyphs for visible labels: ${[...missingGlyphs].join('')}`);
  for (const layer of style.layers) if ('source-layer' in layer) assert.ok(layers.has(layer['source-layer']!), `Missing vector layer ${layer.id}`);
  console.log(JSON.stringify({ map: catalog.id, files: catalog.files.length, bytes: catalog.files.reduce((n, f) => n + f.bytes, 0), tiles, features, glyphs: glyphIds.size, perZoom, roadKinds: [...roadKinds].sort(), result: 'All local resources verified and coverage tiles decoded; native rendering still needs the phone.' }, null, 2));
  }
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
