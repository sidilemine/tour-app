# M1: Spotify interruption and Bluetooth earbud disconnection

Historical record: this preserves the build, observations and open cases at the time of this check. M1 completed on 15 September 2026; use the [closure record](M1-closure.md) and [completed checklist](../PHONE-CHECKS.md) for current status.

14 September 2026, 18:00–18:10 BST. **The observed Spotify loss/explicit-resume and Bluetooth case/disconnect/reconnect sequences passed. M1 remains implemented; awaiting physical test.** Temporary audio-focus return to the tour was not exercised by Spotify's paused session and remains open.

## Setup and preserved evidence

Pixel 6 / Android 17, self-contained source `84599b46333c1aa1`, stationary and USB-connected. The existing A/B completed, C unplayed fixture was retained. Each session used Start and explicit Resume to clear the preceding ended hold before manually replaying a completed clip. There was no pre-existing hold to mask the interruption. No application changes, installation, progress reset, fixture replacement or journal edits occurred.

The app saved and verified `walking-diagnostics-2026-09-14T17-09-14-718Z-n87jtt.json` under Documents/Walking Tour Tests. Phone and local SHA-256 matched: `ecd596c1f36b2d314ea89a8abf3826c8a2d8a46bc12e637027bc9d823a66330c`. Private exports, UI, audio-focus/output, media and exit records remain ignored under `diagnostics/audio-checks-2026-09-14/`.

Full replay reproduced **2,751 transitions / 23 segments**. The new subset reproduced **266 transitions / one segment**. The entire previous 2,485-transition prefix and the three-stop/ten-point fixture match the earlier backup. Replays validate stored policy transitions, not audible output or Android focus delivery.

## Spotify interrupts A

Spotify's existing paused track was used; no new account, library change or provider integration was introduced. Output was the phone speaker; Bluetooth earbuds were connected for the later test.

| Event | BST time / result |
|---|---|
| Manual A request, no hold | 18:01:41.853 |
| Native playing | 18:01:42.210 |
| Spotify requests `GAIN` | 18:01:44.631 |
| Tour native pause | 18:01:44.638, offset **2.311 s**, hold `native-pause-or-interruption` |
| Explicit in-app Resume, after stopping Spotify | 18:02:21.559, requested saved 2.311 s |
| Native playing after Resume | 18:02:21.711 |
| A completes | 18:02:30.416 |

All 19 transitions in the **36.921-second** interval from interruption to Resume issued no play effect. That interval includes both music playback and the wait after stopping it; it is not a measured 36.9 seconds after Spotify stopped. Sidi confirmed that A stopped when Spotify started, stayed silent after music stopped, and continued only on explicit Resume.

**Scope:** native focus snapshots still show Spotify as focus owner after its Pause. The tour did not receive an unsolicited `GAIN` in that interval. Its next request was caused by explicit Resume; after A finished, native history shows focus returning to Spotify. This verifies real competing-audio interruption, durable hold and deliberate continuation, but does not establish the separate temporary-loss/focus-return case. A call or another controlled transient interruption is still required for that part of the original acceptance criterion. Do not treat music becoming silent as proof that focus returned.

## Bluetooth earbuds into case, reconnect, resume

Sidi connected Bluetooth earbuds, listened to B, then put the earbuds into their case and closed it without pressing the app's Pause. Native output history confirms A2DP connection/disconnection/reconnection.

| Event | BST time / result |
|---|---|
| Manual B request, no hold | 18:05:44.584 |
| Native playing | 18:05:44.771 |
| Native pause | 18:05:52.973, offset **7.272 s** |
| Actual remote pause command | 18:05:53.001; coordinator records manual hold at 18:05:53.005 |
| A2DP active device becomes null | 18:05:54.742 |
| Android noisy-output broadcast | 18:05:54.768 |
| A2DP output made unavailable | 18:05:55.912 |
| A2DP active device reconnects | 18:06:39.516 |
| Explicit in-app Resume | 18:07:32.306, requested saved 7.272 s |
| Native playing / B completion | 18:07:32.477 / 18:07:37.007 |

The **99.301-second** manual-hold interval contained 51 transitions and no play effects. Visible state after reconnection still showed B paused at 7.3 s with manual hold. Sidi confirmed no narration after closing the case, continued silence after reconnection, and the remainder of B playing through the earbuds only after explicit Resume and finishing normally.

This passes the real case/earbud sequence for this output. The remote Pause arrived before the noisy-output broadcast, so the result does not isolate the native noisy-output handler without a preceding headset pause. It is not a wired-unplug result, a guarantee for every headset, or the walking remote-pause/arrival test; Resume here was in-app.

## Handoff and remaining work

End stopped tracking at 18:08:06.409. Final A/B remain completed and C unplayed; the route and earlier records are unchanged. The self-contained app was deliberately cold-reopened after export, visibly stopped with the ended hold, and Android reported no remaining app services. Retained exit records show the deliberate final force-stop and no app crash in these test intervals. Existing older failures remain in the logs.

The temporary USB screen-awake setting was restored to its original zero value. Network, location permissions, pairing and volume settings were not edited by the engineer. Sidi physically connected/reconnected the earbuds; Spotify was left paused. These powered stationary tests establish no battery-consumption or offline locked-walk result.

Automated review covered full/new replays, fixture and prefix equality, checksum verification, native/UI evidence, guide parity, local links and diff whitespace. This update changes documentation only; no new app build or unit-test run was needed. The [working checklist](../PHONE-CHECKS.md) retains temporary focus return, actual remote pause during arrival, other lifecycle checks and the controlled walking/route/battery matrix.
