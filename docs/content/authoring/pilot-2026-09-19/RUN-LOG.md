# Pilot assignments and handoffs

19 September 2026. This record distinguishes actual execution from planned work. All agent roles use the current session's inherited model and reasoning settings; no override was requested. Each begins with a fresh task context and explicitly reads the saved inputs. Prompt files contain the full task; the messages below are the actual launch instructions.

## Shared input record

- Current writing brief version 1 and living guidance revision 11.
- Existing source stories are preserved in `BASELINE.json`, with their original file hash.
- `BRIEF.md` fixes this pilot's scope; `CALIBRATION.md` links selected owner reactions.
- Original installed packages and Word review files are outside all delegated write scopes.

## Launch 1 artsdepot research

Agent: `pilot_stop_research`. Launched in parallel with the walking researcher. Sole output: `P01-RESEARCH.md`.

> Execute the saved assignment at /Users/sidi/Documents/Tour app/docs/content/authoring/pilot-2026-09-19/prompts/01-stop-research.md. Read it and its required inputs before research. Your sole output ownership is P01-RESEARCH.md in that pilot directory. The coordinator is independently preparing the workshop, and another researcher handles the walking chapter. Return a concise evidence handoff; do not commit or edit other files.

## Launch 2 walking research and route review

Agent: `pilot_walking_research`. Sole output: `P02-RESEARCH-ROUTE.md`.

> Execute the saved assignment at /Users/sidi/Documents/Tour app/docs/content/authoring/pilot-2026-09-19/prompts/02-walking-research-route.md. Read it and its required inputs before research. Your sole output ownership is P02-RESEARCH-ROUTE.md in that pilot directory. The coordinator is independently preparing the workshop, and another researcher handles artsdepot. Return a concise evidence and route handoff; do not commit or edit other files.

## Research coordination messages

After the stop researcher identified the 2004 director's account, the coordinator sent:

> That specific distinction is useful. Please keep the core support readily inspectable and record the sources as separate contemporary, retrospective and current accounts. The writer will need room for an engaging script, so prioritise concrete material and keep direct excerpts short. Preserve uncertainty about whose wishes the director's plans establish. Send the handoff once the packet is ready.

After the walking researcher checked the actual chapter timing, the coordinator sent:

> Please use the 139.5-second measured baseline and clearly label the 115–125-second target as a proposal for this desk sample. The exact minimum navigation wording can sit separately from the prose if that protects timing and avoids inventing a verified cue point. Keep the directory search bounded; finish once it adds a meaningful detail or its limited result is clear.

The coordinator then bounded remaining research:

> Please finish the handoff now from the sources already checked; the new director/account distinction is enough to commission the sample. Park remaining interesting leads as optional questions. The writer and independent reviewer will follow, so this packet does not need to pre-empt every possible question.

> Please finish the handoff now using the sources already checked; the directory detail plus route budget is enough to commission the sample. Park remaining leads. Keep the historical address separate from any modern exact-building/point-at instruction.

## Handoff 1 artsdepot

[P01-RESEARCH.md](P01-RESEARCH.md) supplies a contemporary account of specific planned uses, a retrospective link to the Bull Arts Centre, current participation examples and the limits of attributing a director's plans to all residents. It also catches two tempting simplifications: the Gaumont had a stage and café, and the council's later account describes a joint arts/library alternative. These are research findings to use or respect, not evidence that the owner has selected this angle.

## Launch 3 writer

Agent: `pilot_writer`. P01 was ready; P02 research was still being completed. The writer could read shared inputs and begin the independent P01 section while waiting for the second handoff.

> Execute the saved assignment at /Users/sidi/Documents/Tour app/docs/content/authoring/pilot-2026-09-19/prompts/03-writer.md. P01-RESEARCH.md is ready; begin reading the shared inputs and drafting P01 while the independent walking researcher finishes P02-RESEARCH-ROUTE.md. I will message you when that handoff is ready. Do not complete P02 from the old baseline alone. You own DRAFT-V1.md and later DRAFT-V2.md/REVISION-NOTES.md after review. Preserve meaningful choices for Sidi, send focused research questions through me if needed, and do not commit or edit other files.

## Handoff 2 walking chapter

[P02-RESEARCH-ROUTE.md](P02-RESEARCH-ROUTE.md) adds a visually checked contemporary street-directory entry for two ladies' educational establishments on Alexandra Grove. It supplies a supported ordinary-life scene at street level, without identifying a present door. It also distinguishes a chapter launch window from the recording's end, uses the 139.5-second measured baseline and proposes a shorter 115–125-second sample with explicit faster-walker limits.

The writer reported that P01's documented offer supplied the missing relationship and required no further research for that angle. The funding/access alternative was retained as a separate possible treatment, not squeezed into the same script. No artificial writer-to-researcher question was required.

The coordinator sent the completed walking handoff:

> P02-RESEARCH-ROUTE.md is now complete. Read it before drafting P02. The directory's schools provide distinctive local material; preserve the difference between street-level evidence and a currently identified doorway. Its 260–285-word total includes navigation; 115–125 seconds is an estimate, not audio measured. P01's director plans/current programmes and P02's staged development are workable starting pitches, with your alternatives left for Sidi. Please finish both V1 samples and compact notes without expanding into full-tour production.

## Launch 4 independent reviewer

Agent: `pilot_reviewer`. Both research handoffs existed. Source checking could begin while the writer drafted; review of the actual prose had to wait for completed V1.

> Execute the saved assignment at /Users/sidi/Documents/Tour app/docs/content/authoring/pilot-2026-09-19/prompts/04-reviewer.md. Both research handoffs are ready; the writer is drafting DRAFT-V1.md now. Begin independent checks of the central sources and route constraints while that work proceeds. I will notify you when V1 is complete; review the actual finished draft before finalising REVIEW.md. You own only REVIEW.md. Focus on material claims and preserve the owner’s preference for fluent supported reconstruction. Do not edit drafts, launch agents or commit.

## Finished V1 and the readiness handoff

The writer completed [DRAFT-V1.md](DRAFT-V1.md), 317 words for P01 and 266 for P02 including 37 orientation words. Frozen SHA-256: `a69b03539890ec64661d425a54b250fcec0b9a725c208e313aa2f93328ccdbd6`. Timing remained an estimate; no audio or listening test was performed.

The coordinator's finalisation message was:

> I can see V1 on disk; please finalise counts and hand it off once ready, preserving this file for the independent review. I have begun a separate coordinator read. No extra source search is needed unless a specific draft problem requires it.

The reviewer had read an early working copy while checking sources. It contained “much grander” and a doorway/disclaimer passage; the writer independently removed these while finalising V1. The reviewer was asked to reread the frozen version. These are **not** remaining V1 defects or changes attributable to the completed review. Source prechecking can overlap writing; final prose review requires an explicit ready signal and version identity.

Actual completion and correction messages to the reviewer:

> The writer confirms DRAFT-V1.md is complete and frozen now. Counts are P01 317 words; P02 266 including 37 navigation words. Please finalise REVIEW.md against this finished version and hand off when ready.

> Please reread the saved V1 now: the writer's finalisation changed the earlier working text. The current opening omits 'much grander', and P02 now ends 'Behind the separate front doors, a neighbourhood was acquiring its daily routines...' rather than the doorway/disclaimer wording you first saw. Record findings against the frozen file, and distinguish any observations on the earlier working text from remaining changes needed.

The coordinator had also asked that emerging findings preserve the strongest passages and distinguish factual implications from style. Once the bounded checks were sufficient:

> Please complete REVIEW.md now with the bounded findings already established. The main-script result and one alternative-opening integration fix are enough; preserve the source checks and distinguish earlier working-text observations. We will send that single material fix to the writer, then assemble the owner packet.

## Independent review outcome

[REVIEW.md](REVIEW.md) independently checks the central source material, actual scripts, counts and saved route arithmetic. It finds no material factual defect in the main scripts. **R01:** substituting the railway opening removes the introduction of Moss Hall, leaving “its estate” in the following paragraph without a referent. The alternative must be checked in its full surrounding passage. Lyrical versus concrete ending, and street versus railway entry, remain editorial choices for Sidi.

## Writer revision assignment

The same writer received this follow-up after review, preserving V1:

> The independent review is complete at /Users/sidi/Documents/Tour app/docs/content/authoring/pilot-2026-09-19/REVIEW.md. Please apply its single material finding R01: the P02 railway alternative must introduce Moss Hall before unchanged paragraph 2 says 'its estate'. Give Church End a little locational context if keeping that name, without expanding historical claims. Preserve both main scripts and owner alternatives unless this specific fix requires a change. Write DRAFT-V2.md and concise REVISION-NOTES.md, leaving frozen V1 untouched. Count the complete replacement-opening version as well as both main scripts; if the alternative needs a compensating cut to stay inside 260–285 words, provide that exact cut as part of the option. Record R01 resolved and retain discretionary style choices for Sidi. Do not generate audio, edit other files or commit.

## Pending owner decisions

The writer returned [DRAFT-V2.md](DRAFT-V2.md) and [REVISION-NOTES.md](REVISION-NOTES.md). R01 is resolved by introducing the country house in the railway opening. That complete option is 278 words including navigation, so no compensating cut is needed. Both main scripts and the P01 alternative remain unchanged; V1's hash still matches the reviewed version. The coordinator checked the focused diff and complete replacement join rather than commissioning another full review.

The [owner packet](REVIEW-PACKET.md) presents the spoken samples first and the two editorial choices beneath them. Sidi's selections and reasons remain pending. The source packets, every task prompt, frozen draft, review and revision remain available for later process work. The pilot establishes inspected sources and working handoffs; it does not establish audible delivery, physical readiness or improved enjoyment.

## Documentation verification

The coordinator checked 196 local links/anchors across 17 changed/new Markdown files, valid JSON, exact baseline preservation, the frozen V1 hash, unchanged main scripts, owner-packet fidelity, all task word counts and the 278-word assembled railway alternative. All four owner Word sources retain their recorded hashes. Installed package/content files are unchanged. `npm run docs:check` and whitespace checks pass. No app tests or builds are needed for this documentation-only assignment.
