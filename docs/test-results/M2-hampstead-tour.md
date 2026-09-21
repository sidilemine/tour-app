# M2 Highgate / Hampstead preparation and handoff

21 September 2026. **Installed and ready for the ordinary outing; silent handoff completed.** No new native audio/location behavior, SDK or dependency change. M2 remains open; new outing feedback is not inferred from preparation.

[Owner guide](../content/HAMPSTEAD-TAKE-THE-TOUR.md) · [content inputs](../../content/hampstead/README.md) · [authoring/review record](../content/authoring/hampstead-2026-09-21/README.md).

## Exact build and package

- Guide **13**, source **`1bd3e861342b27e4`**, self-contained and development APKs built successfully.
- New immutable package `highgate-hampstead-room`, version 1: five stops, two walking passages, George. Start Highgate Underground Archway Road exit 3; mapped finish Hampstead Heath station.
- Seven new audio assets: **4,792,091 bytes**, 559.4 seconds total. Stationary speech/directions 441.6 seconds; walking speech 117.8 seconds.
- Third map `hampstead-0abcc26a600e0718`: 4,017,382 bytes, 75 decoded tiles. Existing maps/fonts and A/B/C packages unchanged.
- Final offline APK verifies all **four tours / 29 audio entries**, exact source identity, all three pinned map IDs and **259 distinct map/font resources** byte-for-byte. Both variants pass the native audio marker and location-job permission checks.
- Offline APK SHA-256: `858cbde6175bff2fb9bfead987642f23d1fabd44205145a6cc8821066c611bb6` (91,107,293 bytes). Development APK SHA-256: `322d3a9c8c2afbec089b0b7c33e232eb2bd07f3c3170487d1619b0531873d537` (83,608,769 bytes).
- Development variant retains its Metro requirement; only the self-contained variant is the intended independent-use handoff. Earlier Clerkenwell APKs are retained privately.

## Automated and desk evidence

| Check | Result and scope |
| --- | --- |
| Typecheck and lint | Pass |
| Full tests | **161 pass**, zero failures |
| Guide source/generated documentation | Match, revision 13, 22 cases |
| Package/media validation | All paragraphs/evidence/chunks align; complete decode, bytes, hashes and measured durations checked |
| Package/replay regressions | All new arrivals and interleaved chapters, held/expired opportunities and brisk 6 km/h fixed-cadence progression pass; existing packages retained |
| Map preflight | All three maps and local style/font dependencies pass |
| Native builds and final APK inspection | Both variants pass; exact embedded payloads inspected |
| Independent navigation review | Actual final route/stories match reviewed 239-point geometry, stops, directions and launch windows |

Walking clips last **50.2 / 67.6 seconds**. From each latest launch at 6 km/h they leave **27.16 / 94.17 seconds** before the respective navigation decision, above the 15-second margin. This is an authoring/replay calculation, not a physical GPS timing observation.

No fresh Expo compatibility result is claimed. The pinned SDK/native stack is unchanged from the 20 September checked build; recommended patch updates remain outside this content assignment. Build logs, raw provider responses, media working files and any future device captures stay ignored under diagnostics/artifacts.

## Connected-session correction

The first silent opening on source `03d87e38b7e80ca8` rendered the new map in 0.6 seconds with Android reporting no active default network. However, the generic extract-centre/zoom-15.5 view landed on the Heath with the route off-screen. That frame establishes drawing, not an acceptable opening view. The map now initially fits an authored tour’s complete route with padding and allows zoom 13; un-narrated test fixtures keep their existing centre/zoom. The [pinned Camera API](https://maplibre.org/maplibre-react-native/docs/components/camera/) and installed 11.3.10 types were checked before this small UI change. No map assets, content versions or audio/location behavior changed. Typecheck, lint and all 161 tests passed again. The replacement build/source `1bd3e861342b27e4` and final device result are recorded below. Both APKs and their native/content checks pass.

Direct read-only database copying was unavailable because the installed release is not debuggable. No data was cleared or changed to bypass that boundary; preservation is checked through in-place installation and the app UI, not claimed as a fresh checksum audit of all old reviews/voice files.

## Smallest useful physical question

Can this new map and complete package cold-open offline on the Pixel while existing progress remains available? The new extract and catalogue entry make this one short check useful. Reuse the [20 September phone evidence](M2-clerkenwell-phone-handoff.md) for unchanged renderer behavior, EarFun/Spotify recording, review-close continuation and native adapters. No new listening session, stationary waiting test or separate outdoor technical walk is needed.

Prepared guide case 22: one **5–10-minute silent USB session**, install in place, prepare all bundled tours, network-off cold-open, inspect new map/reader, briefly switch to retained content, restore prior network settings and leave Highgate selected/unstarted with tracking stopped. Stop once this question is answered. Do not clear app data or reset another tour.

## Physical result

**Completed on the Pixel 6 / Android 17, 21 September.** The installed self-contained APK exactly matches the final hash above. Both installations used `adb install -r`; no uninstall, storage clearing, walk reset, progress edit or review edit was performed.

- Original app opening showed Clerkenwell selected, with inspected middle stops unplayed. Bundled preparation imported all four packages and selected Highgate without starting it. Existing immutable A/B/C versions remain available.
- With Metro absent and Android reporting **no active default network**, the final build drew the complete Highgate route and all five numbered stops, including the station start and the mapped finish. First complete frame **0.6 seconds**, files checked. Private screenshots were visually inspected. The initial unhelpful centre view above is superseded by the actual corrected view, not counted as a full route-view pass.
- The retained Finchley A map also opened in the final build with all five markers/route visible, first complete frame **0.5 seconds**, network still off. A retained its stopped, paused six-second replay position when selected earlier in the same in-place handoff. This is representative UI preservation, not a fresh audit of every old stop, review or voice file.
- Highgate's actual station approach and first-leg directions were read offline, including exit 3, the Archway Road signals, Southwood Lane, Highgate High Street zebra and Pond Square steps. This content is unchanged by the final camera correction.
- Final force-stop/cold reopen retained Highgate. A UI hierarchy capture failed once during the final scrolling check; a fresh capture then showed **TOUR STOPPED**, **Start tour at Highgate Underground station**, and automatic narration checked/enabled. No Start/Resume/Play command was issued. The failure was in inspection tooling; no app data was changed to bypass it.
- Wi-Fi and mobile data were restored to enabled. Bluetooth and airplane mode remained off, matching the original settings. Sidi was told the phone could be disconnected.

The 5–10-minute estimate was exceeded because the observed opening-view defect needed a small correction, rebuild and in-place recheck. No audible test was added. Existing accepted EarFun/Spotify and review-close evidence is reused; the new recordings have complete media verification but no subjective listening result yet. No outdoor automatic-arrival/chapter pass or M2 closure is claimed.

## Ordinary-use limits

Dated imagery and official map/access information are desk evidence, not today's route clearance. Merton Lane lacks a continuous footway; unnamed Heath forks need the map. The first short launch window can be missed by delayed fixes; manual chapter playback remains available. No native cadence/control changes were made to address hypothetical failures. Sidi's normal outing can supply practical directions, enjoyment and automatic-chapter observations without a test form. E1 and M2 closure remain separate subsequent work.
