# Clerkenwell / Farringdon discovery survey

20 September 2026. Sidi selected Clerkenwell / Farringdon from the [area options](../../authoring/revision-2026-09-20/NEXT-AREA-OPTIONS.md). Apply [the public-tour survey protocol](../../AREA-TOUR-SURVEY.md) before our own theme, route or script. The next complete tour should include two narrated walking legs. Sidi remains editorial lead; offer meaningful assembly options after broad discovery. This is not permission to publish, purchase tours/books, contact guides or copy scripts.

## Patch and purpose

Core: Farringdon station, Smithfield/Charterhouse, Clerkenwell Green and Close, St John's Gate/Square, Exmouth Market/Spa Fields and the southern New River Head edge. This is a research boundary, not an instruction to include every part in one walk. Nearby comparisons: Angel, Hatton Garden, St Paul's/Barbican and the wider Fleet valley. Mark nearby-only candidates; do not silently expand the planned walk. Search Clerkenwell/Farringdon/Smithfield and specialist names as useful.

Find the publicly visible stops, themes and stories of existing walks, plus local/history and present-day sources that could change the candidate pool. Discover varied subjects, not only a famous-names list or a predetermined makers/radicals thesis. Record original source families and distinguish a complete itinerary from selected marketing highlights. Public inclusion is discovery evidence, not historical corroboration or verified visitor access.

## Parallel ownership

- **Public-walk researcher:** commercial/independent operators, self-guided/audio resources, published guides/book previews. Own `PUBLIC-WALKS.md` and `public-walks.json`.
- **Local-context researcher:** civic/heritage/community walks, local reporting and specialist history, current places/operators/events. Own `LOCAL-CONTEXT.md` and `local-context.json`.
- **Coordinator:** consolidate without duplicate counting, record coverage/gaps and prepare assembly choices. No agent selects the final tour or writes narration.

Initial source leads in the area options are discoveries to reopen as needed. Each researcher should inspect up to four materially different resources per assigned family, prioritising information gain. This is a ceiling for the initial sweep, not a quota; stop repetitive searching, record access gaps and nominate at most three consequential follow-ups. Do not deeply research every historical claim now. When both handoffs are ready the coordinator performs the gap check. A public page's omitted stops remain unknown; do not extract an itinerary from guesses or reviewer comments.

## Shared record format

Each JSON file contains `area`, `retrievedOn`, `scope`, `sources`, `tours`, `places`, `searchLog`, `gaps` and `parked`. Use stable role-prefixed IDs (`CW-PW-...` or `CW-LC-...`) so the coordinator can merge references explicitly.

- Source: `id`, `title`, `originator`, `url`, `kind`, `publishedDate` (null if unknown), `retrievedOn`, `access` (opened / partial / inaccessible), `family`, `relationshipNotes`, `summary` (own words), `rightsNotes`. Record sources actually opened; search-only leads stay labelled.
- Tour: `id`, `title`, `sourceIds`, `originator`, `status`, `areaRelation`, `themes`, advertised `duration`/`distance`/`start`/`end` (null if unstated), `stopListCompleteness`, `stops` with published `name`, `placeId` or null, `sequence` or null and `sourceId`, and `stories` with source references. List only disclosed subjects, not invented script content.
- Place: `id`, `name`, `aliases`, `address` or null, `coordinates` or null, `sourceIds`, `tourIds`, `candidateAngles`, `tags`, `currentContext`, `verificationNotes`. Do not invent coordinates; if present give provenance. Standing, access and directions remain unverified.
- Search log: actual queries/families, resources inspected or blocked and result. Gaps/parked: specific potential value and next evidence, not an exhaustive wishlist.

Keep prose concise: coverage and omissions; recurring versus less-covered material with basis; promising clusters and choices; useful candidates for walking subjects; what would need independent verification. Avoid reproducing protected descriptions. Keep quotations minimal and source summaries within tool limits. Two useful assembly directions may be suggested, with clear source basis; they are options, not fixed themes.

No other agents, commits, app/native changes, audio, phone actions or private-data access. Read repository instructions first. Signal when the owned files are complete and frozen; report whether any actual blocker prevents meaningful handoff. Use Extra High as requested.
