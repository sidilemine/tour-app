# Fresh factory token accounting — 7 October 2026

Actual generation uses consented `gpt-6-astra`, medium, through the overflow-disabled ChatGPT plan route. **Direct paid charges: US$0.** The table measures observed runtime usage, including failed work; it does not estimate a completed tour's full cost.

| Runtime responsibility | Requests | Known input | Known output | Cached input (included) | Reasoning (included in output) | Token-only API-equivalent USD |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Research, including survey and physical research | 12 | 763,741 | 16,318 | 33,792 | 724 | 8.149182–9.9740545 |
| Route planner | 1 | 8,047 | 1,167 | 0 | 69 | 0.138820–0.1589375 |
| **Fresh job known subtotal** | **13** | **771,788** | **17,485** | **33,792** | **793** | **8.288002–10.132992** |
| Separate hosted-search calibration | 1 | 13,774 | 184 | 4,224 | 107 | 0.108924–0.132799 |
| **Known job + calibration** | **14** | **785,562** | **17,669** | **38,016** | **900** | **8.396926–10.265791** |

The job's known token total is **789,273**; including calibration it is **803,231**. One research request failed at provider schema validation with unknown token counts. It is included in request counts but excluded from known token/estimate subtotals, never represented as zero usage. Writer, editor, verifier, scout review, tester and audio production have not run on this live job. The producer's deterministic orchestration has no separate inference operation.

[RUN.json](RUN.json) retains every operation ID, role, task, failure, partial/unknown fields, active seconds and estimate. [SEARCH-CALIBRATION.json](SEARCH-CALIBRATION.json) keeps calibration separate. Prior Clerkenwell work is excluded. Implementation parent/helper token counts are unavailable through this runtime ledger and are **unknown**, not zero or folded into these totals.

The retained price quote is dated 6 October 2026: [official Astra model page](https://developers.openai.com/api/docs/models/gpt-6-astra), US$10 input, US$1 cached input, US$12.50 cache write and US$50 output per million tokens. The range covers unobserved cache writes. Cached input and reasoning are subsets, not additional tokens. Hosted-tool fees, subscription/API parity, taxes, production capacity and full failed-run amortization are not established. These numbers are a token-only comparison basis, **not an invoice or a production price promise**.
