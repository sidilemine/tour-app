# Local tour factory

**Current work:** new jobs use Sol6.1 medium and the owner-authorized personal-beta completion policy. Duration and stylistic differences are reported without rejecting the tour. Concrete access, factual, direction and required package defects still need correction. Earlier trials remain recorded under their original rules. [Results](RESULTS.md), [per-role costs](COSTS.md).

The assignment was to finish the fresh 60-minute Hampstead station loop, then run an entirely fresh 60-minute Highgate Underground exterior loop with the accumulated factory fixes and compare the two runs. [Actual results and blockers](RESULTS.md), [per-agent usage](COSTS.md), [plan and boundaries](PLAN.md), [Hampstead brief](../../../../fixtures/generation/factory/hampstead-brief.json), [Highgate brief](../../../../fixtures/generation/factory/highgate-brief.json). Previous authored content is excluded. Existing offline map/player and George model files are infrastructure.

**Model access correction, 7 October:** fresh briefs can select `gpt-6-sol` or `gpt-6.1-sol` at medium effort as well as Astra. Both Sol models passed live text/function/history/structured-output/image checks on the existing grant with overflow off. Removed the adapter's incorrect catalog-membership gate and the factory brief's Astra-only restriction. Historical Astra jobs retain their model; changing a resumed job's model is still rejected. [Evidence and separate calibration usage](../SOL-ACCESS-2026-10-07.json). Historical policy2/3 jobs enforced duration bounds and proportionate crossing review. New policy4 jobs retain practical crossing review while making duration advisory. Historical results remain as detailed in [results](RESULTS.md).

Hampstead **package v3** contains four actual George recordings totalling **328.1 seconds**, a **1,295.669711 m** route including return, and no walking chapters. Its complete estimate is **1,887.824759 seconds (31m28s)**; walking is estimated and narration is measured. The requested hour remains unmet. The final supplemental package review **accepted at 01:24:19 UTC**, completing the compact inspection-draft handoff. The run used **47 requests** over **6,398.69 seconds elapsed**, including engineering and owner pauses. Listening and field observations remain pending. The first fresh Highgate trial stopped at route review after **24m58s**, **32 requests** and **1,260,232 known tokens** (one request usage unknown). It produced no accepted route, script or audio. The subsequent [second Highgate brief](../../../../fixtures/generation/factory/highgate-final-brief.json) started afresh after the routing fixes with a **45-minute generation allowance** and **US$0** direct ceiling; previous trial content is excluded.

```sh
npm run generation:factory -- fixtures/generation/factory/hampstead-brief.json local-data/generation/hampstead-fresh-factory
```

Use the existing app-specific sign-in and owner-observed overflow-off evidence. Renewal rotates only that grant. The factory has no API-key or paid fallback. A live search calibration is separately available as `npx tsx tools/generation/factory/preflight.ts <new-ignored-directory>`; it consumes one authorized plan request and retains its actual usage. Do not repeat it routinely.

The command creates a Balanced job with a 20-minute default or the fresh brief's explicit `generationMinutes` allowance, recorded at creation. Early Highgate briefs declared45minutes; the latest declares90minutes. These do not reset any earlier job. Limits are 16 candidates, two targeted research rounds, three route proposals, two consolidated correction batches and one corrective render per changed clip. Failed work consumes the same allowance. A blocked job is not reset by rerunning the command. Completed phases may be reused only with identical input/prompt/schema bindings; uncertain interrupted requests need inspection rather than automatic replay. Existing complete handoffs print without regenerating. A checked settled provider failure can receive one explicit technical retry per phase with `--retry-known operation-id "checked failure and fix"`; this retains the original deadline, failed round, files and input binding. Unknown dispatches cannot use this shortcut.

`starting-inputs.json` records the brief, empty authored-input list and implementation hashes. `requests/` retains explicit context and observed returns per operation. `phases/` contains typed artifacts bound to exact inputs. Retrieved passages must match actual `read_page` responses; semantic entailment remains an independent review, not a substring test. Source pages are untrusted data. Full source text, provider history and local paths stay private in ignored `local-data/`; retained supporting quotations are minimal.

Physical research can request bounded OSM features and actual JPEG/PNG images. Image sources may have no textual quotation only when matching archived bytes and tool closure prove that the image was supplied to a completed model request. This establishes transport and source identity, not correct visual interpretation or equivalence between camera and visitor positions. Map retrieval is serialized, spatially clipped and capped; imagery dates remain unknown unless sourced. The verifier may reopen retained source URLs to judge a claim in context rather than mistaking a short quotation for the whole source.

The final request in each phase disables tools and requires synthesis from retained evidence. Explicit recovery commands cover checked local integration failures (`--resume-checked`), the old missing-synthesis defect (`--finalize-retained`) and schema revalidation of completed retained text (`--recover-output`). Each needs documented evidence and preserves the original deadline, counters and operations. They do not authorize extra time or overwrite an accepted artifact. `amend-budget.ts` exists for an explicitly approved total elapsed allowance; it records old/new deadlines from the original start and never resumes automatically. The owner approved a 45-minute total allowance on 7 October; it was applied to the current job with the original start preserved. See RESULTS for the actual continuation outcome.

`job.json` and `usage.json` retain requests, role, input/output/cache/reasoning tokens, failures, direct charges and dated token-only API-equivalent ranges. Reasoning is already in output tokens. Unknown usage is never zero. These figures measure the generated-tour runtime; implementation-assistant token usage is not available through this ledger. Hosted-tool accounting and subscription/API equivalence remain uncertain; the estimate is not an invoice.

After the runs finish, `node --import tsx tools/generation/factory/benchmark.ts <hampstead-directory> <first-highgate-directory> <final-highgate-directory> <report.json>` produces the redacted comparison. It separates creation/first dispatch to terminal elapsed time, including pauses, from summed provider activity; parallel provider time is not wall time. It retains request and per-role known/unknown usage, actual local-tool receipts and failures, recovery/time-amendment events, phase completion and measured package timing. Package recording counts are separate from corrective-render counters. Compare outcomes at the same completion stage; Hampstead's supervised engineering/recovery time and Highgate's fresh-run conditions differ, as do the areas. Helper usage remains unavailable.

`package-v*/` contains the immutable real player package, review transcripts, complete decoded audio and measured preparation record. Public routing includes the station return. Walking chapters require a launch interval clear of both stops and sufficient time from the latest launch to the next navigation decision. Their audio overlaps walking; stationary audio and looking/crossing allowance are added separately. Public FOSSGIS routing is for bounded personal authoring and is not a production service dependency.

A successful automated handoff is **awaiting listening**, not physically accepted. `handoff.json` states the actual package, timing and remaining observations. No mobile code is changed by factory generation, so the earlier phone acceptance evidence is reused; no new APK or full regression walk is required just to test these authoring tools. A generated tour can be imported through the existing package flow after its required review.

## Verification

Run `npm run typecheck`, `npm run lint`, `npm test` and `npm run docs:check`. The current checkpoint has **342 tests passing**, with full typecheck, lint and documentation parity passing. The final live run began at the339-test checkpoint; post-run metadata/arrival corrections have separate regressions. Focused factory tests use synthetic evidence and audio transport to exercise the complete flow, correction/failure paths, actual parser, usage preservation, source validation, safe HTTP boundaries, deadlines, immutable cache and no-replay behavior. Package-specific checks additionally exercised Hampstead v3's parser, rejected missing-asset/corrupt-base64/unsupported-version clones and its actual fixture's manual selection/Pause/Resume/End reducer effects without playback. Builder receipts separately retain actual audio decode, hashes and duration checks. None establishes human listening, phone import or a physical walk. No mobile code changed.

For an explicitly approved allowance starting at actual resumption, use `node --import tsx tools/generation/factory/amend-budget.ts <directory> --from-now 30 "explicit owner decision"`. The owner approved this basis on 7 October; it was applied at **00:28:19 UTC**, setting **00:58:19 UTC** while retaining all usage and non-time counters. A further recorded owner-approved continuation runs from **00:59:17 to 01:29:17 UTC**. The original 20-minute envelope, 45-minute total-from-start approval and both later continuations remain separate events. See RESULTS for the final outcome rather than repeating a stale recovery command.

New route phases use a frozen protocol version: propose a supported stop order, resolve the station using bounded transit-specific mapping, then request measured pedestrian geometry and independent scouting. Existing dispatched phases retain their original prompt/tool bindings on resume. Research notes and qualifiers remain in every draft-review context; the factory's structural validator does not require internal notes verbatim in speech. Independent verification must judge their meaning, attribution and uncertainty. Review tools reopen exact retained map text and proven image pixels from this job.

For a completed model tool request blocked by a checked local validator defect, `--complete-tools <phase> "checked repair"` completes missing read-only receipts once and consumes only the remaining synthesis slot. It requires settled operations, matching bindings, valid tool identities/arguments, an unused final slot and the active deadline. It cannot authorize another route proposal or research round.


A third-route rejection may receive one bounded Scout disposition on the **same frozen geometry and stops** after a documented tool repair. The original rejection is preserved. A separate crossing lookup includes unnamed `highway=crossing` nodes that ordinary place discovery omitted; it does not certify present street conditions. The disposition must explicitly accept, close required issues and supply directions for every unchanged leg. It cannot silently override a rejection, invent access, create another route proposal or reset any counter. Final-request tool restrictions apply to that request, not earlier authorized history.


Successful route/Scout text receipts are frozen separately in `route-evidence.json`, with exact source identity, text hash and operation/call provenance. These expand verification access only to evidence actually retrieved in the relevant job phases. Later review contexts retain the original route rejection and complete disposition; existing contexts remain unchanged through phase-protocol bindings. Pre-render reviews assess content; synthesis is already authorized and actual duration/assets are checked afterward. An upper time-budget pass does not establish an approximately hour-long experience.

New route protocol 4 can bind ordered through points to actual retained OSM vertices and request a preference for mapped walkways. Every returned point must be visited in order within3m; this is geometry verification, not access or safety acceptance. The public server accepts at most10 locations, so larger requests are split into existing tour legs with response hashes, connected joins and a deadline check immediately before each outbound request. Independent Scout review still decides whether the resulting connections are supportable. Decision-dense routes may use stationary-only narration. The feasibility gate reserves80seconds per stop; actual rendered duration and review still determine final fit. Existing dispatched protocol bindings remain unchanged.


The subsequent `highgate-fresh-factory-v2` trial also stopped before writing: unresolved physical places did not enter the remaining research allowance, and its third route response was interrupted. The original15requests and591,347known tokens remain recorded. The [fresh verification brief](../../../../fixtures/generation/factory/highgate-verification-brief.json) exercised the readiness repair after automated review; its blocked outcome is recorded above. Prior trials remain closed; no counters or authored inputs are reused.


Final verification command (historical job is closed):

```sh
npm run generation:factory -- fixtures/generation/factory/highgate-verification-brief.json local-data/generation/highgate-fresh-factory-v3
```

Rerunning a blocked job does not extend its limits. Do not use a technical retry for a fourth route proposal or to conceal the unresolved crossing sequence. New producer protocols for readiness and stationary arrival activate only before any route task/artifact exists. The final live run preceded the small composite-time and stationary-arrival fixes; their focused regressions and read-only artifact checks are separate evidence, not retroactive live validation.

### Fresh Sol6.1 verification

The v4–v7 trials used strict duration policies; their retained jobs preserve those exact bindings. For a fresh personal-beta run use the new brief below. A reused output directory preserves completed phases, counters and accounting; it does not start another fresh tour.


Direction preparation protocol3 permits up to20 lines, matching the existing player. The compiler preserves approved wording while splitting long lines at sentence boundaries. If the complete return exceeds the duplicate finish field, that field explicitly directs the visitor to the final story’s existing Read / directions control, which retains every return step. Review protocol4 describes that actual layout; a historical null projection caused by a compiler error requires a separate exact integration review after the local fix. It cannot approve changed content or erase prior findings. New writer protocol3 keeps research-audit disclaimers out of speech and distributes the word budget according to supported substance.


## Dated local map evidence

A fresh brief may bind `mapEvidence.path` (inside ignored `local-data`) and its SHA-256. Map queries then use that immutable snapshot, retain source and query identities, and reject queries outside its declared extent. This is reusable geographic infrastructure; each job still obtains its own tool receipts and fresh editorial research. It avoids the observed Overpass outage, while page reads and Valhalla routing remain online. It is currently scoped to dated Greater London Geofabrik extracts, not a global map backend.

Prepare the isolated parser with `python3 -m venv local-data/generation-map-env` and `local-data/generation-map-env/bin/pip install --index-url https://pypi.org/simple -r tools/generation/factory/map-requirements.txt`. Download the dated PBF and matching MD5 from the [official Geofabrik London directory](https://download.geofabrik.de/europe/united-kingdom/england/greater-london.html), then run:

```sh
local-data/generation-map-env/bin/python tools/generation/factory/extract-map.py local-data/generation-map-data/greater-london-261006.osm.pbf local-data/generation-map-data/highgate-261006.json --bounds=-0.165,51.552,-0.125,51.585 --source-url https://download.geofabrik.de/europe/united-kingdom/england/greater-london-261006.osm.pbf --md5 local-data/generation-map-data/greater-london-261006.osm.pbf.md5
```

Use the emitted snapshot SHA-256 in a new brief. Never overwrite a bound snapshot or change a resumed brief. The extractor validates the downloaded checksum and retains the original data timestamp. This example has data through 6 October 2026, 20:21:06 UTC. Refresh explicitly for future work; there is no claim of live closure information. Tagged nodes/ways are retained; relations are omitted and extent-edge geometry has explicit gaps. Query truncation and access uncertainty stay visible. Do not infer absence from a limited result.

For a route rejected as too short, new jobs can now use still-available physical research on existing unresolved candidates before the next proposal. No research/route limit is increased and genuine final underfill still fails.


Planning protocol5 supplies the real bundled playback-map bounds from the first proposal and measured per-leg routing diagnostics after a rejected proposal. Research-map query coverage is separate. Revisions must examine the oversized actual legs and their optional shaping constraints, rather than infer a fix from the total duration alone. Direct endpoint distance is not a routed alternative. Exhaustive pavement shaping is no longer encouraged; independently reviewed public access and correct directions remain required.


Planning protocol6 exposes ordinal `leg-1` through `leg-7` identifiers in the model's structured-output schema; existing plans retain their old bindings. New disposition-timing protocol2 spends the existing single frozen-route correction allowance at the first failed Scout before research or another proposal, rather than reserving it for proposal3. This can fix directions from retained evidence without mandatory new search. It is still one correction per job, at most three requests shared with its contradiction closure. A failed correction cannot be repeated on later routes; genuine unresolved access still goes through the original research/proposal limits.

## Personal beta simplifications — 7 October

Sidi selected completion despite tolerable imperfections, with later tightening guided by actual use. These changes apply to new jobs (experience policy4); saved policy1–3 jobs and historical results retain their original rules.

| Boundary | First beta pass |
| --- | --- |
| Duration | Aim near the requested length; report actual audio plus estimated walking/allowance and the difference. No duration veto, padding or forced rerender. |
| Discovery/research | Target1–3 published guides and a small candidate pool; unreadable guides are gaps. No fixed page/source/claim quota. Read actual supporting pages and preserve claim evidence. |
| Stop count | Allow three worthwhile stops rather than requiring a fourth. Paragraph count is flexible for short encounters. |
| Physical evidence | Public mapped approaches and intelligible crossing instructions suffice. Read imagery only for a consequential ambiguity; retain real access/direction blockers. |
| Review | Prepare canonical directions, then one independent combined content/route review instead of separate Scout/editor/verifier loops. Editorial and duration categories cannot veto. |
| Correction | At most one focused content/direction correction, using existing research and geometry. Remove unsupported incidental details; real unresolved material findings still fail. |
| Voice layout | Split oversized paragraphs locally without changing words or claim links. An optional chapter that exceeds its navigation window is omitted; stationary audio stays cached. |
| Package handoff | Keep builder decode/hash/duration checks, actual player parsing, offline assets and manual-control checks. Remove the additional model tester and its subjective veto. |
| Tool compliance/context | Discovery still attempts hosted search. Research/physical repairs need not repeat search when actual retained pages/maps suffice. Send map geometry once; retain its full snapshot locally. |

`handoff.json` returns `beta-draft`, the measured/estimated duration, limitations and no mandatory owner actions. Listening and an ordinary walk remain unobserved feedback. The underlying job uses its existing awaiting-decision state for optional review, rather than claiming physical acceptance. `beta-notes.json` preserves raw and effective review findings; phase artifacts retain every original verdict. A reviewer verdict alone cannot reject a tour without a consequential required issue. The sanitized report includes beta summaries and per-role token accounting.

```sh
npm run generation:factory -- fixtures/generation/factory/highgate-beta-v8-brief.json local-data/generation/highgate-beta-v8
```

Verification before the live trial:374automated tests, typecheck and lint pass. Focused complete-package replays cover short/long duration, three stops, fewer sources/unavailable published guides, advisory negative reviews, actual factual omission, local station-direction correction, cached audio after optional-chapter omission, and unchanged wrong-crossing/corrupt-package rejection. Paragraph formatting preserves words, references and source artifacts. These are synthetic workflow/media checks; they do not establish actual voice quality, walking access or enjoyment. No native/player dependency changed and no new phone test is required for this implementation pass.

The first live beta trial exposed an additional avoidable evidence-format failure. New beta validation treats newline-separated textual excerpts as separate quotations (each must occur exactly in the retrieved page, with the same25-word total per URL). Structured map observations require their real retained map identity/payload instead of pretending to be literal webpage quotations. This does not certify the observation: material coordinate/access interpretations remain subject to the combined route/content review. Historical validation remains contiguous. The original run, two repair calls and costs are retained before checked same-job resumption; no fresh discovery restart or deadline/counter reset is needed.

Evidence-format correction verification:376automated tests, typecheck and lint pass. The new focused cases retain fabricated-text/missing-map rejection and the25-word source allowance; all three real v8 research artifacts validate under the corrected formats before same-job recovery.
