# Fresh factory token accounting — 7 October 2026

Actual generation uses consented `gpt-6-astra`, medium, through the overflow-disabled ChatGPT plan route. **Direct paid charges: US$0.** The table measures observed runtime usage, including failed work; it does not estimate a completed tour's full cost.

| Runtime responsibility | Requests | Known input | Known output | Cached input (included) | Reasoning (included in output) | Token-only API-equivalent USD |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Research, including survey and physical research | 16 | 882,790 | 16,728 | 44,928 | 809 | 9.259948–11.354603 |
| Route planner | 2 | 20,022 | 2,571 | 0 | 102 | 0.328770–0.378825 |
| **Fresh job known subtotal** | **18** | **902,812** | **19,299** | **44,928** | **911** | **9.588718–11.733428** |
| Separate hosted-search calibration | 1 | 13,774 | 184 | 4,224 | 107 | 0.108924–0.132799 |
| **Known job + calibration** | **19** | **916,586** | **19,483** | **49,152** | **1,018** | **9.697642–11.866227** |

The job's known token total is **922,111**; including calibration it is **936,069**. Two research requests have unknown token counts: the original schema rejection and the final interrupted synthesis. Both are included in request counts but excluded from known token/estimate subtotals, never represented as zero usage. The approved continuation added 132,838 known tokens plus that unquantified synthesis; known token-only API-equivalent increment US$1.300716–1.600436. Writer, editor, verifier, scout review, tester and audio production have not run on this live job. The producer's deterministic orchestration has no separate inference operation.

[RUN.json](RUN.json) retains every operation ID, role, task, failure, partial/unknown fields, active seconds and estimate. [SEARCH-CALIBRATION.json](SEARCH-CALIBRATION.json) keeps calibration separate. Prior Clerkenwell work is excluded. Implementation parent/helper token counts are unavailable through this runtime ledger and are **unknown**, not zero or folded into these totals.

The retained price quote is dated 6 October 2026: [official Astra model page](https://developers.openai.com/api/docs/models/gpt-6-astra), US$10 input, US$1 cached input, US$12.50 cache write and US$50 output per million tokens. The range covers unobserved cache writes. Cached input and reasoning are subsets, not additional tokens. Hosted-tool fees, subscription/API parity, taxes, production capacity and full failed-run amortization are not established. These numbers are a token-only comparison basis, **not an invoice or a production price promise**.
