# Four remaining outdoor checks

Prepared 15 September 2026 after accepting the three development baselines. These are the existing remaining outdoor cases. The self-contained app can run them without Metro, including after reopening. M1 remains implemented; awaiting physical test.

Latest review: [cases 1 and 3 passed](test-results/M1-corrected-detour-and-pass-pending.md). Only **case 2 (stay at B until long A finishes)** and **case 4 (Battery Saver)** remain outdoors. The original four-case instructions below are retained for reference.

## Files and preparation

Use **Documents / Walking Tour Remaining**, not the older Walking Tour Morning folder:

- `01-standard-walk.json`: STANDARD CLIPS, corrected route version 2, original A/B/C standing coordinates.
- `02-edge-tests-long-A.json`: EDGE TEST, matching corrected route version 2, A speaks for approximately 6:21.
- `00-Four-tests.txt`: these instructions, readable offline.

The route line was reconstructed from the first successful baseline trace and compared with the other two. Its physical verification status remains unverified; it follows the previously walked path but does not establish new access or orientation. The original files and progress remain preserved. Check current path access as usual.

Start with Battery Saver off, Wi-Fi/mobile data off and Location on. The corrected standard fixture should be selected, stopped and ready for a new walk. Use the same audio output for the batch and record which one. The embedded guide revision 4 contains the individual procedures, but its old seven-case overview and **Walking Tour Morning** folder reference are historical: use this four-case plan and the **Walking Tour Remaining** files instead. Do not repeat the three completed baseline cases.

For each test: select the fixture first, New walk / reset progress, begin the matching Offline test guide attempt, then Start in the player. Stop safely before reading the screen. End and export before changing fixtures.

## 1. Detour and paused return — STANDARD CLIPS

1. Start at A; let A finish. Before B, take your familiar safe public side path about 60 m sideways from the route.
2. Stop and read the diagnostic reason. Look for `off-route`; record the actual reason if it does not appear, without wandering to force it.
3. Tap Play A and let the replay finish. Then tap Pause.
4. Rejoin the known path and continue to B while paused. Note roughly when you physically rejoin and when the off-route reason clears. The configured corridor is 45 m wide on either side, so recognition may precede the exact path centreline.
5. At B wait 10–15 seconds for fresh fixes. B must remain silent. Press Resume; B should play once. Let B finish, then End.

No C, three-minute silence or 60-second wait is required. This tests the corrected route and the manual replay/paused-return steps omitted from the earlier detour.

## 2. Arrive while A speaks — EDGE TEST

1. Load `02-edge-tests-long-A.json` and confirm EDGE TEST. New walk; begin the guide's Arrive before narration ends case.
2. Start at A and walk normally to B while long A speaks. Do not Pause or manually play a clip.
3. At B, check recent events for `arrival-pending-unfinished-clip` while A still speaks.
4. Stay at B until A finishes naturally. B should then play once without overlap or cutting A short. Let B finish, then End.

If A ends before reaching B, record inconclusive. No C or minimum silence is required.

## 3. Pass B while A speaks — same EDGE TEST

1. Return to A; New walk; begin Pass a pending stop. Start and walk normally to B while long A speaks.
2. At B wait about ten seconds and confirm `arrival-pending-unfinished-clip`.
3. Continue along the familiar B-to-C path, roughly 70 m beyond B, while A still speaks. Stop safely; check To eligible stop is over 50 m with fresh fixes.
4. Stay there until A finishes. B must remain unplayed and silent. End before returning towards B. C is not required.

If A ends before leaving B's area or no pending arrival was confirmed, record inconclusive; do not rush. No minimum silence is required.

## 4. Battery Saver — restore STANDARD CLIPS

1. Load `01-standard-walk.json`; confirm STANDARD CLIPS. New walk; begin Battery and power-saving conditions.
2. Record start battery percentage and app battery policy, then enable Android Battery Saver. Leave app-specific restrictions unchanged. Wi-Fi/mobile data off; Location on.
3. Start at A, keep the screen locked, and let each clip finish. Allow at least three full minutes of genuine silence before entering B, and again before C; aim for four. Waiting safely before approaching the next stop counts. B and C should trigger once without unlocking.
4. Let C finish before End. Record end battery and delays/missed clips, then restore your preferred Battery Saver setting.

## Switching and saving

End and export first. Configure / load fixture → Choose JSON file → Documents / Walking Tour Remaining → select the file → Validate and load JSON → Load. Close configuration; New walk / reset progress. Check STANDARD CLIPS versus EDGE TEST before beginning the guide attempt.

After each case, save the guide observations and both **Test results JSON** and **Private diagnostics**. Keep the distinct default filenames. Save to the local Walking Tour Tests folder and wait for Saved and verified. Export before changing fixtures because diagnostics are filtered by the selected route identity. Do not clear history. You can complete the four cases without reporting back between them; preserve failed/inconclusive attempts too.
