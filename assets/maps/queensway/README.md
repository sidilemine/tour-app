# Queensway / Bayswater offline map

Fourth bounded map area, prepared 21 September 2026 for the owner's short evening demo near Queensway station and Queensborough Terrace. Coverage longitude −0.195…−0.178, latitude 51.507…51.519 includes the selected candidates and public-street alternatives. Map coverage does not certify pedestrian access.

Uses the existing Protomaps 4.15.2 snapshot of 15 September 2026 and go-pmtiles 1.31.2. Official [extract instructions](https://docs.protomaps.com/pmtiles/cli#extract) checked for this preparation. No key, paid service or runtime network dependency. This verifies the regional extract, not the complete remote planet archive.

The extract is 2,171,984 bytes, map identity **queensway-105db6bcbdfce45f**. Noto Sans glyphs and attribution/licence notices are shared unchanged with the existing maps. Each area still prepares a complete durable local resource directory.

Reproduction:

    .toolchain/pmtiles/pmtiles extract https://build.protomaps.com/20260915.pmtiles assets/maps/queensway/basemap.pmtiles --bbox=-0.195,51.507,-0.178,51.519 --maxzoom=15
    .toolchain/pmtiles/pmtiles verify assets/maps/queensway/basemap.pmtiles
    node tools/maps/catalog-queensway.cjs
    npm run check:map

Structural verification and all 25 coverage tiles pass, including style dependencies and glyph coverage for map labels. Actual native opening view and the final tour package are recorded separately in the tour's result record when prepared; file verification alone is not a phone-rendering result.
