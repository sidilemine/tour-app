# Clerkenwell offline-area extension

20 September 2026. Implementation for the selected next tour; not M2 closure or a field result. The original build evidence below was followed by the [guide-12 phone handoff](M2-clerkenwell-phone-handoff.md), which passed representative cold offline drawing and area switching.

## Change

The app now recognises two explicit bundled map IDs. Clerkenwell has its own bounded Protomaps extract and shares the existing font assets and credits. Tour import checks geometry against the selected area's coverage, prepares that map, and persists its identity in the library. Historical library entries without a map ID continue to use North Finchley without rewriting fixtures, progress or feedback. A repair cannot change the map associated with an existing tour ID/version.

Map title, initial camera, coverage mask and position filtering follow the selected area. A keyed map component discards the previous area's local UI state; preparation and repair are isolated by map ID. The renderer still reads local files and uses the existing session position. No native dependency, location/audio policy, network routing or map-download service was added. General tour-home labels replace the first-area wording. Guide 11 changes the map label and states that new-area checking does not reopen the historical physical matrix.

The [Clerkenwell source record](../../assets/maps/clerkenwell/README.md) retains rights, commands and checksums. Its new archive is 2,652,619 bytes; the 6,240,473 font bytes are shared in the bundle. Existing Finchley assets, catalogue and original tours are unchanged.

## Verification so far

- Type checking and lint pass. The app suite passes **145 tests**, including selected-area coverage, legacy map association, rejecting changed associations for immutable versions, and repair preserving the other map and saved progress. These are automated results.
- Map checking verifies all resource sizes/hashes and local style references, decodes **52 Finchley tiles / 65,838 features** and **30 Clerkenwell tiles / 60,104 features**, and checks all displayed label glyphs. The PMTiles CLI structural check passes.
- An independent code review found no actionable regression and separately reran the map/package checks. It did not supply physical evidence.
- Guide 11 matches generated documentation; its six journal/guide tests pass after the label update.
- Android development and self-contained builds pass, guide **11**, source **`19487e68235bb598`**. Both APKs pass signing, native audio-marker and location-job-permission checks. The self-contained APK contains all **258 distinct map/font resources**, the unchanged two Finchley tours and their **12 audio entries**. Clerkenwell narration is not yet packaged. The first sandboxed invocation could not open Gradle's local socket; the authorised unrestricted local retry passed in 1m 58s. This initial failure was environmental. Raw build output stays in ignored `artifacts/clerkenwell-map-build.log`.

## Remaining practical evidence

After the complete tour is bundled, verify both map archives and the exact narration bytes in the actual APK. In the single prepared phone session, cold-open the self-contained app without Metro/networking, view the Clerkenwell route and representative labels/coverage, switch to a retained Finchley tour/map and confirm saved progress remains, then return to Clerkenwell. This checks the changed area selection and native drawing. Existing resource-repair, map/audio coexistence and M1 location/audio evidence remain reusable; no new walk follows from adding another map extract alone.

The complete route and walking chapters will receive their own geometry/timing replays before travel. Current street access cannot be established by the tile archive or these tests.

## Complete-tour follow-through

The [final Clerkenwell build](M2-clerkenwell-tour.md) now includes the narration, eight stops and two walking passages, with guide 12/source `9505427915e2d1df`. Its APK re-verifies all map resources and three tours. This supersedes the earlier local build and is now installed. Representative cold offline Clerkenwell drawing/reader and switching to retained Finchley passed the [combined phone session](M2-clerkenwell-phone-handoff.md). The earlier procedure above is complete at that representative scope; current street conditions and chapter launches await ordinary use.
