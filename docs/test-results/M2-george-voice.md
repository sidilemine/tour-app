# M2 voice update — George

17 September 2026. Sidi selected George after hearing the [two matching samples](../content/voice-samples/README.md): Emma was crisper but quite flat; George had better intonation and a deeper sound appropriate for a London tour. That choice authorises replacing the tour narration; it is not a full-tour enjoyment result.

## Change and checks

- Both tour content versions advance from **1 to 2**. All 12 audio assets use local Kokoro `bm_george`, speed 1, full precision on CPU. Model revision `1939ad2a8e416c0acfeecc08a694d14ef25f2231`, runtime/encoder settings and actual durations are recorded in [preparation metadata](../../content/north-finchley/preparation.json).
- Paragraph-level rendering preserves multi-sentence delivery; actual model tokens are checked before synthesis so an oversized passage cannot silently truncate. Every source paragraph and spoken direction was supplied. All 12 final 24 kHz mono AAC/M4A files decode completely. Generated audio was not played automatically.
- Compared version 2 against the committed version-1 packages: route geometry, visitor positions, access instructions, transcripts, evidence, directions and chapter launch window are unchanged. No new research claims or route changes.
- A: stationary audio **483.2 seconds**, ordinary estimate **27–32 minutes**. B: stationary audio **558 seconds**, walking chapter **139.5 seconds**, ordinary estimate **40–45 minutes**. Optional feedback remains additional. B's latest-launch navigation-margin test passes at the existing 4.5 km/h assumption; faster walking remains ordinary-use feedback, not a newly claimed field result.
- TypeScript and full lint pass; **131 tests pass**, including both actual-route replays, package hashes and measured chapter timing. Native dependencies and playback/location policy are unchanged. The previous SDK patch-update recommendations remain recorded in [the earlier build evidence](M2-tour-build.md); no SDK upgrade occurred.
- Library presentation shows each tour's latest edition and any older currently selected edition. Older packages, reviews and progress are retained; selecting version 2 starts separate progress rather than applying a Daniel playback offset to George.

## Build and handoff

Both ARM64 APK variants built successfully in **1m 50s**. Self-contained source **`3bff1f696cc9c8cd`**, guide 8; **66,333,829 bytes**, SHA-256 `b327762a6fab30d145ab65199d59ca349e0076e7dc02ac4985cfa09b538b18a7`. Signatures, patched native audio markers and permissions passed; all 257 map resources and both version-2 tours with all 12 audio payloads are verified inside the APK.

**Installation pending:** previous self-contained Daniel source `9bfa68ae66573afa` remains the last verified phone handoff until superseded here. The previous APK is retained locally under ignored `artifacts/m2-daniel-v1/`; generated native source/config were archived before prebuild.

No new walk, microphone check or background-location baseline is required for this audio-only dependency change and small library presentation adjustment. Reuse [the accepted phone checks](M2-tour-phone.md). A silent install, bundled preparation and cold reopening are sufficient for handoff; the owner already approved the voice from the actual local sample. Full-tour pacing, pronunciation and enjoyment remain first-use observations.
