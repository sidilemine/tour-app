# Authored North Finchley tour review packages

17 September 2026. Two self-contained personal-review tours, following the [public-tour survey](../../docs/content/survey/README.md), owner comments and dated exterior checks. This is supervised authoring for M2, not the later automated compiler/factory or an E1 success claim.

- `stories.json`: nine original shared narratives, with paragraph-level source/reconstruction/editorial classifications and evidence. Retain alternatives and feedback in the [editorial record](../../docs/content/EDITORIAL-REVIEW-RECORD.md).
- `packages/B.json`, `packages/A.json`: actual import transports. Each contains the immutable fixture, transcripts, directions, evidence and base64 AAC/M4A assets; it names the exact installed North Finchley map bundle. The app stages/verifies every audio file and prepares/checks that map before publishing the library entry.
- `A-manifest.json`, `B-manifest.json`: readable inspection copies with audio payloads replaced by an explanatory marker; **not import files**.
- `preparation.json`: measured durations, bytes/hashes, provider-route references, voice/rate and estimates. The ordinary duration excludes optional review time; B's chapter overlaps walking.

All speech was generated locally with the installed macOS Daniel voice at 145 words per minute, then AAC encoded at 64 kb/s. No paid synthesis, network generation, music or third-party audio was used. Source photographs and Street View frames were inspected but are not included in the packages. Distribution/voice rights have not been cleared for publication; these files are for Sidi's private review.

Reproduce this particular authored pair with:

```sh
node --import tsx tools/prepare-finchley-tours.ts
node --import tsx --test tests/prepared-tours.test.ts
```

The tool caches unchanged narration by transcript SHA-256 under ignored `artifacts/finchley-audio/`. It saves real-provider responses separately, checks the package contract and measures actual files. It does not research, choose new places, verify current access or call an LLM. Once a version has been imported on the phone, change the content version before changing its fixture or media; changed content under the same ID/version is rejected.

## Physical data and first-use scope

Landmark pins and pavement candidates are separate. The [route record](../../docs/content/routes/north-finchley-review-v2/README.md) identifies OSM footways and provider geometry; the [exterior checks](../../docs/content/routes/north-finchley-review-v2/EXTERIOR-CHECKS.md) retain Street View dates, actual camera coordinates and approximate pavement nominees. `verification.status` stays `unverified` because no current field walk is claimed. This does not mean the historical evidence or desk geometry has not been reviewed.

These candidates are suitable for an ordinary first personal review with public-exterior descriptions and manual fallback. Neither tour requires entering a building, private garden or closed arcade. A temporary obstruction can be handled by moving a few steps on the same pavement or skipping the story. The first use supplies actual enjoyment, current conditions and whole-tour integration; no exhaustive release certification is implied.

[Owner guide](../../docs/content/NORTH-FINCHLEY-TAKE-THE-TOURS.md) · [Native build evidence](../../docs/test-results/M2-tour-build.md)
