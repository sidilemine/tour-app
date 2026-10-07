# Local factory results — 7 October 2026

**Current implementation:** fresh jobs use the owner-selected Sol6.1 medium on the existing app grant, with overflow off and US$0 direct paid ceiling. Duration feasibility is enforced before writing and actual audio plus estimated walking/allowances must meet55–65minutes for the60-minute brief. Proportionate crossing review and complete canonical directions are implemented. Both Sol models pass capability checks; Sol6.1 also passed hosted search and is running the full factory. [Model evidence](../SOL-ACCESS-2026-10-07.json), [search calibration](../SOL61-SEARCH-2026-10-07.json).

**Latest live checkpoint:** fresh v7 at`090acdb` closed after17m06.938s,18inferences and1,219,532known tokens, none unknown. It exercised the ordinal output contract, local maps, offline bounds and per-leg feedback without engineer intervention. Three real routes reduced the length but the final conservative estimate was66m19, outside the current55–65minute range; no Scout/content/audio phase was reached. A full accepted hour and unattended reliability remain unproven. The owner has been asked whether earlier permission to extend duration includes a worthwhile walk up to75minutes, or only generation time. No duration requirement has been changed pending that clarification. V3's50m45package and all failed trials/costs remain retained.

**Implemented underfill correction:** policy3 accepts route feasibility only when walking/allowance plus80seconds per stop reaches the lower bound. It does not assume three-minute stories everywhere. Writer budgets use an approximately2.3word/sec George infrastructure estimate; final audio is still measured. This directly rejects the third run’s2.617km geometry before writing. No narration padding, slower playback, inflated allowance or old source material is used.

The following four-job table is the historical Astra baseline. Its immutable records remain unchanged; later Sol6.1 trials and all failed work are accounted separately below and in[COSTS](COSTS.md).

| Live job | Wall elapsed | Requests | Known tokens | Usage-unknown requests | Outcome |
| --- | ---: | ---: | ---: | ---: | --- |
| Hampstead | 1h46m39s | 47 | 2,022,776 | 3 | Tested offline inspection draft;31m28 rather than60m |
| Highgate first trial | 24m58s | 32 | 1,260,232 | 1 | Route review blocked |
| Highgate second trial | 8m08s | 15 | 591,347 | 1 | Readiness coordination defect; later stream interruption |
| Highgate final verification | 24m22s | 37 | 1,936,810 | 0 | Readiness/through-point fixes exercised; route review blocked |

Those four historical runs used consented Astra medium and **US$0 direct paid usage**. The four jobs total131requests and5,811,165known tokens, with five additional requests of unknown usage. The final run's token-only API-equivalent estimate isUS$20.8745–25.4507; that is not a charge. Per-role figures, failed work and exclusions are in[COSTS](COSTS.md);[BENCHMARK.json](BENCHMARK.json) retains exact timings, versions and completion stages. Cross-area elapsed differences cannot establish causal improvement.

## Final fresh Highgate verification

This section records the historical Astra baseline.

Implementation commit `1b06692`; empty authored inputs; fresh sources and geometry. Started **02:21:53.020UTC**, ended **02:46:15.017UTC**: **1,461.997seconds**, with **1,317.32seconds summed provider activity** (not wall time). All37provider requests completed with known usage. No technical retry, manual content replacement, time extension or in-run implementation intervention occurred. The final software metadata/navigation corrections recorded below were made after this run; its artifact hashes and implementation identity remain unchanged.

The readiness gate used one existing research round to resolve four places before consuming route proposals. The second round addressed the first Scout rejection. The three actual routes passed21,23and22ordered through-point checks; ten distinct successful routing HTTP responses were cached, with repeated components reused. The final route removed the earlier Southwood detours and completed the constrained Southwood and Highgate High Street crossings. Model tool receipts record22/24successful page reads,17/20ordinary map reads,4/4station maps,9/10crossing maps and9/9image reads. Failed reads remain visible.

**Actual blocker:** legs2and4 still connect through North Road crossing midpoints and carriageway geometry without an established complete pavement-to-island-to-pavement sequence. The final disposition explicitly considered `sidewalk=both`; a mapped public street corridor is supported, but those tags did not establish the selected junction sequence. The full divided-road crossing contains additional island/crossing components absent from that sequence. Through-point proximity is insufficient to verify connectivity. Three independently reviewed proposals plus one frozen-route disposition remained negative; the original two-research/three-route caps were not reset. No route acceptance, script, audio, package, listening or walk result was fabricated. [Redacted final record](HIGHGATE-FINAL-RUN.json).

Timing is a second unresolved constraint. Final geometry is3,123m/provider2,782.839seconds; prepared geometry is3,131.547m/2,609.622seconds at1.2m/s. After480seconds allowance, the conservative provider estimate leaves337.161seconds of narration. Four80second stories might fit, but the648second objective does not; there is no rendered audio to establish actual fit. Increasing the job's time allowance alone would not repair the route or create acceptable narration.

**Next step, revised after the 7 October owner discussion:** reassess the retained crossings and practical approach/onward directions under the [proportionate verification criterion](../../EDITORIAL-REVIEW-RECORD.md#7-october-2026--proportionate-crossing-verification). A road-centre line or partial mapped connector alone should not reject an otherwise usable instruction. This supersedes the proposed prerequisite for exact pavement-side and complete crossing-chain geometry; correct any concrete conflicting directions or access problems found in the targeted review. New runtime criteria now implement that policy; this historical benchmark remains unchanged. The closed job's exhausted caps remain intact. No sign-in, credit-overflow change, phone action or listening test is needed for that review. Source accounts and local audio infrastructure worked; route acceptance is the remaining factory readiness blocker.

## Hampstead outcome and earlier checkpoints

**The fresh Hampstead run produced an actual offline inspection package with four local George recordings. Final factual and production-editorial reviews accepted its content/navigation; the supplemental final package review accepted the now-supplied execution receipts. It is a31½-minute draft, not the requested60-minute tour, and needed explicit engineering interventions. Unattended success has not been demonstrated.** The owner requested a fresh60-minute Hampstead tour with no walking constraints. Existing player, map and local George files are infrastructure; the authored-input manifest is empty and no previous tour material entered the run.

## Observed progress

**Why Hampstead was only 31m28:** this was an underfilled design, not a recording cut off by the generation deadline. The selected four-stop loop is about1.296km; its planned walking time is17m59.7s at1.2m/s, plus5m28.1s of fully rendered narration and8minutes of looking/crossing allowance. The planner froze a compact cluster and the writer was instructed to produce four to six generally140–210word stories. No suitable walking chapters were available. Even the earlier600second narration scenario would have left the route at about36minutes. More synthesis time alone could not supply the missing28½minutes.

**Historical duration defect, diagnosed 7 October and now fixed for new jobs:** the builder's `withinTarget` means `totalSeconds <= targetSeconds`, a ceiling check. That historical factory reported underlength but lacked a lower-bound repair. New experience-policy2 jobs now test route feasibility before freezing, derive narration budgets from the real route, and use the existing bounded correction loop when actual audio leaves the whole estimate outside the requested range. Focused regressions include the actual31m28 Hampstead shortfall. That is implemented enforcement; a completed live duration result is recorded separately, without relabelling old packages. Generation deadlines were a separate real problem: the run required extensions and took1h46m39s wall time, but all four final recordings completed. [Timing calculation](../../../../tools/generation/builder.ts), [factory planning and handoff](../../../../tools/generation/factory/pipeline.ts).

- App-specific credential renewal and actual hosted search succeeded. The separately ledgered [calibration](SEARCH-CALIBRATION.json) retains its15 sources and usage.
- Fresh survey: four published walks and ten candidates. Latest validated research:20 sources,17 claims and four exterior places. Original returns, failed fetches and qualifications remain private in the job archive; [RUN.json](RUN.json) contains the sanitized record.
- The third proposal produced actual FOSSGIS/Valhalla pedestrian geometry:1,296m, five legs including station approach and return, with a provider walking estimate of18m11s. Stops: Fenton House, Admiral’s House, the reservoir/Observatory site, and New End. The Observatory story uses the general reservoir-site boundary; dome visibility and admission are not dependencies.
- Independent Scout initially rejected incomplete crossing directions. A corrected map query returned actual zebra node420703265 immediately north of New End. One bounded disposition accepted the exact route as a desktop draft and supplied complete pedestrian directions. Original rejection, evidence, geometry and standing points remain preserved. No fourth route proposal or extra historical research round was created.
- There are zero walking chapters: the route is too decision-dense for the required uninterrupted windows. Stationary narration is appropriate here.
- Actual encoded narration totals328.1seconds (5m28.1s). The1,295.67m route at1.2m/s plus480seconds for looking/crossings gives1,887.82seconds (31m27.8s). The requested hour is short by28m32.2s. Walking remains an estimate; no padding or physical timing is claimed.
- The immutable v3 package contains all four recordings, exact transcripts, complete approach/onward/return directions and a bundled offline-map reference. Every recording fully decodes; hashes, bytes, durations, text/chunk identity and actual player parsing pass. Six further package-specific checks cover parser failures, actual clip selection/Pause/Resume/End with no location, and saved fallback data. No audio was played.

## Failures, repairs and limits

| Observed failure | Implemented repair | Evidence and limit |
| --- | --- | --- |
| HTTP400 unsupported structured-output schema | Convert the provider wire schema while preserving strict local validation | One checked retry; original unknown usage retained. |
| Broad maps crowded out station identity and returned429/504 | Bounded station-specific and crossing-specific queries, clipped geometry, serialized requests and cache | Actual station/entrance and zebra features returned. Intermittent public-service failures remain. |
| Planner treated absence of future routed geometry as reason to refuse provisional selection | Freeze a versioned route-phase protocol: supported stop order, actual routing, independent Scout | Existing dispatched bindings preserved; third proposal produced real geometry. |
| Tool loop exhausted without final JSON; image-source contract required nonexistent text quotation | Reserve final synthesis; validate actual image-input receipts rather than inventing quotations | Original returns preserved; checked recovery, no inference replay for schema revalidation. |
| Retained report included unused empty failed-map lead | Exclude only unreferenced empty non-image leads from successful evidence; preserve original and explicit exclusion record |20 valid sources remain; depended-on invalid sources still fail. |
| A15m map request was rejected by an undocumented20m local parser minimum | Align parser with already-bounded public adapter; complete the retained requested tool once, then use the remaining final slot | No model replay or route-counter reset; focused recovery regression. |
| Research instructions/candidate IDs would have been required verbatim in speech | Structural references remain deterministic; independent verifier checks qualifications semantically | Attribution, uncertainty and scope remain mandatory. |
| Reviewer applied final-only tool restriction retroactively | Clarify that the restriction governs only the current request | Archived operations24–25 allowed tools;26 made no tools. Original mistaken report retained. |
| Verifier could not reopen the Scout’s later crossing evidence | Freeze successful scoped route receipts and explicitly allow their exact URLs; preserve original review bindings | Checked completion of the existing requested reads; no repeated inference request or source discovery. |
| Scout treated small route-to-standing offsets as a need to rebuild geometry | Preserve2–5m associations within existing10m player contract and provide actual final approaches | Explicit accepted disposition and unchanged standing points; no claim of surveyed accuracy. |

The original job began **23:37:41 UTC on6 October**, with a20-minute deadline. The first extension approved45 minutes **total from that original start**, so only about2½ minutes remained when resumed. Operation18 timed out at00:22:41 during synthesis; partial text was not promoted. That proposal should have made the practical remaining time clearer.

The owner then approved **30 minutes from actual resumption**. It was applied at **00:28:19 UTC**, setting **00:58:19 UTC**. Original counters and all usage remain intact. A second30-minute continuation at00:59:17 UTC set01:29:17 UTC after operation39 timed out. Final counters are ten candidates, two targeted research rounds, three route proposals, two content corrections and zero **corrective** renders; four initial recordings were synthesized. Recoveries and the one frozen-route disposition are explicit interventions; this is not an unattended success.

## Verification and practical limit

Typecheck, lint, documentation parity and **321 tests** pass at this checkpoint. Focused regressions cover actual-source identity, archived image pixels, frozen phase bindings, completed-tool recovery, bounded map queries, negative disposition refusal, exact route/standing preservation, independent review, duration accounting, immutable packages and changed-clip rendering. Complete factory and builder tests use disclosed synthetic providers/audio; they prove software flow, not real source quality or a finished live tour.

Local George prerequisites were checked without audio playback: Node24.13.0arm64, pinned Kokoro/Transformers/ONNX imports, all model hashes and George voice bytes, FFmpeg decoding/normalization, and sufficient disk. Actual local synthesis subsequently produced all four Hampstead recordings; complete decoding and measured timing passed without audible playback.

The current architecture has executed live research, route selection, drafting, independent factual/editorial closure, actual George rendering and deterministic final package checks. The final supplemental tester accepted at01:24:19UTC; all47operations are settled. It has not demonstrated unattended production of the requested hour. Large evidence histories and repeated repair work make the original20-minute envelope unproven. The owner requested a fresh Highgate rerun after these fixes, with elapsed time, per-role tokens and interventions compared; its initial declared allowance was45minutes; the completed trial outcomes are recorded above. [Per-role usage and cost limitations](COSTS.md).

No mobile source changed. No new APK, audible phone test, human listening or outdoor acceptance is claimed. The existing playback evidence remains applicable. No remote push, deployment or publication occurred; five unrelated owner Word documents are untouched.

### Final production corrections

The player labels story directions as **Next directions**. The deterministic compiler now projects leg1 into the visual introduction, each complete onward leg into the corresponding story and the full return into finish instructions. It retains the exact reviewed geometry and spoken paragraphs. Regression builds inspect the actual package fields, including missing/oversized direction refusal.

Writer audit prose had stale claims about disconnected paths and missing introduction audio. Producer-owned visual status/provenance replaces those claims; only story/chapter paragraph collections are spoken. The original editorial rejection remains recorded, followed by a narrow production review of the corrected fields. Final factual review accepted the same story text and source-linked physical directions.

The first tester lacked explicit final check receipts and therefore requested revision. Actual builder and package-specific receipts now link the accepted draft, input, package and review hashes; the supplemental tester accepted those checks without overriding the duration/listening/field limits. Listening, physical access and requested duration remain separate.


## First fresh Highgate trial

The fresh Highgate job started at01:28:40.699UTC and ended blocked at01:53:38.531UTC: **24m57.832s**,32requests,1,260,232known tokens plus one request with unavailable usage. It obtained a new four-walk survey, ten candidates and validated16-source/16-claim research. It did not reach writing or audio: all three route proposals retained crossing-midpoint/carriageway errors, and the final route disposition did not accept them. A faster failed run is not a completed-tour speed improvement. [Exact run](HIGHGATE-RUN.json), [comparable-stage benchmark](BENCHMARK.json).

One implementation repair enabled the research repairer to reopen exact retained map/image evidence. A subsequent18-second route-planner transport interruption received its single checked technical retry; unknown usage remains unknown. The original45-minute deadline and non-time counters were never reset. Map requests after the32MiB resource declaration succeeded in the observed continuation; general reliability is not established.

The remaining routing defect is a contract gap: planner prose could ask for a complete crossing or specific gate, but the router received only stop points. Separate public diagnostics found footway preference alone unchanged, combined footway/sidewalk preference improved some crossings but left others wrong, and evidence-backed intermediate points hit the server's actual10-location cap. These are engineering diagnostics, not generated/reviewed tour outputs, and are excluded from runtime model counts. A further entirely fresh Highgate job will exercise the completed through-point/segmented-request fix rather than reset this failed job or reuse its authored material.


**Final pre-run software verification, 7 October:** all335tests, full TypeScript, ESLint, offline-guide parity and whitespace checks passed. Independent helper review found no remaining actionable acceptance/resume defect in the new routing/protocol changes. The deadline regression prevents the second split transport after expiry. No app/native code changed, and no phone or listening observation is claimed. The subsequent live generation used the separate second Highgate brief and empty authored inputs.


## Second fresh Highgate trial — readiness handoff defect

The run at implementation commit `fdc62f2` started02:10:02.977UTC and ended02:18:10.706UTC: **487.729seconds (8m07.729s)**,15requests, **591,347known tokens**, one incomplete stream with unknown usage, direct paidUS$0. It began from an empty authored-input list and independently retrieved its survey/evidence. Research passed structural validation with16sources and18claims, but all researched places retained essential physical unknowns. The producer repeatedly consumed route proposals rather than invoking its unused physical-research allowance after valid candidate IDs failed preparation. Two complete route proposals were rejected; the third response was interrupted before completion. No Scout acceptance, scripts, audio or package resulted. The provider interruption is distinct from the underlying coordination defect. No recovery or time extension was applied; this failed run and its original counters remain closed. [Redacted record](HIGHGATE-SECOND-RUN.json).

The readiness correction below resolved eligible-place readiness before dispatching route selection, retained the same two-round research cap and stopped if fewer than four supported stops remained. It did not retroactively alter this trial's frozen phases or turn its low elapsed time into a completed-tour improvement. The final verification above started from new evidence after that fix, preserving all prior failure costs.


**Readiness repair verification:**339tests, full TypeScript/ESLint, guide parity and whitespace checks pass. Complete synthetic execution covers all-unknown research becoming eligible before route1, selected-stop repair, exhausted/unresolved research with zero router calls, exact cached replay and legacy bindings. Independent review confirmed the observed missed branch and found no binding/cap blocker. A first readiness repair that still yields fewer than four eligible places stops honestly instead of automatically spending another round; no access assertion is weakened.


## Final software verification

**342 tests passed**, with full TypeScript, ESLint, offline-guide parity, local documentation links, redacted-report checks and whitespace verification. Post-benchmark regressions confirm latest-component timestamps, stable mixed-cache recomposition and exact zero-distance arrival normalization for new jobs only. A read-only check against the actual Highgate final route confirmed corrected arrival wording with identical geometry/distance; this is not a new route acceptance or a second live run. No mobile source or native dependency changed, so no new APK or physical regression was required. Existing Hampstead decode/parser/manual-fallback receipts remain accepted evidence. Listening, outdoor access and requested-hour delivery remain unverified or unmet as stated above.


## Sol6.1 trials and current fresh verification

- Engineering run:42m07,37 actual inference calls plus one zero-dispatch setup operation,2,110,593known tokens plus one unknown. No script/package; route-preparation ordering, stale timing and contradictory review flags were corrected afterward.
- Map-failure run:10m23,10calls,242,895tokens. No route; safe alternate-public-address fallback was fixed and exercised separately.
- Third run:56m31,57calls,3,129,164known plus two unknown. Fresh15-source/18-claim research and a2.617km four-stop route; final918spoken words produced383.9seconds audio. Actual whole estimate3045.1196seconds (50m45); lower-bound rejection preserved. Both correction batches were used for genuine editorial cleanup and the compiler issue; none was reset. The exact navigation integration review accepted after the local compiler fix. Full audio decode/hash/text/parser checks and separate actual-package software checks passed; there is no final tester acceptance, listening or physical result. [Record](SOL61-V3-RUN.json).
- Fourth run: starts entirely fresh at`4ca21c7`, Sol6.1medium,90-minute generation allowance under the owner’s extension authorization. Uses policy3 conservative timing, direction-preparation3, writing3 and review4. All360tests, typecheck/lint and focused duration/package regressions pass before dispatch. Final outcome is pending.

All direct paid charges areUS$0. Failed work and unknown usage are retained in[COSTS](COSTS.md). None of these incomplete results proves unattended completed-tour speed or enjoyment.


## What the fixes establish

Owner question, 7 October: are these temporary patches or genuine corrections for future runs? The classification matters; passing the automated suite is not a universal guarantee.

| Change | Nature and evidence | Remaining limit |
| --- | --- | --- |
| Enforce final duration and plan conservatively | Shared coordinator checks; regressions reject the actual compact Hampstead and Sol v3 route cases; live v3/v4 were honestly rejected | Enforces rejection, not successful selection; fresh integration still required |
| Research before retrying a short route | Shared control-flow repair, regression proves research precedes the next proposal within original caps | Depends on useful existing candidates and resolvable access |
| Preserve complete directions and station return | Shared compiler/schema correction; actual package/player-parser regressions preserve the ninth direction and split long text losslessly | Correct wording/access still requires review; no outdoor result implied |
| Practical crossing criteria, less repetitive narration, clearer reviewer verdicts | Versioned role instructions plus deterministic acceptance checks; wrong-crossing regression still blocks | Model compliance and editorial quality are probabilistic; prompt changes cannot guarantee future behaviour |
| Try a second advertised public address | Shared transport correction with refusal/abort/TLS/POST regressions; live fallback observed | Cannot fix an outage on both servers or HTTP429 |
| Dated local OSM map queries | Bounded operational alternative, checksum/extent/retained-evidence regressions and real parser/query checks | Requires a fresh suitable extract; relations/current closures absent; online routing/page dependencies remain |
| Explicit interrupted-request recovery and accounting | Bounded supervised recovery, immutable failures and unknown usage retained | A manual recovery is not unattended reliability |

The current local-map version passed363automated tests, typecheck, lint, guide parity and the separate actual Pyosmium extraction regression. Tests establish those cases only. Closed failed runs, partial packages and their costs remain preserved. New generation runs begin with empty authored inputs; no manual story substitution or relaxed duration gate is used to force acceptance.
