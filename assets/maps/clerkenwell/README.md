# Clerkenwell / Farringdon offline map

Second bounded public-map area, prepared 20 September 2026. Coverage: longitude −0.116…−0.091, latitude 51.515…51.536. This contains the current Clerkenwell candidates and a margin; it is not a verified pedestrian itinerary.

The extract uses the **same 15 September 2026 Protomaps 4.15.2 snapshot** and **go-pmtiles 1.31.2** as [North Finchley](../north-finchley/README.md). The [official download documentation](https://docs.protomaps.com/basemaps/downloads) and [CLI extraction instructions](https://docs.protomaps.com/pmtiles/cli#extract) were checked on 20 September. No account, key, payment or runtime network service is used. The entire planet archive was not downloaded or independently hashed; the exact regional bytes are hashed in [the new catalogue](../../../src/map/clerkenwell.json).

The map adds **2,652,619 bytes**, containing 30 tiles. It shares the existing pinned Noto Sans glyph assets and full offline attribution/licence text, including OSM/ODbL, Natural Earth, unused ESA landcover, SIL OFL and renderer licences. No existing Finchley asset is replaced. Metro references the same font files for both maps; each prepared map has a self-contained durable local directory. Native drawing has not yet been observed for this second area.

```sh
.toolchain/pmtiles/pmtiles extract https://build.protomaps.com/20260915.pmtiles assets/maps/clerkenwell/basemap.pmtiles --bbox=-0.116,51.515,-0.091,51.536 --maxzoom=15
.toolchain/pmtiles/pmtiles verify assets/maps/clerkenwell/basemap.pmtiles
# Only after an intentional replacement; checks do not rewrite expected hashes:
node tools/maps/catalog-clerkenwell.cjs
npm run check:map
```

Both areas' checks validate every resource, all coverage tiles, style, labels and local-only references. The APK check requires both areas' actual bytes. Camera bounds, grey outside coverage and live-position filtering use the selected tour's map. A changed source snapshot would require reviewing attribution, compatibility and catalogue identity; this authoring tool does not upgrade it automatically.
