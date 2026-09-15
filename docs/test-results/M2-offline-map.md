# M2 first slice — offline North Finchley map

15 September 2026. **Implemented; offline map and most desk regressions verified, remaining physical gates pending.** Sidi authorized the previously discussed small-map slice after agreeing the shortest useful North Finchley testing plan. This is not M2 acceptance or a selected six-stop itinerary.

## Implemented boundary

- MapLibre React Native **11.3.10**, Android OpenGL native **13.2.0**, on existing Expo **57.0.22** / RN **0.86.3** / React **19.2.3**. Native 13.2.0 is present in the resolved local Gradle artifacts. No accepted audio/location dependency or engine/session policy was changed.
- Fixed map `north-finchley-abc1a7e4d563d305`: Protomaps **4.15.2**, 15 September snapshot; real-file PMTiles, a local authored style, Noto Sans Regular glyphs, offline attribution/licences. No sprite/icons or external style resources. [Source, rights, sizes and reproduction](../../assets/maps/north-finchley/README.md).
- **9,524,280 bytes** of map/fonts, 257 files. Resource preparation stages and reads back before publication; every opening checks the durable copy. Missing/damaged files fail visibly; explicit rebuild touches only this map copy. Failed preparation does not change tour progress or test notes.
- Read-only map modal uses the existing active session's usable recent position, with stale/outside/stopped fixes hidden. No additional location subscription, follow mode, tour-start command or playback command. The camera is north-up, coverage is visibly bounded, and z16–18 overzoom the z15 data.
- Guide **7** adds one prepared map case. Existing M1 cases and accepted evidence remain available. No general archive importer, six-stop player, cue arbitration, verified route or narration was added in this slice.

## Automated / build evidence

| Check | Result |
| --- | --- |
| TypeScript / ESLint | Pass |
| Unit/replay/real SQLite suite | **87 pass**, including 8 map failure/coverage tests; prior 79 retained |
| Resource inspection | All hashes/sizes match; **52/52** archived coverage tiles decoded, **65,838** features; all selected street/place label characters have bundled glyphs |
| Style / local resources | MapLibre style validation passes; all requested sources/glyphs local; no sprite dependency; outside mask present |
| Copy/recovery failure paths | Reopen without source access; same-size corruption; missing files; copy/readback/promotion failure; abandoned staging; failed replacement/promotion preserves prior copy; interrupted promotion restores it; invalid relative paths rejected |
| Both Android APKs | Built and signatures verified; required patched audio markers and location-job permissions present |
| Actual APK resources | ARM64 MapLibre library in both; every one of the **257** map/font files present byte-for-byte in self-contained APK |
| Guide parity / diff | Generated guide matches canonical JSON; local links and diff reviewed. The third-party font licence is retained verbatim, including one upstream trailing space |
| Expo compatibility | `expo install --check` exit 1; Expo Doctor **20/21** checks pass. The remaining check recommends the same five patch updates recorded at M1 closure: expo 57.0.23, build-properties/location/task-manager 57.0.18, sharing 57.0.20. Versions were preserved rather than widening native regression scope; these checks are not reported as a full pass |

Final source **`a7c69f00e14e185a`**, guide **7** (includes the device-discovered header correction below):

| Variant | Bytes | SHA-256 |
| --- | ---: | --- |
| Development | 83,608,669 | `acc4d006a2672f755e2a5406d15429c8a9b2f85d6107ebb8087c49a428dfd6eb` |
| Self-contained | 53,836,605 | `a484d895e80570594d9fc0e0315932f190ee3760b2a149e42ba40439cbc80d94` |

The self-contained APK grew by 19,095,050 bytes from the accepted M1 build. A lockfile comparison found **no existing package version changes**. Compared with both accepted APKs, the only added manifest permission is the map dependency's normal `ACCESS_WIFI_STATE`; required location/job/audio permissions remain, and `RECORD_AUDIO` remains absent. Actual Start/background callback delivery is therefore part of the prepared phone gate. Intermediate native-only builds are not the handoff artifacts. Raw build logs/APKs remain ignored. The accepted M1 APKs were copied to `artifacts/m1-accepted/` before building the preview.

## Connected desk results — 15 September evening

Pixel 6 / Android 17. Sidi requested a listening-readiness check before audio; each audible sequence waited for an explicit ready reply. The final self-contained audio/navigation prompt had not been answered when the silent handoff checks were completed, so that subcase remains pending. No outdoor test took place.

### Map, data preservation and header correction

- Installed development without clearing data. Backed up files/preferences; both SQLite stores passed integrity checks. The four previous journal attempts and 7,570 preceding diagnostic events were retained. Initial progress was stopped/ended, A completed, B skipped, C unplayed, paused A **192.158 s**. All four cached audio hashes matched. Fast Refresh was already false; its crashing menu toggle was not used.
- Initial source `b9a8052ee0fe8d26` drew local roads, buildings, paths, railways and labels. Metro preparation plus first complete frame took **11.9 s**. After Wi-Fi/data settled to **Active default network: none**, all four coverage corners drew at overview/detail scale. Grey beyond coverage was expected. Credits opened offline. This development preparation alone was not a self-contained cold-launch result.
- USB dropped during the sweep follow-up. ADB and the Mac USB inventory both lost the device; reconnecting the cable restored it. No file injection or audio had occurred at that point. The interruption was a connection problem observed during testing, not evidence of an app crash.
- **Found and fixed:** the map Back button overlapped Android's status bar. Its centre tap failed; tapping the exposed lower edge returned to the player. The header now includes Android's reported status-bar height, matching the existing guide's approach. Centre taps then worked on error, normal-map and self-contained screens. [React Native documents `StatusBar.currentHeight`](https://reactnative.dev/docs/statusbar#currentheight-android). Source became `a7c69f00e14e185a`; typecheck/lint, all **87 tests**, both builds and APK marker/permission/resource checks passed again. Development APK bytes stayed identical because its JavaScript comes from Metro.
- With the app force-stopped, moved the copied `0-255.pbf` aside, then separately overwrote one byte of the copied PMTiles without changing its length. Each cold reopen showed **Map unavailable** naming the affected file. The player remained reachable; **Rebuild local map copy** restored drawing in **2.7 s** and **4.0 s** respectively. All **257 phone files / 9,524,280 bytes** matched source SHA-256 before injection and after each repair. Fixture, saved progress and the entire pre-existing journal were byte-identical across these map tests.

### Audio, recovery and stationary location

- Real Android media Pause/Play commands reached the guarded adapter and produced logged remote commands. Manual hold survived Start and map opening. With the map open, Play advanced narration and remote Pause held it again. Opening/closing the map **during uninterrupted playback** was not established by this sequence and remains a short follow-up.
- The first focus attempt was inconclusive: the tour was already paused when the companion requested focus. The repeat first verified actual playing state. Native loss occurred **22:03:17.340 BST**, gain **22:03:25.403**, and explicit Resume **22:03:42.186**. Position **12.420 s** stayed held for **16.783 s after actual gain**. Sidi confirmed narration stopped, stayed silent, and resumed deliberately; the marker beep was **not heard**, so no audible-beep claim is made. Native focus loss/return and narration behaviour establish the interruption result.
- After another deliberate short Resume, remote Pause saved **15.084 s**. Development force-stop/cold reload restored exactly that position, manual hold, stopped tracking, completed A and skipped B. No play effect occurred on recovery. End then deliberately stopped the test. The earlier **192.158 s** was replaced by intentional test playback, not lost during map use.
- **Indoor network-off limitation:** Start delivered one fix about **294.8 s old**, rejected as stale; no fresh locked callback was established in that condition. This is not a passed offline-location check or proof of a map regression.
- With original Wi-Fi/data settings restored and the phone locked, received **nine fresh fixes over 57.393 s**, ages **72–157 ms**, reported accuracy **4.0–21.6 m**, callback gaps **5.062–7.746 s**. Manual hold and **15.084 s** stayed intact. This proves live locked delivery with Wi-Fi available, not offline outdoor delivery or the requested two-second cadence on every callback. Actual app-scoped native logs/exit records were collected; no app fatal exception was found in the inspected development log. Hardware vibration-profile messages are not relabelled as application crashes.
- The collected development transitions replayed successfully: **77 transitions / two segments**. Private fixes and native logs remain ignored. The map's live position dot/camera behaviour still needs observation with a usable in-area fix.

### Self-contained offline map and memory

The complete app-file/preferences backup was verified, including both SQLite stores and every map hash. Automatic approval review rejected deleting map copies on backup-coverage grounds. The safer operation **moved**, rather than deleted, the 257 map asset-cache files and durable map into a separate app-cache backup. This preserved all data while forcing fresh preparation. Metro was stopped and its listening port was absent. The corrected self-contained APK was installed with `adb install -r`; the optional Play Protect upload was declined.

With phone networking off and **Active default network: none**, cold reopening showed the stopped player, ended hold and **15.1 s**. A fresh map copied from the APK and drew in **2.3 s**. All four corners at overview/detail scale were inspected with labels/geometry and the expected outside mask; Back worked. The APK check had independently verified all 257 embedded files byte-for-byte. This establishes independent offline map operation, not just retention of a Metro-loaded view.

| App PSS | Development | Self-contained |
| --- | ---: | ---: |
| Player before map | 333.1 MiB | 153.1 MiB |
| After initial map drawing | 449.4 MiB | 249.2 MiB |
| Maximum of six sweep samples | 471.6 MiB / 13.3 s | 275.6 MiB / 13.1 s |
| After confirmed map closure | 361.8 MiB after repaired-map run | 180.2 MiB |

These are short process measurements, not an absolute peak, a leak clearance or battery/endurance evidence. The initial development observations/metrics were recorded before the release sweep; the sweep helper reused its scratch filenames, so the retained corner images/sample JSON now describe the explicitly renamed **release** run.

The original four journal attempts were verified unchanged. One new desk attempt spans the development and self-contained work and is saved **inconclusive** for the full case, with variant-specific limits in its note; it is not an acceptance certificate. Automated hardware-key note entry caused development reloads (consistent with React Native's double-R shortcut while editing a modal); final note entry succeeded in self-contained release. This preparation limitation is separate from audio/location results. The shared named-save flow is used for the journal and matching private diagnostics.

**Verified handoff:** installed self-contained APK hash matches the final table. Metro is stopped; cold reopening shows stopped/ended at **15.1 s**, with no app services. The temporary focus companion was removed. Both exports reported **Saved and verified** in the existing local Documents / Walking Tour Tests folder; readback on the Mac preserved all five attempts, and the saved diagnostic export reproduced the same **77 transitions / two segments**. Session exit history contains five requested force-stops and one package update, with no recorded crash/ANR; the inspected release log has no fatal exception. No further audible check was started without a readiness reply.

Wi-Fi and mobile data were re-enabled; Battery Saver and charging stay-awake remained off. **Airplane mode was off at final inspection**, whereas it had been on initially; this session issued no airplane-mode change and retained the later observed setting. Thus final connectivity is recorded explicitly, not described as an exact restoration of every original setting. The reversible map-copy backup remains under the app's cache, separate from the fresh working map; no tour data was deleted.

**Remaining gates:** the short audible check opening/closing the map during playback, usable in-area position-dot/camera observation, and the targeted offline locked silence-to-arrival / paused stationary release outdoors. Reuse the completed map, repair, focus and recovery evidence; do not repeat the whole desk batch. The broader six-stop product, route verification and M2 acceptance remain open.

## Prepared connected-phone batch

**Purpose:** establish the native offline map and catch interference with the accepted player before requesting a walk. **Owner time:** about **5–10 minutes** of permission prompts and short audible confirmations; the engineer needs the handset longer. Keep the existing fixture, guide journal, progress and previous exports. Use `adb install -r`; never uninstall or clear app storage.

1. **Engineer preflight:** confirm no active walk/unfinished evidence, retain the current app data and build identity, install the development preview and load Metro. Verify the guarded audio adapter revision, guide 7, map ID and all four cached audio hashes. Do not use the crashing Disable Fast Refresh menu action. Confirm its saved setting as in the accepted field-preparation procedure.
2. **Native map:** open the map, note first complete frame time and actual labels, pan/zoom through all four edges/corners at overview and street scale, including Tally Ho/High Road, Lodge Lane, Nether Street and the Hutton/Dale Grove candidate extent. Check grey outside coverage, credits, repeated open/close and unchanged camera during position updates. Record app-scoped map errors and memory before opening, after a coverage sweep and after closing. Observe a stale/stopped/outside position disappearing; synthetic display checks do not prove live GPS.
3. **Engineer failure injection:** with the app stopped, alter only its own `files/offline-maps/north-finchley-abc1a7e4d563d305/` copy using the debuggable APK's app-scoped `run-as` access. In separate attempts remove `fonts/Noto Sans Regular/0-255.pbf`, then damage `basemap.pmtiles` without changing its length. Reopen; expect **Map unavailable**, a reachable working player, and successful **Rebuild local map copy**. Preserve databases, fixture and notes. Preparation interruption is automated; add a native copy interruption only if observed behavior warrants it.
4. **Actual session coexistence:** use seconds of standard/long-A test audio as appropriate. Open/close the map while playing and manually paused. Confirm actual remote Pause/Resume and hold persistence through the existing focus companion / cold reopen procedure. Inspect native callbacks/checkpoints and app-scoped crash/exit records. For Start and locked stationary location, verify fresh callbacks while paused, then deliberate Resume; do not accept a registered service as delivery evidence. Keep pending-arrival release for the checked outdoor segment if indoor position cannot establish it.
5. **Independent-use gate:** install self-contained preview without clearing data. Stop Metro; switch phone networking off. Cold reopen, confirm silent recovery/progress, open and sweep the map, note timing and short manual audio. Check all resources from this APK rather than merely retaining a Metro-loaded screen. Record network/output/permission/battery conditions and the build identity. Restore the self-contained variant at handoff; if a blocker prevents a usable preview, retain the accepted M1 APK as rollback and document the actual final phone state.

Use embedded guide case **19** for observations, noting separate development and self-contained attempts. Save/export through the existing named local-save flow; no new export boundary was introduced. Stop the affected check for missing tiles/labels, persistent resource errors, unusable controls, unexpected speech, lost hold/offset, absent fresh location or a crash. Preserve evidence, fix the failing boundary and repeat that case before walking.

## Outdoor gate after desk success

One **roughly 10–15-minute** targeted M1 segment: accepted fixture, appropriate prepared development build, networking off and locked through **at least three minutes of real silence** before an eligible arrival. Observe exactly one correct clip and fresh locked callbacks. Include a short paused stationary wait and explicit release if compatible. Export before changing fixtures. Stop for unsafe access, failed arrival, violated hold, overlapping speech or missing evidence. Batch with a compatible visit where practical; it is not automatically another full route outing.

This native-map dependency justifies the targeted check; it does not reopen all accepted M1 walks. No North Finchley field route has been prepared or verified yet. The later survey, 20–30-minute six-stop design target, cue tests and E1 comparison remain governed by the [short-walk plan](../content/M2-TEST-PLAN.md).
