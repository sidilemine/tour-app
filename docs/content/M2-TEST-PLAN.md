# M2: shortest useful walk and physical evidence

Planning discussion, 15 September 2026. Sidi requests the shortest walk consistent with valid testing, starting around North Finchley bus station and ending nearby. This supersedes the earlier provisional area/duration preferences, not the six-stop acceptance criteria. M2 runtime implementation has not been authorized by this planning discussion; the first implementation slice remains a recommendation for discussion.

## Route brief

- Aim for **20–30 minutes including narration and pauses**, with six distinct, useful stops. This is a design target, not a measured route or a guaranteed minimum.
- Investigate the compact Tally Ho / High Road / Lodge Lane / Nether Street area first. A short Hutton Grove / Dale Grove connection is a candidate if needed. Start and finish near the bus station, at a checked pedestrian standing place.
- Prefer short original stories, provisionally around 30–45 seconds each, with usable directions and deliberate silence. Budget against actual walking legs before fixing script lengths.
- The earlier Finchley Central–Church End–Stephens House sequence was an unrouted editorial candidate. Its backtracking was not a deliberate route feature. The later suggested Friary Park circuit and 60–75-minute allowance are not needed to satisfy M2.
- Keep all six stops and review their spacing, safe viewpoints and story value. Do not manufacture six triggers at one junction, tighten GPS thresholds merely to fit, or count manual recovery as a successful automatic arrival. If the compact area cannot support six good stops, identify the failing constraint and propose the smallest extension.

### Desk-research candidates, not a selected itinerary

The [OpenStreetMap street layout](https://www.openstreetmap.org/#map=16/51.61290/-0.18100) was inspected on 15 September. No pedestrian-router output, field-approved geometry, visitor coordinates or final distance has been produced. The following is a candidate pool, not walking instructions or field evidence:

| Candidate | Research starting point | Required physical check |
| --- | --- | --- |
| artsdepot / Tally Ho | [artsdepot's own timeline](https://www.artsdepot.co.uk/timeline/) supports researching local entertainment and the Gaumont | Safe exterior meeting place outside vehicle/pedestrian flow; observable story detail |
| Former Torrington pub site | [Contemporary historical-society newsletter](https://www.friern-barnethistory.org.uk/userfiles/file/Newsletters/2000-2009/2004/No-19-Dec-2004.pdf) records the music venue's closure | Identify the former site and usable public viewpoint; do not assume the current business |
| John Parr memorial, Lodge Lane | [Council local history](https://www.barnet.gov.uk/libraries-old/local-studies-and-archives/pocket-histories/finchley-friern-barnet-and-totteridge-17) and [memorial location record](https://www.warmemorialsonline.org.uk/memorial/266775/) | Confirm the public memorial and room to stop; do not use a resident's doorway as the destination |
| St Michael's exterior, Nether Street | [School history](https://www.st-michaels.barnet.sch.uk/home/school/) and [address](https://www.st-michaels.barnet.sch.uk/sixth-form/contact-us-2/) | A useful public view without entering or obstructing the school; replace if unsuitable |
| Finchley Progressive Synagogue / Hutton Grove | [The congregation's contact page](https://www.fps.org/about-us/contact-us/) identifies the site and says visitors should make contact beforehand | Exterior-only candidate; verify an appropriate public viewpoint, with no assumed entry or visibility beyond its gates |
| Trinity Church, Nether Street | [Church history](https://trinitychurchnorthfinchley.co.uk/history.html) and [location](https://www.trinitychurchnorthfinchley.co.uk/joomla/index.php/find-us) | Identify the building, exterior view and standing space; check separation from start/end |

These sources were consulted on 15 September 2026. They are discovery material; full claim review, minimal evidence passages, rights and physical review records remain necessary before narration/package readiness. The mix of institutions must earn its place through distinct stories and visible details, not merely supply a sixth address. Final selection and order remain open.

## What establishes confidence

M2 in [ROADMAP](../../ROADMAP.md#milestone-2--curated-six-stop-offline-walk) specifies no minimum total walking time. Its essential physical evidence is a complete six-stop experience with reviewed access/viewpoints, useful directions, automatic arrivals, manual controls and owner feedback. Shortening the walk is acceptable if all those observations remain meaningful.

| Risk | Engineer work before requesting field time | Necessary physical evidence |
| --- | --- | --- |
| Incomplete offline map/package | Asset/resource checks, decoding, coverage sweep, missing/corrupt assets and failed/interrupted imports; real SQLite version/progress recovery | Cold launch with Metro stopped and networking off; whole-area pan/zoom and usable media. Engineer-operated phone check |
| Native map changes disturb the accepted session | Pinned dependency review, both APK builds, required permissions and audio markers; screen open/close, playback and recovery checks | Live locked location and actual audio/remote controls as affected. Preserve the accepted native adapter and source-build guard |
| New cue/story handover violates intent or loses position | Deterministic races in both orders; pause during loading/cue; interruption; skip/end; stale cue; death during handover; real SQLite checkpoint tests | Short audible cue → story resume and cue → manual pause → silence checks; focus/termination at the desk, moving-position relevance on a short verified segment |
| Bad route geometry or standing areas | Candidate research, suitable capture/worksheet preparation, then real pedestrian routing between inspected visitor positions; retain provenance and review every leg | Survey each retained stop/leg: actual access, crossings, viewpoint, spacing and walking time. GPS capture alone is not verification |
| Six-stop integration/content is unhelpful | Source/rights review, duration budgets, packaged directions/transcripts, six-stop replay and manual-player checks | One complete offline six-stop walk, locked during automatic sections, with planned safe manual interactions and a short content/UX debrief. Fix blockers and retest affected cases |

### Reusing M1 and retaining meaningful duration

M1 is accepted on the recorded Pixel 6 stack. Its three-minute silent gaps and three consecutive baseline walks are retained evidence; they are not a requirement to insert three minutes of silence between every stop of the M2 product.

For the native map addition, plan one targeted locked silence-to-arrival regression on an already checked segment after desk checks pass. Retain at least three minutes of genuine silence for that case. Reuse the accepted M1 route/fixture rather than fabricate a new short route. A roughly 10–15-minute case may be batched with another compatible visit if the verified geography and build permit; it is not automatically a separate outing. Broader audio/location/SDK changes or a failure require a correspondingly broader regression plan, potentially the relevant M1 matrix.

Ordinary cue/seek/focus tests need only seconds of speech. Use separate labelled test audio where a longer story must outlast a short approach. Do not lengthen every product story to create a timing test. Fresh stationary callbacks, manual holds, pending-stop eligibility and saved seek targets remain mandatory. Short tests do not establish endurance, universal GPS accuracy or other-device support; revisit M3's field plan after M2.

## Owner-time budget and stopping rules

These are preparation targets, excluding travel, not booked outings or promises that failures need no retest:

1. **Connected phone session:** aim for 5–10 minutes of owner prompts/audible confirmations; the engineer needs the handset longer for setup and checks. Do builds, scripts and failure injection beforehand. Restore the self-contained APK without clearing data and verify cold reopening with Metro stopped.
2. **Compact route survey:** provisionally 25–35 minutes once a candidate fits the target; collect the six visitor records and leg observations together. Route authoring/review and final scripts follow. This is separate from acceptance and cannot be replaced by remembered M1 playback observations.
3. **Completed tour:** target 20–30 minutes plus about five minutes of feedback. Batch any compatible targeted cue/arrival checks into a short nearby segment, provisionally 5–10 additional minutes if needed. Avoid turning the natural content evaluation into repeated interruptions.

The 20–30-minute goal describes the finished walk, not all owner effort across M2. Before each batch, give its actual build/route, purpose, time allowance, evidence to capture and stop conditions. Do not request a walk while offline resources, desk recovery or logs are broken. Stop the affected field case for unsafe/closed access, wrong/overlapping speech, a violated hold, failed required arrival or missing evidence. Preserve the attempt, diagnose it and request only the justified repeat. Define acceptable arrival placement at each reviewed viewpoint before judging its result.

Use the existing private diagnostic and named local-save workflow. Keep observations separate from progress; preserve previous attempts. Record build/content versions, network/lock conditions, requested and actual audio, fresh fixes, cue/hold/seek transitions, failures and the owner's audible/physical observations. Synthetic replays do not certify field behavior.

## E1 and the next implementation discussion

E1 remains a separate supervised comparison requiring both variants to be walked/listened to, with at least three narrated samples each, meaningful predicted differences and an explicit owner outcome. Re-author its briefs for the compact area and comparable short duration after route feasibility is known. Reuse shared factual/access evidence where applicable; preserve presentation order and do not count one mixed A/B walk as both complete variants. The earlier Finchley Central listening drafts remain historical preparation. No fixed E1 outing count or M3 time commitment is added here.

The recommended first implementation slice is still one small offline map and a read-only map/session boundary, now for the North Finchley candidate area. Prove fully local tiles/styles/fonts/icons, resource failures and native compatibility before settling the package map format. Current MapLibre Android [documents local PMTiles sources](https://maplibre.org/maplibre-native/android/examples/data/PMTiles/); React Native integration remains an experiment, not an established capability of this app. [Protomaps regional extracts](https://docs.protomaps.com/basemaps/downloads) are a proposed data source, subject to recorded resource licences and rights. No package/runtime dependency, map data or APK has been changed by this planning record.
