# Local package preflight

Implemented 13 September 2026 as independent M2 preparation while M1 was awaiting physical acceptance. M1 has since [completed](../test-results/M1-closure.md); mobile package import remains unimplemented. Run from the project root:

```sh
npm run check:package -- content/finchley/manifest.json
npm run check:package -- content/finchley/manifest.json --ready
```

The first command accepts a structurally valid draft and lists readiness blockers. The second requires no blockers and therefore **intentionally fails for the Finchley draft**. A manifest declaring `stage: ready` also fails if blockers remain. This content package is not an M1 three-stop fixture; do not import it into the current phone app.

The implementation is [tools/content/package.ts](../../tools/content/package.ts), with [failure-path tests](../../tests/package.test.ts). It uses the existing Zod dependency and the pure distance helper. It does not enter the mobile bundle or change the installed player.

## What is checked

- Explicit schema/content versions, walking mode, stable unique IDs, known fields and valid coordinates.
- Separate landmark and visitor standing points; approach, viewpoint and access have independent review records. Checked declarations require a reviewer and date.
- Factual paragraphs reference claims; claims reference sources and short supporting passages. Readiness requires source-checked evidence with explicit uncertainty.
- Narration and transcript asset references, audio duration metadata, local map resources, bounds and attribution.
- Consecutive route legs cover the whole geometry, contain directions and meet visitor positions within 10 m. This tolerance matches the M1 fixture check; it is not a field accuracy promise. A building centroid cannot substitute for the visitor point.
- Relative asset paths, no symlinks or traversal, file type/size, SHA-256, duplicate paths/IDs and broken references. Temporary prototype limits: 500 MB per asset and 750 MB total; revisit using real map measurements.

## What is not established

This is a preflight tool over a trusted local authoring directory, not a secure archive importer or a complete compiler. It verifies declarations and bytes, not historical truth, legal permission, map coverage inside a claimed bounding box, map/audio decoding, audio/transcript correspondence, pronunciation, measured clip timing or physical access. A person can enter an incorrect review assertion; passing the tool does not make it true. Unit fixtures use synthetic bytes and synthetic review records, not real maps or field results.

`source_checked` means the author checked the cited passage against the statement; it is not independent corroboration. `field_checked` records an actual reviewer observation, with its limitations in `note`. `stale`, `blocked`, `unverified`, disputed claims and missing media prevent readiness. Geometry checks do not prove safe crossings, path availability or accessibility. Claimed map format is metadata, not evidence of renderer support.

The six-stop draft keeps absent resources null/empty, rather than adding fake routes or placeholder assets that appear complete. Its paragraphs are original editorial drafts; the evidence excerpts appear once in the manifest. Public geocoding responses have provenance under `content/finchley/research/`; they are not private phone recordings.

## Next implementation boundary

After the M1 physical gate, select and prove a small offline map adapter, then implement durable mobile import: stage all files, run validation, verify actual renderer/media resources, commit the new version atomically and retain the old working version if interrupted. Pin progress to a content version. Test interrupted import, corrupt assets and version changes before connecting the six-stop package to playback. A desktop preflight pass does not satisfy any of these mobile acceptance criteria.
