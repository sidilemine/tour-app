# Balanced Clerkenwell pilot

**6 October 2026 — supervised manual calibration candidate.** The requested gpt-6.1-sol subscription pipeline has not generated this tour. Reusing research, routing and local voice tools produces useful review artifacts while that access gate remains separate. Do not treat this as T43 faithful-workflow evidence, production cost/latency, a matched model comparison or a field pass.

The [new plan](../../../content/generation-pilot/plan.json) is a proposed **60-minute daytime Farringdon loop**, with six recorded stops and five main stories. Its new package ID is `clerkenwell-balanced-pilot`, version 1. Existing authored tours, installed library, player and phone are unchanged. The [route record](../../../content/generation-pilot/ROUTE.md) explains the selected 2.245 km geometry, physical evidence, exact public routing attempts and remaining gaps. The [scripts](../../../content/generation-pilot/stories.json), [claim passages/qualifications](../../../content/generation-pilot/evidence.json) and [separate encounter records](../../../content/generation-pilot/encounters.json) are review inputs.

## Walk plan

| Order | Place | Why stop / intended discovery | Planned movement to next |
| --- | --- | --- | --- |
| 1 | Farringdon, Cowcross Street entrance | Begin where the visitor arrives; establish the loop and low assumed local knowledge | Cowcross Street to Smithfield, about 4 min |
| 2 | Smithfield exterior | A porter badge reveals specialist, paid carrying jobs and a different working clock | St John Street/Lane, Briset and Britton, about 4.5 min |
| 3 | Booth panels, 25 Britton Street | A wall depicting work survived by acquiring a different job itself | Retrace to Briset and Gate, about 1.6 min |
| 4 | St John's Gate | A working writer helped manufacture the speeches readers thought they were hearing from Parliament | Square/Path, Britton, Old Sessions pedestrian signals, about 5.8 min |
| 5 | Clerkenwell Green | Practical cooperation remembered through a room too small for a visitor's chair | Close, Sans Walk and Woodbridge, about 6.3 min |
| 6 | Woodbridge Chapel | Hand-shaped petals reveal craft behind fashionable flowers; the investigator and mission assistant are distinguished | Sekforde, Green, Old Sessions signals, Turnmill to Farringdon, about 9.2 min |

Actual durations are **58.9, 101.1, 89.5, 137.5, 111.0 and 137.2 seconds**, respectively: **10.59 minutes** stationary audio. The 4.5 km/h geometry estimate is **29.93 minutes** movement, leaving **19.49 minutes** for looking, settling and crossing waits. The three representative main-story samples total **5 minutes 28 seconds** (Smithfield, Booth panels and Chapel).

The movement column mixes fresh provider estimates with reused September leg estimates; the authoritative composed distance/timing assumptions are in preparation metadata. Measured recordings replace assumed speech speed. Reserve the remaining part of the hour for looking, settling, crossing waits and ordinary pauses. Refreshments and interior visits are outside the hour. The 60-minute envelope is plausible on desk estimates, not yet timed.

The archived survey supplied the candidate pool before selection (RES-001). Cutting Charterhouse/Ingersoll/Exmouth earns the return within the hour (CUR-001/002); this is not the old open route with a new title. Quiet legs are a deliberate first-loop calibration choice, departing from the older two-walking-chapter authoring experiment. No prior owner enjoyment is claimed for that choice. Route/visitor positions remain separate (ROUTE-003/004/005); no walking chapter launch needs to be inferred from these altered indices. Claim wording and qualifications survive adaptation (REVIEW-001), with a fresh review of these exact versions still needed (REVIEW-002). Local cached George preserves the selected voice and measures real output (VOICE-001/002).

## Build, inspect and resume

From the repository root:

```sh
# Reassemble frozen desk inputs from retained routing and September source inputs, if needed:
python3 content/generation-pilot/assemble-inputs.py
# Offline renderer: reuses content-addressed local audio, never calls a paid voice service:
node --import tsx tools/generation/pilot.ts
# Validate with the actual app package parser:
node --import tsx tools/generation/pilot.ts --check
# Import exact records once; repeat validates and preserves the existing Job:
node --import tsx tools/generation/import-pilot.ts
```

The assembly source inputs are versioned repository files; do not rerun against altered September inputs without reviewing the resulting diff. The voice renderer validates cached model hashes, disallows remote models, rejects oversized tokenizer paragraphs and checks every chunk. A restart retains each completed content-addressed recording; it does not charge or fetch again. Input/script hashes, media hashes, exact voice revision, actual durations, full decode checks, map ID, render elapsed time and direct cost are retained in [preparation.json](../../../content/generation-pilot/preparation.json). The package parser enforces the actual player's schema/map coverage; a reimported changed package requires a version bump. Nothing auto-imports or plays.

## Review and smallest useful owner procedure

First review the desk candidate and resolve the station/Smithfield exterior-position evidence gaps. The package can be structurally valid while route/content acceptance stays blocked. Historical passage checks are mostly inherited; excerpt coverage and fresh independent current-version verification remain separate. Audio-capable listening was not performed by this agent.

For a short owner listen, play the actual **Smithfield**, **Booth panels** and **Woodbridge Chapel** files in [audio/](../../../content/generation-pilot/audio/) at a comfortable volume. The files are complete station narratives, not silent placeholders. Ask only: what stayed with you, what confused or dragged, and whether George sounded comfortable. No mandatory form or full-route outing is required to give that feedback. Do not play on the phone without first checking Sidi is listening.

Once the exterior issues are resolved, one ordinary daytime use of the candidate can answer the remaining practical question: does this exact loop, including the quiet station return, feel like a useful hour? The engineer prepares import and an independent-of-Metro handoff first if that use is requested. Keep manual arrival, Pause and End available; preserve earlier tour progress. Report the actual time and any wrong approach/blocked view that affected use. No new locked-screen endurance or baseline campaign is justified by these authoring-only artifacts. Existing player evidence applies only to unchanged behavior, not to unobserved new tour enjoyment, physical access or automatic arrivals.

The [durable authoring Job](../../../content/generation-pilot/authoring-job.json) imports 71 exact-revision records with transitive dependencies, unknown encounters, returned execution, US$0 settled direct cost and three required open issues. It has **no acceptance decisions**. The [review/repair record](../../../content/generation-pilot/REVIEW.md) distinguishes an independent retained-source wording check, applied physical-metadata repairs and outstanding final/physical/listening review. Existing job imports validate rather than overwrite review history; changed inputs require explicit versioning.

## Outcome boundary

Content drafted and local media/package work are inspectable. Full media decode and package parsing can be demonstrated without claiming listening, outdoor checks or release readiness. See preparation metadata for the actual completed checks. Public Valhalla routing used no account or paid allowance; cached local George incurred US$0. Built-in Codex research and adaptation are implementation assistance, not measured subscription-stage usage or API-equivalent cost. No paid call, new service account, publication, device install or upload of private data occurred.
