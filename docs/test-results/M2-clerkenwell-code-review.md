# Clerkenwell package and integration review

20 September 2026. Review of the coordinator’s completed package integration, with one additional brisk-walk replay. **No blocking correctness issue found in the inspected snapshot.** This is code, artifact and deterministic replay evidence. No native build, phone playback or field observation was performed for this review.

## Scope and result

Reviewed [the preparation tool](../../tools/prepare-clerkenwell.ts), [build identity inputs](../../tools/build-info.cjs), [bundled tour list](../../src/tours/bundled.ts), [plan](../../content/clerkenwell/plan.json), [stories](../../content/clerkenwell/stories.json), [preparation record](../../content/clerkenwell/preparation.json), [manifest](../../content/clerkenwell/manifest.json), [actual transport](../../content/clerkenwell/packages/working-lives.json), [prepared-tour tests](../../tests/prepared-tours.test.ts) and [APK verifier](../../tools/verify-tour-apk.py). The existing parser, immutable-version guard and import path were inspected where they determine the integration’s behavior. Physical directions and street access remain the separate [navigation check](../content/authoring/clerkenwell-2026-09-20/FINAL-NAVIGATION-CHECK.md).

- The actual transport has **eight physical stops, two walking chapters and ten audio assets**, using `clerkenwell-working-lives`, content version **1**, and map `clerkenwell-8f45f13ad1755318`. The parser accepts it, including the route and standing positions within that map’s bounds.
- The packaged fixture, chapter windows, narration metadata, prose and directions agree with the authored plan/stories. The readable manifest has the same fixture and asset keys; its audio placeholders are correctly excluded from the import path.
- Every preparation input hash matches its source file. For all ten recordings, packaged bytes equal the retained local M4A cache; byte counts, MD5, SHA-256, transcript hashes, exact paragraph chunks and rendering metadata agree. Chunk durations plus paragraph gaps agree with the encoded duration within the preparation tool’s existing tolerance. The retained configuration specifies the pinned local George model and renderer. This review reused the recorded successful full decodes; it did not regenerate speech or claim an audible judgement.
- The preparation tool validates the package before publication and applies the existing immutable-version guard before overwriting a prior transport. A read-only probe with this actual fixture confirmed that exact reimport is allowed, changed content or map under the same ID/version is rejected, and an explicit new version is allowed.
- `bundledTours` includes Clerkenwell first, followed by the existing B and A transports. The Finchley package files remain **byte-for-byte identical to HEAD**. Imports retain separate tour/version directories and progress identities through the existing storage path.
- Build identity enumeration includes `content/clerkenwell/packages`, including the transport’s base64 media. Running the real identity script with file writes intercepted produced a deterministic identity; changing a media payload only in the in-memory input changed that identity. The check wrote neither the transport nor `src/buildInfo.json`. The actual build must generate its own final identity after all source changes.
- The APK verifier now requires all three authored packages, all **22** clip entries, the current build identity, feedback markers and **both** pinned map IDs. It validates each package’s complete audio-key set and bytes/hash before looking for the corresponding payload in the bundle. Map-resource bytes remain the responsibility of the separate map APK verifier. No newly built APK was claimed by this review.

## Added replay: brisk walking at the requested callback cadence

The earlier route simulator divided each geometry segment into short steps. Short segments could therefore generate callbacks more often than the desired two-second native request interval. The additional Clerkenwell test samples continuously along each whole walking leg at **6 km/h**, one location fix every **2 seconds**, carrying distance across route vertices. The last interval of a leg may include a brief stationary remainder at its destination. It does not manufacture an extra fix at each bend.

The test begins at the instructed Charterhouse start, finishes each stationary story there before departure, and walks every following leg. It uses the actual packaged durations and engine. Its expected playback order is explicit:

`charterhouse → smithfield → booths → stjohn-gate → green → many-hands → flowers → ingersoll → next-days-stock → exmouth`

All eight stops and both chapters complete once. Both chapter starts lie inside their authored launch intervals, and each retains the required navigation margin at this pace.

| Chapter | Launch beyond window start in replay | Time after narration before navigation in replay | Time after narration from latest launch boundary |
| --- | ---: | ---: | ---: |
| Many hands, small parts | 8.62 m | 24.90 s | 15.31 s |
| The next day’s stock | 6.89 m | 76.14 s | 40.89 s |

The separate latest-launch tests continue to use the **end** of each launch interval, rather than relying on the earlier starts produced by this replay. They require the actual package/plan geometry and indices to agree and retain the authored **15-second** margin. Both chapter-specific manual-pause/expiry tests remain in place: walking through an opportunity while held stays silent; the chapter expires; Resume at the next fresh arrival starts that stop without resurrecting the chapter. Finchley’s existing route and Moss Hall budget assertions are retained.

The simulator’s chapter completion uses the active clip’s duration and playback token. It no longer sends every chapter completion with chapter zero’s offset.

## Verification and limits

**Observed checks:** all **13** prepared-tour tests passed; scoped ESLint, project typecheck, Python verifier syntax and changed-file whitespace checks passed. The additional read-only artifact/hash and version probes described above passed.

This establishes the deterministic behavior for the supplied ideal fixes and actual recordings. It does not establish that Android delivers callbacks exactly every two seconds, measure native audio-loading delay, or certify GPS, acoustic quietness, current access, pronunciation or enjoyment. The Close window’s latest-launch calculation has only about **0.31 seconds beyond its required 15-second reserve**; any changed recording or route needs the existing budget check again. Delayed or poor fixes can miss a short launch window; the documented manual fallback remains available. No new physical test is requested by this review.

Root integration still owns the final build identity, native build/APK verification and the separate handoff record. The Farringdon approach is mapped/written; this replay follows the product instruction to press Start at the Charterhouse, where story one begins immediately.

## Inspected artifact versions

| Artifact | SHA-256 |
| --- | --- |
| Actual working-lives package | `efc47024908fc8d775f2bab9bf8c5fd17c51784453643a10d4c41337dd0f56f4` |
| Plan | `28c1f3758e8d8010ef0ba03bf77e85fe4bb8724404ccd32242b8a3bf580b49a2` |
| Stories | `e56e49d924dc71fdbd5e1de9dc6a80ca28f2eaad4dd870d8adb7dc4c8b6fb64e` |
| Preparation record | `e7d34b788e6c4c6105b1885dbe522bceb38d5eca7fd0f3075d6effd4bc478f01` |
| Readable manifest | `cfac27fd410a1e4127bc3ece003e1565cb84befc94d48b5b783ef7fd603159f0` |
| Preparation tool | `b1e99ba1c96fedfefa8939390b11e32ea47a8c75931525cd02b6358793e86e59` |
| Build identity script | `ef134bbd9ddbafdccc25def97e2c73097f4afb6d38106adf1bb74496366ca854` |
| Bundled tour list | `b9cf7ff2e39103024f5d77f988ab7bdcea1ec409a8d4ff0cc3eed4dd54e011c5` |
| Prepared-tour tests, including new replay | `e85d6a83db4d5ec2e301ac0d2c3636c79ad3a212fddd3989fe9a381f10881e7c` |
| Tour APK verifier | `c47957c369668db667562404b4ec2418543e1bc7825dbdde069bf667a2248513` |

Only the prepared-tour test file and this review record were edited in this review assignment. No commit was made by the reviewer.
