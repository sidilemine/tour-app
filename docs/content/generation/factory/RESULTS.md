# Fresh Hampstead factory result — 7 October 2026

**Implemented and tested in simulation; the first live run is blocked before route approval. No fresh finished tour or audio package has been produced.** The owner supplied 60 minutes, no walking constraints and no reuse of earlier material. The system began with an empty authored-input list and a fresh survey. Existing player, map and George files were reused as infrastructure.

## Demonstrated behavior

- Official app-specific credential renewal and a separate actual hosted-search request succeeded. [Calibration](SEARCH-CALIBRATION.json) records one completed search, 15 returned sources and observed usage.
- The new live survey found four published Hampstead walks and ten candidate places. The job retained its initial research, the route planner's refusal and subsequent physical research. [Sanitized job and request ledger](RUN.json).
- The physical research return contains 16 sources (eight text, four map, four image), 15 proposed claims and four proposed places. Actual image bytes were supplied to completed requests. After fixing the visual source contract, read-only validation of the already completed output succeeded. [Retained research and image receipts](RETAINED-RESEARCH.json). This artifact was subsequently recovered into the job after explicit time approval; independent verification has not run.
- Generic packaging uses the real player parser, immutable versions, exact-text/voice cache receipts, complete audio decoding and measured duration. Synthetic complete runs exercise the ordinary handoff and an overlong version followed by corrected, independently reviewed version 2 with only changed audio rendered again.

## Live failures and repairs

| Observed failure | Repair and evidence | Remaining limit |
| --- | --- | --- |
| First survey request: HTTP 400 `invalid_json_schema` | Convert only the provider wire schema to its supported subset; retain strict local validation. One checked technical retry, original ledger retained. | The earlier boolean capability probe had not exercised the richer schema. Rejected request has unknown token counts. |
| Route planner refused because visitor positions were unresolved; placeholder stop IDs caused `Unknown stop` | Preserve refusal and request targeted map/image research instead of attempting routing with invalid IDs. | No real pedestrian route has yet been requested or accepted for this run. |
| Broad OSM responses were truncated, exceeded the byte cap or returned 429 | Bound and prioritize local nodes/ways, clip geometry, serialize requests with a quiet interval, cache exact responses. | Resumed live requests returned compact station and Observatory maps; one smaller follow-up returned HTTP 504. This does not establish map-service reliability. |
| Physical research used all tool rounds without final JSON | Reserve the final request for tool-free synthesis. One explicit retained-history synthesis repaired this run without another research round. | The intervention means this was not an unattended success. |
| Completed physical report had empty quotation strings for image sources | Accept empty image passages only with verified image-input receipts; text/map passages still require exact fetched text. Archived output passes this corrected contract without inference. | Original deadline expired before recovery; owner-approved continuation subsequently promoted the retained output without replay. Independent claim/route review remains necessary. |

The job began at **23:37:41 UTC on 6 October**, with its original **23:57:41 UTC** deadline. The last schema failure occurred at 23:54:41, about 17 minutes after start; the deadline then expired while engineering fixes continued. Counters remain ten candidates, one targeted research round, one route proposal, zero content corrections and zero audio renders. All 13 operations are settled; there is no unknown dispatch outcome. One settled schema rejection lacks token counts.

The owner approved **45 minutes total from the original start** on 7 October. The explicit amendment set the deadline to **00:22:41.168 UTC**, preserving counters and usage. Recovery began at 00:20:09 and promoted the already completed physical research under its repaired contract without a model replay. The original request retains work limits despite zero direct cash cost. Because the total was measured from the original start, most of the extension elapsed during engineering/reporting and the permission exchange; it did not grant 25 new minutes from resumption. The proposal should have made that practical consequence clearer.

## Approved continuation outcome

The recovered research passed its evidence contract. Operation 14 completed a second route proposal, correctly identifying three eligible places and the unresolved station/fourth-stop questions; invalid placeholder IDs were rejected before routing. Operations 15–17 completed targeted evidence retrieval: compact station/Observatory map data and actual Observatory pixels. One smaller map query returned HTTP 504 and one station-photo attempt returned HTTP 403; subsequent alternatives succeeded. Failed results remain recorded.

Operation 18 was synthesizing the updated report when its 66-second remaining-time timeout fired at **00:22:41.062 UTC**. It retained 13,084 characters of partial text but had no terminal completion or observed token usage. No fragment was promoted as completed research. All 18 dispatch outcomes are settled, with two unknown-token operations overall. Non-time counters remain ten candidates, **two research rounds, two route proposals, zero corrections and zero audio renders**.

The job is blocked at the approved deadline; no scripts, audio or fresh package exist. A separately approved continuation can perform one checked retry of operation 18 as the fifth, tool-free synthesis request using retained evidence, then use the remaining route proposal and downstream review/build allowances. No additional research round is available. The prepared `amend-budget.ts --from-now` option sets a separately approved deadline from actual resumption and records the prior deadline; it has not been applied. The proposed next allowance is 30 minutes from resumption, US$0 direct paid, retaining all counters and costs.

## What still blocks the finished tour

The next run must finish the retained second physical-research return, resolve the station standing point and any essential viewpoint uncertainty, obtain actual pedestrian geometry and independent route/scout acceptance, then write, review and correct the exact draft before rendering local George and measuring the complete package. The Observatory proposal currently retains a conditional dome-view uncertainty; the producer must resolve or redesign that encounter rather than erase it. The other three proposed places are Fenton House exterior, Admiral's House public footway and New End hospital street exterior. Proposed research is not an accepted itinerary.

The software enforces these stages and preserves missing evidence. Its sufficiency for unattended authoring and the 20-minute envelope is not demonstrated. Research context grew to roughly 150,000 input tokens in the final synthesis; context selection/caching deserves review after correctness, using retained requests rather than guessing at savings. [Per-role spend and limitations](COSTS.md).

## Verification and handoff

`npm run typecheck`, `npm run lint`, `npm run docs:check` and **291 tests** passed at the implementation checkpoint. After the continuation, 29 focused runtime/budget tests, typecheck, lint and docs consistency pass; two new tests exercise an explicit allowance from resumption. Focused checks cover refresh/account binding, live-search metadata extraction, provider-schema conversion, source passages, real image-input proof, safe public fetches, bounded map results, route geometry/chapter timing, unknown dispatch handling, deadlines, retained-output recovery, explicit budget amendments, independent exact-draft reviews, measured audio correction and immutable real-player packaging. Synthetic providers, sources and audio in these tests are disclosed; they do not prove factual quality, current physical access or a live finished tour.

No mobile implementation changed. No new APK, phone playback, listening or outdoor result is claimed or requested for this software checkpoint. Any eventual successful automated package remains **awaiting listening**, with field limitations explicit. No remote push, deployment or publication occurred. Five unrelated owner Word documents remain untouched.
