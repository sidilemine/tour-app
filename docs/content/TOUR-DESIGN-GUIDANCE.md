# Walking tour design guidance

Living editorial reference, revision 1, 16 September 2026. Maintained for Sidi and the engineer preparing tours, and eventually for supervised automation. Update it as conversations and ordinary-use feedback reveal what works; retain the reason for substantial changes.

**Our aim:** make an enjoyable, relaxing walk reveal the non-obvious stories and meaning beneath the surroundings, giving the listener a deeper connection to a place, whether new or familiar. Being there should contribute something that reading at home cannot.

## Authority and use

Sidi's preferences lead. Research provides starting assumptions; feedback from Sidi, friends and family will refine them. This document is the single maintained reference for editorial choices, alongside the technical and evidence contracts in [PRODUCT](../../PRODUCT.md) and [ARCHITECTURE](../../ARCHITECTURE.md). It replaces the initial research draft's pending-preference summary, not its research findings.

The sections below distinguish **owner direction**, **working interpretations** and **future ideas**. Working interpretations are proposed ways to apply the comments, not separately approved decisions. None of these notes implements a feature or creates an additional physical test requirement. The M2 six-stop scope and compact North Finchley brief remain unchanged; the owner's twelve-stop example illustrated tonal variety.

Basis: Sidi's 24 comments, IDs 0–23, in `walking-tour-design-review Sidi COMMENTS.docx`, reviewed on 16 September. The Word body matches the original, with no tracked insertions or deletions. The original and commented Word files remain untouched. The [research review](WALKING-TOUR-DESIGN-RESEARCH.md) preserves source details and limitations.

## Owner direction

### Reveal something worth knowing in this place

Interesting, non-obvious knowledge is central. Help the listener understand why an ordinary-looking feature matters, how it came about, or what it reveals. An invitation to look is useful when it leads to an insight; merely pointing out visible objects is insufficient. A missing feature can also tell a story if its relationship to the current scene is clear.

At each main stop ask: **What becomes more interesting or understandable because we are here?** The experience should reward going outside as well as listening. Sidi identifies 99% Invisible as a reference for this spirit, including its use of supporting visual material. Its own [description](https://99percentinvisible.org/about/the-show/) centres on overlooked design and architecture. Comments 2, 13, 14 and 23.

### Give the tour a meaningful theme

A main theme and connections between stops matter. Individual insights can connect a physical feature to that theme. Keep the connection understandable without asking listeners to retain a complicated argument or resolve a series of intellectual challenges. The walk should remain relaxing and interesting in unfamiliar surroundings. Comments 5, 6 and 20.

### Treat rhythm as part of route selection

Aim for roughly even spacing, avoiding clusters of stops followed by long empty stretches. Narration should fit comfortably into the relevant walking leg or planned pause, with room for directions and silence. Select subjects that fit the available time: a specific local event or revealing decision is more suitable than compressing an enormous subject into a short summary. Deliberate quiet and varied depth are welcome. Give VoiceMap's practical production advice real weight when planning this rhythm. Comments 9, 11 and 18.

### Vary tone while keeping the walk easy to enjoy

Avoid repeating the same dramatic formula at every stop. Most stories can be even-keel, with occasional dramatic, reflective, amusing or charming moments where the material supports them. These are possibilities, not quotas. Descriptive judgement such as “an impressive façade” is acceptable; avoid prescribing the listener's emotions or making participation feel like homework. Comments 15, 19 and 20.

### Make the walking pleasant and the directions concrete

Avoid unsuitable road environments and uncomfortable stopping places. Walking quality matters alongside story quality. Use the planned incoming route and recognisable landmarks to establish directions; GPS is one input, not our only context. For example, a verified pharmacy at the relevant junction can anchor a turn. Street View is worth considering as a desk check of approaches, pavements and visible features. Comments 10, 16 and 17.

### Allow intrigue within honest boundaries

Enjoyment can include speculation, folklore and material beyond an encyclopaedic account. The evidence policy should support engaging narration rather than strip it of personality. The practical distinction between fact, inference, legend and imagination is set out below; the specific wording is a working interpretation of Sidi's preference. Comment 8.

### Choose the ending deliberately

Keep a repertoire of endings and choose what suits the tour. A climax and a reflective finish are both valid. Ending style could eventually be a preference alongside theme and duration. Comment 12.

## Working interpretations to apply and refine

### Structure and pacing

Use a clear theme as a selection aid, without forcing unrelated material into a thesis. Prefer a calm conversational voice with occasional tonal variation. Roughly even spacing means a comfortable rhythm, not identical metres or audio lengths: crossings, terrain, a strong story and a useful viewpoint can justify variation. These are editorial judgements, not numerical research findings.

For each candidate retain a brief note: the non-obvious insight; what the visitor experiences here; theme connection; evidence; intended tone; access; and the cost in walking and listening time. Compare candidates against one another so that several individually good stops do not repeat the same idea.

For each leg, estimate walking time, identify navigation moments and allocate moving narration, quiet and any separate stationary story. Count simultaneous walking and listening once in the tour total. Use the measured recording length before finalising the budget; shorten the subject or change the route when it does not fit. No universal words-per-stop target or dramatic-stop quota is adopted.

### Presenter qualities worth retaining

The Stern and Powell study highlighted confidence, passion, sincerity and charisma. Its measures grouped comfort, apparent knowledge and eloquence under confidence, and passion, charisma and sincerity under authentic emotion and charisma. These were associations in live programmes, not established effects for synthetic narration. See the [2013 paper](https://frec.vt.edu/content/dam/frec_vt_edu/documents/jir_stern.pdf), abstract and Table 6, printed p. 24.

Our proposed audio translation is clear delivery, well-understood material, audible interest, varied emphasis and honest uncertainty. Confidence should mean ease and clarity, not overstating a claim. We can convey interest through selection and delivery without inventing a narrator's memories. Voice quality and timing need listening judgement; the study supplies no TTS recipe. Comments 0–1 prompted this clarification.

### Speculation and evidence

Proposed writing rules within the existing claim-evidence contract:

- State supported facts naturally and retain their evidence behind the script.
- Introduce a reasonable inference as a possibility and preserve what supports it. “Perhaps” is not a substitute for a reason.
- Introduce a documented legend as a legend. Evidence that a story is told does not prove that its events happened.
- An invitation to imagine a scene may add atmosphere if it is clearly imaginative and its historical setting is supported. Do not present invented dialogue, motives or events as recovered history.
- Keep directions and access instructions literal and checked; entertaining uncertainty belongs in the story, not in whether a visitor can cross or enter somewhere.

These distinctions permit intrigue while preserving trust. Apply them in editorial review and retain the basis for each passage in the existing evidence records.

### Route preparation and walking times

**Recommendation, not a completed integration:** use Valhalla pedestrian routing during authoring for candidate paths, distances, estimated times and manoeuvres. It is already the candidate in [map and routing notes](MAPS-AND-ROUTING.md). Its [project documentation](https://github.com/valhalla/valhalla/blob/master/README.md) describes routing, time/distance matrices and a public FOSSGIS demonstration service subject to fair use. Start with a small, saved set of public candidate-route requests, not a new hosted routing service or a phone dependency.

Route between plausible visitor positions and entrances for desk comparison; retain their verification status. Review the actual paths before selecting final stops. Add allowances for crossings, looking and stationary listening; a router's travel estimate is not a tour duration or a promise of pleasant access. No route request or private trace upload was performed for this review. A production provider decision remains open.

Use Street View where available to examine the proposed approach and visible orientation cues, recording the imagery date and limits. Treat that as a desk observation, not proof of current opening hours or unobstructed access. Physical checking should target uncertainties that matter to the planned walk, under the existing pragmatic testing policy. A known approach can justify left/right instructions; a visitor who arrives another way needs an explicit landmark-based orientation or manual fallback.

### Ending options

Choose one editorial intention before polishing the final stop:

- **Payoff:** resolve the opening question or reveal a connection.
- **Reflection:** invite one uncomplicated connection back to what was seen.
- **Perspective change:** return to an ordinary feature the listener can now understand differently.
- **Quiet completion:** close at a pleasant or convenient place without forcing a climax.

The first two follow Sidi's comment; the fuller repertoire is an initial proposal. Always make completion and the endpoint clear. No ending-selection UI is scheduled.

## Future ideas and open hypotheses

- **Optional visual depth — owner intent.** A “learn more” layer with text, photos and other supporting material should complement audio. Keep the core walk usable with the phone in a pocket. This is broader future content design; it does not turn the current map/transcript work into a full multimedia feature assignment. Comment 2.
- **Personal relevance — hypothesis.** Sidi suggests that choosing subjects one cares about, alongside satisfaction in self-directed discovery, might explain some visitors' preference for their own resources. The Edinburgh Castle study does not establish either mechanism. Use this as a question for later personalisation and feedback, not a causal research finding. Comment 3.
- **Music and sound — distant ideas.** Ambient music, soundscapes and filler playlists are retained for later exploration, without current implementation. Comment 4.
- **Interactive conversation — distant idea.** Speech recognition and an LLM might eventually allow responsive or real-time dialogue. The recorded tour cannot currently hear an answer; that is a present scope limit, not a claim of permanent impossibility. Live services remain outside the current offline product. Comment 7.
- **Voice feedback — requested direction, design pending.** The research draft's feedback questions were for testers. Capture short spoken reactions while the experience is fresh, without a street-side written report. For the next ordinary-use review, an existing phone recorder is the simplest proposed interim approach if convenient. An in-app memo action remains unscheduled; before adding it, define deliberate recording, pause interaction, local storage and export. No background recording, transcription service or sharing is implied. Comment 22.

## How to use this for the next draft

Write one clear tour promise and theme. Compare candidate insights and routes, then prepare two contrasting sample stops with different tones and plausible timing. Review those at the desk before polishing a complete tour. During normal use, collect brief reactions about what was interesting, confusing, dull or worth the walk; follow concrete issues rather than creating a new test campaign.

The [first North Finchley sample pair](NORTH-FINCHLEY-SAMPLE-STOPS.md) puts a light naming anecdote beside a quieter neighbourhood memorial story. It is draft material awaiting Sidi's response, not evidence that these styles or candidates have been accepted.

Keep this guide current as preferences change. Future automation should use the same versioned editorial reference rather than accumulating inconsistent rules in separate prompts. There is no new automation, route choice, app change or physical acceptance claim in this revision.

## Comment coverage and revision history

All 24 comments were considered: 0–1 guidance and presenter qualities; 2 visual depth and 99% Invisible; 3 personalisation hypothesis; 4 sound; 5–6 theme; 7 dialogue; 8 speculation; 9 rhythm; 10 orientation; 11 producer guidance; 12 endings; 13–14 purpose and presence; 15 variety; 16–17 walking quality and Street View; 18 pacing agreement; 19 descriptive judgement; 20 cognitive effort; 21 routing estimates; 22 spoken tester feedback; 23 non-obvious knowledge.

Revision 1 records Sidi's Word comments and the engineer's explicitly labelled interpretations. Presenter details and the routing project documentation were checked on 16 September 2026. The wider source review remains in the linked research document; no new user study or field evidence is claimed.
