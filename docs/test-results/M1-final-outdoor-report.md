# M1: final outdoor batch review

Historical record: this preserves the build, observations and open cases at the time of this check. M1 completed on 15 September 2026; use the [closure record](M1-closure.md) and [completed checklist](../PHONE-CHECKS.md) for current status.

15 September 2026. **Stay-at-B early arrival and Battery Saver accepted. The planned M1 outdoor batch is complete.** M1 remains implemented; awaiting physical test because connected lifecycle/interruption checks remain open.

## Owner observations and intake

Sidi reports both runs worked as expected. Battery Saver was completed first and remained enabled for the subsequent long-A walk. That condition does not invalidate early-arrival coverage: this case tests pending playback release, not an ordinary-settings baseline. No repeat is requested solely for this setup difference.

The phone was initially unavailable; reconnection allowed read-only collection of both original exports and app-scoped native exit records. No app installation, setting, progress or fixture was changed. Raw coordinates and exports stay in ignored local diagnostics. No saved guide-result export accompanied these two diagnostics; the owner's conversation supplies audible observations.

Both exports identify self-contained source `aaa261ee84596b55`, Pixel 6 / Android 17 and corrected route version 2. The first uses standard clips; the second uses `edge-long-a` with the shortened asset. Both start with fresh progress, precise/background permissions granted, `lowPower: true` and the existing desired 2-second / zero-displacement location request. Neither uses manual playback, Pause, Resume or Skip during the walk.

## Battery Saver — standard A/B/C

Run duration: 8 minutes 18.170 seconds. A, B and C each started once and completed naturally before End. The two actual silence intervals were **239.576 seconds** and **213.747 seconds**. B and C began 148 ms and 195 ms after their respective confirmed arrival events; these are software latencies, not measured physical-arrival delays.

The app briefly backgrounded and returned during A, then remained continuously backgrounded from shortly after A ended until after C finished. Before B there were 236.568 uninterrupted background seconds; the entire second silence interval was backgrounded. Lifecycle evidence alone cannot prove screen lock or disabled network. Sidi explicitly confirmed Wi-Fi/mobile data were off, the screen was locked from shortly after A until C finished, and no arrivals were noticeably delayed. This supplies the physical conditions missing from lifecycle logs and closes the Battery Saver case.

Battery readings were approximately **98% → 97%**. There were 246 usable fixes, median interval 2.001 seconds and maximum interval 6.365 seconds, plus one rejected initial stale fix. There were no wrong/duplicate clips, off-route events or audio errors. This is one short run on this phone; the coarse battery percentage does not establish all-day endurance or other devices' power-saving behavior. App-specific battery policy was not captured in the export.

## Stay at B until A ends — long A, Battery Saver still on

Run duration: 3 minutes 46.398 seconds. Pending B arrival was confirmed while A was speaking, **19.007 seconds before A completed**. Ten successive fixes retained the pending arrival. A finished naturally at a reported offset of 210.001 seconds; the final preceding fix was 0.987 seconds old and about 7.2 m from the stored B point, inside the arrival area.

A's completion issued one B play effect, and native playback began **115 ms later**. B finished naturally before End; C remained unplayed as expected. There were no overlapping requests, pauses, manual substitutions, stale-position delays or audio errors. The app remained backgrounded from shortly after A started until after B completed. Combined with the owner's successful physical/audible report, this closes the stay-at-B early-arrival case. Battery Saver stayed on by owner report and was logged enabled at Start.

Battery readings were approximately **97% → 96%**. There were 112 usable fixes, median interval 2.004 seconds and maximum interval 3.046 seconds, plus one rejected initial stale fix. Do not interpret the rounded one-point change as a precise energy comparison with the longer standard walk.

## Automated and native verification

- Full cumulative exports reproduced: standard 596 transitions / 3 segments; edge 1,168 transitions / 4 segments. Earlier attempts are historical context, not additional passes.
- Isolated latest runs reproduced: standard **304 transitions / 1 segment**, edge **351 transitions / 1 segment**. Both have continuous stored sequence numbers from Start through session-end.
- App-scoped exit history has no exit during either outing. Latest preceding entries were deliberate installation/force-stop preparation; the historical developer-menu crash is not attributed to these walks.
- Documentation-only changes: checked the diff and guide parity; no new app build or physical session was needed to review these exports.

Private evidence directory: `diagnostics/final-outdoor-2026-09-15/`. Original standard export: 1,250,107 bytes, SHA-256 `0e5069ac81a06c9233395d5c946e85d266e7f216424ce42aa2a827d663887b65`. Original edge export: 2,460,600 bytes, SHA-256 `ae1e8d1e560c4fb4a6b1419c7115459424c72bd7a9e8ce5d64579a80a40e617d`. The isolated files are review derivatives; originals remain unchanged on phone and Mac.

## Remaining scope

No additional outdoor walk is requested. The planned outdoor batch is closed. The existing connected cases remain: temporary interruption with actual audio-focus return, skipped-stop/guide-note recovery, swipe-away, development recovery and unscheduled process kill. Keep M1 open until those criteria are met. No new test category is introduced.
