# M2 curated-tour native build evidence

17 September 2026. **Final build passed and is ready for the targeted phone session; no installation or physical acceptance is claimed here.** This record concerns the new A/B packages, walking chapter, player and private feedback workflow. The final APK below matches the current source and packaged content.

## Final build for phone preparation

Final source **`9bfa68ae66573afa`**, guide **8 / 20 cases**. The build identity now includes imported `content/north-finchley/packages/` files. A read-only recomputation after assembly confirmed the current source still matches this ID.

| Check | Observed result |
| --- | --- |
| TypeScript / full ESLint | Pass; TypeScript checked again after the final chapter-title fix |
| Complete automated suite | **131/131 pass**, including prepared tours, walking chapters, feedback and verified voice-file copying |
| Guide parity | Pass before build and again in build script |
| Final ARM64 debug + release assembly | Pass, Gradle **1m 47s**, 886 actionable tasks |
| Signatures, native adapter, microphone/location permissions | Both APKs pass the script checks; `RECORD_AUDIO` present and `FOREGROUND_SERVICE_MICROPHONE` absent |
| Offline map payload | All **257** map/font resources embedded byte-for-byte; MapLibre native library present in both variants |
| Offline tour payload | New `verify-tour-apk.py` passes: exact source ID, both tours, all **12** complete audio entries with validated decoded sizes/MD5, feedback and pinned map markers |

The final source includes the corrected pavement standing points and walking-chapter interval, explicit saved-voice copying, guide updates, and the root App's chapter-safe title lookup. An intervening build with source `2da90fd1ced340a6` passed but became obsolete when the title lookup was corrected during assembly; it was rebuilt and is **not** the handoff artifact.

| Final APK | Bytes | SHA-256 |
| --- | ---: | --- |
| Development | 83,608,721 | `a1dd9fdd8f51fd32463ee0cecd881ac76feddc7ae14d44176587efa616ceffb7` |
| Self-contained | 66,004,341 | `048f4941f9b751e37eb7980ce1a9cc9edede0b9b78b93d6abd1b94a061f91445` |

The development APK is unchanged from the early native build because JavaScript/content are served by Metro in that variant. This does not mean its bundled standalone content matches the self-contained APK.

| Final package | SHA-256 of source JSON |
| --- | --- |
| `north-finchley-b`, version 1 | `34ed7a3df2d877bbe6b432643ba99511a996ccd5acaf16f6f803c7802fc60788` |
| `north-finchley-a`, version 1 | `4cdb4bb2a86b65209833ae9bbe2659b7a1c5a68b121428df87ee409b24186a39` |

### Expo compatibility limitation

The online, read-only `expo install --check` returned exit **1**, recommending five patch updates: Expo `~57.0.23`, build-properties `~57.0.20`, location and task-manager `~57.0.18`, sharing `~57.0.20`. Existing dependencies were kept pinned; no installation or upgrade occurred. An initial offline fallback returned exit 0 but explicitly warned that validation was unreliable, so it is not counted as a compatibility pass. These recommendations do not invalidate the observed assembly results, and assembly does not establish untested native behavior.

Final local ignored evidence: `.cache/m2-tour-build/build-final-revised.log`, `final-metadata.json`, `final-typecheck.log`, `final-checks.log` (guide parity), `expo-compatibility-online.log` and the final prebuild source/config archive. The complete test result was observed in the command output; no test log is fabricated. No phone install, audible test, public upload or commit was performed by the build task.

## Early build

Source ID reported by the early build: **`a56ee2ff9cc7a482`**. At this point the build-ID script did not yet hash imported `content/` package files; their exact independent hashes are recorded below. That omission was reported for correction before the final build.

| Check | Observed result |
| --- | --- |
| TypeScript and full ESLint | Pass before early build, with `bundled.ts` present |
| Feedback tests | 12 pass: real SQLite persistence/rollback, scores, private export, capture races/failure preservation, saved-note playback cancellation/switch/finish |
| Prebuild preservation | 31 generated source/config files archived locally before Expo regenerated `android`; comparison found only main AndroidManifest changed |
| Canonical guide and map source checks | Build script passed guide parity, all resource hashes, local coverage decoding and bundled glyph checks |
| Audio source patch | Version-guarded resume/remote-intent patch verified before assembly |
| Android assembly | Debug and release ARM64 successful; Gradle reported 1m 58s, 886 actionable tasks |
| APK signatures | Both passed `apksigner verify` |
| Native adapter and permissions | Both passed existing adapter-marker checks and required location/job/playback permissions; both contain `RECORD_AUDIO` |
| Foreground capture scope | Neither APK declares `FOREGROUND_SERVICE_MICROPHONE`; background recording remains disabled in Expo configuration |
| Actual map packaging | ARM64 MapLibre in both; all 257 map/font resources embedded byte-for-byte in self-contained APK |
| Actual tour packaging | Both tour IDs, every story/chapter ID and all 12 complete base64 audio payloads found in the release Hermes bundle; decoded source sizes and MD5 match narration metadata |

The first sandboxed Gradle attempt could not open its local lock-contention socket (`SocketException: Operation not permitted`). The authorised escalated build succeeded. This was a host execution constraint, not an application regression. Upstream Kotlin/Gradle deprecation warnings did not fail assembly. No dependency upgrade or build-script change was made for this result.

| Early APK | Bytes | SHA-256 |
| --- | ---: | --- |
| Development | 83,608,721 | `a1dd9fdd8f51fd32463ee0cecd881ac76feddc7ae14d44176587efa616ceffb7` |
| Self-contained | 65,991,601 | `914c707027f92319cbf2a41bba6b989c943ac2af443467720405bcaaf55628dc` |

| Package in early APK | Content | SHA-256 of source JSON |
| --- | --- | --- |
| `north-finchley-b`, version 1 | Six stops, one walking chapter, seven audio assets | `f47ac39ca2d48d01fd67f07173797ec1095c0c9a6f23a227c3e77e809e5f0c0c` |
| `north-finchley-a`, version 1 | Five stops, five audio assets | `4cdb4bb2a86b65209833ae9bbe2659b7a1c5a68b121428df87ee409b24186a39` |

Local ignored evidence: `.cache/m2-tour-build/build-initial.log`, `build-initial-escalated.log`, `initial-metadata.json` and the prebuild archive/checksums. APKs remain in ignored `artifacts/`; no upload or installation occurred in this build task.

## What this does not establish

Assembly and static payload checks do not establish actual microphone permission/capture, audible saved-note playback, route access, outdoor triggers, narration enjoyment or cold reopening without Metro. Relevant accepted M1/M2 map evidence remains available for reuse, while new feedback and walking-chapter behavior need only the short representative device/use checks justified by the current personal-prototype testing policy. This record does not repeat or supersede those historical physical results.
