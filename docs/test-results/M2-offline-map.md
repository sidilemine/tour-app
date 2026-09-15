# M2 first slice — offline North Finchley map

15 September 2026. **Implemented; awaiting physical test.** Sidi authorized the previously discussed small-map slice after agreeing the shortest useful North Finchley testing plan. This is not M2 acceptance or a selected six-stop itinerary.

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

Final source **`b9a8052ee0fe8d26`**, guide **7**:

| Variant | Bytes | SHA-256 |
| --- | ---: | --- |
| Development | 83,608,669 | `acc4d006a2672f755e2a5406d15429c8a9b2f85d6107ebb8087c49a428dfd6eb` |
| Self-contained | 53,836,581 | `365c7bf393f5435651d06267ce9fbbc814f8390975154f79ba46929d39c3a603` |

The self-contained APK grew by 19,095,026 bytes from the accepted M1 build. A lockfile comparison found **no existing package version changes**. Compared with both accepted APKs, the only added manifest permission is the map dependency's normal `ACCESS_WIFI_STATE`; required location/job/audio permissions remain, and `RECORD_AUDIO` remains absent. Actual Start/background callback delivery is therefore part of the prepared phone gate. Intermediate native-only builds are not the handoff artifacts. Raw build logs/APKs remain ignored. The accepted M1 APKs were copied to `artifacts/m1-accepted/` before building the preview.

No handset was connected when implementation began. No installation, native rendering, memory measurement, actual audible result, locked callback delivery, outdoor arrival or new handoff is claimed by these automated results. The last accepted phone state remains the M1 closure record until a connected session updates this record.

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
