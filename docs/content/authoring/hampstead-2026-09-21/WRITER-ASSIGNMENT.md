# Writer assignment — Highgate to Hampstead

Read this area's [brief](BRIEF.md), [selection](SELECTION.md), the three source packets linked there, and [writing brief v4](../WRITING-BRIEF.md). The new area's brief supersedes that brief's historical Clerkenwell-specific paragraph. Apply the owner's comments to the prose itself: distinctive activity, explanatory context, present life, warmth and some amusement; no obligatory moral at every ending.

Own only `SCRIPTS-V1.md` and `draft-stories-v1.json` here. Preserve this first complete draft for fresh independent review. Five stationary IDs in order: `highgate-station`, `pond-square`, `highgate-ponds`, `willow-road`, `keats-house`. Two walking IDs: `walking-conversation` after `pond-square`; `keeping-the-heath` after `highgate-ponds`. The first chapter starts only after the turn onto the Heath causeway between the Model Boating and Men’s ponds; Merton Lane and Millfield Lane remain silent. Exact directions are root-owned and will be appended after reviewed geometry; do not fabricate facing, visibility or access.

## Budgets and editorial jobs

- Station: roughly 75–100 words, including a clear welcome. Actual start is the public pavement by Highgate Underground's Archway Road exit; use a short introduction suitable for a busy place. A railway fact can earn its place but is not compulsory. Set up the walk, not every plot point.
- Pond Square, eastern ponds, Willow and Keats: generally 170–235 words before short navigation, with selective flexibility for the best material. About two minutes is relatively long for this owner; do not inflate every stop to its maximum.
- Walking conversation: **110–120 words initially**, with an actual audio cap of 60 seconds in George. Give Coleridge and Keats enough context, the documented conversational movement and the joke. No exact route reconstruction.
- Keeping the Heath: **160–175 words initially**, likely 80–90 seconds. One ownership explanation, a concrete visible ecological process, and (if it fits) sheep/anthills as a specific current management example. The sheep are elsewhere, not promised on this route.

Keep paragraphs normally under 80 words for the voice model, while varying sentence rhythm. Choose and join worthwhile material rather than pack every researched fact in. At Willow preserve both an intelligible visible design account and some vivid activity; trim repetitive dispute explanation. At Keats do not get bogged down in death or several women with the same first name. The current artist/birdsong story is a promising warm ending; the library remains an alternative, not an extra compulsory paragraph.

## Deliverable

JSON matches the existing bounded writer handoff:

```json
{"stories":[{"id":"highgate-station","title":"...","transcript":"paragraphs separated by two newlines","sources":[{"title":"...","url":"https://..."}],"evidence":[{"paragraph":"exact complete paragraph","kind":"source_checked","basis":"Claim IDs, support and material limits","sourceUrls":["https://..."]}]}],"chapters":[{"id":"walking-conversation","afterStopId":"pond-square","title":"...","transcript":"...","sources":[],"evidence":[]}]}
```

Allowed evidence kinds: `source_checked`, `supported_reconstruction`, `editorial`. Every paragraph maps exactly and in order; mixed factual/editorial paragraphs need actual sources. Keep supported reconstruction distinct in the evidence, with a natural spoken cue when useful. No invented dialogue/composite characters, generic historical atmosphere, photos/audio/geometry placeholders or copied third-party tour wording. Markdown presents the same draft in route order plus short selection notes and consequential questions.

Verify parsing, exact evidence alignment, all cited source URLs and word counts. No other edits, device action, paid service, publication or commit. Once ready, send root the strongest moment and any material unresolved gap. Root will integrate literal navigation, review feedback, actual audio and package timing.
