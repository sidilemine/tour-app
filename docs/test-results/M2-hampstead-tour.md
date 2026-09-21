# M2 Highgate / Hampstead preparation and handoff

21 September 2026. **Implemented and built; awaiting the one silent new-area phone handoff.** No new native audio/location behavior, SDK or dependency change. M2 remains open; new outing feedback is not inferred from preparation.

[Owner guide](../content/HAMPSTEAD-TAKE-THE-TOUR.md) · [content inputs](../../content/hampstead/README.md) · [authoring/review record](../content/authoring/hampstead-2026-09-21/README.md).

## Exact build and package

- Guide **13**, source **`03d87e38b7e80ca8`**, self-contained and development APKs built successfully.
- New immutable package `highgate-hampstead-room`, version 1: five stops, two walking passages, George. Start Highgate Underground Archway Road exit 3; mapped finish Hampstead Heath station.
- Seven new audio assets: **4,792,091 bytes**, 559.4 seconds total. Stationary speech/directions 441.6 seconds; walking speech 117.8 seconds.
- Third map `hampstead-0abcc26a600e0718`: 4,017,382 bytes, 75 decoded tiles. Existing maps/fonts and A/B/C packages unchanged.
- Final offline APK verifies all **four tours / 29 audio entries**, exact source identity, all three pinned map IDs and **259 distinct map/font resources** byte-for-byte. Both variants pass the native audio marker and location-job permission checks.
- Offline APK SHA-256: `ce8e24565751ab7865cd4ac83e23848d1027ec18edb7f465b780ddc3060f8a9b` (91,106,793 bytes). Development APK SHA-256: `322d3a9c8c2afbec089b0b7c33e232eb2bd07f3c3170487d1619b0531873d537` (83,608,769 bytes).
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

## Smallest useful physical question

Can this new map and complete package cold-open offline on the Pixel while existing progress remains available? The new extract and catalogue entry make this one short check useful. Reuse the [20 September phone evidence](M2-clerkenwell-phone-handoff.md) for unchanged renderer behavior, EarFun/Spotify recording, review-close continuation and native adapters. No new listening session, stationary waiting test or separate outdoor technical walk is needed.

Prepared guide case 22: one **5–10-minute silent USB session**, install in place, prepare all bundled tours, network-off cold-open, inspect new map/reader, briefly switch to retained content, restore prior network settings and leave Highgate selected/unstarted with tracking stopped. Stop once this question is answered. Do not clear app data or reset another tour.

## Physical result

**Pending.** The connection check found no connected USB device. No phone has been inspected or installed as part of this assignment at the time of this entry. The latest previously observed installation is guide 12/source `9505427915e2d1df` from 20 September; today's tour/progress state is unknown until inspected. The new recordings have structural/media verification but no subjective listening result yet.

## Ordinary-use limits

Dated imagery and official map/access information are desk evidence, not today's route clearance. Merton Lane lacks a continuous footway; unnamed Heath forks need the map. The first short launch window can be missed by delayed fixes; manual chapter playback remains available. No native cadence/control changes were made to address hypothetical failures. Sidi's normal outing can supply practical directions, enjoyment and automatic-chapter observations without a test form. E1 and M2 closure remain separate subsequent work.
