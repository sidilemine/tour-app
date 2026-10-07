# Fresh factory token accounting — 7 October 2026

Actual generation uses consented Astra medium with credit overflow off. **Direct paid charges: US$0.** Counts include failed work where the provider reported usage. API-equivalent estimates are a token-only comparison, not subscription charges.

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

[RUN.json](RUN.json) retains request-level usage and failures; [BENCHMARK.json](BENCHMARK.json) separates wall time, summed provider activity, tool outcomes, interventions and completion stage. The fresh Highgate comparison is pending. The separate [hosted-search calibration](SEARCH-CALIBRATION.json) used13,958 known tokens and an API-equivalent US$0.108924–0.132799; it is excluded from the job totals. Earlier Clerkenwell work is excluded.

Implementation assistant/helper tokens are unavailable through this ledger and remain **unknown**. Cached input and reasoning are subsets, not added again. The retained6October quote uses US$10 input,US$1 cached input,US$12.50 cache write andUS$50 output per million tokens, with context multipliers recorded in the report. [Official Astra model reference](https://developers.openai.com/api/docs/models/gpt-6-astra). Hosted-tool fees, cache-write details, subscription/API parity, taxes and production throughput are not established.


## First Highgate trial — stopped before writing

The incomplete trial took24m57.832s, including the recorded repair pause. It used32requests and **1,260,232known tokens**, plus one transport-interrupted request with unknown usage. Directpaid charges remainedUS$0. It did not produce audio/package, so lower elapsed time or tokens cannot be described as completed-tour improvement.

| Role | Requests | Unknown requests | Known input | Known output | Token-only API-equivalentUSD |
| --- | ---: | ---: | ---: | ---: | ---: |
| research | 11 | 0 | 518,253 | 24,255 | 6.0912–7.3023 |
| route | 10 | 1 | 169,139 | 5,288 | 1.9558–2.3786 |
| scout | 11 | 0 | 530,895 | 12,402 | 5.9291–7.2563 |

All failures remain in[HIGHGATE-RUN.json](HIGHGATE-RUN.json). Engineer-run public routing diagnostics have no runtime model requests; they remain separately documented, not silently included as successful tour generation. Implementation/helper tokens remain unknown. A separate fresh Highgate run after the routing fix is pending.


## Second Highgate trial — readiness failure retained

Elapsed8m07.729s;15requests;591,347known tokens plus one interrupted request with unknown usage; direct paidUS$0. No audio/package and no completion-speed claim.

| Role | Requests | Unknown requests | Known input | Known output | Token-only API-equivalentUSD |
| --- | ---: | ---: | ---: | ---: | ---: |
| research | 6 | 0 | 452,954 | 10,972 | 4.9042–5.9883 |
| route | 9 | 1 | 125,236 | 2,185 | 1.3616–1.6747 |
| **Known subtotal** | **15** | **1** | **578,190** | **13,157** | **6.2658–7.6630** |

The unchanged job contains no recovery or extension events. Its closed evidence remains in[HIGHGATE-SECOND-RUN.json](HIGHGATE-SECOND-RUN.json); the subsequent coordination repair is implementation work whose helper token counts remain unavailable.
