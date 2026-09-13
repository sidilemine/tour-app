# Roadmap

Status: 13 September 2026. M0 is complete; M1 is implemented and awaiting physical acceptance. This roadmap supersedes the original brief's ordering: lifecycle reliability comes first, and the supervised AI experiment runs alongside early curation. Each implementation assignment ends in appropriate tests/debugging, updated documents and a coherent local commit.

“Implemented; awaiting physical test” is a valid intermediate status, not a passed milestone. Only actual result records can establish device behavior or enjoyable content. Do not treat the whole roadmap as authorization to implement all future work.

## Milestone 0 — foundation

**Status: complete.** Original brief read in full and preserved; folder/toolchain inspected; current official background/build documentation reviewed. Created README, PRODUCT, ARCHITECTURE, AGENTS, ROADMAP and .gitignore. Git is initialized locally with the foundation committed; no remote or publication.

Acceptance: documents agree with the owner's revisions, link to each other, distinguish known setup from untested behavior, and specify M1 concretely. No application code, package scaffold or cloud infrastructure added. Foundation checks cover file/link consistency, ignore behavior, brief integrity and Git diff/status; no phone test is claimed.

## Milestone 1 — Android audio and location lifecycle spike

**Status: implemented; awaiting physical test.** Outcome: establish whether one installed development build can play a clip, stay locked through several minutes of actual silence, and automatically start the next clip on real arrival. This gate precedes map polish and the six-stop player's implementation.

Implementation/build evidence: [M1 result record](docs/test-results/M1.md). For the first attempt use the short [first-walk checklist](docs/FIRST-WALK.md); subsequent open checks are in the [working phone checklist](docs/PHONE-CHECKS.md). All criteria below remain required. Both build variants have been installed and launched on Sidi's Pixel 6 (Android 17/API 37), with the self-contained variant left installed for independent use; stationary media controls and offline force-stop recovery have also been checked, while the full walking/lifecycle gate remains pending.

The M1 follow-up adds a bundled [offline test guide](docs/TEST-GUIDE.md) and persistent attempt notes/results, with independent and engineer-prepared cases distinguished. See [guide delivery evidence](docs/test-results/M1-guide.md). The full criteria below are unchanged.

### Delivery stages

1. **M1a — first installable vertical slice:** configurable three-stop fixture, live background fixes, owned local audio, Start/Pause/Resume/manual/End controls, basic SQLite progress and diagnostic export. Build and attempt installation as soon as these connect end to end. Deliver a short first-walk checklist.
2. **M1b — complete independent work:** harden arbitration/recovery, replay and SQLite failure tests, prepare the self-contained APK, retain the full physical matrix below and document all pending evidence.
3. **Physical acceptance:** keep M1 at “implemented; awaiting physical test” when independent implementation is done. An initial successful walk does not satisfy the full criteria.

### Bounded implementation

- Scaffold a single Expo/React Native/TypeScript app with pinned dependencies, npm scripts and installed `expo-dev-client`. Record Android package ID, SDK/target SDK, build variant and tested phone/OS.
- Use a small owned test fixture with three safe standing areas A/B/C, two verified walking legs and three short local spoken clips. Choose B/C so each leg permits at least three minutes of silence after the preceding clip. Check approaches and access in daylight. A simple route/debug display is enough; no production map vendor is required.
- Register background location and configure audio/lock-screen services. Start them while visible, confirm actual readiness, then allow the locked walk. No live TTS, LLM, backend, silent-loop audio or artificial location injection in the physical pass.
- Build the minimal pure route matcher (known path, usable-fix persistence, next-stop gating, hysteresis and duplicate suppression), separate state domains, scheduler/holds and SQLite checkpoints. Avoid implementing the whole future matcher.
- Provide Start, Pause/Resume, End tour, automatic narration on/off, manual stop play/skip and local diagnostic export. Capture actual audio results as well as requested actions. Manual pause during silence must be possible from the app; keep remote controls usable where supported and verify behavior.
- Produce the installed development build **and** a self-contained locally sideloaded release-variant test APK for offline cold-start/recovery verification. [README.md](README.md#install-and-take-the-first-walk) explains the difference. The second build supplements the development-build test; it does not replace it.

### Automated acceptance

- Typecheck, lint, unit/replay and storage tests pass; Expo dependency compatibility checks pass. Record exact commands/results.
- A deterministic fixture drives clip A completion → at least three minutes with no playing clip → usable fixes at B → one play request. Reject a single jump, stale/out-of-order fixes and repeated arrival callbacks.
- Event replays cover manual Pause versus arrival in either order, pause during silence, arrival during unfinished audio, leaving a pending stop, interruption then focus return, explicit Resume with automatic narration disabled, manual skip/replay and restored state. No automatic event clears a persistent hold.
- SQLite close/reopen tests recover tour/version, completed/skipped IDs, clip/offset and holds; inject interrupted writes/effects. Do not depend solely on an in-memory mock or a lifecycle shutdown callback. Completed stops do not automatically replay after restart.
- Exported diagnostic events can be replayed with the same reducer/matcher; results are deterministic without network or real-time sleeps.

### Physical phone procedure for M1

The engineer prepares the builds, fixture, diagnostics and result template. Sidi performs the walk and phone permission/USB prompts. The engineer diagnoses failures and converts reproducible traces into regression tests.

1. **Record conditions.** Build/commit/variant, actual phone model and Android version, target SDK, battery percentage, battery-saver/app battery setting, permissions (precise/background), location settings, speaker/headphones and network state. Start with ordinary battery settings and no debugger. Use a safe route; stop moving before screen interactions.
2. **Prepare while connected.** Install the development build, load its JavaScript, import/cache every test asset in durable local storage and verify they open. Grant permissions and start an explicit diagnostic walk. Wait for fresh usable fixes and service readiness. Start clip A.
3. **Remove development support.** Disable Fast Refresh, unplug USB, stop Metro on the Mac, turn off Wi-Fi/mobile data on the phone while leaving location enabled, and lock the screen. The app must already be loaded; do not reload the development client during this run.
4. **Exercise the critical gap.** Hear A finish. Keep the screen locked, walk for **at least three minutes of genuine silence** (target 3–5), then enter B's verified standing area and wait up to 30 seconds. B must begin audibly once without unlocking or pressing Play. Do not use a silent track or merely mute a continuously playing clip. Repeat B → C with another silent interval of at least three minutes. Record actual gap and arrival/play timestamps.
5. **Repeat baseline.** Use End then New walk/reset between independent attempts. Obtain three consecutive successful walks (six silent-gap arrivals in total) under recorded baseline conditions. No wrong, duplicate or out-of-order clips; no unlock required for arrival. The 30-second arrival window is an initial usability criterion for this controlled route, not a universal GPS promise. A late/missed trigger is a failed test even if manual fallback works.
6. **Test holds and contention separately.** Pause in-app mid-clip, then pause from lock-screen/headset controls where available. Walk into the next stop and wait at least 60 seconds: silence must continue until explicit Resume. Also pause during a silent gap. Test early arrival while a preceding clip is longer than the approach (a separate checked fixture with B near A lets the existing 11-second clip exercise this without long TTS); it must finish without overlap, and the pending clip may start only if still appropriate. Pass the pending stop and verify no stale backlog plays.
7. **Test interruptions and degradation.** Use a call or competing audio app, disconnect headphones/Bluetooth, deny/revoke location, turn location off/on and leave/rejoin the known route. Interrupted audio stays paused until explicit resume; denied/poor location leaves manual playback usable. Inspect power-saving behavior in a separately labeled run; do not silently change battery settings to claim a default-settings pass.
8. **Test reopening.** First verify persisted progress after terminating/reopening the development build, reconnecting to Metro if required and recording that dependency. Then install the self-contained build, verify a cold launch with Metro stopped/data off, repeat the locked silent-gap test, and test termination/reopen offline. Use Android Settings → Apps → this app → Force stop, then reopen from its icon. Check saved offset (target no more than five seconds of lost narration position), completed/skipped stops and manual hold. Test swipe-away separately because it is not equivalent to force-stop on every device. Never uninstall, clear storage or reinstall between a checkpoint and its recovery assertion.
9. **Collect evidence.** Export local logs, reconnect for native logs if necessary, record end battery, and review failures with service/task, fix, trigger, playback and checkpoint timestamps. A debugger/USB-only pass or missing logs through the silent interval is inconclusive. Keep raw traces private; commit a sanitized result summary and approved replay fixture.

### Exit criteria and failure handling

M1 passes only when automated checks and the physical procedure meet their criteria, including durable recovery and persistent manual pause. Store a result under `docs/test-results/` with build/device/conditions, each case's expected and actual result, silence duration, trigger latency, log references, failures and retest results. Those files are created with the implementation, not fabricated at foundation stage.

If the combined scenario fails, isolate service lifetime, permissions, task delivery, audio focus and player ownership. Fix within the adapter boundary and retest. If a substantial native replacement is required, present the smallest tested alternative and tradeoffs for owner review. Keep M1 open or explicitly blocked with evidence; do not silently redefine success as screen-on playback. M2/E1 content desk research can still proceed independently of device debugging.

The first reported field attempt on 13 September failed with native crashes at Start. The missing persisted-job permission is corrected; the failure and device retests are recorded in [M1 results](docs/test-results/M1.md). A subsequent self-contained walk triggered and completed A/B/C once, with no crashes/duplicates reported. Diagnostic replay confirms automatic B/C arrivals and silent gaps of 189.603 s and 170.728 s; the second is short of the three-minute criterion. Brief foreground lifecycle entries also require a controlled locked-screen repeat. The full physical gate remains open.

## Milestone 2 — curated six-stop offline walk

**Status: preparation in progress; player work follows M1.** Sidi authorized independent progress while away on 13 September. Implemented a local package preflight with failure-path tests and a sourced six-stop editorial draft. Map/provider comparison is documented; mobile import, map rendering and routed/verified walking content remain unimplemented. See [preparation results](docs/test-results/M2-preparation.md). This does not pass or bypass M1.

Deliver a validated versioned package, durable local import, a local map with full renderer assets, verified planned walking legs/directions, six narrated stops, transcripts, source/rights display and clear manual controls. Compare offline map/data and routing options before commitment; present any material cost or lock-in for owner review. Use owned audio initially if voice selection would delay the walk.

Acceptance:

- Six stops have separate landmark, standing, approach, viewpoint and access data; physical instructions and operational constraints have review status/date. Missing critical verification blocks readiness.
- Each factual passage maps to reviewed claims and supporting source excerpts. Audio duration fits its stop/leg budget, including reserved navigation time and silence. Image/voice/map rights are recorded.
- With network off after import and a cold launch, local map, planned route, directions, audio, transcript and progress recovery work across the entire tour area. The app explicitly handles leaving map coverage; it does not promise arbitrary offline rerouting.
- Reject incomplete/corrupt/unsupported packages; an interrupted import preserves the working version. Test retained progress against pinned content versions.
- Sidi completes the six-stop walk with manual controls and automatic arrivals, recording route/content/UX defects. Fix blockers before calling the curated prototype complete.

## Experiment E1 — supervised AI brief comparison

**Status: desk preparation complete; supervised experiment pending.** [Two contrasting briefs](docs/content/E1-BRIEFS.md), candidate sequences and three short local listening samples per variant are prepared. Real routed plans, physical verification and Sidi’s listening/walking feedback remain outstanding. This is a parallel learning track, not delegated agent work or an automated factory.

Prepare two contrasting briefs for the same area and comparable duration, start/end and access constraints. Suggested contrast: engineering/architecture versus ordinary lives/unusual stories. Let the brief affect candidate selection, route and narrative, rather than forcing identical stops. Preserve a curated baseline for comparison. If E1 finishes before the player, use reviewed route sheets and local recordings to walk/listen without waiting for app features.

Deliver local briefs, candidates/rejection reasons, real-router route outputs, verified visitor positions, claim/passage evidence packs, scripts and short recorded/generated samples. Keep the process supervised and review every candidate route and final factual/physical instruction. Use existing authorized tools; obtain approval for meaningful paid usage before generating it. Record effort, editing and approved costs rather than assuming production economics.

Acceptance and decision gate:

- Each variant has a complete feasible walk plan and at least three narrated sample stops. Compare against the curated six-stop baseline using the same time/access envelope.
- Before listening, identify at least two substantive predicted differences (stop/route choices, visible details, thematic arc or pacing). Sidi can describe the differences after trying both; stylistic wording alone does not count.
- Sidi walks/listens to both and records brief fit, enjoyment, orientation clarity, factual trust, pacing and “would choose this walk” with concrete examples. Record presentation order to expose possible order/familiarity effects. Optional ratings are subjective feedback, not claim-confidence scores.
- Record all unsupported assertions, corrections, route/access failures, pronunciation issues and editing time. No unreviewed physical or factual claims go into the walked samples.
- Write a short outcome: **proceed**, **revise and repeat**, or **do not automate yet**, with rationale. These are exploratory findings from a small sample, not statistical proof. Do not build the full automated factory without a positive owner decision based on this evidence.

## Milestone 3 — replay and walking hardening

**Status: planned after M2.** Expand route matching and recovery only in response to field failures.

Acceptance: replay fixtures for noisy streets, parallel paths, self-crossing route, reversal, coffee stop, lost signal, implausible speed, skipped/ahead stops and restart have explicit expected events. Sanitized field failures reproduce before the fix and pass after it. Repeat the full six-stop walk offline with screen locked, interruptions and saved recovery. Report trigger mistakes, manual fallback use and battery change with conditions; fix unacceptable failures and agree remaining limits with Sidi. Recheck the M1 gate after relevant native/SDK changes.

## Milestone 4 — local tour compiler

**Status: planned after the authored package and walking behavior stabilize.** Build local TypeScript tooling from authored inputs to the existing package format; no server.

Acceptance: a fixture compiles repeatably; normalized real-routing outputs determine timing before writing; measured audio durations enforce budgets; missing assets, evidence, physical verification or rights fail validation. Cache reusable outputs within this project where permitted. Demonstrate a different provider fixture without changing playback. Emit a local package for import; publication is a separate authorization.

## Milestone 5 — bounded content automation

**Status: gated by E1's positive decision and M4.** Automate only demonstrated useful stages: evidence collection/review, selection/routing, narrative planning, evidence-bound writing/verification, pronunciation, TTS and assembly.

Acceptance: stage inputs/outputs are inspectable, repeatable/cached and independently retryable; factual sentences retain evidence passages and review states; unsupported claims/physical instructions block package readiness. Audio is generated once, duration checked, and the package plays with generation services unavailable. Track actual usage/cost against an approved budget. Human review remains where E1 shows it is needed. No city-wide knowledge base or backend is implied.

## Milestone 6 — iOS device parity

**Status: planned once Android behavior is stable; can precede M5 if product priorities change.** Use the same domain/package while implementing platform-specific permissions and lifecycle adapters.

Acceptance: repeat the locked silent-gap, remote pause, interruption, offline and termination/reopen matrix on a physical iPhone. Simulator results alone are insufficient. Record signing/toolchain needs at this milestone, not as Android prerequisites.

## Later, only when needed

Private sharing/download hosting, accounts/sync, wider generation UI and a reusable city knowledge base need concrete demand and separate infrastructure/cost/publication decisions. Driving, live AI, optional branches, dynamic closures and arbitrary offline rerouting each require explicit scope. Do not add their code to earlier milestones for hypothetical reuse.
