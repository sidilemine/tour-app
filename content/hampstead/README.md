# Highgate to Hampstead — Room to breathe

21 September 2026. A hand-built M2 tour for Sidi: **five exterior stops and two walking passages, all in George**. The owner chose Highgate Underground station as the start. The [authoring record](../../docs/content/authoring/hampstead-2026-09-21/README.md) preserves the public-tour survey, selection, source packets, original draft and independent editorial/navigation reviews. This is a second contrasting new-area outing alongside Clerkenwell, not an automated compiler or the E1 comparison.

## Inputs and reproduction

- [stories.json](stories.json): final original prose, spoken onward summaries, detailed directions and paragraph-level evidence.
- [plan.json](plan.json): 239 reviewed route points, separate landmark/visitor geometry, access limits, route-input hashes and two measured launch windows. The East Heath Road pavement correction is explicit; provider output is not treated as a physical survey.
- [packages/room-to-breathe.json](packages/room-to-breathe.json): actual import transport with all seven AAC/M4A recordings and pinned map `hampstead-0abcc26a600e0718`.
- [manifest.json](manifest.json): readable inspection copy with placeholder audio; unsuitable for import.
- [preparation.json](preparation.json): exact text/input hashes, local synthesis settings, paragraph chunks, media hashes/durations and navigation reserves.

```sh
node --import tsx tools/prepare-hampstead.ts
node --import tsx --test tests/prepared-tours.test.ts
```

Uses the existing pinned, locally cached Kokoro George renderer, with no paid or runtime generation service. The preparation tool checks complete text/evidence/chunks, phoneme limits, media decoding and measured duration against the chapter cap and navigation margin. Imported content is immutable by ID/version; change the version for a later revision.

## Route and measured budget

Start at **Highgate Underground's Archway Road exit 3**. Press Start there; it plays the welcome immediately. Continue through Pond Square, the Highgate ponds, 2 Willow Road and Keats House. The offline line continues to Hampstead Heath station/South End Green. A longer return to Hampstead Underground is written separately.

About **4.1 km**, provider estimate 58.3 minutes moving; allow **85–100 minutes** with crossings, looking and listening. Stationary narration including directions totals **7m22s**. The two walking passages total **1m58s**, concurrent with movement, not extra time. Interior visits are optional and are not needed on Monday.

| Walking passage | Actual audio | Distance after latest launch | Time at 6 km/h | Reserve before navigation |
| --- | ---: | ---: | ---: | ---: |
| Walking conversation | 50.2 s | 128.94 m | 77.36 s | 27.16 s |
| Keeping the Heath | 67.6 s | 269.61 m | 161.77 s | 94.17 s |

The first passage begins only after leaving Millfield Lane for the Heath. Merton Lane has no continuous footway and remains without planned walking narration. Several Heath forks are unnamed: the detailed directions and offline route are important. No current field clearance or GPS behavior is inferred from dated imagery, route validation or brisk-walking replays. Manual play remains available if a launch window is missed; no retracing is required.

## Readiness and rights

[Owner guide](../../docs/content/HAMPSTEAD-TAKE-THE-TOUR.md) · [build/device evidence](../../docs/test-results/M2-hampstead-tour.md).

Both APKs build, 161 automated tests pass, and the self-contained APK contains all four tours/29 recordings and three maps. The new-area silent phone handoff is recorded separately from build success. Previous Finchley and Clerkenwell content versions are unchanged; preserve all progress and reviews during installation/import.

Original AI-assisted prose and local George synthesis; provenance is visible in the tour introduction. Claim excerpts, reconstruction bases and rights are stored per story. OpenStreetMap attribution and map/font notices are retained. No photographs, Street View imagery, music or third-party narration are bundled. Subjective pronunciation/listening quality and ordinary outing feedback remain unobserved for these new recordings.
