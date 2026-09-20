# First complete writer assignment

Read [BRIEF](BRIEF.md), [SELECTION](SELECTION.md), [writing brief v4](../WRITING-BRIEF.md), and the three research packets linked from selection. Route research may still be finishing; directions and exact facing remain coordinator-owned. Apply the owner's actual craft preferences, not just headings describing them.

Own only `SCRIPTS-V1.md` and `draft-stories-v1.json` in this folder. Preserve the draft for later fresh review. Draft all eight stationary stories and two walking chapters as one coherent, varied experience, with George throughout. Aim for selective roughly 1–2-minute stops, allowing a little more where genuinely earned; first story includes a short welcome. The two walking drafts should initially be about 170–210 words each, subject to route/audio budgeting. Do not pad the total to satisfy the outing duration.

Use the selected pieces and consider their joins. If something stronger requires a meaningful change, explain it briefly in the draft notes. Bring distinctive activity to life; avoid universal filler, repeated moral endings, unexplained names and attribution in every sentence. Leave prose room for warmth and amusement. Most important factual claims should map to evidence rather than sounding like a list of verified facts. Return a targeted research question only when its answer could materially improve the story.

The JSON is a bounded authoring handoff, not a new universal schema:

```json
{"stories":[{"id":"charterhouse","title":"...","transcript":"paragraphs separated by two newlines","sources":[{"title":"...","url":"https://..."}],"evidence":[{"paragraph":"exact complete paragraph","kind":"source_checked","basis":"Claim IDs plus evidence limits/reconstruction rationale","sourceUrls":["https://..."]}]}],"chapters":[{"id":"many-hands","afterStopId":"green","title":"...","transcript":"...","sources":[],"evidence":[]}]}
```

Allowed evidence kinds are `source_checked`, `supported_reconstruction`, `editorial`; every non-editorial paragraph has sources. Retain uncertainty in the basis even when natural prose does not require a disclaimer. Map every paragraph, including introduction/conclusion; do not label mixed factual paragraphs purely editorial. Sources should use the actual inspected URLs from the research, with useful titles. No audio/geometry placeholders or made-up access claims in this file. Markdown presents the same prose in route order with short selection/remaining-issue notes. Final root integration will append reviewed navigation and build package assets.

Keep paragraphs short enough for the local voice model's 512-token limit (normally under about 80 words); do not flatten sentence rhythm to do this. Root will check actual phoneme tokens and rendering. Check the JSON parses, exact paragraph/evidence matches and all source references. No app/other file edits, purchases, contacts, phone actions or commit.
