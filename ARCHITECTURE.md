# Architecture

Status: updated 14 September 2026. M1 implemented; full physical acceptance pending. A functional self-contained walk has passed; see the result record for its limits. [PRODUCT.md](PRODUCT.md) defines the experience; [ROADMAP.md](ROADMAP.md) defines the evidence required before advancing. The owner's revisions override the original brief's mixed state machine, numerical claim-confidence examples, lifecycle milestone ordering and early backend/knowledge-base recommendations.

## Decisions and boundaries

| Decision | Current choice and reason | Revisit when |
| --- | --- | --- |
| ADR-001: mobile stack | React Native, Expo, TypeScript; installed Android development build first. Expo 57.0.22 / React Native 0.86.3 / TypeScript 6.0.3 are locked for M1. | The combined lifecycle experiment finds a concrete native limitation. |
| ADR-002: native projects | Expo Continuous Native Generation; commit config/plugins and owned native modules, ignore generated native folders. | A required change cannot be represented reproducibly. |
| ADR-003: app structure | One app and npm lockfile. Expo Router for screens when useful; plain typed reducers/services for behavior. No mandatory state library or monorepo framework. | Demonstrated complexity warrants one. |
| ADR-004: playback ownership | A tour-session coordinator owns policies; platform adapters own audio/location; screens observe state and issue commands. | Device evidence requires a bounded native session service. |
| ADR-005: local storage | SQLite for transactional progress and package metadata; durable app files for media/maps. Do not store required downloads only in purgeable cache. | Measured storage or migration needs change. |
| ADR-006: generation boundary | Authored inputs and eventually local TypeScript tooling emit versioned, validated tour packages. Playback imports data, never generation code. | A supervised content experiment justifies more automation. |
| ADR-007: offline scope | Local map, planned route, stored directions/media and recovery. Arbitrary offline rerouting deferred. | Owner explicitly approves the additional capability. |
| ADR-008: infrastructure | No backend, accounts, object-storage service, telemetry service or reusable city knowledge base yet. No remote is created for the foundation. | A concrete sharing/generation requirement needs one. |
| ADR-009: walking only | Support walking now; use schema versions for future extension. No driving policies or abstractions in the current implementation. | Walking works and driving is separately commissioned. |

SQLite is supported by Expo and persists across app restarts; the proposed transactional/checkpoint policy below is our design, not something the library supplies automatically. See [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/).

Current layout (future adapters are added only when used):

```text
App.tsx                  player and fixture controls
src/domain/              fixture types, geometry and deterministic playback policy
src/session/             Expo audio/location adapters, serialized events and recovery
src/storage/             shared transactional SQLite store
src/export/              JSON snapshots, naming and platform save/share adapters
src/testing/             bundled offline guide, independent journal and guide screen
fixtures/                synthetic or approved sanitized tours/traces
assets/                  small owned test media
tools/content/           Node-only package preflight; no mobile importer yet
content/finchley/         public-source editorial and listening drafts
docs/test-results/       sanitized build/device result summaries
diagnostics/             ignored private raw device exports
```

No screen or React hook owns the lifetime of the active tour. Domain code must run under automated replay without React Native, wall-clock waits, a map SDK, network or actual GPS.

## Provider contracts

Define the smallest typed contract when its first consumer exists. Keep vendor payloads inside adapters, with normalized coordinates, times, units and errors across boundaries.

| Boundary | Responsibility | First use |
| --- | --- | --- |
| Location input | Permission/service state and timestamped fixes; live adapter and replay adapter emit the same events. | M1 |
| Audio output | Load local clip, play/pause/seek, expose actual status, completion, interruptions and remote control events. | M1 |
| Progress store / clock | Transactional snapshots, ordered events, controllable timestamps for tests. | M1 |
| Map/offline resources | Render local map and overlays; enumerate required style, tile, glyph and image assets, coverage, attribution and errors. | M2 |
| Routing | At authoring time, accept verified visitor waypoints and walking constraints; return real geometry, maneuvers, distance, duration and provenance. | E1/M2 initially as reviewed provider output; code in M4 |
| Research, LLM and TTS | Produce evidence, constrained drafts and generated audio through separate replaceable adapters. Capture model/voice/text version and usage where available. | E1 manually; automate after its decision gate |

The runtime never asks a router or LLM to reinterpret a downloaded walk. Swapping a routing or TTS vendor must not change the player domain. A provider can calculate a route without proving that a crossing, path or viewpoint is currently usable.

## Tour package contract

A package has distinct `schemaVersion` and `contentVersion`, stable tour/stop/clip/claim IDs, a manifest of local relative paths, byte sizes and checksums, creation/review dates and an attribution section. Do not implement a speculative universal schema in M1: use a small versioned fixture and grow it into M2's validated package.

Required content for a downloaded tour:

- Metadata: title, scope/coverage, start/end, walking constraints, theme/request brief, estimated walking/listening/rest time and version.
- Planned route: WGS84 geometry, ordered legs, distance/time estimates, provider/retrieval metadata and navigable walking instructions. Retain known alternatives/rejoin instructions only when verified.
- Local map resources: declared geographical bounds/zoom range, all renderer dependencies, dataset/provider/version, offline-use rights and attribution. A route polyline on a blank background is not a local map.
- Stops: landmark reference, visitor geometry and verification details, order/eligibility, narration, transcript, claim references and optional licensed images.
- Narration: local file, measured duration, clip role (stop/story/direction/approach), transcript/text version and pronunciation metadata. Direction audio is also prepared ahead of use when spoken guidance is supplied.
- Evidence: claim-level source passages and review records, including facts used for physical orientation and operational access.

At installation, stage files, validate all required assets and checksums, then atomically mark the package ready. Reject unsupported schema versions, path traversal, duplicate/broken IDs, missing assets/rights, invalid coordinates and broken route references. Interrupted or corrupt installs must not replace a working version. Pin an active session to a specific content version; never silently migrate offsets/stop IDs onto a changed tour. Migrations need explicit mapping and tests, otherwise offer a separate restart while retaining the old progress.

Download completeness includes the local map, route, directions, narration and transcripts, not just audio. A local package-import path is sufficient before hosting exists. Progress is a separate mutable local record keyed to the immutable tour version; downloading a tour does not download somebody else's progress.

## Visitor geometry and verification

| Object | Information kept separately |
| --- | --- |
| Landmark | Representative coordinate/footprint, identity and descriptive facts. Never automatically used as a walking destination. |
| Standing position | Safe visitor point or small area, usable arrival zone and reference to the connected route segment/entrance. May have verified alternatives. |
| Approach | Incoming walking leg, permitted entrance/crossing, direction of approach and any instructions needed to reach the standing area. |
| Viewpoint | What should be visible from the standing area, target feature, descriptive orientation and optional bearing reference; conditions affecting visibility. |
| Access | Public/private boundary, gates, hours, fees, stairs, surface, gradient, crossings and known limitations; unknown values remain unknown. |

Each physical assertion records status (`unverified`, `desk_checked`, `field_checked`, `stale` or `blocked`), supporting source/observation, reviewer, checked date and applicable conditions. A field visit does not guarantee future access. Record operational freshness/recheck requirements separately from durable history. Directions using left/right must identify the reference approach or facing direction; prefer visible landmarks when orientation cannot be established. Never treat an unreliable device compass as verification.

## Independent state and event processing

Three separate state domains plus persistent user intent replace the brief's single mixed state list:

| Domain | Example states/data | Does not imply |
| --- | --- | --- |
| Location | unavailable, acquiring, on-route, approaching, at-stop, off-route, uncertain; raw/matched fix, sample age/accuracy, along-route distance, candidate/reasons | Audio playing or a stop completed |
| Playback | idle, loading, playing, paused, interrupted, ended, failed; clip/offset/output route and observed native status | Visitor still at that stop |
| Progress | not-started, active, completed; next eligible stop, per-stop unplayed/in-progress/completed/skipped, last checkpoint, pending arrival | Physical location or permission state |
| User intent | persistent playback hold and reason, automatic triggering enabled/disabled, active-tour tracking enabled/ended | A temporary lack of sound is a user pause |

Process location batches, UI actions, native audio status and lifecycle events through one serialized coordinator. Assign event IDs and use durable deduplication for trigger/stop transitions; a duplicate location callback must not play a second copy. Sort/check fix timestamps, reject stale or implausible updates, and test concurrent manual pause versus arrival. The current persisted hold must be checked immediately before issuing a play effect, not just when arrival was detected.

State transitions return effects; adapters execute effects and report what actually happened. A request to play is not proof of audible playback or completion. Background callbacks must load current intent/progress rather than using stale UI closures. Native player ownership and delivery of commands from a background task are explicit M1 integration risks.

### Playback arbitration

1. A manual or recovery hold wins over all automatic speech. Preserve it across call completion, GPS changes, stop arrival and app restart. A manual Pause is durably recorded before the UI acknowledges it. Pause during silence also sets the hold.
2. Explicit Resume, including lock-screen Play for the saved clip, clears the playback hold. The separate “automatic narration off” setting stays off until explicitly enabled. Explicit stop selection permits that requested clip only when a hold remains.
3. Play only one clip at a time. If the next eligible arrival occurs during an unfinished clip, retain one pending candidate, finish the current clip and revalidate the candidate with a fresh fix. If the visitor has left, keep it available manually; do not replay a stale queue.
4. Only native completion or explicit user skip changes a stop to completed/skipped. Physical passage, loading failure and interruption do not. Explicit replay does not reset completed progress. Starting from a chosen stop records the sequence change without pretending earlier content was heard.
5. Initially pause on calls/focus loss and output disconnection; require explicit resume. Distinguish user/system reasons where the adapter exposes them. An unexplained native pause is treated conservatively as held, not silently auto-resumed. Verify that the library can enforce this policy.
6. In the walking player, an actionable walking direction may briefly pause narration, play its prepared cue, then resume the story at the saved offset. Recheck manual hold before the cue and before resuming: a pause during either phase cancels automatic continuation. Prefer planned windows, but do not rely solely on a visual direction when narration runs long. This policy is recorded for M2; M1 does not implement a navigation engine.

## Route-aware location engine

Input fixes contain provider timestamp, received timestamp, coordinate, reported horizontal accuracy, and optional speed/heading. Match plausible nearby route segments using recent continuity, direction of travel and sequence context, then compute along-route distance and cross-track distance. Keep location quality as explainable states/reasons, not a purportedly calibrated percentage.

Arrival requires the next eligible visitor zone, plausible route position, usable recent fixes and persistent agreement. Use hysteresis, cooldown/deduplication, reversal detection and speed/jump checks. Physical heading is a weak hint at walking speed. Radii, dwell and corridor limits are tunable parameters recorded with the replay result, not universal accuracy guarantees.

The current M1 implementation confirms arrival inside a 30 m radius, with at least three usable fixes spanning four seconds, cross-track ≤45 m and reversal rejection. Reported horizontal accuracy must be ≤35 m; retained arrival uses a 40 m exit radius. These are broad lab defaults, not exact-pin or physically verified viewpoint guarantees. [Repeated field observations](docs/test-results/M1-two-more-walks.md) require checking recorded visitor coordinates and approach geometry before tightening zones; no threshold was changed during that review.

[Arrival calibration research](docs/ARRIVAL-CALIBRATION.md) identifies single-fix stop capture as a separate uncertainty from live GPS and trigger policy. Prioritize fresh stationary capture, provenance and repeated physical verification before per-stop radius tuning. The proposed capture experiment is not implemented; current fixtures lack capture-quality metadata. Pinned Android source inspection found that an enum-only High → Highest change would leave our explicitly configured continuous location request unchanged. Keep the installed M1 build stable during current acceptance tests.

M1 starts with a known route and simple next-stop gating; later fixtures cover dense streets and crossings. Include normal travel, GPS jump, noisy parallel street, reversal, long silence/coffee stop, crossing route, stale/batched fixes, signal loss, jumping ahead, implausible bus speed and restart. Manual fallback must work regardless of matcher output.

The [14 September pause walks](docs/test-results/M1-four-pause-walks.md) exposed a conflict between the old 2 m displacement filter and pending playback's 15-second freshness gate. Active touring now requests High accuracy at a desired 2 s interval with zero minimum displacement, including while paused and stationary. End still stops tracking; the recorder retains its separate 3 m path-sampling request. The reducer's radius, freshness, hold and ordering rules are unchanged. A stale pending arrival after Resume/completion is explicitly logged and explained on screen. See the [correction record](docs/test-results/M1-stationary-location.md) and [two successful outdoor pause retests](docs/test-results/M1-pause-retests.md). Connected locked delivery and fresh fixes through outdoor held arrival/release are observed on the Pixel 6. Delivery on other devices and battery cost remain measurement items; the requested interval is not a guarantee.

## Android lifecycle hypothesis to test first

Use `expo-location` with a module-scope `expo-task-manager` task and an explicitly configured Android location foreground service. Enable the applicable background/foreground-service permissions in the config plugin and request foreground then background location with an explanation. Expo documents the requirements and termination limitations in [Location](https://docs.expo.dev/versions/latest/sdk/location/); its [TaskManager reference](https://docs.expo.dev/versions/latest/sdk/task-manager/) describes task registration. Periodic background jobs and foreground-only location watchers are not a substitute for active-walk updates.

Start the session while the app is visible, await permission and service-start results, and show ready/error before asking the user to lock the screen. Android restricts starting foreground services from the background and enforces permission eligibility at start; see [Android foreground-service restrictions](https://developer.android.com/develop/background-work/services/fgs/restrictions-bg-start).

For `expo-audio`, enable background playback, configure the audio session, and activate lock-screen controls. Disable unnecessary recording/microphone permissions. Keep the player independent of screen mounts. These requirements come from [Expo Audio](https://docs.expo.dev/versions/latest/sdk/audio/).

**Hypothesis, not a guarantee:** the active location session and audio adapter can deliver the next narration after the previous clip has ended and the phone has been locked and silent for several minutes. An audio service continuing an already playing clip does not prove this. For apps targeting Android 15+, focus requests require the top app or a running foreground service; see [Android audio focus](https://developer.android.com/media/optimize/audio-focus).

Log whether services survive the silent gap, background fixes arrive, the coordinator runs and the new clip really starts. Keep location tracking for the active tour, including silence and manual playback pauses; stop it on End tour. Do not use a looping silent audio file, repeated timers, a debugger or a permanent charging cable to manufacture a pass. Treat battery-saving restrictions and OEM behavior as measured conditions.

If Expo cannot meet this behavior, isolate whether the failure is task delivery, service lifetime, audio focus, remote controls or player ownership. Try a bounded adapter/configuration fix and document evidence. A major switch to a different native architecture requires an owner decision with a concrete comparison. Do not move on to a polished player while this gate is unresolved.

Expo TaskManager's location delivery schedules persisted Android jobs. The app explicitly declares `RECEIVE_BOOT_COMPLETED`, required by [JobInfo.Builder.setPersisted](https://developer.android.com/reference/android/app/job/JobInfo.Builder#setPersisted(boolean)); omitting it caused the first physical Start attempts to crash natively. The build checks this permission in the final APK, along with the audio/location foreground-service permissions. The player's explicit recovery hold is unchanged; this is not automatic tour resumption.

An OS kill or force-stop may end all services. Reopening and recovery are required; automatic resurrection or uninterrupted operation after force-close is not. iOS lifecycle behavior requires its own physical-device milestone.

## Persistence and diagnostics

Persist tour/content version, stop states, selected/current clip, offset, next eligible stop, pending candidate and user-intent flags in SQLite. Commit on meaningful transitions and checkpoint the audio offset at a target interval of at most five seconds during playback; validate that interval under background operation. Do not rely on component unmount or a termination callback. A crash can replay the last uncheckpointed seconds, but must not lose saved completion/skip/pause decisions.

On launch, validate the installed package, hydrate state, reconcile unfinished effects as interrupted, and present Resume. Never reissue an ambiguous pre-crash play command automatically. Reset location quality to acquiring, obtain fresh fixes and recheck permissions before enabling arrival triggers. If the package/version is unavailable, explain and retain progress. Test writes/reopen with SQLite as well as pure reducers; audio output and DB commits cannot be assumed to be one atomic transaction.

Diagnostics include session/build/SDK/device identifiers, sequence IDs, event/sample/receive timestamps, location quality and rejection reasons, next eligible stop, separate state transitions, hold reason, requested/actual audio status and offset, asset load errors, service/permission state where observable, lifecycle observations and checkpoint success/failure. Record start/end battery and power-saving settings; do not infer service health from a stale “started” flag.

Persist useful structured events locally through the silent gap. Private raw GPS capture requires an explicitly started diagnostic session; cap/rotate logs, offer export/delete, and never upload automatically. Exported replays must include intent/audio/lifecycle events as well as fixes to reproduce race conditions. Sanitize personal coordinates/device identifiers before committing fixtures; preserve timing and route-relative geometry needed to reproduce the failure. Production diagnostics can use non-coordinate reason codes.

## Evidence and authoring

Each claim stores its text, subject, exact narration sentence/segment references, source IDs, minimal supporting passage(s) with page/section locator, publisher/title/author/date/URL/accessed date, and how each passage supports or conflicts with it. Retain rights/reuse metadata and only the passages needed for verification, not indiscriminate full-page archives.

Use explicit claim statuses. The provisional Node package checker currently implements `needs_review`, `source_checked`, `disputed` and `rejected`; `source_checked` describes review against cited evidence, not certainty of truth. Source retrieval dates and uncertainty are present. Claim-specific reviewer/method/review-date and freshness handling remain required additions before a production content package; the original `supported` / `needs_refresh` terminology was a design proposal, not the current schema. Important or contested claims need corroboration or clearly qualified narration. Folklore remains labeled. Do not replace this with a numerical model confidence or source-quality score.

Prefer heritage bodies, museums, government, academic/primary and reputable specialist sources. Discovery sources can suggest leads; the writer receives reviewed evidence and verified physical context. Check every factual sentence for unsupported, overstated or conflicting content. Missing support returns the draft for revision. Model self-verification alone is not approval in E1.

Authoring order: interpret brief → candidates/evidence → verified visitor positions → real walking route → timing/narrative plan → evidence-bound script → factual/orientation review → recorded or generated audio → measured duration/rights checks → validated local package. TTS runs once per content revision, with voice/model, pronunciation and generation metadata; pressing Play never generates speech.

## Unresolved decisions and risk gates

| Issue | Evidence/decision needed | Due / owner |
| --- | --- | --- |
| Silent-gap Android playback and task/player lifetime | Repeated unplugged development-build runs and native diagnostics on Sidi's phone; a bundled-build repeat to exclude Metro effects | M1 / engineer, Sidi walks |
| Audio interruptions/remote pause observability | Confirm actual module callbacks can enforce persistent holds; fix adapter if needed | M1 / engineer |
| OEM battery/GPS behavior | Record device/OS, gaps, late/false triggers and power use; baseline default settings before tuning | M1, M3 / engineer + physical tests |
| Offline map renderer/data and routing provider | Demonstrate a small local map, full asset coverage, route export, offline rights/attribution, cost and SDK compatibility | Before M2 package commitment / engineer; owner approves material cost/lock-in |
| Arbitrary offline rerouting | Current scope excludes it; decide only if field evidence makes stored-route recovery insufficient | After M3 / owner |
| Test area, content tone and voice | Safe local route plus curated six-stop walk, then contrasting briefs and listening/walking feedback | M1 route; M2/E1 content / Sidi with engineer proposals |
| Personalization value | E1's documented differences, enjoyment and editing burden justify or reject further automation | Before M5 / owner |
| iOS parity | Real iPhone service, permission, interruption and recovery results | M6 / engineer + physical tests |

Current official documentation was consulted on 12 September 2026. Links using `latest` can change. At M1, record the chosen SDK and dependency versions and verify the corresponding versioned APIs; this foundation does not establish device compatibility by documentation alone.

## M1 implementation record

The first native development APK was built as soon as the controls, configurable fixture, reducer, SQLite and diagnostics connected end to end. M1b added replay/crash tests, repeated-walk reset, explicit remote-control events and the self-contained APK. See [test results](docs/test-results/M1.md). A functional self-contained A/B/C walk and stationary recovery have been observed. The strict repeated locked-screen and failure-path matrix remains incomplete; M1 has not passed.

The current adapter keeps a single native player and media service through completed clips and real silence, replacing its media source for each clip. A narrow, version-guarded postinstall patch to expo-audio 57.0.5 disables its native focus-gain auto-resume, enables pause on output disconnection, routes notification/headset play/pause through explicit coordinator events and tags media generations to reject delayed status from the previous source. The patch fails on an unexpected library version or source anchor. This is an Android adapter customization, not a replacement native architecture. The first APKs incorrectly linked Expo's stock precompiled audio module, discovered in device testing on 13 September. Android `buildFromSource` now explicitly selects `expo-audio`; the build inspects native DEX markers and playback checks a native adapter revision before issuing play. See [Expo precompiled modules](https://docs.expo.dev/guides/prebuilt-expo-modules/). Actual media-control/focus behavior must still be measured in the phone matrix.

A synchronous SQL transaction saves each processed transition before effects. Native audio status arrives at a requested one-second interval while playing; the five-second recovery acceptance target still needs phone measurement. An epoch gate cancels asynchronous play/seek preparation if a later pause/end arrives. End attempts to stop location even after a storage error. Cold reopening always requires explicit tracking start/resume. Interrupted effects are not automatically replayed.

The fixture loader accepts three ordered standing positions on a recorded/imported path, retaining separate approach/viewpoint/access and optional landmark fields. It does not generate routing or certify physical orientation. Friary Park is an area suggestion only. Changed content needs a distinct version; prior fixture progress is archived locally. New walk resets current progress after confirmation, without deleting prior diagnostic events.

Diagnostics are local and bounded to 10,000 events. Exports are scoped to the current fixture and contain event timestamps, requested/observed audio state, raw fixes when opted in, reasons, snapshots and build/source identity. `tools/replay.ts` reproduces the transitions using the production reducer; raw exports must stay private until deliberately sanitized.

Navigation cues are deliberately absent from M1. The corrected M2 walking policy is to pause a story for an actionable cue and resume it only if no manual pause intervened. No visual-only fallback is treated as sufficient.

## Independent M2 preparation — 13 September 2026

The owner authorized independent development while physical M1 checks are pending. A Node-only [package preflight](tools/content/package.ts) now checks an authored versioned manifest, references, review declarations, planned leg continuity and local asset integrity. Its schema is a provisional curated-package contract, separate from the existing M1 fixture. It reuses only a pure domain distance helper; the mobile session does not import authoring tools. See [scope and limits](docs/content/PACKAGES.md).

Readiness declarations require separate standing/approach/viewpoint/access reviews, source-checked claim evidence, real route provenance, local map/audio/transcript resources and an offline renderer review. This is structural validation of recorded assertions, not proof of truth, access, resource decoding or permission. Mobile staging, atomic import/version pinning and renderer validation remain M2 work after the M1 gate. Map format alternatives in the provisional schema do not assert that an adapter supports each format.

The [Finchley draft](content/finchley/manifest.json) deliberately fails readiness: visitor positions, verified route/directions and real offline assets are missing. Short supervised E1 samples are rendered locally for desk listening only. No runtime dependency, private route upload, backend, paid provider or phone build changed. [Map/routing notes](docs/content/MAPS-AND-ROUTING.md) recommend a bounded MapLibre offline-database experiment; data rights and actual native integration remain unresolved.


## Offline guide and observations — M1 follow-up

`src/testing/guide.json` is embedded in the self-contained APK and included in the JavaScript loaded by the development client. It defines 18 cases, preparations, variants, steps and expected observations. `tools/guide-docs.ts` generates `docs/TEST-GUIDE.md` from that same source; `npm run docs:check` and the Android build reject drift. The existing roadmap remains the acceptance authority.

A React Native modal presents the guide without taking ownership of the active session. Opening, closing, beginning or saving a test never issues playback or location commands. The journal uses a separate `walking-tests.db` and the shared synchronous transactional Store: selected case, active notes/conditions and append-only completed attempts recover independently of the tour. It records source/variant, device, route identity, guide revision and start/end context; observations are not automatic acceptance decisions. It prevents overlapping attempts and an observed pass spanning a changed build/route. Corrupt data and write failures are surfaced without deleting saved records. Retention stops at 500 completed attempts pending deliberate archival; nothing is silently discarded.

The explicit test-results export is separate from precise diagnostics. Match the two using attempt times, route identity and walk timestamps. Drafts and previous failures remain available. All guide instructions work offline, while development-build, long-A timing-fixture and unscheduled-kill tests still require engineer preparation. This change does not add a fabricated short route or expand navigation.


## Named local exports — M1 follow-up

The shared export dialog serializes an immutable JSON snapshot before opening a picker. Each new export gets a type prefix, UTC timestamp and short random suffix; a monotonic process timestamp handles repeated/backwards clock readings. The user can edit a bounded filename; path separators/traversal are rejected and a `.json` suffix is normalized. Results, diagnostics and fixtures retain their existing payload schemas. Exports never issue session commands.

On Android, the existing [Expo legacy FileSystem StorageAccessFramework](https://docs.expo.dev/versions/v57.0.0/sdk/filesystem-legacy/) requests only a user-selected folder grant, creates a new JSON document, writes it and reads it back before showing success. The provider resolves duplicate names; we never open an existing document for overwrite. Cancel creates nothing; write/readback failure attempts cleanup of only the newly created incomplete document and retains the serialized draft for retry. Failed cleanup may leave an incomplete file, and the UI does not report success. The last selected folder is remembered only during the process. No broad storage permission or new dependency is added.

[Android's document-tree restrictions](https://developer.android.com/training/data-storage/shared/documents-files) prohibit choosing Downloads itself on Android 11+, so the embedded instructions use a Documents/Downloads subfolder. Cloud providers can also appear in Android's picker: instructions explicitly identify local phone storage for offline saving. Optional Share uses a private export-specific directory and the edited filename; chooser dismissal does not imply delivery or local saving. Private share snapshots remain in app storage, while deliberately saved documents remain in the chosen folder. Device-specific picker, naming and readback evidence is recorded in [M1 export results](docs/test-results/M1-exports.md); unit tests alone do not prove it.

## Local evidence intake

`tools/testing/review.ts` and `tools/review-test-exports.ts` operate only on explicitly supplied local JSON exports. They deduplicate completed journal observations, retain conflicting copies as warnings, replay diagnostics with the current policy and suggest candidates by source/fixture/time overlap. These are evidence aids, not acceptance decisions or proof of complete coverage; variant, audibility and locked-screen conditions still require review. Notes and coordinates are omitted from the report, but filenames and times remain private. No mobile import, native dependency or phone behavior is changed. See [review procedure](docs/TEST-EVIDENCE-REVIEW.md).

## M1 field-test audio preparation

Guide revision 4 supports a separate timing fixture using the original path/standing positions and optional `audioProfile: "edge-long-a"`. Its A is one locally rendered 6:21 speech asset. B/C and normal A are unchanged. This replaces the need to invent a shorter route for the two unfinished-narration field cases; their acceptance behavior is unchanged. Original fixtures omit the optional field so serialized recovery identity is preserved. Edge copies have separate IDs and archived progress. Audio preparation keys its cache by explicit asset filenames (`edge-a-v1` versus normal `0`); switching back must select normal A even in the same process. No looping, silent keepalive, trigger-policy or native changes. Normal locked-silence baselines must use standard clips. Physical timing remains to be tested.
