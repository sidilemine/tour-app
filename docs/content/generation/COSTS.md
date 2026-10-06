# Observed agent tokens and cost estimates

Recorded 2026-10-06T23:01:12.044Z. Actual direct paid charges: **US$0**. [Per-operation CSV](AGENT-USAGE.csv), [full JSON ledgers](AGENT-USAGE.json). Runtime model: **gpt-6-astra, medium**; historical pre-inference Sol failures remain distinct in JSON.

| Role | Observed input | Observed output | Unknown-token operations | API-equivalent known subtotal |
| --- | ---: | ---: | ---: | ---: |
| tester | 39,354 | 3,040 | 5 | $0.5422–$0.6439 |
| planner-producer | unavailable | unavailable | 1 | unavailable |
| research | 24,353 | 2,854 | 0 | $0.3862–$0.4471 |
| route | 29,914 | 2,844 | 0 | $0.4413–$0.5161 |
| scout | 22,525 | 3,135 | 0 | $0.3820–$0.4383 |
| writer | 37,299 | 3,555 | 1 | $0.5507–$0.6440 |
| editor | 37,264 | 3,007 | 0 | $0.5230–$0.6161 |
| verification | 82,137 | 7,441 | 0 | $1.1934–$1.3988 |

Known totals: **272,846 input + 25,876 output = 298,722 tokens**, API-equivalent **$4.019–$4.704**, plus unquantified missing usage. Tester totals include all calibration probes and the package desk reviewer; per-task rows separate them. Planner/Producer's manual import has no measured model usage.

The price snapshot is 6 October 2026: Astra Standard input $10, cached input $1, cache-write input $12.50 and output $50 per million tokens; larger-context multipliers are recorded in code. [Official model pricing](https://developers.openai.com/api/docs/models/gpt-6-astra). Ranges account for unknown cache-write treatment; they exclude unmeasured requests, tools, taxes and subscription/API accounting differences. Reasoning is already included in output, never added twice. Cached and reasoning observations (including unknowns) are in the CSV/JSON.

Three early dispatched Responses attempts lack observed tokens. Sign-in/model-catalog failures did not reach inference; their usage is still left null, with diagnostics explaining the distinction. The first writer sandbox failure occurred during catalog retrieval and was retried once within the original envelope. That failure’s flat response file was overwritten before immutable per-operation saving was added; the ledger and observed diagnosis remain. No reconstructed response is presented as historical evidence.

Implementation helpers `/root/provider`, `/root/pilot` and parent engineering/Producer work have **unavailable token counts**. Those are not the live runtime role totals, and no estimate is fabricated. Local George and public routing incurred no direct provider charges; earlier manual activity/time remains unmeasured. Subscription results are not a funded matched API comparison.

Reproduce current-job accounting with `npm run generation -- usage local-data/generation/live-pilot/job.json`. Report active request time and total elapsed separately; model self-reported zero tool spend is not its inference usage.

Timing caveat: ledger `activeSeconds` measures dispatch-to-settlement windows. Research shows 216.415 seconds because its saved completed return was reconciled later; the provider itself reported **70.134 seconds**. That window includes engineer recovery time and must not be called model latency. Other raw provider durations remain in private returns; implementation/research-helper active time is unavailable. Total live envelope elapsed was 1,122.790 seconds (18 minutes 42.790 seconds); no quota wait was observed.
