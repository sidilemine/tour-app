# M2: shortest useful walk and physical evidence

Planning discussion, 15 September 2026. Sidi requests the shortest walk consistent with valid testing, starting around North Finchley bus station and ending nearby. This supersedes the earlier provisional area/duration preferences, not the six-stop acceptance criteria. Sidi subsequently authorized the discussed first offline-map slice. The first map slice is now verified using automated/build, desk and [reviewed outdoor evidence](../test-results/M2-outdoor-map.md). The omitted stationary minute remains recorded; accepted unchanged M1 evidence is reused and no repeat map outing is requested. The survey and six-stop product below remain later work.

**Testing revision, 16 September:** apply the [personal-use policy](../../AGENTS.md#testing-policy-for-the-personal-prototype). The checks below describe ways to resolve material uncertainties, not an obligation to perform every case. Use accepted evidence first; request physical work only when the result could change the next implementation or Sidi's intended use. Rare recoverable issues may remain documented for feedback during ordinary use. No broad launch certification is required.

## Route brief

- Aim for **20–30 minutes including narration and pauses**, with six distinct, useful stops. This is a design target, not a measured route or a guaranteed minimum.
- Investigate the compact Tally Ho / High Road / Lodge Lane / Nether Street area first. A short Hutton Grove / Dale Grove connection is a candidate if needed. Start and finish near the bus station, at a checked pedestrian standing place.
- Use original stories with usable directions and deliberate silence. The earlier 30–45-second suggestion is not a per-stop target: after editorial review, choose depth to suit the insight and budget against actual legs and planned pauses. The fuller Tally Ho sample is a writing proposal, not a measured tour-duration commitment.
- The earlier Finchley Central–Church End–Stephens House sequence was an unrouted editorial candidate. Its backtracking was not a deliberate route feature. The later suggested Friary Park circuit and 60–75-minute allowance are not needed to satisfy M2.
- Keep all six stops and review their spacing, safe viewpoints and story value. Do not manufacture six triggers at one junction, tighten GPS thresholds merely to fit, or count manual recovery as a successful automatic arrival. If the compact area cannot support six good stops, identify the failing constraint and propose the smallest extension.

### Desk-research candidates, not a selected itinerary

The [OpenStreetMap street layout](https://www.openstreetmap.org/#map=16/51.61290/-0.18100) was inspected on 15 September. No pedestrian-router output, field-approved geometry, visitor coordinates or final distance has been produced. The following is a candidate pool, not walking instructions or field evidence:

| Candidate | Research starting point | Required physical check |
| --- | --- | --- |
| artsdepot / Tally Ho | [artsdepot's own timeline](https://www.artsdepot.co.uk/timeline/) supports researching local entertainment and the Gaumont | Safe exterior meeting place outside vehicle/pedestrian flow; observable story detail |
| Former Torrington pub site | [Contemporary historical-society newsletter](https://www.friern-barnethistory.org.uk/userfiles/file/Newsletters/2000-2009/2004/No-19-Dec-2004.pdf) records the music venue's closure | Identify the former site and usable public viewpoint; do not assume the current business |
| John Parr memorial bench, Lodge Lane — not retained after editorial review | [Council notice, 6 November 2025](https://www.barnet.gov.uk/news/bench-honours-first-british-soldier-die-world-war-one) records a replacement bench at the car park edge after the earlier silhouette was stolen; the older memorial location record is stale | No physical check requested; Sidi prefers avoiding minor solemn sites. Preserve the source record without carrying this stop into route preparation |
| St Michael's exterior, Nether Street | [School history](https://www.st-michaels.barnet.sch.uk/home/school/) and [address](https://www.st-michaels.barnet.sch.uk/sixth-form/contact-us-2/) | A useful public view without entering or obstructing the school; replace if unsuitable |
| Finchley Progressive Synagogue / Hutton Grove | [The congregation's contact page](https://www.fps.org/about-us/contact-us/) identifies the site and says visitors should make contact beforehand | Exterior-only candidate; verify an appropriate public viewpoint, with no assumed entry or visibility beyond its gates |
| Trinity Church, Nether Street | [Church history](https://trinitychurchnorthfinchley.co.uk/history.html) and [location](https://www.trinitychurchnorthfinchley.co.uk/joomla/index.php/find-us) | Identify the building, exterior view and standing space; check separation from start/end |

The original sources were consulted on 15 September 2026; the John Parr bench correction was checked on 16 September against the council's indexed notice. These are discovery material; full claim review, minimal evidence passages, rights and physical review records remain necessary before narration/package readiness. The mix of institutions must earn its place through distinct stories and visible details, not merely supply a sixth address. Final selection and order remain open. After the [sample review](TALLY-HO-SAMPLE-V2.md), the memorial is excluded from the active shortlist; six suitable stops still need to be found and selected. Do not count the retired candidate or manufacture a replacement merely to fill the table.

## What establishes confidence

M2 in [ROADMAP](../../ROADMAP.md#milestone-2--curated-six-stop-offline-walk) specifies no minimum total walking time. Its essential physical evidence is a complete six-stop experience with reviewed access/viewpoints, useful directions, automatic arrivals, manual controls and owner feedback. Shortening the walk is acceptable if all those observations remain meaningful.

| Risk | Engineer work before requesting field time | Physical check only if the question remains unresolved |
| --- | --- | --- |
| Incomplete offline map/package | Asset/resource checks, decoding, coverage sweep, missing/corrupt assets and failed/interrupted imports; real SQLite version/progress recovery | Cold launch with Metro stopped and networking off; whole-area pan/zoom and usable media. Engineer-operated phone check |
| Native map changes disturb the accepted session | Review affected dependencies and reuse the completed map-slice evidence; preserve permissions, audio markers and source-build guard | This slice is closed. Further native changes need only the checks relevant to their actual effects |
| New cue/story handover violates intent or loses position | Relevant deterministic races, holds, stale cues and real SQLite checkpoints; reuse unchanged focus/recovery evidence | A short audible cue → story resume and cue → manual pause → silence check. Add native focus, termination or moving-position cases only for an uncovered change or failure |
| Bad route geometry or standing areas | Candidate research, suitable capture/worksheet preparation, then real pedestrian routing between inspected visitor positions; retain provenance and review every leg | Survey each retained stop/leg: actual access, crossings, viewpoint, spacing and walking time. GPS capture alone is not verification |
| Six-stop integration/content is unhelpful | Source/rights review, duration budgets, packaged directions/transcripts, six-stop replay and manual-player checks | Use the complete offline six-stop tour, locked during automatic sections, and give brief feedback. Ordinary use counts; fix blockers and retest only affected cases, keeping recoverable issues visible |

### Reusing M1 and retaining meaningful duration

M1 is accepted on the recorded Pixel 6 stack. Its three-minute silent gaps and three consecutive baseline walks are retained evidence; they are not a requirement to insert three minutes of silence between every stop of the M2 product.

The native-map regression is complete, including more than three minutes of locked silence before automatic arrival. The omitted stationary minute is explicitly covered by reuse of accepted M1 evidence, not reported as newly performed. No further map outing is needed. Future audio/location/SDK changes require a review of affected behavior and the smallest meaningful regression; they do not automatically reopen the M1 matrix.

Ordinary cue/seek/focus checks need only seconds of speech. Use separate labelled test audio where a longer story must outlast a short approach. Do not lengthen every product story to create a timing test. Preserve fresh-position checks, manual holds, pending-stop eligibility and saved seek targets through implementation and targeted evidence; do not independently repeat every physical case. Short checks make no endurance or other-device claim, and those claims are unnecessary for the present personal-use goal.

## Owner-time budget and stopping rules

These are earlier preparation estimates, excluding travel, not required sessions or minimum durations. Before requesting any of them, reduce the work to the remaining question and reuse observations from ordinary use:

1. **Connected phone session:** aim for 5–10 minutes of owner prompts/audible confirmations; the engineer needs the handset longer for setup and checks. Do builds, scripts and failure injection beforehand. Restore the self-contained APK without clearing data and verify cold reopening with Metro stopped.
2. **Compact route survey:** provisionally 25–35 minutes once a candidate fits the target; collect the six visitor records and leg observations together. Route authoring/review and final scripts follow. This is separate from acceptance and cannot be replaced by remembered M1 playback observations.
3. **Completed tour:** target 20–30 minutes plus about five minutes of feedback. Batch any compatible targeted cue/arrival checks into a short nearby segment, provisionally 5–10 additional minutes if needed. Avoid turning the natural content evaluation into repeated interruptions.

The 20–30-minute goal describes the finished walk, not a testing quota. Before a field request, state the unresolved question, why existing evidence cannot answer it, the shortest useful procedure and when to stop. Do not request a walk with known blockers to the intended use. Stop for unsafe/closed access or loss of usable controls; record an occasional recoverable arrival or content defect and continue with manual fallback when practical. A missed observation or failed arrival stays missing/failed, but does not by itself justify repeating the whole walk. Define useful arrival placement at each reviewed viewpoint before judging it.

Use existing diagnostics to capture technical details. Ask Sidi for a short account of what worked and any problem; request timing, conditions or a local export only when needed to resolve the current question. Use the existing private diagnostic and named local-save workflow, keep observations separate from progress and preserve prior attempts. Synthetic replays do not certify field behavior.

## E1 and the next implementation discussion

E1 remains a separate supervised comparison, with at least three narrated samples per variant, meaningful predicted differences and an explicit owner outcome. Start with short listening samples; add representative walking segments only for location/pacing questions that matter to the choice. Reuse shared paths and factual/access evidence. Preserve presentation order and distinguish listening feedback from actual walking observations; no two-full-walk quota applies. Re-author the briefs for the compact area after feasibility is known. The earlier Finchley Central drafts remain historical preparation.

The authorized first implementation slice was one small offline map and a read-only map/session boundary for the North Finchley candidate area. MapLibre Android [documents local PMTiles sources](https://maplibre.org/maplibre-native/android/examples/data/PMTiles/). At planning time, React Native integration was unproven and [Protomaps regional extracts](https://docs.protomaps.com/basemaps/downloads) were a proposed data source. The subsequent implementation pinned the map library, recorded resource rights, built both APK variants and verified native offline drawing, repair and session coexistence on the Pixel. The [slice record](../test-results/M2-offline-map.md) and [outdoor review](../test-results/M2-outdoor-map.md) close that work; no map physical gate remains. General package import and the verified walking route remain separate work.
