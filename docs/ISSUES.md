# Known issues, fixes and reusable lessons

Updated 6 October 2026. Maintained by the technical lead. This is the general log to consult when preparing another tour, assigning agents, fixing the player or building the M4/M5 authoring tools. It includes mistakes, demonstrated fixes, successful choices worth preserving and unresolved questions. Detailed evidence remains in the linked records.

## Scope and use

This retrospective covers the **foundation/M1 conversation, 12–15 September**, and the **M2 conversation, 15–21 September**, through the request for this log. The lead reviewed both conversations' user messages and recorded answers, reconciling earlier claims with later corrections and maintained results. Three bounded audits covered editorial work, routes/delivery and engineering. Supporting material includes the existing index of **100 Word comments**, both Finchley feedback recoveries and clarifications, the authoring pilot/revision, and Clerkenwell/Highgate preparation records.

This is a synthesis of that evidence, not a new transcription or a fresh verification of every historical source. Original private recordings and conversation extracts remain local and uncommitted. The [editorial record](content/EDITORIAL-REVIEW-RECORD.md) preserves detailed discussion; [living guidance](content/TOUR-DESIGN-GUIDANCE.md) and [role briefs](content/authoring/AGENT-BRIEFS.md) remain the instructions for writing. This log makes their concrete lessons and the technical fixes findable together.

### How an issue is handled

1. Find the existing entry before adding another. Record the example, response, current evidence/limit and the action that prevents repetition. Keep stable IDs when an entry moves.
2. Use a status that says what we know: **owner direction**, **working method**, **fixed with evidence**, **implemented with limits**, **open**, **monitoring**, **deferred** or **superseded**. An editorial preference is not a software defect; a proposed technique is not a proven rule.
3. Fix the shared cause where practical. Retain a focused regression for reproducible logic/storage failures; for visual/native behavior, preserve the reproduction and smallest useful observation. Passing unrelated tests proves nothing about the issue.
4. For unresolved work, state a fallback and a concrete revisit trigger. No open entry automatically requests a phone session, repeat walk or rewrite of an installed tour.
5. The lead includes the relevant IDs and source examples in each assignment. At handoff, update changed statuses and promote useful lessons into the responsible brief, code or check. Link this log rather than copying its entire history into every prompt.

Apply the [personal testing policy](../AGENTS.md#testing-policy-for-the-personal-prototype). Preserve actual failures and incomplete evidence while making pragmatic progress. A later pass does not explain an earlier failure unless the evidence connects them.

## Find lessons by agent function

| Function | Read for |
| --- | --- |
| [Lead and orchestration](#lead-and-orchestration) | Scope, learning, handoffs, reusable research, future automation |
| [Survey and story research](#survey-and-story-research) | Coverage, independent evidence, actors, present use, names, comparisons |
| [Curation and tour assembly](#curation-and-tour-assembly) | Route value, duration, rhythm, selection within stories |
| [Narration writing](#narration-writing) | Context, reconstruction, unfamiliar experience, reflection, tone |
| [Route and visitor experience](#route-and-visitor-experience) | Pedestrian approaches, geometry, standing points, access, speech windows |
| [Independent review](#independent-review) | Semantic source checks and complete frozen drafts |
| [Voice and media production](#voice-and-media-production) | George, complete rendering, actual durations |
| [Offline maps and package integration](#offline-maps-and-package-integration) | Map opening, resource integrity, area identity, immutable content |
| [Player and native engineering](#player-and-native-engineering) | Real native code, location delivery, holds, recovery, known limits |
| [Feedback capture and synthesis](#feedback-capture-and-synthesis) | Headset issues, recording lifetime, transcription gaps, comment provenance |
| [Verification and phone handoff](#verification-and-phone-handoff) | Proportionate tests, listening readiness, delivered builds, exports, evidence |

## Current follow-ups

These are selected unresolved items, not an additional acceptance list. The detailed entries carry their scope.

| ID | Current position | Revisit when |
| --- | --- | --- |
| [AUDIO-001](#audio-001--headset-field-failure-remains-unexplained) | EarFun desk capture passed; prior field failure unexplained | Recurrence in ordinary use or relevant audio-routing change |
| [WALK-001](#walk-001--manual-completion-is-not-an-automatic-launch-pass) | Natural automatic walking-chapter launches not established | Ordinary Clerkenwell/Highgate feedback; M2 closure |
| [ROUTE-001](#route-001--approach-directions-need-the-actual-pedestrian-layout) | Confusing Finchley Crescent instruction remains in the old package | Before reusing that instruction or issuing a relevant revision |
| [RES-003](#res-003--explain-who-acted-and-how-the-arrangement-worked) | Crescent development/lease/ownership questions remain unanswered | Reusing that historical explanation |
| [PLAYER-006](#player-006--the-eligible-leg-is-not-the-whole-route) | “Off route” can mean outside the eligible leg, while still on the tour | Relevant M3 route/UI work or a consequential recurrence |
| [FEED-001](#feed-001--recording-lifetime-must-be-visible) | Lock/background ends and saves recording; no background capture | Ordinary feedback shows current recording lifetime is inadequate |
| [MAP-001](#map-001--opening-map-omitted-the-route) | Opening fixed and observed; no dedicated camera regression test | Camera refactor or materially different route extent |
| [MAINT-001](#maint-001--recommended-dependency-patches) | Recommended Expo patches deferred | Scheduled native maintenance or a relevant bug |
| [LEAD-003](#lead-003--retain-reusable-records-before-building-the-database) | Reusable catalogue and compiler planned | M4 design, using actual reuse cases and this log |

## Lead and orchestration

### LEAD-001 — detailed criticism is learning, not an automatic rewrite order

**Owner direction; applied to subsequent work.** After Tour B, Sidi explicitly said he fully enjoyed it and learned about his neighbourhood. He wanted the comments to improve how we build tours generally. Earlier recovery notes leaned too much towards fixing each Finchley story.

**Carry forward:** retain what worked alongside criticism and distinguish a technical defect from optional editorial refinement. Tour B's enthusiasm is observed success; Tour A has useful individual feedback, not an equivalent overall verdict. Clerkenwell/Highgate preparation is not owner enjoyment evidence. Reopen an installed story only for an assigned change or material practical problem. [Original correction and ratings](content/FIRST-TOUR-FEEDBACK-RECOVERY.md#owners-purpose-and-overall-verdict--subsequent-clarification), [decision 15](content/EDITORIAL-REVIEW-RECORD.md#15-purpose-correction-general-authoring-lessons-not-finchley-polishing).

### LEAD-002 — separate functions, with one accountable integrator

**Owner direction; working method exercised.** Sidi identified trying to research, select, route and write in one pass as a weakness. The pilot used bounded assignments, shared briefs, named output ownership and an explicit completed-draft handoff. Prompts of 322–357 words referenced larger packets; that is an example, not an optimal length.

**Carry forward:** commission a clear output with current inputs, decisions, file ownership and unresolved questions. Researchers can answer a writer's targeted follow-up. The lead resolves conflicts and reviews the whole tour. More agents or longer prompts do not themselves improve a story. See REVIEW-002 for the actual integration failure. [Pilot record](content/authoring/pilot-2026-09-19/README.md), [role briefs](content/authoring/AGENT-BRIEFS.md).

### LEAD-003 — retain reusable records before building the database

**Owner-requested plan; database not implemented.** Repeated area research prompted the request for reusable locations, sources and stories. Current surveys and authoring packets retain structured IDs and provenance. The local catalogue belongs alongside M4, before scaling M5; the original deferral of a speculative city knowledge base does not cancel this later request.

**Carry forward:** reuse places, aliases, claims, story angles, visitor positions, dated access and inclusion/rejection history. Keep historical truth and current access on separate review lifecycles. At M4, demonstrate rebuilding an existing tour and reusing research in a different treatment; consult this log for failure cases. Do not start with a hosted service or a schema that cannot answer a real authoring query. [Catalogue scope](../ROADMAP.md#reusable-location-and-research-catalogue).

### LEAD-004 — preserve decisions, alternatives and supersessions

**Adopted practice; recurring coordination risk.** Preparing two options did not select both final scripts. Sidi chose the railway-led opening, conditionally preferred a better-written warm ending, chose George generally, and clarified Highgate Underground rather than Highgate village. The old 20–30-minute tour assumption and future 3–5-outing estimate were superseded.

**Carry forward:** a current brief records what the owner chose, what the lead selected within scope, what remains proposed and why. Preserve rejected alternatives so a later route can reuse them. Two different enjoyed tours are not by themselves a controlled test that changing a prompt caused the difference. M5 still has the E1 decision gate. [Pilot choices](content/authoring/pilot-2026-09-19/OWNER-FEEDBACK.md#decisions-and-their-meaning), [current outcomes](content/EDITORIAL-REVIEW-RECORD.md#current-outcome-register), [E1](../ROADMAP.md#experiment-e1--supervised-ai-brief-comparison).

## Survey and story research

### RES-001 — survey existing walks before our shortlist

**Owner direction; now applied.** Early Finchley proposals preceded the comprehensive survey. Looking up one Kinks walk was not the intended first step. Later work catalogued public tours, stop sequences, themes and angles across source families; discovery also includes guides and present-day places.

**Carry forward:** return coverage, deduplicated source families and a varied candidate pool before selection. Distinguish full itineraries from advertisements, previews and unread paid books. A large count is not comprehensive reading or independent corroboration. Use others' tours for discovery, verify the claims used and write original narration. Preserve gaps rather than inventing an unavailable sequence. [Survey protocol](content/AREA-TOUR-SURVEY.md), [owner decision](content/EDITORIAL-REVIEW-RECORD.md#09-survey-before-selection-and-retain-reusable-research).

### RES-002 — research the question that could change the story

**Owner direction; working method.** The cycling anecdote felt like random people meeting; the owner suspected a wider movement. Research into Torrington's performers offered a richer picture of careers and audience. Repeated copies of one account would not supply that depth.

**Carry forward:** identify the missing explanation, ask what additional source could change it, and follow that lead. The writer may send a focused question back. Stop when further searching mainly repeats the picture. No fixed source count, Wikipedia eligibility test or numerical confidence score was adopted. Literature and practitioner conventions inform our method but do not prove ideal stop counts or story lengths. [Research response](content/SECOND-PASS-REVIEW-RESPONSE.md#a-method-for-finding-the-interesting-part), [research review](content/WALKING-TOUR-DESIGN-RESEARCH.md).

### RES-003 — explain who acted and how the arrangement worked

**Owner direction; original historical questions open.** Calling Moss Hall Crescent a shared undertaking left unclear who developed it, who leased what to whom, and who owns and maintains the green now. The dated appraisal supports subdivision, restrictions and some maintenance history, but not all those answers.

**Carry forward:** distinguish landowner, developer, contracting parties, beneficiaries, operator and maintainer when the explanation depends on them. Shared use does not prove collective development or ownership. General guidance changed; the installed Finchley account was not rewritten. Before reusing it, resolve the missing relationships or narrow the claim. Later Wells/Burgh research separates trustees, income, freehold and lease, but remains alternative material. [Clarification and limits](content/FIRST-TOUR-FEEDBACK-RECOVERY.md#owner-clarification-development-leases-and-the-parallel-street), [guidance](content/TOUR-DESIGN-GUIDANCE.md#explain-the-people-and-arrangement-behind-the-story).

### RES-004 — return history to the place as it is now

**Owner direction; applied in later drafts.** At the Grand Arcade, a preservation story missed the shops closing in front of the listener. Sidi wanted current businesses, causes of decline and any continuing effort researched. This supersedes a positive-only present-day coda. Clerkenwell review also added Woodbridge Chapel's present identity.

**Carry forward:** collect dated present use during research, including difficult change. Owner-observed closures are useful leads, not proof of a cause or campaign. An advertised event proves an offer, not attendance. Current use can go stale independently of historical facts. A specific current detail often earns its place better than another abstract ending. [Direct clarification](content/reviews/2026-09-18-second-tour-clarifications.md#grand-arcade-current-affairs-and-living-businesses), [Clerkenwell correction](content/authoring/clerkenwell-2026-09-20/REVIEW-V1.md#r3-give-woodbridge-chapel-its-brief-present-identity).

### RES-005 — names need context that can inform the scene

**Owner direction; applied in later work.** Torrington named musicians from a clipping without explaining them; Trinity needed the orchestra's identity and relationship to the church. A name alone did not help the listener picture the night.

**Carry forward:** supply a compact identity, relevant relationship and the detail it unlocks. Research can establish musical style and plausible atmosphere; the owner's examples of jazz, hipsters or rockabilly were questions, not facts to insert. Avoid full biographies when five useful words suffice. Later edits explain Moore as a sculptor and give the named Keats ode an intelligible image. [Torrington clarification](content/reviews/2026-09-18-second-tour-clarifications.md#torrington-investigate-names-to-inform-the-scene), [Highgate edits](content/authoring/hampstead-2026-09-21/FINAL-EDIT-CHECK.md#applied-changes).

### RES-006 — find the missing comparison when it matters

**Owner direction; revised samples prepared.** “Half an hour into London” sounded ordinary to a listener making that journey today. The useful missing context was travel before the railway and what occupied the land before the houses. An 1887 girls' school could be illuminated by period/type-level research without an extraordinary incident at that exact school.

**Carry forward:** identify what the listener cannot infer from normal life. Compare origins, destinations, modes and periods honestly; regional coach/rail examples do not establish an exact same-trip saving. Broader education history must not become an invented local curriculum. The owner explicitly rejected making before/after comparison compulsory everywhere. Revised samples have desk review, not a renewed owner verdict. [Clarification](content/authoring/pilot-2026-09-19/OWNER-FEEDBACK.md#follow-up-clarification-period-context-and-selection-within-a-story), [revision review](content/authoring/revision-2026-09-20/REVIEW.md#alexandra-grove).

## Curation and tour assembly

### CUR-001 — short technical tests do not mean short finished tours

**Superseded assumption; owner direction applied.** The request for the shortest valid tests was mistakenly turned into a tiny tour brief. B's extra walking was welcome. Clerkenwell's chosen 75–90-minute outing should justify travel; Highgate's 85–100 minutes is an honest preparation estimate, not a newly owner-selected cap.

**Carry forward:** keep test burden and desired experience separate. Estimate movement, stationary narration, looking and waits; count walking speech only once. Use actual audio duration when available, and separate optional visits/feedback. Two-minute stories are acceptable selectively, not a default or universal limit. [Owner correction](content/EDITORIAL-REVIEW-RECORD.md#08-owner-review-of-the-two-tours), [Clerkenwell timing review](content/authoring/clerkenwell-2026-09-20/REVIEW-V1.md#required-integration-check-use-this-drafts-actual-timing).

### CUR-002 — a good subject must earn its route cost

**Owner direction; exercised selection.** The first Finchley Central sequence backtracked unintentionally because it was a stop list presented too much like a settled route. Later the thin Stanhope cinema detour lost to richer Gaumont/artsdepot material on the main route. Highgate selected an endpoint cluster rather than appending every researched attraction.

**Carry forward:** assess story, visible/present connection, extra walking and awkward return together. Convenient transport start/end is part of the brief; clarify which station exit or village point. Retain rejection reasons. This is not a ban on backtracking, vanished buildings or two related sites: each can work when the payoff and contrast justify it. [Early route correction](content/EDITORIAL-REVIEW-RECORD.md#01-convenient-location-and-proportionate-testing), [detour guidance](content/TOUR-DESIGN-GUIDANCE.md#make-a-detour-earn-its-place), [Highgate selection](content/authoring/hampstead-2026-09-21/SELECTION.md).

### CUR-003 — vary the rhythm; let the theme serve discovery

**Owner refinement; applied working direction.** Roughly even spacing became too rigid. The owner accepted dense stops, longer walks, some retracing and silence; a loosely connected portrait can work without every anecdote proving one thesis.

**Carry forward:** plan the whole walk's changes in attention, movement and tone. Sidi wants at least one moment of levity in an ordinary tour, with deliberately sombre/serious tours excepted. Quiet is not an unfilled content slot. Two similar subjects need a useful difference, not automatic rejection. Walking chapters are first-class stories, not leftovers between stops; two chapters is the current experiment's brief, not a permanent quota. Music/soundscapes remain future ideas. [Rhythm and theme](content/TOUR-DESIGN-GUIDANCE.md#give-the-tour-coherence-without-requiring-a-strong-theme), [tone direction](content/TOUR-DESIGN-GUIDANCE.md#vary-tone-while-keeping-the-walk-easy-to-enjoy), [walking-story feedback](content/FIRST-TOUR-FEEDBACK-RECOVERY.md#4-walking-chapter).

### CUR-004 — select within the facts, and check what a revision loses

**Owner direction; lightweight method being tried.** The artsdepot pilot improved the explanation but dropped masks, protests and Madness despite having that research. Repeated plans and intentions displaced vivid action. This was a selection failure, not missing evidence.

**Carry forward:** make a short selection outline: provisional promise, strongest material, what each contributes, complementary combination and order. Compare the revision with its predecessor for lost strengths. The focused revision restored campaign action and cut repetition; it omitted “free” because the gig's price was unproved and retained the joint arts/library nuance. The method is not an adopted scoring formula, and the revised ending has no owner verdict yet. [Observed loss](content/authoring/pilot-2026-09-19/OWNER-FEEDBACK.md#what-the-retained-material-shows), [method](content/authoring/WRITING-BRIEF.md#select-material-within-the-story), [revision](content/authoring/revision-2026-09-20/REVIEW.md#artsdepot).

## Narration writing

### WRITE-001 — give the listener usable bearings

**Owner direction; recurring writing lesson.** Tally Ho's junction, coaching and cycling material lacked a clear hierarchy; Trinity needed an introduction. Figures such as houses and men meant little without a useful relationship. The artsdepot script already contained 1937: the feedback showed that the context did not register, not that the date was absent.

**Carry forward:** establish enough place, time and relationship for the next sentence to make sense on one hearing. Counting names/dates in a script is weaker than checking whether the prose conveys them. Context before anecdote is a strong preference, not a ban on an intriguing opening. [First recovery](content/FIRST-TOUR-FEEDBACK-RECOVERY.md#recovered-editorial-feedback), [corrected synthesis](content/EDITORIAL-REVIEW-RECORD.md#18-authoring-synthesis-prepared-stop-for-the-second-pass).

### WRITE-002 — help reconstruct the vanished world

**Owner direction; earlier restriction withdrawn.** Asking someone to imagine a vanished street without helping them picture it was a missed opportunity. Sidi explicitly permits confident, strongly supported reconstruction and atmosphere, as in a serious audiobook about an area.

**Carry forward:** preserve the documented foundation and imaginative extension in the evidence notes; use a natural cue when shifting into imagination. Do not demand an eyewitness for every plausible gesture or scatter “perhaps” through every sentence. Invented dialogue and composite characters were not selected for this phase. Plausible atmosphere does not authorise invented motives, relocated incidents or false commemorative meanings. [Original correction](content/EDITORIAL-REVIEW-RECORD.md#06-correction-on-imagined-colour), [scope clarification](content/SECOND-PASS-REVIEW-RESPONSE.md#confidence-and-imagination).

### WRITE-003 — evocation must reveal an unfamiliar experience

**Owner direction; revised application awaiting reaction.** Schoolbooks opening and chairs moving felt universal. Wood panelling began to evoke Gaumont, but the scene stopped short of what made a 1937 cinema visit different. The question is not whether the activity is plausible; it is whether narration supplies a missing picture.

**Carry forward:** identify that picture first, then choose a telling action, material or mechanism. The revised samples use the rising organ/double bill and the period tension in girls' education. Later reviewers valued market carrying, petal shaping, elm pipes and Moore's stringed head; those are desk judgements until owner feedback. Do not require spectacle or uniqueness to the exact institution. [Owner feedback](content/authoring/pilot-2026-09-19/OWNER-FEEDBACK.md#owner-wording), [revision assessment](content/authoring/revision-2026-09-20/REVIEW.md#what-works-and-what-remains-a-judgement).

### WRITE-004 — keep evidence bookkeeping behind fluent speech

**Owner direction; repeated editorial corrections.** Crescent variants narrated irrelevant unknowns; Torrington announced why the subject was interesting. Highgate V1 commented on leaving transport history behind. Short isolated factual sentences also made delivery monotonous.

**Carry forward:** say the interesting thing directly, join related ideas and vary rhythm for listening. Retain qualifications that materially affect belief; keep routine research limits in the evidence packet. Removing a spoken caveat must narrow an unsupported claim, not make it falsely certain. A warm documentary voice can express an editorial outlook without fictitious narrator memories or personal tastes. Sidi also directs upfront AI-generation disclosure: Clerkenwell's introduction supplies one implemented example, not universal disclosure UI or proof of accuracy. [Voice and disclosure direction](content/TOUR-DESIGN-GUIDANCE.md#use-a-warm-documentary-voice-with-an-editorial-outlook), [spoken-prose guidance](content/TOUR-DESIGN-GUIDANCE.md#keep-evidence-work-behind-graceful-spoken-prose), [Highgate applied edits](content/authoring/hampstead-2026-09-21/FINAL-EDIT-CHECK.md#applied-changes).

### WRITE-005 — broader thinking should deepen the local encounter

**Owner direction; numerical cap unapproved.** The sculpture feedback did not reject digressions. Sidi wanted local story and broader thought together, with enough restraint to preserve the value of actually walking there. Artsdepot needed documented motives to complete the link from a local venue to a wider insight.

**Carry forward:** know what the broader passage adds and how it returns to people, choices or surroundings. Give it a deliberate allowance and assess the whole story's balance. The suggested 25% ceiling remains a proposal, not an automatic validator. Vanished history can be core local content; an amusing detail need not carry a thesis. [Sculpture clarification](content/FIRST-TOUR-FEEDBACK-RECOVERY.md#owner-clarification-sculpture-and-bounded-digressions), [artsdepot clarification](content/reviews/2026-09-18-second-tour-clarifications.md#artsdepot-complete-the-connection-from-local-facts-to-wider-insight), [unapproved budget](content/TOUR-DESIGN-GUIDANCE.md#proposed-initial-digression-budget).

### WRITE-006 — do not impose a memorial's meaning

**Specific rejection; general lesson adopted.** The John Parr sample blurred its commemorative subject and attached an unsupported message about remembering the surrounding street. Defending that ending as interpretation was withdrawn. The minor solemn stop was dropped.

**Carry forward:** establish what an object commemorates before interpreting it. A fluent metaphor cannot change that purpose. Sidi prefers selective use of solemn subjects with restraint; this is not a ban on churches, religion or reflection, nor a universal heritage rule. [Sample decision](content/EDITORIAL-REVIEW-RECORD.md#04-contrast-in-sample-stops), [current guidance](content/TOUR-DESIGN-GUIDANCE.md#be-selective-about-solemn-subjects).

### WRITE-007 — warmth works through specifics; endings need variety

**Conditional owner preference; working editorial method.** The warmer artsdepot ending was favoured if better written. Later Clerkenwell drafts repeated the meaning of a chair and the notes-to-speech explanation; repeated thematic closing instructions weakened the cumulative experience.

**Carry forward:** let an action or relationship carry the feeling, preserve its strongest image and remove repeated explanations. Review endings across the tour. Huxter's wish to share birdsong is the chosen Highgate application, not yet owner-endorsed. No universal warm-ending formula or settled list of narrator values follows from these choices. [Owner preference](content/authoring/pilot-2026-09-19/OWNER-FEEDBACK.md#decisions-and-their-meaning), [Clerkenwell edits](content/authoring/clerkenwell-2026-09-20/REVIEW-V1.md#worthwhile-optional-improvements), [Highgate review](content/authoring/hampstead-2026-09-21/DRAFT-REVIEW.md#keep-these-strengths).

## Route and visitor experience

### ROUTE-001 — approach directions need the actual pedestrian layout

**Known instruction issue; old Finchley package unchanged.** Alexandra Grove → Moss Hall Crescent was confusing because the useful approach continues to Ballards Lane. Imagery of the villas did not verify the incoming turn. Clerkenwell independently exposed misleading shorthand for crossing Rosoman and then entering Exmouth.

**Carry forward:** inspect parallel streets, offset junctions, crossing landings and the pavement the visitor actually reaches. Verify and version a correction before reusing the Crescent instruction. The map is a fallback, not evidence that wording is correct. Later Clerkenwell directions record the literal crossing/right/left sequence, with desk evidence rather than a field pass. [Owner report](content/EDITORIAL-REVIEW-RECORD.md#13-explain-who-acted-and-check-directions-from-the-actual-approach), [Finchley correction](content/routes/north-finchley-review-v2/EXTERIOR-CHECKS.md#first-use-correction--17-september), [Clerkenwell final check](content/authoring/clerkenwell-2026-09-20/FINAL-NAVIGATION-CHECK.md).

### ROUTE-002 — inspect bad geometry before tuning GPS

**Fixed with replay and field evidence.** M1's roughly one-minute rejoin delay occurred with fresh callbacks. Sparse fixture geometry cut long straight chords across the curved walked path, putting normal fixes far outside the stored corridor.

**Carry forward:** separate sensor delivery, geometry and matching policy. Preserve the original input, compare corrected geometry on the same recorded fixes, then check only the affected behavior. Do not widen thresholds to hide a bad line. The corrected walk recognised the route and preserved Pause; that does not give a surveyed timestamp for crossing a precise centreline. [Failure and analysis](test-results/M1-three-baselines-and-detour.md#detour-approximately-one-minute-false-off-route-status), [corrected result](test-results/M1-corrected-detour-and-pass-pending.md#corrected-detour-170026170707-bst).

### ROUTE-003 — landmark, viewpoint and standing point are different

**Implemented authoring distinction; desk-verification limits remain.** Street cameras can sit in the carriageway; a photograph of an artwork does not establish a public pavement view. Britton Street's initial imagery faced the wrong building. A Highgate visitor point failed its route-association rule and was moved to an equivalent plausible place without weakening the rule.

**Queensway application, 21 September:** a discovery-page pin was about 55 metres north of the actual 23/24 Leinster Gardens fronts. Numbered address nodes and dated imagery supplied the corrected landmark and a separate public-pavement viewpoint. Nearby coordinates alone would have passed a superficial area check. [Route research](content/authoring/queensway-2026-09-21/ROUTE-RESEARCH.md).

**Carry forward:** check the view and public approach as well as numeric distance. Never put a point in the road merely to pass validation. Record approximate versus surveyed positions and dated imagery. Keats' partial view behind fence/trees is a limit, not an assured full reveal. Small trigger variations alone do not justify shrinking arrival radii; saved-position quality may be the issue. [Exterior checks](content/routes/north-finchley-review-v2/EXTERIOR-CHECKS.md), [Highgate associations](content/authoring/hampstead-2026-09-21/FINAL-NAVIGATION-CHECK.md#stops-approach-and-viewpoint), [arrival calibration](ARRIVAL-CALIBRATION.md).

### ROUTE-004 — routing output is a candidate requiring topology review

**Corrections applied; ordinary-use evidence pending for new routes.** Highgate candidates snapped to an alley, an underground location and an interior Keats path. Another line crossed East Heath Road away from the nearby zebra. Conversely, Clerkenwell's “Charterhouse Mews” label suggested a private shortcut until coordinates showed public pavement.

**Carry forward:** inspect geometry and access, not labels alone. Preserve provider requests/responses and mark authored corrections separately. The Highgate zebra landing and approximate imagery-supported connector are explicit; the connector was not returned by the router. A provider maneuver is not a checked walking instruction. Revisit on changed routing or reported access mismatch. [Highgate recon](content/authoring/hampstead-2026-09-21/ROUTE-RECON.md#selected-result), [Mews correction](content/authoring/clerkenwell-2026-09-20/ROUTE-RESEARCH.md#charterhouse-mews-naming-correction).

### ROUTE-005 — historical truth does not prove present access or sensory cues

**Adopted review practice; current conditions remain dated.** Monday Highgate could not depend on Willow/Keats interiors; Sunday Clerkenwell could not promise weekday market activity. A strong pond-island history did not establish a usable view. Trinity's private rehearsal was not evidence that a walker could hear it.

**Carry forward:** distinguish the essential exterior experience from optional admission, transient activity and older imagery. Check words such as “see”, “hear”, “enter” and “behind”. Omit or qualify unsupported live cues without discarding good history. Public exteriors are this route's solution, not a universal rule. Revisit when access prevents completion or a promised reveal lacks support; a certification trip is not automatic. [Highgate access limits](content/authoring/hampstead-2026-09-21/ROUTE-RECON.md), [Clerkenwell dated checks](content/authoring/clerkenwell-2026-09-20/ROUTE-RESEARCH.md#current-works-opening-and-day-of-week-evidence).

### ROUTE-006 — budget walking speech from the latest usable launch

**Implemented calculations/replays; physical timing still scoped separately.** Highgate imagery moved speech off Merton Lane, which lacks a continuous footway, onto the Heath. Clerkenwell's Close chapter had little spare margin after the required reserve. Long route distance alone did not make either speech window adequate.

**Queensway application, 21 September:** mews and forecourt entrances broke the first proposed corridor. The replacement Leinster corridor needed its guard before the first of two Queen’s Gardens mouths, rather than the later mapped junction. A bollarded joining cycle/pedestrian path still needs awareness even without a vehicle crossing. Final geometry and measured audio, rather than the street name or apparent quietness, determine the budget. [Final route check](content/authoring/queensway-2026-09-21/FINAL-NAVIGATION-CHECK.md).

**Carry forward:** retain launch interval, next navigation point, distance, brisk pace, measured voice-file duration and reserve. Count spoken directions too. Recalculate after route, text, voice or pace changes; do not carry a story through a crossing just to preserve its draft length. Current 6 km/h and 15-second checks are explicit preparation assumptions, not universal guarantees about GPS/loading. [Clerkenwell budget](content/authoring/clerkenwell-2026-09-20/FINAL-NAVIGATION-CHECK.md#geometry-and-indices), [Highgate measured files](test-results/M2-hampstead-tour.md#automated-and-desk-evidence).

### WALK-001 — manual completion is not an automatic-launch pass

**Open evidence question; manual fallback works.** Finchley B's chapter reportedly needed manual start. Available field records do not establish why. Review-close continuation later passed, and new-tour replays cover launches, holds and expired windows; neither retroactively explains the earlier miss.

**Carry forward:** use ordinary Highgate/Clerkenwell feedback about whether passages start naturally. Diagnose a reported miss specifically; request an affected-segment check only if needed. Do not ask the owner to retrace or repeat a tour simply to collect a pass. Saved completion and listening enjoyment are different evidence from automatic launch. Revisit at M2 closure. [Evidence review](test-results/M2-closure-review-2026-09-20.md), [current limits](test-results/M2-hampstead-tour.md#ordinary-use-limits).

## Independent review

### REVIEW-001 — verify the sentence, not just its evidence label

**Errors caught and corrected before delivery.** Clerkenwell V1 assigned stock-buying to Groom when the notebook assigned it to the senior missionary; it changed separate interviews into separate interviewers and implied an unsupported local watch supply chain. These paragraphs already had valid claim IDs.

**Queensway application, 21 September:** the museum’s image alternative described swimming costumes; viewing the actual party photograph showed summer clothing and skating boots. The final prose keeps the vivid seaside/ice contrast with directly observed props. Inspect a central visual detail when possible rather than treating authoritative-host alt text as visual verification; update the claim register as well as the script. [Source review and exact correction](content/authoring/queensway-2026-09-21/SOURCE-EDITORIAL-REVIEW.md).

**Carry forward:** reread the actual claim's actor, action, time and relationship against the passage after writing. Correct prose and evidence together. Schema/reference checks cannot detect a newly invented implication. Retain the draft and review delta. The review was a fresh prose reading with selected source checks, not independent rediscovery of every source. [Must-fix review](content/authoring/clerkenwell-2026-09-20/REVIEW-V1.md#must-fix-before-the-narration-freeze), [final corrections](content/authoring/clerkenwell-2026-09-20/FINAL-EDIT-CHECK.md#corrections-and-additions).

**6 October prototype application:** independent retained-source review found six physical transition groups labelled editorial and a narrow flower snippet that did not cover the whole process. The [manual pilot repair](../content/generation-pilot/REVIEW.md) reclassifies them with exact encounter dependencies and strengthens minimal passages. Code validates partitions and references; it cannot establish assertion classification or entailment. The pilot remains unaccepted pending current physical/final/listening review.

### REVIEW-002 — review complete alternatives against frozen inputs

**Pilot integration failure corrected.** Substituting the railway opening removed Moss Hall's introduction, leaving “its estate” without an antecedent. One review also encountered a draft still changing.

**Small Queensway follow-up:** the installed first-approach field still reads `about60metres` / `at17`; the spoken directions are clean. The cosmetic repair is deferred to the next version, with no extra phone check. Include introduction, approach, viewpoint, access and finish fields in the final human-readable review as well as the script and direction arrays. [Observed result](test-results/M2-queensway-tour.md#silent-pixel-result-21-september).

**Carry forward:** require a ready signal and named version/hash, then read the complete substituted chapter and surrounding context. Preserve V1 and record V2's response. Changed text needs bounded rereview, not a claim that the earlier review still covers it. Use a fresh reviewer where helpful, while honestly describing any earlier research involvement. Briefs already asked for distinctive detail; reviewing the actual result remains necessary. [Pilot execution](content/EDITORIAL-REVIEW-RECORD.md#21-a-visible-agent-authoring-pilot), [repair](content/authoring/pilot-2026-09-19/REVISION-NOTES.md#r01-resolved--introduce-the-house-before-its-estate).

## Voice and media production

### VOICE-001 — use the selected voice, without expanding paid scope

**Owner choice; George installed.** Daniel sounded robotic. In matching short samples, Emma was crisper but flatter; George's intonation/depth felt more suitable for a London tour. Sidi later chose George generally.

**Carry forward:** local Kokoro George is the current default. Record model/voice/settings and judge an actual passage when a meaningful voice change is proposed. Mentioned ElevenLabs/Hume subscriptions are not authorisation for paid generation. A preferred sample establishes preference, not perfect pronunciation or comfort for every full tour. Voice changes also alter content identity and timing: see PKG-001 and ROUTE-006. [Original choice](content/EDITORIAL-REVIEW-RECORD.md#11-a-voice-comfortable-enough-for-the-whole-walk), [general choice](content/EDITORIAL-REVIEW-RECORD.md#26-george-throughout-and-a-clerkenwell-outing-worth-the-journey), [delivery](test-results/M2-george-voice.md).

### VOICE-002 — an audio file can exist without establishing complete speech

**Preparation constraint caught; renderer checks implemented.** The revised school paragraph required splitting for the model's 512-token ceiling. This was caught before delivery, not an observed shipped truncation. Identical text also produced different actual timings across voices.

**Carry forward:** guard actual model tokens before inference, preserve complete text across chunks and retain exact source/chunk hashes. Decode the full file and compare packaged bytes; measure the final chosen voice. These checks prove integrity/completeness of inputs and files, not naturalness, pronunciation or every word being heard. Use paragraph/sentence boundaries to retain intonation. Revisit after text/model/voice/encoder changes. [Rendering evidence](content/authoring/revision-2026-09-20/audio/README.md#retained-inputs-and-checks), [renderer](../tools/voice-samples/render-tour.mjs).

## Offline maps and package integration

### MAP-001 — opening map omitted the route

**Fixed with representative phone evidence; no dedicated camera regression test.** Highgate source 03d87e38b7e80ca8 rendered at the extract centre/zoom 15.5 with its route off-screen. Shared authored-map code now fits route bounds with padding and allows zoom 13. Commit ec04275; installed source 1bd3e861342b27e4.

**Evidence:** actual offline opening showed the complete Highgate route/five markers and retained Finchley A's route/five markers. The 161 tests did not specifically test opening-camera behavior. A frame-complete event is not usable orientation.

**Additional evidence, 21 September:** the unchanged shared camera also opened the new compact Queensway route with all three markers and its return visible in the silent offline handoff (0.6-second first complete frame). No dedicated camera calculation test was added. [Queensway result](test-results/M2-queensway-tour.md#silent-pixel-result-21-september).

**Carry forward:** retain Highgate as the displaced-route reproduction. Inspect the actual opening view when camera behavior or materially different route extent changes. Add a focused automated check if this calculation is refactored or grows; it still cannot prove native drawing. No new phone session follows from this log. [Device correction](test-results/M2-hampstead-tour.md#connected-session-correction).

### MAP-002 — offline means all resources, with integrity and repair

**Implemented; automated and Pixel failure checks recorded.** The map required local tiles, style, glyphs and actual file access. A missing glyph and same-length PMTiles corruption showed why existence/size checks alone were insufficient.

**Carry forward:** enumerate and hash the complete dependency graph; stage, read back and promote durable copies. Fail visibly and repair the affected copy while preserving progress and feedback. Pixel repair restored drawing and checked resources; this does not establish current street truth or opening-camera usefulness. Revisit format/style/fonts/storage/preparation changes with focused fault injection, not another walking baseline. [Map implementation and checks](test-results/M2-offline-map.md), [asset provenance](../assets/maps/north-finchley/README.md).

### MAP-003 — a new area needs explicit identity and isolated state

**Implemented; representative offline switching checked.** The original importer was bounded to North Finchley. Adding Clerkenwell required map identity, coverage and area-specific UI state, not simply replacing coordinates.

**Carry forward:** retain the bounded area catalogue, immutable tour/map association, legacy fallback and isolated preparation/repair. Clear stale area-specific UI when switching; share genuinely common resources. Preserve earlier tours and progress. This solved the needed extension without a universal downloader/backend. Revisit changed area/version/repair behavior; do not rerun every old walk. [Area extension](test-results/M2-clerkenwell-map.md#change), [actual switch](test-results/M2-clerkenwell-phone-handoff.md#installation-and-offline-readiness).

### PKG-001 — content revisions must not reinterpret old progress

**Implemented versioning/import contract.** George changed durations, so old seek offsets could not safely become offsets in replacement audio of the same edition. Finchley moved from v1 to v2; earlier editions, reviews and progress were retained.

**Carry forward:** media and map are part of content identity. Identical reimport is allowed; changed content under the same tour/version is rejected. Keep progress separate from immutable package content. Version actual route/audio changes; do not overwrite earlier reviewed artifacts. Old-version/storage cleanup is deferred until measured pressure or a concrete migration need. [Voice migration](test-results/M2-george-voice.md#change-and-checks), [import review](test-results/M2-clerkenwell-code-review.md#scope-and-result).

### PKG-002 — package readiness must survive interrupted preparation

**Implemented bounded transport; broader compiler remains planned.** M2 added staged import, media/map checks and recoverable preparation. A desktop editorial preflight or a folder of source files was never the mobile importer itself.

**Carry forward:** validate paths, declared assets, identity and evidence at the relevant boundary; publish a prepared version only after successful validation. Interrupted/failed imports must preserve the working library and saved progress. Keep the current transport's limits explicit: the larger proposed package schema, general tour compiler and arbitrary offline rerouting are not already implemented. Revisit at M4 or when a real format/import need appears. [Current player/import scope](content/M2-PLAYER-IMPLEMENTATION.md), [acceptance assessment](test-results/M2-closure-review-2026-09-20.md#acceptance-by-acceptance-assessment), [package design](content/PACKAGES.md).

## Player and native engineering

### PLAYER-001 — verify patched code inside the delivered native binary

**Fixed with binary/runtime and actual-control evidence.** M1 media Pause worked but Play did not release the hold. Expo had selected stock precompiled expo-audio despite patched source and a successful build.

**Carry forward:** force this module to build from source while patching it; keep version-guarded/idempotent patches, final APK markers and runtime adapter/generation guards. Inspect actual remote controls when this boundary changes. Never bypass the guard to make an old binary look functional. Source compilation alone was superseded as proof that the patch shipped. [Original discovery](test-results/M1.md#13-september--stationary-playback-and-native-build-correction), [maintained workflow](../AGENTS.md#current-local-workflow).

### PLAYER-002 — audio success does not prove location jobs can start

**Fixed with manifest and live-device checks.** The first M1 field attempt crashed at Start because TaskManager scheduled persisted location jobs without RECEIVE_BOOT_COMPLETED. Earlier audio-only checks did not exercise that path.

**Carry forward:** verify final APK permissions and, after relevant startup/native changes, actual Start plus fresh background location and app-scoped crash/exit records. Service registration is weaker evidence than usable callback delivery. The permission enables the job contract; it does not authorise automatic narration after reboot. [Failure and fix](test-results/M1.md#13-september--first-field-attempt-failed-at-start), [APK verifier](../tools/verify-android-apk.py).

### PLAYER-003 — stationary Resume needs genuinely fresh fixes

**Fixed with replay, locked-device callbacks and short field retests.** Pauses held, but B waited tens of seconds after Resume. The movement filter suppressed callbacks while stationary although playback correctly required a recent fix.

**Carry forward:** preserve freshness revalidation and request usable stationary updates; do not accept arbitrarily old positions or manufacture timestamps. The change removed active-tour displacement suppression. Corrected field release was prompt after Resume/unfinished A. Revisit cadence, displacement, freshness or native-delivery changes; unchanged M1 evidence later covered the omitted M2 stationary minute. Long-tour battery endurance was not established by this fix. [Cause and device evidence](test-results/M1-stationary-location.md), [field retests](test-results/M1-pause-retests.md).

### PLAYER-004 — preserve the seek target through transient zero callbacks

**Fixed with a real SQLite regression and corrected native sequence.** During M1 closure, buffering emitted zero offsets before the commanded seek arrived. A physical termination happened to miss that brief window, but durable checkpoints could still overwrite the saved position.

**Carry forward:** retain the last commanded/usable position through loading, buffering and errors. Test intermediate persisted states with close/reopen, not only successful final playback. The original real-storage case caught the failure; corrected callbacks and recovery retained the target. Reuse unrelated arrival evidence after a narrow fix. [Observed weakness and regression](test-results/M1-closure.md#loading-offset-weakness-found-during-review), [corrected handoff](test-results/M1-closure.md#corrected-build-verification-and-handoff).

### PLAYER-005 — distinguish deliberate review close from passive recovery

**Owner behavior change implemented; later audible continuation passed.** Review originally paused the tour and closing it left the hold. Manual Play could play a story without re-enabling later automatic arrivals, which was confusing. Sidi chose Save review and resume tour, including Android Back for an active tour.

**Carry forward:** save feedback, then resume only for that explicit active-tour close. Saving a voice note alone, backgrounding or passive unmount must not resume; ended tours stay ended and automatic-off stays off. Separate location, playback and intent outside screen lifetimes. Preserve ordinary manual Pause across arrival/focus/reopen; do not generalise this chosen close action into automatic recovery. [Implementation/tests](test-results/M2-review-resume.md), [actual continued sentence](test-results/M2-clerkenwell-phone-handoff.md#review-close-continuation).

### PLAYER-006 — the eligible leg is not the whole route

**Known diagnostic limitation; deferred to relevant M3 work.** When the owner continued from pending B towards C, “off route” appeared although the fix lay close to B→C. The matcher still used A→B because B was the eligible stop.

**Carry forward:** distinguish route position from next-stop eligibility and from what the UI tells the walker. Manual playback remains available; no arbitrary rerouting is promised. Do not retune GPS or replace eligible-leg trigger matching with whole-route nearest matching merely to correct the label. Revisit if it disrupts ordinary navigation or while implementing the relevant M3 matcher/UI improvement. [Observed example](test-results/M1-corrected-detour-and-pass-pending.md), [M3 scope](../ROADMAP.md#milestone-3--replay-and-walking-hardening).

### MAINT-001 — recommended dependency patches

**Deferred maintenance.** Compatibility checks recommended newer Expo patches; the tested stack remains pinned. Do not call this a clean current compatibility pass or casually upgrade during tour preparation.

**Carry forward:** at scheduled maintenance or a relevant bug, inspect official compatibility guidance and the version-guarded patches, then run checks for the affected behavior. This is not authorisation to upgrade now or repeat M1 wholesale. [M1 closure](test-results/M1-closure.md), [current build scope](test-results/M2-hampstead-tour.md#automated-and-desk-evidence).

## Feedback capture and synthesis

### AUDIO-001 — headset field failure remains unexplained

**Monitoring; one later desk pass.** After first-walk microphone confusion, selectable/verified input and transient-exclusive focus handling were implemented. On the 18 September outing, Sidi still reported poor headset capture and Spotify continuing; switching to phone input stopped Spotify. The 20 September EarFun check produced clear speech, stopped Spotify and restored normal output on unchanged recorder/native code.

**Carry forward:** Bluetooth output does not prove Bluetooth microphone capture. Preserve the selected/actual input, music behavior and original sample when diagnosing recurrence. Phone microphone near the mouth or text is the fallback. Poor capture and continued music need not share a cause. No precautionary headset matrix or repeat walk; revisit recurrence or a relevant routing dependency change. [Implementation and field limits](test-results/M2-recording-input.md), [scoped desk result](test-results/M2-clerkenwell-phone-handoff.md#earfun-recording-and-spotify).

### FEED-001 — recording lifetime must be visible

**Implemented foreground-only capture; further behavior change deferred.** Locking/leaving Review ends and saves a recording. Sidi noted that silently cutting it off is annoying, but indefinite recording would also be undesirable. A keep-awake/save-with-notice response was proposed; it must not be reported as implemented or accepted.

**Carry forward:** keep the review visible while speaking under the current behavior; the UI explains the limit and shows elapsed time/input. Retain the captured portion on interruption without silently resuming later. Saving a file cannot recover speech after capture stopped; a force-killed file is retained as interrupted with playability unverified. If ordinary use makes the limit inadequate, decide a bounded visible recording policy before adding background capture. [Current boundary](test-results/M2-recording-input.md), [capture contract](content/M2-PLAYER-IMPLEMENTATION.md#feedback-and-microphone), [owner discussion and recovery limits](content/FIRST-TOUR-FEEDBACK-RECOVERY.md#outcome-and-limits).

### FEED-002 — intact files and agreeing transcripts do not prove complete recovery

**Earlier reassurance corrected; gap-based synthesis adopted.** Fourteen first-tour recordings were retrieved intact, but the claim about how much was recovered was too broad. Local whisper.cpp large-v3-turbo and medium.en passes, including processed copies, still contained garbled/uncertain spans. They are related models, not independent witnesses.

**Carry forward:** retain originals and timestamped uncertainty, distinguish transcription from direct listening, and never infer that silence/garble contained no feedback. Ask only substantive missing questions; preserve the owner's answers. Those answers resolved named gaps, not every lost word. The owner accepted proceeding; no full re-recording was necessary. This retrospective did not newly listen or transcribe. [First limits](content/FIRST-TOUR-FEEDBACK-RECOVERY.md#outcome-and-limits), [second gaps](content/SECOND-TOUR-FEEDBACK-RECOVERY.md#known-recovery-gaps).

### FEED-003 — keep feedback attached to its actual subject and version

**Implemented recordkeeping; interpretation remains explicit.** A recording saved under Trinity concerned Torrington; the owner corrected it. Word comments needed their exact anchors and reviewed draft, not only a summary. A saved heard-before flag was not enough to prove familiarity.

**Carry forward:** preserve original label/artifact, interpreted subject, correction source, draft/hash and uncertainty. The existing 100-comment index and direct clarifications are the provenance for general guidance. Do not overwrite owner documents or silently rewrite original labels. Update current summaries as well as appending corrections so later agents do not reuse stale conclusions. [Evidence index](content/EDITORIAL-REVIEW-RECORD.md#evidence-index), [second-tour clarification](content/reviews/2026-09-18-second-tour-clarifications.md).

## Verification and phone handoff

### QA-001 — every owner test needs a question that changes a decision

**Owner policy; old repeat assumptions superseded.** M1 testing felt like a moving finish line. Later the omitted M2 stationary minute added little because unchanged M1 evidence already answered the risk. Its omission stayed explicit while the map slice progressed.

**Carry forward:** state the unresolved question, why existing evidence is insufficient, shortest valid procedure, owner time and stopping condition. Prefer engineer-operated checks, replays and ordinary use. Retain real silence/duration only when that is the subject. The original M1 baseline/quiet-gap conditions were explicitly owner-requested and remain valid historical evidence; they and the proposed 3–5 M3 outings are not future quotas. Rare recoverable cases can wait for a report. A 1% battery change is not an endurance result. [Policy](../AGENTS.md#testing-policy-for-the-personal-prototype), [omitted-minute decision](test-results/M2-outdoor-map.md#why-the-omitted-minute-does-not-require-another-outing).

### QA-002 — confirm listening, and verify the silent setup really is silent

**Owner direction; operator mistake recorded and corrected.** At the first curated-tour session an unverified Pause tap left a not-started state. Start released that state and spoke before readiness confirmation. This was not evidence that a real manual hold failed.

**Carry forward:** prepare bounded actions first, obtain listening readiness and verify actual controls/state. Stop playback on completion or failure. Reject stale/failed UI hierarchy dumps; playback counters can prevent them reaching idle. Separate what the owner heard from native focus evidence: an unheard beep was not a heard beep, even when narration/focus behavior was confirmed. No long listening exercise where seconds suffice. [Setup incident](test-results/M2-tour-phone.md#installation-and-silent-checks), [corrected sequence](test-results/M2-tour-phone.md#confirmed-listening-and-feedback-checks), [focus evidence](test-results/M2-offline-map.md#audio-recovery-and-stationary-location).

### QA-003 — hand back an app that works away from the Mac

**Handoff mistake corrected; ongoing delivery practice.** Sidi reopened the early development APK away from Metro and encountered the launcher/connection error. The phone should have been handed back with the self-contained build.

**Time-cost lesson:** the 20 September 10–12-minute estimate overran mainly through serial tool/USB round trips; the 21 September session instead needed a real map correction and rebuild. These call for better preparation and clear revised handback expectations, not more test cases to justify the time. [Recorded handback limits](test-results/M2-clerkenwell-phone-handoff.md#final-handback-and-limits).

**Carry forward:** prepare builds before requesting a clustered connection. Install in place, preserve existing data, stop Metro/forwarding, cold-open the real player and check necessary offline resources. Record selected tour, stopped tracking and restored settings. A prepared development-only batch is an explicit exception. Release the phone after retrieval while analysis continues. USB disconnection is a setup constraint, not an app failure; do not repeatedly mistake unlocking for reconnecting a device the Mac cannot see. [Original incident](test-results/M1.md#reported-development-launcher-failure-after-reopening), [current handoff/preservation limits](test-results/M2-hampstead-tour.md#connected-session-correction).

### QA-004 — evidence belongs to the final inputs and installed artifact

**Build-identity gaps corrected.** Early M2 identity omitted imported content. A later successful build became obsolete after a source change during assembly. A development APK can also remain byte-identical while Metro JavaScript changes.

**Carry forward:** freeze inputs for delivery, include generated content/media in source identity, and check identity after assembly. Verify the final APK's assets, markers and permissions; label obsolete builds superseded and rebuild after relevant edits. The media-only mutation check showed that content changes now change identity. An earlier green build/test run is not evidence for a later tree. [Build correction](test-results/M2-tour-build.md#final-build-for-phone-preparation), [identity review](test-results/M2-clerkenwell-code-review.md#scope-and-result).

### QA-005 — a share chooser is not a saved export

**Fixed with shared flow and device evidence.** Early results used fixed names and a Share chooser without a useful rename/direct-save path. The owner needed durable, distinguishable local copies.

**Carry forward:** use the shared named Save to folder/Share flow, timestamped defaults and successful readback. Cancellation/failed readback is non-success; repeated names must preserve earlier records. Keep tests/feedback separate from tour progress and retain attempts before reset or fixture switching. Verify the real saving boundary after relevant changes, not merely a chooser screenshot. [Export design](../ARCHITECTURE.md), [recorded result](test-results/M1-exports.md).

### QA-006 — guide notes are observations, not acceptance

**Adopted evidence practice; stale assertions corrected.** The owner needed instructions and results on the phone, not scattered chat. A later guide case was added after a passing suite, leaving a stale case-count assertion; the subsequent run caught it. Some reported attempts also exercised a different case or omitted the intended wait.

**Carry forward:** maintain the shared guide source and generated parity, name the actual build/fixture/case and preserve earlier attempts. Review logs alongside observations; distinguish reused evidence from a new pass and physical arrival from logged recognition. Update summary status, not only appendices. Keep case coverage explicit; do not weaken assertions to make an incomplete run green. [Guide source](../src/testing/guide.json), [late-change correction](test-results/M2-recording-input.md#subsequent-review-resume-correction), [closure evidence](test-results/M1-closure.md).

### QA-007 — make the simulator reproduce the intended input cadence

**Replay weakness corrected.** Segment-by-segment walking samples generated extra fixes at short bends, flattering narrow chapter windows. Clerkenwell added continuous-distance sampling at fixed two-second intervals for brisk walking, explicit expected playback order and correct completion offsets.

**Carry forward:** inspect generated inputs and assertion semantics, not just pass counts. Retain latest-launch, held and expired-window cases separately. Synthetic location cannot prove native callback delivery or GPS error, and replay success cannot replace WALK-001's missing natural-launch evidence. Revisit when simulator, timing policy or launch geometry changes. [Brisk-cadence correction](test-results/M2-clerkenwell-code-review.md#added-replay-brisk-walking-at-the-requested-callback-cadence).

### QA-008 — isolate development-tool failures from walking behavior

**Known development limitation; workaround retained.** Disable Fast Refresh crashed on this pinned React Native stack after saving false. Reloading with the saved setting worked. A separate development session once had no JavaScript location callbacks despite native delivery until reopening; no cause or new code fix was demonstrated for that session.

**Carry forward:** do not repeat the failing menu action during a prepared session. Verify saved settings and fresh callbacks before release, keep standard/edge fixtures distinct and confirm their cached audio. Do not promise that a Metro-loaded process survives force-close, reload or an overnight wait. These records do not explain every future callback failure or require a speculative native replacement. Revisit on recurrence or relevant stack maintenance. [Preparation incident/workaround](test-results/M1-field-preparation.md), [unexplained callback session](test-results/M1.md#13-september--first-field-attempt-failed-at-start).

### QA-009 — diagnose the replay harness before changing the product

**Replay portability/intake errors corrected.** Real exports initially diverged because JSON omitted an undefined fix and Hermes/V8 geometry calculations differed at negligible precision. A later closure replay also mixed fixtures. These were not demonstrated changes in phone decisions.

**Carry forward:** compare the persisted representation, filter the correct fixture/version and keep raw coordinates, timing, intent and effects exact. The implemented tolerance is limited to three derived metre fields, with tests that still reject meaningful differences. Do not loosen all assertions or rewrite product logic to match a bad reconstruction. Separate historical-policy segments and cumulative exports from new evidence. [Original replay corrections](test-results/M1.md), [closure intake](test-results/M1-closure.md#preserved-data-and-conditions), [regressions](../tests/replay.test.ts).

### GEN-001 — returned work and old reviews must not grant current readiness

**Fixed with focused deterministic evidence, 6 October.** The first local generator separates task return, current-version review and Producer acceptance. Review found that a later rejection of a script could leave its previously accepted package valid. Package acceptance now recursively requires current route/content/listening commitments; a later positive review requires a new decision, too. Twenty lifecycle regressions cover this boundary alongside selective invalidation, interrupted operations, cumulative reservations, issue arbitration and deadline limits. Scope is the local CLI, not proof of semantic truth. [Results](content/generation/RESULTS.md), [regressions](../tests/generation.test.ts). Revisit on changes to dependencies, reviews or orchestration.

### GEN-002 — document eligibility is not observed account access

**Live capability access now verified; runtime tool limitations remain.** Official SIWC consent and owner-observed overflow-off succeeded. The requested model was absent; the owner selected Astra medium. Initial HTTP-200 attempts were rejected before parsing because the content-type header was missing. A separately bounded continuation established valid SSE and final output items emitted before an empty terminal output array. The repaired adapter passes all five live T43 probes while incomplete/non-stream/error outcomes remain blocked. Historical failures and unknown usage remain in the ledgers; no private or paid fallback occurred. Seven live role reviews and a revised-draft verification pass used supplied evidence, not a runtime research/imagery browser. [Results](content/generation/RESULTS.md), [usage](content/generation/COSTS.md). The App limits percentage remains distinct from the shared credit-overflow switch; retain that corrected setup guidance.

## Before generalising the builder

Use these entries as demonstrated requirements and counterexamples, not a demand to automate every judgement. M4 should reuse the existing researched/versioned inputs and enforce the concrete integrity, geometry, timing and provenance boundaries above. M5 should automate only useful stages, retaining review where semantic source checks, narrative judgement or current physical interpretation still matter.

Start an assignment with the applicable entries; finish by recording what changed and what evidence supports it. If a lesson recurs, improve the shared brief, implementation or check instead of writing the same advice again. Keep this one log as the cross-function entry point.

### GEN-003 — capability ledgers must reflect the actual selected model

**Fixed with an actual CLI regression.** The environment override reached Responses as Astra medium while the newly created preflight ledger still carried the original Sol default. Preflight now records the selected model/effort before dispatch and rejects changing them in one ledger. The real CLI test runs without credentials and checks the recorded selection and refusal; it dispatches no network requests. HTTP-200 non-stream diagnostics also preserve safe shape/observed usage without treating a JSON status or success HTTP code as completed streaming inference. [Live attempts and verification](content/generation/RESULTS.md#what-went-wrong-and-what-now-works).


### GEN-004 — live results must preserve findings, usage and failed work

**Fixed with observed failures and focused regressions, 6 October.** Research completed with structured finding objects that the initial string-only envelope rejected. Lossless normalization recovered the saved result without replay; known usage now survives invalid output. Per-role totals preserve separately known input/output/cache/reasoning fields; reasoning is not charged twice. Retries keep per-operation returns and a single original allowance. The first writer catalog-failure flat return was overwritten before that repair; its ledger/diagnosis remain, and that missing historical file is not recreated as observed evidence. Candidate/route attempts are counted before validation; failed corrections and concurrent task failures retain state. Tests reproduce partial usage, malformed first proposals, rejected batches and concurrency. [Regressions](../tests/generation-usage.test.ts), [cost interpretation](content/generation/COSTS.md).

**Related lifecycle repairs:** downstream edits do not restart upstream writers; stale queued work receives a fresh context after current prerequisites pass. Dispatch rechecks same-revision revoked acceptance. Route budgets use the actual brief and leg totals. A known settled failure has one explicit checked retry, retaining usage/context/deadline. These are workflow invariants, not factual or physical acceptance.
