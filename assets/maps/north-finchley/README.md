# North Finchley map proof

Fixed, public map resources for M2's first slice. No visitor positions or private traces are included. Coverage is longitude −0.196…−0.159, latitude 51.600…51.626; it contains the compact candidate area and a surrounding buffer, not a verified itinerary.

## Source and rights

- **Tiles:** [Protomaps daily build](https://build.protomaps.com/20260915.pmtiles), 15 September 2026, tileset **4.15.2**. Regional extraction with official **go-pmtiles 1.31.2**, zooms 0–15. The published whole-planet BLAKE3 is `ba618b3b5f301cc8b4142736932c798b0444860bb2caa67cc79a7b4bc5e35357`; the planet was not downloaded or locally verified. The exact local extract SHA-256/size are recorded in [catalog.json](../../../src/map/catalog.json).
- Protomaps [documents its basemap as an ODbL Produced Work](https://docs.protomaps.com/basemaps/downloads), with OpenStreetMap attribution required. The app always displays **© OpenStreetMap contributors**; its offline credits include the copyright/licence links. Underlying [data licences](https://github.com/protomaps/basemaps/blob/main/LICENSE_DATA.md): OSM/OSM water under ODbL, Natural Earth public domain, ESA WorldCover under CC BY 4.0. The bundled archive contains landcover but our style does not display it. No public OSM tile-server bulk download is used.
- **Fonts:** Noto Sans Regular, all 256 BMP range files from [basemaps-assets](https://github.com/protomaps/basemaps-assets/tree/028c18f713baecad011301ff7a69acc39bcc2ae7/fonts), pinned commit `028c18f713baecad011301ff7a69acc39bcc2ae7`. See [SIL OFL notice](FONT-LICENSE.txt). The check decodes glyph IDs and confirms coverage of every street/place label selected at the displayed native tile zooms.
- **Style:** authored in this repository, no external style generator or sprite/icon dependency. Paths and railways have separate line styles. Map data does not certify pedestrian access, crossing safety or a visitor standing area.
- **Renderer:** MapLibre React Native **11.3.10**, Android native **13.2.0**. [React Native licence](MAPLIBRE-RN-LICENSE.txt), [native licence](MAPLIBRE-NATIVE-LICENSE.txt); full notices and font licence are also compiled into the app's offline credits.
- **Cost/expiry:** £0, no account/key, subscription or runtime service. The saved files have no technical expiry or paid-use limit; maintain required attribution/licences. This snapshot will age and is not a current access report. Upstream daily-build retention is limited; the committed extract remains available even if its source URL expires. No irrevocable package-format commitment is made before phone rendering succeeds.

## Reproduction and checks

```sh
.toolchain/pmtiles/pmtiles extract https://build.protomaps.com/20260915.pmtiles assets/maps/north-finchley/basemap.pmtiles --bbox=-0.196,51.600,-0.159,51.626 --maxzoom=15
.toolchain/pmtiles/pmtiles verify assets/maps/north-finchley/basemap.pmtiles
# After a deliberate asset replacement, regenerate and review the catalog:
node tools/maps/catalog.cjs
npm run check:map
```

The CLI is a local ignored tool, obtainable from its [official release](https://github.com/protomaps/go-pmtiles/releases/tag/v1.31.2). Copy the font directory and OFL from the pinned asset commit above before generating the catalog. `catalog.cjs` records byte counts, MD5 (native accidental-corruption checks) and SHA-256 (build verification), creates static Metro requires, and embeds licence text. Normal checks never regenerate expected hashes.

**9,524,280 bytes** across 257 map/font files: map **3,283,807 bytes**, fonts **6,240,473 bytes**. The style only displays zooms 14–18; 16–18 overzoom existing z15 data. Low-zoom archive tiles cover larger surrounding areas; an opaque outside-coverage mask prevents presenting that overfetch as a supported offline area. Camera centres are constrained to the declared bounds.

`check:map` verifies every file, decodes all 52 coverage tiles (65,838 features), validates the style and checks local resource/label coverage. The release APK check finds all map/font hashes in the actual APK. Neither check substitutes for drawing, pan/zoom, label legibility, frame timing or memory measurements on the phone.
