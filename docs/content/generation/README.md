# Local tour-generation prototype

One local TypeScript CLI, atomic JSON job snapshots, scoped role contexts and the current offline player's package format. This is a supervised prototype, not a production factory. [Results](RESULTS.md), [pilot and listening procedure](PILOT.md), [plan/checkpoint](PLAN.md), and the canonical [implementation register](IMPLEMENTATION-REGISTER.md) distinguish selected design, deterministic evidence and actual experience.

The owner's pasted launch request governs this work. The handoff's [accepted workflow](handoff/Tour_generation_workflow_v1.readable.txt), [process draft](handoff/Tour_generation_full_process_draft.readable.txt) and [setup proposal](handoff/Tour_generation_prototype_setup.readable.txt) are supporting inputs. The original ZIP/Word files remain untouched. Selected proposal defaults are reversible; the proposed $40 trial is **not funded**. Direct charges default to US$0. Production/backend/accounts/publication, a city catalogue and wider comparison matrix remain outside scope.

## Run and resume without an account

```sh
npm run generation -- fixture local-data/generation/example/job.json
npm run generation -- run local-data/generation/example/job.json --fixture
npm run generation -- resume local-data/generation/example/job.json
npm run generation -- report local-data/generation/example/job.json
node --import tsx --test tests/generation*.test.ts
node --import tsx tools/generation/pilot.ts --check
node --import tsx tools/generation/import-pilot.ts
```

Use a new example directory only for a genuinely new fixture, never to reset a real job's counters. `fixture` refuses an existing file; `resume` retains returned work, reviews, history, global limits and charges. The example terminates **blocked** intentionally: synthetic evidence and an unknown visitor position cannot form a real ready tour. The curated [manual pilot job](../../../content/generation-pilot/authoring-job.json) is separately inspectable and deliberately blocked, with an actual structurally valid candidate package and six recordings.

The snapshot is written to a private temporary file, fsynced and atomically renamed. A per-job process lock serializes dispatch/acceptance; only a demonstrably dead local process's lock is reclaimed. The pending operation is saved before provider IO. After interruption, a working task becomes blocked and its unresolved operation stays unknown. No automatic retry or paid replay occurs. Corrupt files fail visibly; no reset or repair discards old work.

## Official subscription access

```sh
npm run generation -- signin
# Only after actually observing this app's credit overflow disabled:
npm run generation -- overflow-disabled --owner-observed
TOUR_GENERATION_MODEL=gpt-6-astra TOUR_GENERATION_EFFORT=medium npm run generation -- preflight
```

The sign-in command opens the system browser with a loopback callback. Complete the normal sign-in and explicit ChatGPT-plan permission yourself. In **ChatGPT Settings → Usage**, find **“Allow other apps to use credits after reaching your usage limit”** and verify it is off before recording the observation. This is a shared connected-app credit setting; the App limits percentage is a weekly plan-usage cap, not proof that credit overflow is disabled. See [official usage controls](https://learn.chatgpt.com/docs/sign-in-with-chatgpt). If the separate credit control cannot be found or verified, leave live dispatch blocked. No code purchases credits or enables overflow. Permission and the Usage setting are separate prerequisites. The observation expires after 24 hours and is bound to the selected app/account.

App-only credentials live in ignored `local-data/generation-auth/`, with 0600 files and a 0700 directory. The callback validates state, PKCE, issuer, signature, audience, nonce, identity and granted scopes. Nothing reads Codex tokens, a web session or an API-key environment variable. This first implementation supports one active app registration; expiry requires explicit returning sign-in, retaining its identity. Automatic refresh/account switching are deferred until live access supplies a need; reauthorization invalidates the prior capability preflight.

The original requested model was `gpt-6.1-sol`, medium. After its absence from the live account catalog, the owner selected **`gpt-6-astra`, medium**; use that explicit environment override for both init and preflight. The original code default is retained for reproducibility, so do not omit the override for this continuation. Astra’s first two attempts did not return the expected event stream; the actual capability gate remains blocked. `TOUR_GENERATION_MODEL` and `TOUR_GENERATION_EFFORT` select explicit alternatives at `init` and `preflight`; the preflight must exactly match the job. `preflight path/to/report.json` stores its ledger beside that report; `TOUR_GENERATION_PREFLIGHT_FILE` selects it for live dispatch. The adapter checks the account model catalog, sends explicit input/history and instructions, and requires `response.completed`. Unsupported/denied/quota/incomplete streams stop with safe diagnostics and retain partial drafts. There are no automatic technical retries. A paid API adapter is a non-dispatching seam; funding and implementation would be a separate decision. Model/effort used by Codex to implement this code is unrelated.

T43 preflight checks instructions, a namespaced local function dispatch, explicit function history, structured output and an actual synthetic red image. It stops at the first failed capability and writes a separate durable preflight ledger. A successful synthetic image probe establishes image-input transport only, not scouting quality. Each preflight retains its original 20-minute envelope; after an expired/blocked calibration, preserve and inspect the files before beginning a separately named calibration. It cannot silently reset through a task alias.

Runtime source access in this slice is **supplied retained evidence**, not a new integrated web-search/imagery browser. No hosted search or commercial imagery allowance has been verified. Research/scouting returns missing evidence as a gap; the engineer can add permitted researched records through `put`. That changed condition must be held constant and disclosed in comparisons. A successful capability probe alone does not establish end-to-end workflow faithfulness with search/imagery. T44 paid parity and the wider profile/theme/single-context matrix remain deferred.

Official documents inspected 6 October 2026: [overview](https://developers.openai.com/siwc/token-sharing-open-source), [registration](https://developers.openai.com/siwc/token-sharing-open-source/sign-in), [inference](https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference), [preview restrictions](https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations), [errors](https://developers.openai.com/siwc/token-sharing-open-source/errors-and-recovery), and [model/prices](https://developers.openai.com/api/docs/models/gpt-6.1-sol). Public discovery was fetched and matched the pinned official OAuth/JWKS endpoints. Documentation establishes eligibility of the local integration category, not the selected account's grant or completed inference.

## File-driven responsibility stages

```sh
npm run generation -- init local-data/generation/pilot/job.json fixtures/generation/pilot-brief.json
npm run generation -- put local-data/generation/pilot/job.json path/to/records.json
npm run generation -- review local-data/generation/pilot/job.json path/to/review.json
npm run generation -- accept local-data/generation/pilot/job.json path/to/decision.json
npm run generation -- next local-data/generation/pilot/job.json
npm run generation -- run local-data/generation/pilot/job.json stage-research-1
npm run generation -- report local-data/generation/pilot/job.json
```

The organizing function combines Planner/Producer. `next` creates research, route, scout, writer, editor, verification and tester assignments when their own prerequisites permit. Review and consequential acceptance are explicit serialized record actions, which the engineer handles within delegated scope. `next` reports a precise missing commitment; it does not ask the owner to approve routine work. The CLI runs one reasoning task at a time (within the maximum of two); independent context IDs, prompts, hashes and actual transitive evidence are retained. An affected returned stage can get a new assignment after its input changes, keeping the old return and global counters. Builder/media/package checks are code, not model assurances.

Record JSON follows [the generated schema](../../../fixtures/generation/record-schema.json). Each substantive record has ID, revision, owner, dates and exact `dependsOn`. Revisions are append-only; stale results cannot replace a current version. A source has a real minimal passage, locator, origin, dates, attribution and explicit permission. Reference-only/restricted/unknown payloads cannot be stored as supporting evidence. Script assertions partition the complete transcript, preserving source qualifiers and separate physical encounter references. Semantic entailment, editorial quality and the completeness of assertion classification still require actual fresh review; no validator claims to understand truth.

A review has `id`, `scope` (`brief`, `route`, `editorial`, `verification`, `listening`, `package`), exact `refs`, `reviewer`, `decision`, evidence descriptions and `at`. A decision supplies `scope`, `refs`, `reviewIds`. A later negative verdict supersedes a prior approval. Changed dependencies invalidate acceptance without erasing compatible evidence or history. Package acceptance requires current route, editorial/verification and listening decisions; structural validity alone is insufficient.

The shared issue queue keys findings by stable affected item/category, retaining one owner and attempt history. Two no-progress attempts or unexplained A→B→A stop for Producer arbitration. Duplicate opinions do not reopen a closed issue; changed closure dependencies do. Candidate/route/research/correction/render counters survive renaming tasks and resume. Balanced limits are 16 candidates, 2 targeted research rounds, 3 route proposals, 2 content-correction batches, 1 corrective render per logical clip, 20 minutes per generation job. Initial rendering is distinct from corrective rendering. Deadline exhaustion never accepts missing evidence.

Before dispatch, all settled, pending and unknown operations plus a completion reserve (at least 25% of a funded ceiling) count against one job ledger. Failed requests consume allowance. Direct cash, observed subscription tokens, dated API-equivalent estimates/ranges and unavailable usage remain separate. Estimates are token-only and explicitly uncertain about cache writes, images, tools, taxes and production parity. Total elapsed, active operation time and quota/owner waits are separate; retrospective manual preparation reports unknown active time instead of inventing measurements.

For an interrupted operation, inspect its saved provider return/outcome before reconciliation:

```sh
npm run generation -- reconcile local-data/generation/pilot/job.json path/to/reconciliation.json
```

The file contains `operationId`, checked `chargedUsd`, evidence, `retry` and observed `usage` (input/output tokens, subscription flag, API-equivalent value or null, price date or null, uncertainty). A retry is permitted once only, with fresh inputs and the original deadline. Unknown paid outcomes are never cleared by a guess. If the original deadline has passed, retain the draft and make an explicit later bounded continuation decision instead of modifying timestamps. Runtime issue/arbitration operations are exposed as typed engine functions; this small CLI does not yet provide a generic form for every editorial action.

## Player boundary and checks

The candidate uses the real `parseTourPackage`/`stageTour` contract, the existing Clerkenwell offline map and fully local M4A assets. Local recordings are content-addressed by exact text and voice settings; decode and measured-duration checks reuse the proven renderer. No mobile runtime, map resource, guide, native permission, pause/recovery policy or installed package is changed. Therefore no new APK build, installation or locked-phone regression is warranted for this tooling slice. New-tour physical access and listening remain separate from reused player evidence.
