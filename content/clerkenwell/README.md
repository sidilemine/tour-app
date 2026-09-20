# Clerkenwell — Working lives, hidden in plain sight

20 September 2026. An original, supervised M2 tour for Sidi's private review: **eight exterior stops, two walking passages, George throughout**. The owner selected Clerkenwell, this promise, and about 75–90 minutes in the area excluding travel. The [authoring record](../../docs/content/authoring/clerkenwell-2026-09-20/README.md) preserves the survey, research, selection, independent review and consequential edits. This is a hand-built tour, not the later automated compiler or E1's paired experiment.

## Authored inputs and generated package

- [stories.json](stories.json): final prose, literal directions, sources and exact paragraph evidence. The original writer's V1 remains separately frozen.
- [plan.json](plan.json): public-route coordinates, candidate visitor areas, approaches/views/access, two launch windows and navigation margins. It records the selected geometry/index hashes and the 61-point station-approach offset. Landmark and panorama camera coordinates have not been substituted for visitor positions.
- [packages/working-lives.json](packages/working-lives.json): actual import transport, with all ten AAC/M4A assets and the exact bundled Clerkenwell map identity.
- [manifest.json](manifest.json): readable inspection copy; its placeholder audio strings make it unsuitable for import.
- [preparation.json](preparation.json): frozen input hashes, synthesis settings, actual durations, complete paragraph chunks, byte/hash checks and latest-launch budgets.

Reproduce with the already-cached, pinned local Kokoro model:

```sh
node --import tsx tools/prepare-clerkenwell.ts
node --import tsx --test tests/prepared-tours.test.ts
```

The tool refuses oversized phoneme chunks, mismatched paragraph/evidence records, incomplete media, a changed immutable version or a walking passage that cannot fit after its latest launch. Audio cache keys cover the exact prose and voice/model/render settings. Generation is local and free, with no live generation/routing dependency during touring. Model assets and decoded working audio remain ignored; the actual package retains its media. Once imported, changing content requires a new version rather than silently replacing playback offsets.

## Route and time

The [selected route record](../../docs/content/authoring/clerkenwell-2026-09-20/ROUTE-RESEARCH.md) includes a roughly 7-minute written/mapped approach from Farringdon's Cowcross Street exit. **Press Start at the Charterhouse exterior.** Start plays the first story immediately. The route then visits Smithfield, Britton Street's gin reliefs, St John's Gate, the Green, Woodbridge Chapel, Ingersoll and Exmouth Market.

About 2.74 km including the approach; the provider estimates 38.2 minutes of movement. The owner guide explains the integrated leisurely allowance after measured narration; simultaneous walking speech is not counted twice. Optional interiors, refreshments, feedback and the station return are additional. Stop positions remain `unverified` desk candidates: dated imagery and official access information cannot establish today's furniture, noise, roadworks or sightlines.

Both walking passages are budgeted at 6 km/h from the **latest** launch, with at least 15 seconds before their relevant navigation decision. The current engine does not stop a playing chapter at the end of its launch interval. The Close has a short eligible window; delayed/poor fixes can miss it, and manual play remains available. Skinner Street carries buses; it is not described as a quiet path. Current signs take precedence over the map, and there is a written public-street fallback around Close works.

## Readiness and rights

[Owner outing guide](../../docs/content/CLERKENWELL-TAKE-THE-TOUR.md) · [build and check record](../../docs/test-results/M2-clerkenwell-tour.md).

Automated package/replay/build evidence and physical phone/outing evidence are recorded separately. Existing Finchley packages, feedback and progress remain intact. Headset recording/Spotify behaviour is unresolved; Phone microphone near the mouth or written notes are the practical fallbacks. No new walk is required merely to test the second map.

Original AI-assisted prose and local Kokoro George synthesis; AI provenance is visible in this tour's introduction. Sources and reconstruction bases remain available per story. Map/route data retain OpenStreetMap attribution and the bundled map's rights notices. No source photographs, Street View frames, third-party narration or music are packaged. Public distribution, paid services and a city database remain separate decisions.
