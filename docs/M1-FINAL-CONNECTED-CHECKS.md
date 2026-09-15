# Final M1 connected session

Completed 15 September 2026. **M1 complete.** All five connected cases passed within the [recorded scopes](test-results/M1-closure.md), and the loading-checkpoint correction passed automated and installed-device checks. The plan below is retained as a regression procedure; no owner action or further walk is pending.

The engineer operates the device, captures evidence and restores the self-contained build. Allow roughly 20–30 minutes of connected availability, subject to installer prompts or failures; Sidi should only need a few minutes of listening and any unlock/authorization prompts. Stop and preserve state if the phone disconnects, another app unexpectedly takes the foreground, or evidence is ambiguous. Do not substitute a successful build or replay for physical recovery.

## Prepare once

- Confirm the correct phone and actual installed build. Record original network, Battery Saver, app battery policy and relevant settings before changing anything.
- Preserve route, current progress, journal and prior diagnostic exports. If a matching development APK is temporarily required for a read-only private backup, never launch it before backup, and restore the self-contained APK before testing its recovery. Never reinstall between a checkpoint and its recovery assertion.
- Use the existing edge fixture for a long enough spoken clip. Create a distinct guide attempt and explanatory notes through the UI, without overwriting prior results. Test data and raw logs stay local/ignored.
- Verify offline conditions when required, cache readiness and live location before termination. Export before changing fixtures/variants. Deliberate manual playback may exercise recovery at the desk; it is not an automatic walking arrival.

## Group A — self-contained recovery

1. Complete one stop and deliberately skip another; play the remaining clip, recording offset. Save distinctive conditions/notes in an active guide attempt. Test offline force-stop/reopen with no intervening installation: completed/skipped states, offset within five seconds, active attempt and exact notes must recover; no unsolicited speech. Include a saved manual hold. This extends the already accepted force-stop coverage.
2. Test actual swipe-away from Recents separately with an active session. Record service/audio behavior on this phone; deliberately reopen and verify progress/hold and no unsolicited replay. Do not silently substitute `am force-stop` or assume swipe-away kills the process.

## Group B — transient focus return

Use the [bounded focus companion](../tools/android-focus-probe/README.md) to request and relinquish actual Android transient focus. This avoids arranging a call. Require native evidence of loss **and return**, narration staying held after return, then audible continuation only after explicit Resume. Sidi confirms what they hear. Keep telephony-specific behavior outside the claim.

## Group C — development recovery and unscheduled kill

1. Export/back up the completed self-contained checks, install the matching development APK without clearing data and load its current bundle from Metro. Prepare known completed/skipped progress, active guide notes, offset and hold.
2. Terminate and deliberately reopen the development app. Record any Metro dependency; do not call this offline cold start. Verify durable state and intentional Start/Resume.
3. Use an engineer-controlled process kill without orderly End (for example an app-UID SIGKILL on the debuggable variant); retain native exit evidence that distinguishes it from force-stop. Verify checkpoint recovery, offset loss within five seconds and no unsolicited replay. Combine the saved progress/note assertions, but record this termination mechanism as a separate result. Never clear app data.

## Finish

End tracking; export and replay each new segment; compare original fixture/journal/history preservation. Restore the self-contained APK and original phone settings, remove the temporary focus companion, and verify a silent offline cold reopening with Metro stopped. Review all five cases against their evidence. Fix failures and repeat only affected checks. Update the working checklist/result record and commit coherent changes. Mark M1 complete only if the remaining acceptance criteria actually pass; otherwise state the precise open case.

Preparation checks: TypeScript, lint and all 78 existing tests passed on 15 September; the focus companion compiled and its signature/permissions were checked. These were preparation results, not connected acceptance. The phone was not detected at that stage. The later [closure record](test-results/M1-closure.md) supplies actual device/audible evidence, the 79-test final suite, corrected APK identity and self-contained handoff.
