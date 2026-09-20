# Clerkenwell — final editorial change check

20 September 2026. Narrow closure of [REVIEW-V1.md](REVIEW-V1.md), comparing the [final narration input](../../../../content/clerkenwell/stories.json) with the frozen [V1 JSON](draft-stories-v1.json) and [V1 scripts](SCRIPTS-V1.md). Only this check file was written; narration content was not changed.

## Verdict

**Pass: the required editorial corrections are present, and no new historical factual drift was found in the changes. The checked text is ready for the coordinator's audio and package preparation.** This closes the prose/evidence corrections from R1–R3. It does not establish audio quality, measured walking fit, the final 75–90-minute duration, physical direction accuracy or phone behavior; those remain separate integration checks.

## Exact files checked

| File | SHA-256 |
| --- | --- |
| `content/clerkenwell/stories.json` | `e56e49d924dc71fdbd5e1de9dc6a80ca28f2eaad4dd870d8adb7dc4c8b6fb64e` |
| `draft-stories-v1.json` | `050b2a184ef1c7adff0165f2b85a954522d9a1f9d5976c2982200fc9a54811a7` |
| `SCRIPTS-V1.md` | `7246bc43e542851228bf2bd06f08b18cefce42ecdb34ae1f761540b0a0dc66c5` |
| `REVIEW-V1.md` | `207624f4dd3f76fe06365d0333cd617667e750610f913ba9ba90331ec791dfeb` |

V1's two hashes match those recorded in the review. This verdict applies to the final narration hash above; later text changes require a corresponding bounded check.

## Corrections and additions

- **R1, buyer:** `next-days-stock` paragraph 2 now makes the missionary the former purchaser, with Groom as informant. The supervision and concessions remain attributed; the evidence rationale explicitly records the corrected antecedent.
- **R1, interview:** `flowers` paragraph 5 now attributes the training estimate to a mission assistant, without inventing a different interviewer. The two-year claim remains a reported estimate in the evidence.
- **R2, Ingersoll:** the opening now says the business stored and sold watches. It no longer implies that this company channelled locally manufactured watches through the warehouse. The surviving museum watch remains an example of the brand, with no invented connection to these premises.
- **R3, present chapel:** `flowers` paragraph 6 identifies GraceLife London as a church congregation. Its official site is registered and linked in the exact paragraph's evidence. This supports current use without claiming present medical treatment, a surviving flower workroom or public access.
- **Green and Gate:** the shortened paragraphs retain the original evidence boundaries. The missing-chair image and coach emblem remain; repeated explanation has been reduced. No claim of an unchanged Lenin Room or verbatim Johnson reports has appeared.
- **Exmouth locator:** number 25 and “gift shop” are directly supported by the [Space EC1 directory entry](https://exmouth.london/space-ec1/), independently opened for this check on 20 September 2026. The URL is registered and attached to the paragraph. Mo and Jo's account remains supported by the operator source; no opening promise was added.
- **Ending:** the farewell now clearly ends the tour and asks the listener to tap End tour. The existing UI source contains the label “End tour / stop location”; this was a text inspection, not a functional or phone test. The prose does not claim that finishing narration automatically ends tracking.

## Fidelity and evidence completeness

JSON parses; all ten IDs are unique; all **57 narrated paragraphs** exactly match their evidence entries. Every evidence kind is recognised, every basis is nonempty, every non-editorial paragraph has source URLs, and every referenced URL is registered within its story or chapter. The seven added navigation paragraphs are separate from the historical prose and identify the local route research in their evidence basis. Their physical accuracy belongs to the route review, not this check.

The transcript contains **2,201 stationary-story words including spoken navigation**, plus **338 walking-chapter words**. These are text counts, not measured durations; written `directions` arrays are separate and not included.

**Walking chapters:** `many-hands` transcript, sources and evidence are unchanged. In `next-days-stock`, only paragraph 2 and its matching evidence basis changed; paragraphs 1, 3 and 4, their evidence and the source list are unchanged. Both chapters have added written directions. The authoring-only `afterStopId` fields have been replaced in the package plan by `afterStopIndex` 4 and 6, corresponding to Green and Ingersoll in the unchanged stop order. This records the transformation without assessing trigger geometry.

No app tests, audio inspection, phone action, historical research expansion or commit was performed.
