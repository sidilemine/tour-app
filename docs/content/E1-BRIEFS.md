# E1: two supervised Finchley briefs

Current planning note, 15 September 2026: these are retained drafts for the earlier area. The [short-walk plan](M2-TEST-PLAN.md) now prioritises North Finchley bus station and minimum useful walking time. Re-author both briefs to the same feasible short envelope before walking; keep the comparison gate and original preparation history.

Testing revision, 16 September: follow the [personal-use testing policy](../../AGENTS.md#testing-policy-for-the-personal-prototype). Compare short samples first. Reuse shared route evidence and request walking only where context or pacing remains material to the decision; two full variant walks are not required. Label conclusions by what Sidi actually heard or walked.

Prepared 13 September 2026. **Preparation only; E1 is not passed.** AI-authored outputs are supervised drafts. No additional model service, paid TTS, content factory or backend has been introduced.

## Shared constraints for both briefs

Use the Finchley Central → Church End → Stephens House area. Target 35–45 minutes, starting outside the station and ending at an agreed garden exit. This duration is an editorial target pending real routing/timing. Use public exterior viewpoints and permitted garden paths in daylight; no ticketed station platform, school/house interior, Bothy entry or assumed step-free access. Keep narration short, allow silence and reserve time for actionable directions. Do not invent residents, dialogue, motives, dates, tree identities or access. Factual passages must link to the reviewed claim ledger; physical instructions require field review. A changed brief must change attention, pacing and preferably candidate selection, not merely adjectives.

## Brief A — How places are designed

Create a walk for a curious adult who likes seeing how things work. Connect diagram-making, public-facing architecture, water infrastructure and designed nature. Prefer a small number of observable decisions over an encyclopedic history. The emotional arc should move from simplifying a complicated system to noticing the effort behind apparent simplicity. End with a generous silent interval. Keep questions concrete; do not explain machinery that the evidence does not establish.

Candidate sequence: station introduction → former college exterior → house exterior → water-tower viewpoint (if verifiable) → garden composition → agreed garden exit. The church and sculpture are pass-by candidates rather than full story stops. If the water-tower viewpoint fails, replace it with a verified garden-design observation; do not invent a diversion.

Three original sample scripts are in [listening-samples.json](../../content/finchley/listening-samples.json), variant `design`: school, water, garden. Claims: `school-roberts`, `henry-water`, `garden-designed` in the [evidence manifest](../../content/finchley/manifest.json). They are deliberately explicit about research limits and will need revision before a walked version.

## Brief B — Who gets remembered, who gets a place?

Create a walk for a curious adult who likes people and ordinary public life. Explore a repeatedly altered church, a private estate becoming public and a conversational memorial. Avoid a parade of famous men: ask what preservation, belonging and remembrance mean to a visitor now. Do not supply imaginary historical conversations or claim that a building proves how people felt. End with a reflective question and silence.

Candidate sequence: station meeting/introduction → church exterior → house exterior → a verified garden pause → Spike sculpture → the same agreed exit. The school and water tower are omitted as dedicated stops. Use the time saved for reflection and public-space observation. The garden pause may be a silent interval rather than an automatic narration trigger if spacing is tight.

Three original sample scripts are in the same file, variant `people`: church, house, Spike. Claims: `church-layers`, `house-public`, `spike-work`. Full walking plans for both variants remain pending visitor positions, real pedestrian routing and field review.

## Predictions recorded before feedback

| Dimension | Design variant | People variant |
|---|---|---|
| Selection and route | Adds school and candidate water-tower viewpoint; may require a different garden leg | Adds church and sculpture attention; omits that tower diversion |
| Attention | How a form or arrangement produces an effect | What preserving or sharing a place means |
| Pacing | More observation prompts, ending with a longer silent garden interval | More reflective pauses, ending at a conversational memorial |

The route difference is a hypothesis until the waypoints are verified and routed. Both may use some of the same paths. If the listener perceives only a change of wording, record that as a failed distinction rather than redefining success.

## Desk listening now

Six short local samples have been rendered with the Mac's installed Daniel voice at 145 words/minute. No network TTS or paid usage. Reproduce from the project root:

```sh
node --import tsx tools/render-listening-samples.ts
open artifacts/listening-drafts
```

Generated AIFF files and plain transcripts stay in ignored `artifacts/listening-drafts/`. Source scripts/claim references are committed. These are private desk-listening aids, not licensed production voice assets, not imported into the phone, and not safe directions for an unverified walk. Voice redistribution terms and final pronunciation/durations remain review items. The renderer checks structure and claim references; it cannot check truth or enjoyment.

Listen in either order and record the order. Keep the same voice/rate for both to reduce a voice preference confound. Before revealing the brief names, ask: “What kind of walk do you think this is?” Then reveal the briefs and ask which better fits, which you would choose and one moment you would change. Desk listening can reject dull ideas early; it cannot establish route enjoyment or orientation.

## Full supervised comparison later

1. Engineer verifies facts, develops real routed plans between inspected visitor points, fits narration to measured budgets and resolves all physical blockers. Compare both against the six-stop baseline in the same time/access envelope.
2. Review unsupported claims, pronunciation, rights and orientation; record edits and editing time. Preserve corrections instead of quietly replacing the experiment history.
3. Sidi compares both through short listening samples, noting order and familiarity. Add representative walking segments only to resolve material location/pacing questions; shared paths need not be walked twice. Record brief fit, enjoyment, clarity, factual trust, pacing and willingness to choose that walk, with concrete examples and the limits of desk-only observations.
4. Record route/access defects separately from story preferences. Recheck any changes that affect trigger spacing or cue timing.
5. Write **proceed**, **revise and repeat**, or **do not automate yet**, with reasons. Sidi decides whether the evidence warrants a later automated factory. A small personal experiment is not statistical proof.

| Result to fill | Design | People | Baseline |
|---|---|---|---|
| Presentation date/order | Pending | Pending | Pending |
| Perceived theme / concrete differences | Pending | Pending | Pending |
| Enjoyment / would choose / example | Pending | Pending | Pending |
| Orientation / factual concerns | Pending | Pending | Pending |
| Measured route, silence and narration | Pending | Pending | Pending |
| Corrections and editing time | Pending | Pending | Pending |
