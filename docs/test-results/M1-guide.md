# M1 offline guide delivery and documentation audit

Historical record: this preserves the build, observations and open cases at the time of this check. M1 completed on 15 September 2026; use the [closure record](M1-closure.md) and [completed checklist](../PHONE-CHECKS.md) for current status.

13 September 2026. M1 remains **implemented; awaiting physical test**. This follow-up adds test instructions and observation records; it does not pass the walking matrix.

## Implementation

- All 18 cases are embedded in the self-contained app and available in the development client after loading its JavaScript: preparation, required build, procedure, expected observation, shared setup and export instructions.
- The guide distinguishes independent cases from engineer preparation. No short-approach route is fabricated or installed by this change.
- Begin an attempt, save conditions/notes as typed, retain unfinished work across reopen, and append an observed pass/fail/inconclusive result. Original failures remain visible.
- A separate SQLite journal records guide revision, build/device/route identity, attempt times and walk context. Guide operations do not issue player/location commands or reset tour progress.
- Wrong-build starts, simultaneous attempts, empty observations and observed passes spanning a build/route change are rejected. Read/write errors preserve existing records. Results export only on request to a separate JSON.
- One guide content file drives both the app and generated Markdown. Documentation drift fails `docs:check` and the Android build. The offline APK verifier checks embedded guide strings, journal identity and the three clips, alongside the existing native checks.

## Automated verification

Typecheck and lint pass. All 54 tests pass (48 previous plus six guide contract/storage tests). Real SQLite close/reopen retains unfinished notes and completed results; injected write failure leaves the previous durable note intact. Tests cover separate progress/log preservation, repeated attempts, build/route mismatches and corrupt-data handling. The generated guide matches its source.

Expo dependency compatibility passes; Expo Doctor passes 21/21. Both Android variants assembled and signatures/native markers/location permissions passed. The self-contained bundle also contains all guide markers and three clips. File/code tests do not establish real walking, audibility or subjective usability.

## Documentation audit

The local history shows maintained setup/result documentation across the native audio correction, self-contained handoff, location-job crash fix, successful field walk and independent content preparation. This maintenance was not perfectly consistent: appended results were more current than some overview text.

Corrected in this change:

- Architecture's stale date and statement that all physical operation was unverified; it now acknowledges the functional walk while retaining the open full gate.
- The old speculative folder diagram; it now reflects actual source boundaries and explicitly identifies the absent mobile importer.
- Claim-status terminology: current provisional checker statuses are distinguished from the original proposal. Claim-specific reviewer/method/date and freshness remain future content-package work, not falsely documented as implemented.
- README's broad pending wording; it now distinguishes observed cold-start/recovery/walk results from incomplete acceptance.
- The documentation-only test handoff: README, Product, Architecture, Roadmap, operating instructions, first-walk guide and phone checklist now describe the bundled guide and its limits.

The original brief remains unchanged. Historical result records retain their old build hashes and results; they are not rewritten as if they tested this build. The earlier M2 preparation record remains a dated account. The generated guide prevents procedure-text drift; it does not automatically update human acceptance decisions or remove the need for future documentation review.


## Guide build and connected-phone checks

Runtime source ID: `1e73fe362e3e0d65`. Self-contained APK SHA-256: `dff58ee50d4e760de662ded3651a42e03675bb477b08a6afb0479f9770bb8c61`. Development APK SHA-256: `ad9d843bc708c1c329e05508fae1e3abb4fb49c4104980a74c753dcf670eb3d6`; its native binary is unchanged because the guide is JavaScript loaded through Metro. It does not embed that guide for a cold launch. The self-contained APK does embed it.

Installed with `adb install -r` on Pixel 6 / Android 17 without uninstalling or clearing storage. Before and after installation, the existing three-stop route had 10 recorded points, no unplayed stops and tracking stopped. Opening the guide did not start tracking or change playback progress.

The engineer entered “Engineer UI smoke check. No walk performed.” into an unfinished attempt. With Metro absent and Wi-Fi/data disabled, force-stop/reopen recovered the guide, selected case and exact note; Android reported no active default network. Original Wi-Fi/data settings were restored. This checks stationary offline guide recovery, not an active-walk or audio acceptance result. The UI check is saved as inconclusive and explicitly labelled, so it is not a historical walking pass.

Saving the inconclusive result displayed it in retained history. Export generated `walking-test-results.json` and opened Android's file share chooser; the engineer cancelled without sending it to a recipient or external service. This verifies creation/chooser handoff, not successful saving by every possible recipient app. The phone was left on the player with tracking stopped, the original route retained and no unplayed stops. The installed APK checksum matched the new self-contained artifact; no app entry appeared in the crash buffer for the guide-install/check interval.

The guide alone does not complete all preparation: development-baseline/recovery sessions still require Metro setup, and early-arrival/passed-pending tests require a checked short-approach fixture. No new real walk, audible playback, audio interruption or physical acceptance result is claimed in this follow-up.

Follow-up: the original chooser-only export above prompted the [named direct-save change](M1-exports.md). This historical result describes the earlier guide APK; use the follow-up record for the current export behavior and build.
