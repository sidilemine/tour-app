# M1: stationary location delivery correction

14 September 2026. **Implemented; awaiting physical test.** Follows the [four pause-walk failures/delays](M1-four-pause-walks.md). Those original observations remain unchanged.

## Change

The active-tour request now uses zero minimum displacement instead of 2 m, retaining High accuracy, a desired two-second interval and no requested deferred distance/interval. This permits fresh callbacks while a visitor stands at B for a minute with narration paused. The separate path recorder remains at 3 m displacement; no recorded fixture, stop radius, dwell rule or physical verification status changes.

The 15-second playback freshness gate remains intact. Manual pause, End, automatic-playback preference and unfinished narration still take precedence. A helper explains an eligible pending arrival blocked by stale location; the session logs `pending-arrival-waiting-for-fresh-location` on Resume, audio completion or automatic-mode changes, with stop index and fix age. The screen displays the wait and manual fallback. It does not invent a fresh timestamp or play from an old coordinate.

The installed Expo 57.0.17 Android implementation maps displacement to `LocationRequest.Builder.setMinUpdateDistanceMeters`. Google's [official documentation](https://developers.google.com/android/reference/com/google/android/gms/location/LocationRequest.Builder) confirms that the minimum displacement suppresses closer updates. A requested interval is not a delivery guarantee. This correction removes our movement filter; it does not prove that every provider/OS will deliver a usable fix every two seconds. Extra stationary callbacks/storage work and battery cost remain measurement items.

No one-shot refresh, new SDK, permissions or native audio change was added. If stationary delivery remains inadequate, evaluate bounded fresh acquisition at release/completion within the existing adapter, preserving cancellation and holds.

## Automated verification and builds

- Typecheck and lint pass. All **73 unit/replay/storage tests pass**, including seven new synthetic cases derived from the field failure pattern: a stale Resume; stationary holds with finished/unfinished A; a fix expiring during remaining A; and re-pause, End or automatic-disabled defeating later fresh callbacks. Tests inject stationary fixes and do not prove native GPS delivery.
- All four original cumulative exports still replay unchanged on this reducer: 1,385 / 1,545 / 1,722 / 1,880 transitions. Private traces were not committed.
- Guide revision 3 tells the user to remain still at B, time B's delay separately from the remainder of A, and let B finish before End. `docs:guide` and `docs:check` confirm parity with the embedded guide; prior test observations are retained.
- Expo Doctor: **21/21 checks passed**. Expo install compatibility used the local SDK dependency map because that invocation was offline; it reported dependencies up to date, with its offline-validation limitation retained.
- Both ARM64 builds assembled successfully. APK signature, native audio markers, bundled offline guide/clips and required location-job permissions passed the existing verification tool. No emulator, dependency upgrade or external service was used. About 30 GiB was available before building; no files were deleted for space.

| Build | Source ID | SHA-256 |
|---|---|---|
| Development | `84599b46333c1aa1` | `f71a66c6a195edaeeae6ea16b054148c866766566b8d12543ad56d925de105bd` |
| Self-contained | `84599b46333c1aa1` | `883d5990a7a065eaf123a93fee5043d568d6bf4bf5e553778a062bd0b21ecc0d` |

Outputs remain under ignored `artifacts/`; the previous self-contained APK was retained as `walking-tour-before-stationary-fix.apk`. Build logs and device evidence remain under ignored `diagnostics/stationary-fix-2026-09-14/`.

## Device verification and physical gate

The self-contained update installed successfully with `adb install -r`, without uninstalling or clearing data. The installed base APK SHA-256 exactly matches the artifact above. With no listener on the Mac's Metro port, force-stop followed by activity launch reported **COLD**, status OK, 148 ms; Android reported no active app services afterwards. No tour was started during this check and no connectivity setting changed. App-scoped exit records show the expected package update and deliberate force-stop; retained crash records contain only the earlier 13 September failures, with no new app crash from this installation/launch.

The initial installation ended with the phone keyguard-locked, so visible recovery and live stationary delivery were then pending. The subsequent connected check below resolves those items. Runtime audible release at B and offline-network walking acceptance remain physical retests; they are not inferred from a cold activity launch.

### Connected stationary check — passed, with limits

The phone was unlocked in the follow-up session. The player displayed the original three stops/ten route points, A completed, B paused at 5.6 s and C unplayed. Start retained the ended hold and did not play audio; an explicit in-app Pause set the manual hold. The phone remained USB-connected/powered and was left stationary as instructed. No network, battery or permission settings changed.

The sleep request was followed by native screen-off/keyguard-shown at **11:44:10.585 BST**. Analysis starts at this confirmed locked state, not the earlier sleep request. Through **11:45:24.078**, a **73.493-second** screen-off/locked window with no intervening wake in the retained native events:

| Measure | Observed |
|---|---:|
| Fix callbacks received/persisted | 36 |
| Median callback interval | 2.000 s |
| Minimum / maximum callback interval | 1.954 / 2.042 s |
| Maximum provider-fix age at callback | 0.181 s |
| First fix after lock / last fix before window end | 1.527 / 1.966 s |
| Manual hold | Preserved on every fix |
| Playback effects in the locked window | None |

This directly demonstrates regular stationary background callbacks on this connected Pixel 6 with the corrected request, unlike the minute-long gaps in the earlier field attempts. It does not establish audible pending-stop release, moving arrival, unplugged battery cost, every OEM's behavior or the full M1 gate. The eligible stop was not reached; the test deliberately preserved the previous route/progress and hold instead of inventing a physical arrival.

After Sidi unlocked, End stopped tracking at **11:47:04 BST**. The app's **Saved and verified** flow wrote `walking-diagnostics-2026-09-14T10-47-21-378Z-3tijgn.json` in Documents/Walking Tour Tests. The copied file and phone SHA-256 match: `45e1984c48913c24804ab2d5da234acae30d51c6984d5ea810869d9b81f10cef`. Source `84599b46333c1aa1`, `offline-release`. Full replay reproduced **1,995 transitions / 16 segments**; the new Start→End interval reproduced **115 transitions / one segment**. Fixture, stop states and exact **5.603-second** B offset match the pre-update export.

A subsequent deliberate force-stop/cold reopen, with Metro absent and no installation/data clear between checkpoint and assertion, visibly restored the same route, progress and ended hold. Android then reported no remaining app services. The bundled **Guide 3 · Self-contained build** opened and showed the updated stationary/timing instructions. An unfinished guide attempt from 10:57:32 and the older saved observation remained present; neither was edited or automatically marked passed. Retained app crash records showed no new crash, with the earlier 13 September failures preserved. The stopped player was left visible; the phone can be disconnected.

Only documentation changed in this follow-up: export checksum, replay, fixture/offset equality, native screen/service/crash evidence, local links, guide parity and diff were checked. No new app build or unit-test run was necessary.

Required field retests: on the corrected self-contained build, repeat the two A→B pause cases. First let A finish, pause, walk to B and wait 60 seconds; Resume while stationary should promptly allow B with a fresh usable fix. Second pause A mid-clip, walk/wait likewise, then Resume: the rest of A should finish before B, without an unexplained long silence afterwards. No minimum A→B travel time applies to these pause cases: a normal or brisk walk is fine. Keep the full 60-second wait at B. Time any delay after Resume, let B finish, End and save results plus diagnostics. Actual remote controls and the full baseline/interruption/recovery matrix remain separate. M1 stays open until its real acceptance criteria are met.
