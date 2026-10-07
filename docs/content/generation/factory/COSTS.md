# Fresh factory token accounting — 7 October 2026

Historical jobs use Astra medium; current owner-selected jobs use Sol6.1 medium. Both use the existing consented grant with credit overflow off. **Direct paid charges: US$0.** Counts include failed work where the provider reported usage. API-equivalent estimates are a token-only comparison, not subscription charges.

| Hampstead role | Requests | Unknown requests | Known input | Known output | API-equivalent USD |
| --- | ---: | ---: | ---: | ---: | ---: |
| research | 17 | 2 | 943,631 | 24,767 | 10.2703–12.5171 |
| route | 6 | 0 | 96,278 | 4,475 | 1.1865–1.4272 |
| scout | 6 | 0 | 231,356 | 6,735 | 2.6503–3.2287 |
| writer | 4 | 1 | 83,373 | 16,849 | 1.6762–1.8846 |
| editor | 4 | 0 | 108,896 | 7,533 | 1.4656–1.7379 |
| verification | 8 | 0 | 393,755 | 9,631 | 4.4191–5.4035 |
| tester | 2 | 0 | 90,682 | 4,815 | 1.1476–1.3743 |
| **Known subtotal** | **47** | **3** | **1,947,971** | **74,805** | **22.8156–27.5732** |

Known total: **2,022,776 tokens**. Three requests have unknown usage (schema rejection and two deadline interruptions); those tokens are additional and unknown, never zero. Cached input44,928 is included in input; reasoning1,958 is included in output. Deterministic producer orchestration and local George synthesis have no separate model inference operations.

Hampstead took **1h46m38.7s** from creation to final handoff, including engineering/recovery and owner pauses. It produced a structurally tested31m28 inspection draft, with listening/field and requested duration acceptance separate.47requests, three provider failures/interrupted outcomes,26 recovery journal events and three time amendments are retained. Journal events are not unique human interventions.

[RUN.json](RUN.json) retains request-level usage and failures; [BENCHMARK.json](BENCHMARK.json) separates wall time, summed provider activity, tool outcomes, interventions and completion stage. The completed Highgate trial comparisons are below. The separate [hosted-search calibration](SEARCH-CALIBRATION.json) used13,958 known tokens and an API-equivalent US$0.108924–0.132799; it is excluded from the job totals. Earlier Clerkenwell work is excluded.

Implementation assistant/helper tokens are unavailable through this ledger and remain **unknown**. Cached input and reasoning are subsets, not added again. The retained6October quote uses US$10 input,US$1 cached input,US$12.50 cache write andUS$50 output per million tokens, with context multipliers recorded in the report. [Official Astra model reference](https://developers.openai.com/api/docs/models/gpt-6-astra). Hosted-tool fees, cache-write details, subscription/API parity, taxes and production throughput are not established.


## First Highgate trial — stopped before writing

The incomplete trial took24m57.832s, including the recorded repair pause. It used32requests and **1,260,232known tokens**, plus one transport-interrupted request with unknown usage. Directpaid charges remainedUS$0. It did not produce audio/package, so lower elapsed time or tokens cannot be described as completed-tour improvement.

| Role | Requests | Unknown requests | Known input | Known output | Token-only API-equivalentUSD |
| --- | ---: | ---: | ---: | ---: | ---: |
| research | 11 | 0 | 518,253 | 24,255 | 6.0912–7.3023 |
| route | 10 | 1 | 169,139 | 5,288 | 1.9558–2.3786 |
| scout | 11 | 0 | 530,895 | 12,402 | 5.9291–7.2563 |

All failures remain in[HIGHGATE-RUN.json](HIGHGATE-RUN.json). Engineer-run public routing diagnostics have no runtime model requests; they remain separately documented, not silently included as successful tour generation. Implementation/helper tokens remain unknown. The subsequent fresh trials are recorded below.


## Second Highgate trial — readiness failure retained

Elapsed8m07.729s;15requests;591,347known tokens plus one interrupted request with unknown usage; direct paidUS$0. No audio/package and no completion-speed claim.

| Role | Requests | Unknown requests | Known input | Known output | Token-only API-equivalentUSD |
| --- | ---: | ---: | ---: | ---: | ---: |
| research | 6 | 0 | 452,954 | 10,972 | 4.9042–5.9883 |
| route | 9 | 1 | 125,236 | 2,185 | 1.3616–1.6747 |
| **Known subtotal** | **15** | **1** | **578,190** | **13,157** | **6.2658–7.6630** |

The unchanged job contains no recovery or extension events. Its closed evidence remains in[HIGHGATE-SECOND-RUN.json](HIGHGATE-SECOND-RUN.json); the subsequent coordination repair is implementation work whose helper token counts remain unavailable.


## Final fresh Highgate verification

Started02:21:53.020UTC; ended02:46:15.017UTC. Elapsed **24m21.997s**; summed provider activity **21m57.320s**, counted separately from wall time.37requests, all completed; **1,936,810tokens**, no unknown usage. No manual recovery, counter reset or time amendment occurred. Direct paidUS$0. The job stopped at route review; writer, editor, verifier, renderer and package tester were not dispatched.

| Runtime role | Requests | Known input | Known output | Total tokens | Token-only API-equivalentUSD |
| --- | ---: | ---: | ---: | ---: | ---: |
| research (survey and targeted rounds) | 15 | 1,016,969 | 25,962 | 1,042,931 | 10.9632–13.3655 |
| route | 11 | 318,131 | 13,179 | 331,310 | 3.8403–4.6356 |
| Scout (independent reviews and disposition) | 11 | 551,435 | 11,134 | 562,569 | 6.0711–7.4496 |
| **Total** | **37** | **1,886,535** | **50,275** | **1,936,810** | **20.8745–25.4507** |

Cached input56,064 and reasoning1,126 are included in those totals. No token fields are missing in this run. [Final per-request record](HIGHGATE-FINAL-RUN.json) and[comparison](BENCHMARK.json) retain outcomes and actual implementation identity. The final run used code at `1b06692`; small timestamp/arrival-text corrections made after its final review are tested separately and never retroactively claimed as live-tested.

Across **Hampstead plus all three Highgate trials**:131requests, **5,811,165known tokens**, five requests with unknown usage, **US$0 direct paid**, and known token-only API-equivalent **US$63.9319–77.6241**. Calibration13,958tokens is separate; earlier Clerkenwell and implementation/helper usage are excluded. The latter is unavailable, not zero. No completed-tour speed or cost improvement is established: the Highgate jobs stopped earlier in the workflow than Hampstead, which itself fell short of the requested duration.


## Sol6.1 engineering run — coordination failures retained

The first Sol6.1 job ran42m06.818s, including local debugging, and stopped before writing. It retained38operations:37inference attempts and one proven local provider-initialization failure with no dispatch. Known usage is2,110,593tokens plus one timed-out inference with unknown usage. Direct paid usageUS$0; known token-only API-equivalentUS$4.1995–5.0862. The route itself was supported; generic-direction sequencing, stale provisional timing and contradictory accepted/required review flags prevented promotion. The closed run is not a completed-tour result.

| Runtime role | Operations | Unknown-usage operations | Known input | Known output | Known total | Token-only API-equivalentUSD |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| research | 15 | 1 | 898,996 | 33,756 | 932,752 | 1.6139–1.9261 |
| route | 12 | 0 | 415,233 | 16,418 | 431,651 | 0.9946–1.2023 |
| scout | 11 | 0 | 733,870 | 12,320 | 746,190 | 1.5909–1.9579 |

Research includes the one zero-inference setup operation, separately reconciled from the actual timeout; it is not an extra model call. [Full engineering record](SOL61-ENGINEERING-RUN.json). The separate Sol6.1 hosted-search calibration used14,033tokens andUS$0direct (US$0.02158–0.02638 token-only API equivalent); [calibration](../SOL61-SEARCH-2026-10-07.json). Model access probes remain separately reported in[Sol access](../SOL-ACCESS-2026-10-07.json).

Sol6.1 uses the retained official quote ofUS$2input,US$0.10cached input,US$2.50cache write andUS$10output per million tokens, with the recorded long-context multipliers when applicable. [Official model reference](https://developers.openai.com/api/docs/models/gpt-6.1-sol). Unknown timeout usage and implementation-assistant tokens are excluded, never treated as zero.


## Sol6.1 second trial — map transport unavailable

Elapsed10m23.065s;10inference requests, all research;242,895known tokens with no unknown usage;US$0direct, token-only API-equivalentUS$0.6159–0.7106. The client selected a refusing public map backend and never tried the healthy second DNS address. With no evidenced standing coordinates, the job correctly stopped before routing; no script or audio was produced. Source quotation repair and the original two research rounds are retained in[SOL61-MAP-FAILURE-RUN.json](SOL61-MAP-FAILURE-RUN.json). The separate native transport diagnostic used no model calls and is retained in[Overpass failover evidence](../OVERPASS-FAILOVER-2026-10-07.json).


## Sol6.1 third trial — complete recordings, duration rejected

The run took **56m30.891s** (11:09:58.860–12:06:29.751UTC), including two checked stream retries, one compiler-fix resumption and one time amendment. It retained57inference attempts, **3,129,164known tokens plus two requests of unknown usage**, US$0direct, and known token-only API-equivalent **US$6.7337–8.1879**. Summed provider activity was2800.858seconds, distinct from wall time. All four recordings fully decode, but their383.9seconds plus walking/allowance produces50m45, below55–65minutes. The package was not promoted to final acceptance and the final tester was not dispatched.

| Runtime role | Requests | Unknown usage | Known input | Known output | Known total | Token-only API-equivalentUSD |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| research | 14 | 2 | 944,218 | 28,872 | 973,090 | 2.0988–2.5503 |
| route | 10 | 0 | 254,379 | 13,037 | 267,416 | 0.6391–0.7663 |
| scout | 17 | 0 | 1,050,687 | 15,606 | 1,066,293 | 2.0882–2.5690 |
| writer | 3 | 0 | 104,949 | 15,962 | 120,911 | 0.3695–0.4220 |
| editor | 3 | 0 | 103,641 | 5,739 | 109,380 | 0.2647–0.3165 |
| verification | 10 | 0 | 580,923 | 11,151 | 592,074 | 1.2734–1.5638 |

[Third-run record](SOL61-V3-RUN.json) and [Sol-inclusive benchmark](SOL61-BENCHMARK.json) retain all failures and the unpromoted build receipt. Local George synthesis and the separate actual-package software checks have no model tokens. Implementation-assistant usage remains unknown and excluded. No listening or walking duration was observed.


## Sol6.1 fourth trial — conservative gate and map outage

Elapsed11m01.597s (12:08:20.627–12:19:22.224UTC);17inference requests,538,964known tokens, no unknown usage, US$0direct. Known token-only API-equivalentUS$1.1800–1.4291. No technical retry, deadline extension or manual content replacement. The new duration gate rejected three short routes; no Scout, writer or audio stage was reached. Map service failure and an unused duration-to-research handoff are retained in[SOL61-V4-RUN.json](SOL61-V4-RUN.json).

| Runtime role | Requests | Unknown usage | Known input | Known output | Known total | Token-only API-equivalentUSD |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| research | 6 | 0 | 377,336 | 11,978 | 389,314 | 0.8314–1.0087 |
| route | 11 | 0 | 143,484 | 6,166 | 149,650 | 0.3486–0.4204 |

Map extraction and local regression checks used no model calls. Implementation-assistant usage remains unavailable and excluded.


## Sol6.1 fifth trial — route correction feedback missing

Elapsed14m48.322s;19inference requests,1,491,120known tokens, no unknown usage, US$0direct. Known token-only API-equivalentUS$3.1607–3.8783. No retry, extension or in-run implementation changes. Fresh map evidence succeeded; three routes failed coverage/duration before Scout or content production. [Full fifth-run record](SOL61-V5-RUN.json).

| Runtime role | Requests | Unknown usage | Known input | Known output | Known total | Token-only API-equivalentUSD |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| research | 7 | 0 | 890,092 | 13,609 | 903,701 | 1.8647–2.2962 |
| route | 12 | 0 | 572,272 | 15,147 | 587,419 | 1.2960–1.5822 |

The separate three-query routing diagnostic used no model tokens or direct charge. Implementation-assistant usage remains unavailable and excluded.


## Sol6.1 sixth trial — wording correction sent to research

Elapsed17m34.195s;20inferences,1,475,960known tokens, none unknown, US$0direct. Known token-only API-equivalentUS$3.1685–3.8767. The first malformed leg-ID proposal was automatically replaced; the second route met duration planning and passed the Scout's physical-route assessment except an unsupported starting “left”. The coordinator sent that wording repair to research, whose unnecessary mandatory-search check then blocked. No writing/audio/package; no manual runtime intervention, retry or extension. [Sixth-run record](SOL61-V6-RUN.json).

| Runtime role | Requests | Unknown usage | Known input | Known output | Known total | Token-only API-equivalentUSD |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| research | 7 | 0 | 659,910 | 21,719 | 681,629 | 1.4869–1.8037 |
| route | 7 | 0 | 223,323 | 5,494 | 228,817 | 0.5016–0.6132 |
| scout | 6 | 0 | 559,387 | 6,127 | 565,514 | 1.1800–1.4597 |

Later schema and correction-dispatch changes are tested separately; this run is not claimed to have exercised them. Implementation-assistant usage remains unavailable and excluded.


## Sol6.1 seventh trial — outside the chosen duration range

Elapsed17m06.938s;18inferences,1,219,532known tokens, none unknown, US$0direct. Known token-only API-equivalentUS$2.2138–2.7125. All proposals reached real routing; no malformed leg IDs, offline-map extent failure, manual retry or deadline extension. Geometry reduced from roughly4.34km to3.82km, but the last conservative total was3979.0357seconds (66m19), exceeding the engineering65-minute upper limit. No Scout/content/audio stage was reached. [Seventh-run record](SOL61-V7-RUN.json). Research operation7 completed in543.189seconds despite a360-second transport timer; actual elapsed and usage are retained, and strict per-request wall-time enforcement is unproven.

| Runtime role | Requests | Unknown usage | Known input | Known output | Known total | Token-only API-equivalentUSD |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| research | 7 | 0 | 733,123 | 13,418 | 746,541 | 1.2159–1.4813 |
| route | 11 | 0 | 466,500 | 6,491 | 472,991 | 0.9979–1.2312 |

This is a shorter failed route-selection run, not evidence of a faster completed tour. Implementation-assistant usage remains unavailable and excluded.

## First personal-beta run — Highgate v8

Created 16:15:23.696 UTC, completed 16:43:31.615 UTC:28m07.919s including the 10m39.796s engineering pause and one checked same-job recovery. Provider-reported activity sums to 953.802s; ledger start/end request durations sum to 955.702s under their different timing boundaries. These clocks are separate from total wall time. All 17 inferences have known usage:575,745input +33,322output =609,067tokens. Direct charge US$0 with the consented grant's overflow off; the recorded token-only API-equivalent range is US$1.4346–1.7093. No editor or model tester request was used.

| Runtime role | Requests | Unknown usage | Known input | Known output | Known total | Token-only API-equivalentUSD |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| research | 10 | 0 | 406,183 | 22,988 | 429,171 | 0.9921–1.1821 |
| route | 2 | 0 | 29,807 | 1,054 | 30,861 | 0.0702–0.0851 |
| scout / canonical directions | 2 | 0 | 92,181 | 2,907 | 95,088 | 0.2134–0.2595 |
| writer | 1 | 0 | 9,652 | 4,145 | 13,797 | 0.0608–0.0656 |
| verification / combined review | 2 | 0 | 37,922 | 2,228 | 40,150 | 0.0981–0.1171 |
| **Total** | **17** | **0** | **575,745** | **33,322** | **609,067** | **1.4346–1.7093** |

Research includes the two repair rounds that an overstrict evidence-format validator caused before recovery; their tokens are retained, not discounted as unused work. Subsequent route/writing/review/render completed without a content correction. Local tool receipts show10/11successful page reads,11/11ordinary map queries,1/1station query and5/5crossing queries; no imagery was requested. Five actual local George recordings do not consume model tokens or incur a hosted TTS charge.

V8 used roughly half the tokens of the stricter v7 failed route-selection trial while reaching an offline package. Different fresh research, relaxed acceptance and v8's engineering pause mean this is not a controlled performance improvement. Implementation-assistant/helper usage remains unavailable and excluded. Tool-fee/cache-write/subscription-to-API equivalence is uncertain; API-equivalent figures are estimates, not charges. [Run record](BETA-V8-RUN.json), [full retained-job comparison](BETA-BENCHMARK.json), [actual outcome](RESULTS.md#first-personal-beta-result--fresh-highgate-v8).
