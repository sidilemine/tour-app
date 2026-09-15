# M1: corrected detour and long-narration pass/return

Historical record: this preserves the build, observations and open cases at the time of this check. M1 completed on 15 September 2026; use the [closure record](M1-closure.md) and [completed checklist](../PHONE-CHECKS.md) for current status.

15 September 2026. **Corrected detour/manual fallback/paused return and pass-pending cases accepted. Stay-at-B early-arrival release and Battery Saver remain open outdoors. M1 remains implemented; awaiting physical test.** The owner reports a prompt corrected-route return, silence after passing B while long A played, and automatic B after walking back. The saved exports support those observations. One run does not exercise both outcomes of the unfinished-narration case.

## Preserved evidence and scope

Two new files were copied read-only from the connected Pixel 6. Phone/local SHA-256 values match. Both identify self-contained source `bb0a0e3554c55ed7`, Android 17 and corrected fixture version 2; one standard, one `edge-long-a`. Each includes its earlier connected readiness session; only the last Start is counted as the new field run. No app, fixture, progress, settings or guide record was changed during this review. Original precise exports remain ignored/private.

| Export suffix | SHA-256 | Full / isolated replay transitions |
|---|---|---|
| `2026-09-15T16-07-09-967Z-d6hwv8.json` | `45c5500cbc4748f0ba51a952ac8548da2c12b0b6dd61397a80a6a5e75dc91121` | 292 / two segments; 259 / one |
| `2026-09-15T16-18-43-634Z-f5sy6e.json` | `8887069a2cbcfcfbbe7d0eb9d90efafd1b9e6100b47b0c5fa1348a7aba67bc77` | 760 / two segments; 643 / one |

All four production replays pass. No new guide-results file was found; audible and physical observations come from the owner conversation. Both sessions report precise/background location granted, desired two-second/zero-displacement requests and Battery Saver false. Start battery was 92% and 90%; no end-battery or new network/output claim is inferred. Neither run has an audio error or process-reopen event. App-scoped exit history has no termination during these outings; the latest exit is the deliberate 14:23 preparation force-stop.

## Corrected detour: 17:00:26–17:07:07 BST

- A completed at 17:00:38.226. Actual off-route classification began at 17:03:46.714, 47.4 m from the corrected route.
- Manual replay A started at 17:04:22.410 and completed at 17:04:33.433. Pause was explicitly pressed at 17:04:34.669, while about 103 m from the route. A remained completed; replay did not undo progress.
- At 17:05:14.368 a fresh fix returned within the configured corridor (42.8 m); the reason immediately changed to between-stops. The manual hold remained. Sidi reports it recognised rejoining well. This supports the corrected route; it is not a surveyed exact-centreline rejoin timestamp or a blanket physical-access verification.
- B dwell began at 17:06:42.653 and held arrival was confirmed at 17:06:46.661. B stayed silent until explicit Resume at 17:06:54.157, then native playing began at 17:06:54.335: **178 ms after Resume**. B completed at 17:07:05.594; End followed. No duplicate/wrong clip; C remained unplayed.
- There were 198 usable callbacks over 398.870 seconds, median interval 2.010 seconds, maximum 5.356 seconds; one initial stale fix was rejected.

The log establishes 7.496 seconds between recognised held arrival and Resume. The procedure suggested 10–15 seconds at B for fresh fixes; no precise physical wait was supplied. Accept the detour/manual-fallback/hold result on observed fresh fixes and uninterrupted manual intent, without claiming a 10–15-second physical wait. The separate full 60-second pause tests already have their own accepted evidence. No further detour repeat is requested. Naturally poor/lost GPS was not exercised and remains a conditional observation, not a new required walk.

## Long A: pass B, then return, 17:11:03–17:18:40 BST

A started at 17:11:03.225. B became pending at 17:13:54.699 while A continued. The pending arrival was retained through 19 fixes, then cleared at 17:14:32.675 when distance from B exceeded the 40 m retention radius. A continued without interruption or overlap and completed at 17:17:24.382, native offset 381.047 seconds. The latest fix then placed the visitor **69.7 m from B**. B stayed unplayed; no stale queue ran.

After returning, fresh B dwell began at 17:18:06.642. Arrival was confirmed at 17:18:12.664 and native B playing began at 17:18:12.839, **175 ms later**, without manual Play/Resume. B completed at 17:18:24.100. C stayed unplayed. There were 229 usable callbacks over 456.694 seconds, median interval 2.0055 seconds, maximum 2.332 seconds; one initial stale fix was rejected.

This **passes the pass-pending case**, with additional evidence that a new valid return arrival can play the still-unplayed B once. It does not pass the other branch: remaining at B when A ends and releasing B directly on audio completion. Here B started about 48 seconds after A finished, following a fresh physical return. That distinct short stay-at-B case remains; it does not require C or three minutes of silence. Use the same long-A fixture, arrive while A speaks, and stay until both clips finish naturally.

## “Off route” while walking towards C: known diagnostic limitation

The matcher uses the incoming leg of the **next unplayed stop**. While B remains unplayed, it still projects fixes onto A→B. Once B begins, the eligible stop becomes C and matching switches to B→C. The app currently reuses `off-route` for distance over 45 m from the eligible leg, even when the visitor is on a later part of the tour.

All 97 off-route fixes in this long-A run were within **4.6 m of the stored B→C path** (minimum approximately 0.02 m). At A completion, the latest fix was only 0.49 m from that onward path, but 68.2 m from the eligible A→B leg. This confirms a misleading whole-route interpretation of the label, not another sparse-path error or a missed native update. The playback behavior was correct: passing B does not complete/skip it or authorize C; a fresh eligible B return can play it.

Keep the full-route diagnostic distinction separate from arrival eligibility in the subsequent player work: describe an on-route visitor beyond an unplayed stop as ahead of the pending stop, reserving off-route for actual departure from the planned path. Do not replace the trigger projection with a whole-route nearest match, which could weaken sequence/crossing protection. This wording/status improvement is recorded and **not implemented in the phone build**; it does not require repeating passed walks. No trigger/radius/native change was made during this review.

A synthetic-coordinate regression covers pending B, passage on the onward route, A completion without stale B/C playback, and a fresh return requiring dwell before one B play. Existing early-arrival tests cover the alternative completion-at-B branch in automation; the physical branch remains pending. TypeScript, lint and 78 unit/replay/storage tests pass. TypeScript discovery now excludes ignored private diagnostics/build/toolchain directories while retaining Expo’s existing exclusions: copied local analysis scripts had otherwise entered the app typecheck. Committed app/tools/tests remain checked. The new geometric assertion uses the existing nanometre tolerance for floating-point projection rounding; playback and dwell assertions stay exact. Guide parity, relative links and whitespace checks pass; no Android rebuild was needed.
