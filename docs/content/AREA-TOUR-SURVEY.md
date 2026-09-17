# Survey existing tours before curating a new area

Owner direction, 17 September 2026. This is the first research step for every new area, before selecting our stops, fixing a theme or drafting narration. It also comes next for Finchley: the existing A/B proposals and owner feedback are retained, but the broad survey is now [recorded](survey/README.md). The earlier Kinks lookup is one lead, not a completed survey.

## Purpose and coverage

Build a comprehensive catalogue of publicly discoverable walking tours and their published stops, themes and stories. Understand what local guides have already found, what is repeatedly featured, and what promising subjects or approaches we have missed. Use that knowledge to develop and independently research our own tour.

Define the core area and nearby comparison area first. For this pass, cover North Finchley, Finchley Central/Church End, East Finchley, Woodside Park and the adjoining Muswell Hill/Kinks material. Label which tours overlap our intended area and which merely provide nearby thematic examples; do not treat all of them as convenient additions to the bus-station routes.

Search across these source families:

- Walking-tour operators, individual guides and published event itineraries, including historic listings.
- Council, museum, local-history and community organisations; heritage trails, leaflets, maps and PDFs.
- Self-guided/audio-tour platforms and publicly accessible previews, walking blogs and published video/audio walks with identifiable places.
- Local music, architecture, literary, religious, social-history and other themed walks; follow references to further routes and guides.

Maintain a search log with area/name variants, theme queries, source families covered, useful references followed and access gaps. Deduplicate reseller listings of the same tour. Prefer the originator's account and preserve historical versions when they materially differ.

“Full survey” means a documented broad search of the relevant public material, not a claim to have accessed every unpublished or paid script. Capture partial listings honestly: if only a theme and two stops are public, retain them and mark the rest unknown. Do not infer a whole itinerary, story or stop order from marketing copy. Finish with a coverage/gaps statement and targeted follow-up leads rather than an arbitrary result quota.

## What to catalogue

Use simple versioned local records first. These are the fields to capture, not a requirement to implement a database before doing the survey.

| Record | Information to retain |
| --- | --- |
| Tour | Stable ID; title; originator; original URL; source type; current/historical/unknown status; publication and retrieval dates; area; advertised audience/theme; advertised duration/distance; start/end where stated |
| Tour stop | Tour ID; published name; matched place ID or unresolved identity; stated sequence or order unknown; exact source reference; stop-list completeness |
| Place | Stable ID; names/aliases; address and landmark coordinates with provenance where known; associated tour IDs; separate links to visitor/access records |
| Story or angle | Short summary in our own words of the published subject/angle; linked place and tour; source reference and minimal supporting excerpt where needed; explicit statement of what was actually available |
| Evidence | Source/author/date; relationship to other sources; factual claims to verify; primary-source leads; uncertainty, disputes and verification status |
| Reuse and review | What we might investigate; likely visitor payoff; repetition/contrast with other candidates; owner comments; our eventual inclusion/rejection reason; media/source rights metadata where relevant |

A location may support several stories, and the same story may appear in several tours. Preserve those many-to-many relationships. Another tour's inclusion is discovery evidence, not factual corroboration or a verified public standing area. Several reseller pages or guides copying one source do not constitute independent support.

## Synthesis before our own selection

Produce a readable comparison of the tours and a deduplicated place/story inventory. Identify recurring subjects, contrasting treatments, useful route ideas, overlooked leads and apparent gaps. A popular stop is worth investigating, not automatically including; a less-used one is not automatically original or good.

Write our own route promise, story angles and scripts using checked underlying sources and the current editorial guidance. Preserve attribution to discovery sources and do not copy another guide's wording or distinctive script structure. Record how the survey changed our choices, including when an existing A/B choice survives it. This gives the later guidelines review concrete evidence rather than a vague claim to have looked at the market.

## Reusable catalogue on the roadmap

The intended next stage is a local database of places, source records, claims, story angles, existing tours, visitor/access observations and our feedback. Tours should reference reusable records rather than create unrelated copies. Keep original source provenance, review dates, uncertainty and history when merging aliases or updating facts. Operational access can become stale independently of historical facts.

Start by saving structured survey records in the repository. Shape the database after the first survey and reuse across our two tours reveal the actual queries and relationships. A local SQLite implementation is the current engineering recommendation, not an irrevocable technology decision. This authoring catalogue is separate from the phone's progress store and versioned offline packages. See [the roadmap](../../ROADMAP.md#reusable-location-and-research-catalogue).

## Current status

Protocol applied: the [first comprehensive Finchley survey](survey/README.md) is complete, with source-family records, consolidated catalogue, coverage gaps and decisions for the two authored tours. The database remains planned. Survey completion does not establish physical access or actual enjoyment.
