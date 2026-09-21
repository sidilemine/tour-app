# Highgate / Hampstead offline map

Third bounded map area, prepared 21 September 2026 for the authorised Highgate Underground→Heath→Hampstead walk. Coverage longitude −0.191…−0.136, latitude 51.548…51.585 includes both gateway choices, the village and crossing candidates; it does not certify a pedestrian route.

Same pinned Protomaps 4.15.2 snapshot (15 September 2026) and go-pmtiles 1.31.2 as the existing maps. Official [downloads](https://docs.protomaps.com/basemaps/downloads) and [extract instructions](https://docs.protomaps.com/pmtiles/cli#extract) checked 21 September. No key, account, paid service or runtime network dependency. This is a regional extraction, not a hash verification of the whole planet archive.

Extracted map: 4,017,382 bytes. Map identity `hampstead-0abcc26a600e0718`. Existing Noto Sans glyph files and attribution/licences are shared unchanged; each area is copied into its own complete durable local directory. Existing Finchley/Clerkenwell assets remain unchanged.

```sh
.toolchain/pmtiles/pmtiles extract https://build.protomaps.com/20260915.pmtiles assets/maps/hampstead/basemap.pmtiles --bbox=-0.191,51.548,-0.136,51.585 --maxzoom=15
.toolchain/pmtiles/pmtiles verify assets/maps/hampstead/basemap.pmtiles
node tools/maps/catalog-hampstead.cjs
npm run check:map
```

Structural verification passes; all 75 tiles and coverage, local style dependencies and label glyphs are checked by the map preflight. Native drawing remains for the single prepared phone handoff. The earlier narrower village-only candidate extract is retained privately and is not bundled.
