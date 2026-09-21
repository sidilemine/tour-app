# M2 Queensway evening demo — preparation and handoff

21 September 2026. **Installed and ready for the ordinary demo; silent phone handoff completed.** This owner-requested dinner demo adds content and a map, with no native audio/location behavior, dependency, map-camera or guide-procedure change. M2 remains open.

[Owner guide](../content/QUEENSWAY-TAKE-THE-TOUR.md) · [content inputs](../../content/queensway/README.md) · [research/review record](../content/authoring/queensway-2026-09-21/README.md).

## Prepared package

- Immutable package `queensway-behind-fronts`, version 1: three stops, one chapter, George. Start beside QUEENS, 17 Queensway; final narrative Leinster Gardens; mapped return near 46 Queensborough Terrace.
- Four new audio assets: **2,190,405 bytes**, 256.0 seconds total. Stationary speech and directions **225.5s**; walking speech **30.5s**.
- Fourth map `queensway-105db6bcbdfce45f`: **2,171,984 bytes**, 25 decoded tiles; complete area with shared fonts 8,412,457 bytes. Existing maps/fonts and A/B/C/H packages unchanged.
- Guide 13 unchanged; current build source **`056c32524c6280bf`**. Final APK checks verified all **five tours / 33 recordings** and four pinned map IDs, with 260 distinct map/font resources.
- Latest launch leaves 94.04 m / 56.42 s at 6 km/h before the first Queen’s Gardens guard; after actual narration **25.92s** remains, exceeding 15 s. Prepared launch interval 12.46 m. This is a geometry/media calculation, not measured native GPS behavior.

## Automated and desk evidence

| Check | Result and scope |
| --- | --- |
| Typecheck and lint | Pass |
| Full test suite | **166 pass**, zero failures |
| Guide/documentation | Match, revision 13 / 22 retained cases |
| Media/package | Exact ordered paragraphs/evidence/chunks, bytes/hashes, mono 24 kHz, measured duration and complete decoding pass |
| New route replay | All three arrivals and chapter in order; held/expired chapter preserves pause; 6 km/h with 2 s fixes catches the chapter and leaves navigation margin |
| Maps | All four areas’ resources, coverage tiles, local styles and glyphs pass; new PMTiles structural check passes |
| Source/editorial review | Fresh prose reading plus direct party-image inspection; misleading alt-text costume claim corrected |
| Navigation review | Actual frozen plan/stories match route, separate standings, reviewed crossing directions and corrected first junction guard |
| Android builds/APK checks | Both variants build and pass native audio-marker/location-permission checks; offline APK verifies exact source, five packages/33 recordings and 260 map/font assets |

Official online Expo compatibility check reports recommended patch updates for Expo, Asset, Build Properties, Location, Sharing and TaskManager; it exits 1. The pinned native stack is unchanged from the preceding handoff. Those existing recommendations are retained as a separate upgrade task, not silently labelled a compatibility pass or introduced during this same-day content delivery. No new dependency was added.

## Smallest useful phone session

One **5–10-minute silent USB handoff**: install the self-contained APK in place, prepare the five bundled entries, cold-open without Metro/network, inspect Queensway’s complete route/three markers and reader, confirm retained library/progress, then restore original network settings and leave Queensway selected/unstarted with tracking stopped. Stop after this question is answered. No audio, headset repetition, recording task or extra technical walk.

Reuse unchanged evidence from the [Clerkenwell handoff](M2-clerkenwell-phone-handoff.md) and [Highgate camera correction](M2-hampstead-tour.md). Do not equate hashes/replay with native drawing. Do not clear data or reset another walk. Private screenshots/logs stay ignored under diagnostics/artifacts.

## Build and device result

Both Android variants built successfully. The final self-contained APK contains every prepared recording and all four maps byte-for-byte. No native/audio/location change was made.

- `walking-tour-offline.apk`: 96,325,221 bytes; SHA-256 `4f7497dfad84f9431bfebbfd7f2463a1c6b8d2e7daab415500607fccd3894fb1`.
- `walking-tour-development.apk`: 83,608,769 bytes; SHA-256 `322d3a9c8c2afbec089b0b7c33e232eb2bd07f3c3170487d1619b0531873d537`.

### Silent Pixel result, 21 September

Completed on the Pixel 6 / Android 17. Device preparation/checks ran approximately 16:43–16:52 BST. Installation used `adb install -r`; a readback of the installed APK matched the full offline SHA-256 above. No app uninstall, storage clearing, walk reset, progress edit or review edit occurred.

- Before replacement, Highgate was selected. After replacement its existing introduction and the prior library entries remained available; **Prepare bundled tours offline** added Queensway and selected it. This is representative UI preservation plus an in-place update, not a fresh checksum audit of every old progress/review/voice file.
- Metro was absent. After Android reported **no active default network**, the app was force-stopped and cold-reopened; Queensway remained selected and unstarted. Wi-Fi and mobile data were disabled for the check.
- The new map’s actual opening screenshot was inspected: **the complete route, all three numbered stops and the mapped return are visible**. First complete frame **0.6 seconds**, files checked. No default-centre correction or additional build was needed. Native drawing is observed separately from the prepared geometry/media checks.
- The first stop’s reader showed the QUEENS station approach, exterior standing place, and the two-stage signals instruction across Queensway then Porchester Gardens, offline. The transcript was present. One reader-close tap did not dismiss the modal; Android Back closed it normally. No playback command was sent.
- Final screen: **TOUR STOPPED**, **Start tour at QUEENS**, automatic narration checked/enabled. The initial held state is preserved until the owner starts the walk. No Start, Resume, Play, recording or audible test was performed.
- Wi-Fi and mobile data restored to enabled and read back; Bluetooth and airplane mode remained off, matching the initial settings. The owner was told the phone could be disconnected before documentation work continued.

A minor text-formatting defect is visible in the first approach (`about60metres`, `at17`). Its meaning is clear and spoken directions are unaffected. Keep this cosmetic correction for the next content revision, with the usual new-version rule; it does not justify another build or phone session for tonight. The final review should include every visitor-facing field, not only transcripts.

No fresh EarFun/Spotify, subjective narration-quality or outdoor automatic-arrival/chapter result is implied. Reuse the unchanged prior native/audio evidence; ordinary demo feedback is sufficient next input.

## Ordinary-use limits

The route is desk reviewed with dated imagery, not a current works or evening-visibility survey. Some geometry is explicitly authored from mapped crossings and visitor points; it is not a measured pavement trace. Queen’s Gardens has two mouths; the chapter guard precedes the first. A bollarded cycle/pedestrian opening joins the narrated pavement, and the silent return passage has vehicle access without a separate footway. Follow actual signs/traffic and use manual playback if a launch is missed. The ordinary social demo supplies enjoyment and practical feedback without a test form. Subjective listening quality of these new files, automatic street triggering and M2 closure remain separate from preparation.
