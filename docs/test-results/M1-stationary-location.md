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

The phone remained keyguard-locked. Unlock was requested, but not received during this run. Consequently, visible UI/guide/progress confirmation, runtime audio status and the live stationary locked-location test are **pending**. A successful activity launch behind keyguard is not a visible cold-open or offline-network acceptance pass. The four original exports and existing route backup remain preserved. The update used Android's data-preserving replacement, but saved state has not yet been visually rechecked on this build.

Required connected check: preserve the saved fixture/progress, install with `adb install -r`, cold-open without Metro, start tracking with the existing hold respected, then observe fresh timestamps through a stationary locked interval longer than 60 seconds. End tracking afterwards and review native crashes and exported callbacks. This checks stationary delivery on one connected phone; it is not an unplugged walking or battery pass.

Required field retests: on the corrected self-contained build, repeat the two A→B pause cases. First let A finish, pause, walk to B and wait 60 seconds; Resume while stationary should promptly allow B with a fresh usable fix. Second pause A mid-clip, walk/wait likewise, then Resume: the rest of A should finish before B, without an unexplained long silence afterwards. Time any wait, let B finish, End and save results plus diagnostics. Actual remote controls and the full baseline/interruption/recovery matrix remain separate. M1 stays open until its real acceptance criteria are met.
