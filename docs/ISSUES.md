# Known issues, fixes and reusable lessons

Updated 7 October 2026. Maintained by the technical lead. This is the general log to consult when preparing another tour, assigning agents, fixing the player or building the M4/M5 authoring tools. It includes mistakes, demonstrated fixes, successful choices worth preserving and unresolved questions. Detailed evidence remains in the linked records.

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

**Owner calibration, 7 October:** the Highgate crossing rejection exposed overstrict geometric acceptance criteria. Sidi asks for ordinary “cross here” guidance when the crossing is evidenced. Working interpretation: evaluate the relevant crossing and usable directions; a centreline/partial connector alone is not a material walking defect and does not require an exact kerb/island trace. Preserve actual contradictions and public-access checks. This is a proposed application of owner feedback, not a rerun or retroactive acceptance. Reassess the retained example under this criterion before adding a custom routing graph. [Decision record](content/EDITORIAL-REVIEW-RECORD.md#7-october-2026--proportionate-crossing-verification), [guidance](content/TOUR-DESIGN-GUIDANCE.md#keep-crossing-verification-proportionate).

**Corrections applied; ordinary-use evidence pending for new routes.** Highgate candidates snapped to an alley, an underground location and an interior Keats path. Another line crossed East Heath Road away from the nearby zebra. Conversely, Clerkenwell's “Charterhouse Mews” label suggested a private shortcut until coordinates showed public pavement.

**Carry forward:** inspect geometry and access, not labels alone. Preserve provider requests/responses and mark authored corrections separately. The Highgate zebra landing and approximate imagery-supported connector are explicit; the connector was not returned by the router. A provider maneuver is not a checked walking instruction. Revisit on changed routing or reported access mismatch. [Highgate recon](content/authoring/hampstead-2026-09-21/ROUTE-RECON.md#selected-result), [Mews correction](content/authoring/clerkenwell-2026-09-20/ROUTE-RESEARCH.md#charterhouse-mews-naming-correction).

### ROUTE-005 — historical truth does not prove present access or sensory cues

**Adopted review practice; current conditions remain dated.** Monday Highgate could not depend on Willow/Keats interiors; Sunday Clerkenwell could not promise weekday market activity. A strong pond-island history did not establish a usable view. Trinity's private rehearsal was not evidence that a walker could hear it.

**Carry forward:** distinguish the essential exterior experience from optional admission, transient activity and older imagery. Check words such as “see”, “hear”, “enter” and “behind”. Omit or qualify unsupported live cues without discarding good history. Public exteriors are this route's solution, not a universal rule. Revisit when access prevents completion or a promised reveal lacks support; a certification trip is not automatic. [Highgate access limits](content/authoring/hampstead-2026-09-21/ROUTE-RECON.md), [Clerkenwell dated checks](content/authoring/clerkenwell-2026-09-20/ROUTE-RESEARCH.md#current-works-opening-and-day-of-week-evidence).

### ROUTE-006 — budget walking speech from the latest usable launch

**Implemented calculations/replays; physical timing still scoped separately.** Highgate imagery moved speech off Merton Lane, which lacks a continuous footway, onto the Heath. Clerkenwell's Close chapter had little spare margin after the required reserve. Long route distance alone did not make either speech window adequate.

**Queensway application, 21 September:** mews and forecourt entrances broke the first proposed corridor. The replacement Leinster corridor needed its guard before the first of two Queen’s Gardens mouths, rather than the later mapped junction. A bollarded joining cycle/pedestrian path still needs awareness even without a vehicle crossing. Final geometry and measured audio, rather than the street name or apparent quietness, determine the budget. [Final route check](content/authoring/queensway-2026-09-21/FINAL-NAVIGATION-CHECK.md).

**Carry forward:** retain launch interval, next navigation point, distance, brisk pace, measured voice-file duration and reserve. Count spoken directions too. Recalculate after route, text, voice or pace changes; do not carry a story through a crossing just to preserve its draft length. Current 6 km/h and 15-second checks are explicit preparation assumptions, not universal guarantees about GPS/loading. [Clerkenwell budget](content/authoring/clerkenwell-2026-09-20/FINAL-NAVIGATION-CHECK.md#geometry-and-indices), [Highgate measured files](test-results/M2-hampstead-tour.md#automated-and-desk-evidence).

**Factory application, 7 October:** a structurally valid chapter interval initially occupied the player’s 40-metre departure exclusion zone and could be too narrow for three fixes/four seconds of persistence. The new builder orchestration derives launch windows from actual returned geometry, keeps the entire interval clear of both stops, reserves at least 30 metres of usable launch width and budgets from its latest edge to the next maneuver. Synthetic route/actual-parser regressions exercise these constraints; this is not a fresh GPS or outdoor pass. [Regression](../tests/generation-factory-pipeline.test.ts).

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

**Catalog-gate correction, 7 October:** two direct public Responses probes established that both Sol6 and Sol6.1 work on this app's existing OAuth grant and overflow-off setting despite absence from `/v1/models`. The earlier catalog-only conclusion was incomplete. Removed the incorrect inference membership gate; discovery remains separate and server authorization/completed inference decides access. Added regressions for exact unlisted Sol dispatch/completion and server model denial without substitution or retry; existing consent/overflow/stream failures remain covered. Both models pass all five live medium-effort capability checks. Twelve tester requests total753known tokens andUS$0direct charges, separate from historical tour benchmarks. [Evidence](content/generation/SOL-ACCESS-2026-10-07.json).344tests, typecheck/lint and guide parity pass; no Sol search or complete-tour result yet.

**Live capability access now verified; runtime tool limitations remain.** Official SIWC consent and owner-observed overflow-off succeeded. The requested model was absent; the owner selected Astra medium. Initial HTTP-200 attempts were rejected before parsing because the content-type header was missing. A separately bounded continuation established valid SSE and final output items emitted before an empty terminal output array. The repaired adapter passes all five live T43 probes while incomplete/non-stream/error outcomes remain blocked. Historical failures and unknown usage remain in the ledgers; no private or paid fallback occurred. Seven live role reviews and a revised-draft verification pass used supplied evidence, not a runtime research/imagery browser. [Results](content/generation/RESULTS.md), [usage](content/generation/COSTS.md). The App limits percentage remains distinct from the shared credit-overflow switch; retain that corrected setup guidance.

**Access recheck, 7 October:** the current app-grant catalog still lacks Sol6.1, including hidden entries; listed alternatives are Astra and the5.6 Sol/Terra/Luna models. The historical Sol preflight was a local catalog rejection before inference, not proof of server-side inference incompatibility. Official examples do not establish access for this account. No inference tokens or direct charges were incurred by this catalog recheck; no automatic substitution was made. Revisit on catalog availability or an explicitly selected alternative, preserving separate capability and cost records. [Observation and interpretation](content/generation/RESULTS.md#what-went-wrong-and-what-now-works).

## Before generalising the builder

Use these entries as demonstrated requirements and counterexamples, not a demand to automate every judgement. M4 should reuse the existing researched/versioned inputs and enforce the concrete integrity, geometry, timing and provenance boundaries above. M5 should automate only useful stages, retaining review where semantic source checks, narrative judgement or current physical interpretation still matter.

Start an assignment with the applicable entries; finish by recording what changed and what evidence supports it. If a lesson recurs, improve the shared brief, implementation or check instead of writing the same advice again. Keep this one log as the cross-function entry point.

### GEN-003 — capability ledgers must reflect the actual selected model

**Fixed with an actual CLI regression.** The environment override reached Responses as Astra medium while the newly created preflight ledger still carried the original Sol default. Preflight now records the selected model/effort before dispatch and rejects changing them in one ledger. The real CLI test runs without credentials and checks the recorded selection and refusal; it dispatches no network requests. HTTP-200 non-stream diagnostics also preserve safe shape/observed usage without treating a JSON status or success HTTP code as completed streaming inference. [Live attempts and verification](content/generation/RESULTS.md#what-went-wrong-and-what-now-works).


### GEN-004 — live results must preserve findings, usage and failed work

**Fixed with observed failures and focused regressions, 6 October.** Research completed with structured finding objects that the initial string-only envelope rejected. Lossless normalization recovered the saved result without replay; known usage now survives invalid output. Per-role totals preserve separately known input/output/cache/reasoning fields; reasoning is not charged twice. Retries keep per-operation returns and a single original allowance. The first writer catalog-failure flat return was overwritten before that repair; its ledger/diagnosis remain, and that missing historical file is not recreated as observed evidence. Candidate/route attempts are counted before validation; failed corrections and concurrent task failures retain state. Tests reproduce partial usage, malformed first proposals, rejected batches and concurrency. [Regressions](../tests/generation-usage.test.ts), [cost interpretation](content/generation/COSTS.md).

**Related lifecycle repairs:** downstream edits do not restart upstream writers; stale queued work receives a fresh context after current prerequisites pass. Dispatch rechecks same-revision revoked acceptance. Route budgets use the actual brief and leg totals. A known settled failure has one explicit checked retry, retaining usage/context/deadline. These are workflow invariants, not factual or physical acceptance.


**Factory continuation, 7 October (GEN-004):** known provider usage now settles before archival file processing; a failed local archive cannot turn measured usage back into unknown. Unknown dispatches block the in-memory job as well as restart recovery. Namespaces, tool-call IDs and arguments validate locally before any handler; deadlines are checked after returns and before/after tools. Phase input hashes, immutable outputs and counter journals prevent silent replay or allowance resets. Focused regressions include same-job replay at correction limits and one changed-clip corrective render after a measured overrun. [Runtime](../tests/generation-factory-runtime.test.ts), [pipeline](../tests/generation-factory-pipeline.test.ts).


**Schema boundary observed, 7 October (GEN-002):** the first fresh factory request received HTTP 400 `invalid_json_schema` for `text.format.schema`. Zod emits general JSON Schema (including URI format), while the provider supports a subset. The wire adapter omits unsupported URI/meta/string-length fields and retains the original strict Zod validation locally. The exact failed request and an explicit one-per-phase checked retry remain within the original job; no new deadline or erased usage. This mismatch was not exercised by the earlier boolean-only capability probe. [Supported schema documentation](https://developers.openai.com/api/docs/guides/structured-outputs), [focused wire/recovery regressions](../tests/generation-factory-runtime.test.ts).

**Additional observed factory repairs, 7 October (GEN-002/004):** a refused route proposal supplied unusable stop IDs; producer now preserves refusal and requests targeted physical research. Five completed tool rounds initially ended without synthesis; the final request is now tool-free, with a one-time explicit retained-history recovery for the historical run. Four image sources correctly lacked text quotations but the shared text-source schema rejected them; image-specific validation now requires actual matching bytes/tool closure in a completed model request, while text/map passages still match fetched text. Read-only validation of the saved report passes with 16 sources/15 claims/four places; no new inference or job acceptance was used. Broad map output and HTTP 429 led to bounded prioritized nodes/ways and serialized retrieval; focused tests pass, live retest remains pending. All original counters, failures and usage remain. Original deadline expired before promotion; the owner subsequently approved 45 minutes total and the retained report was promoted without replay. [Live result](content/generation/factory/RESULTS.md), [image/source regressions](../tests/generation-factory-runtime.test.ts).

**Deadline diagnosis correction, 7 October (GEN-004):** after a checked recovery, expiry could repeat the recovery status text instead of naming the actual deadline. `assertRunning` now reports deadline expiry before a stale nonterminal reason. The existing expiry/reopen regression now asserts the exact diagnostic while proving no request is dispatched.

**Allowance lesson, 7 October (GEN-004):** a 45-minute total-from-start amendment left only about 2m32s for actual continuation after engineering and owner waiting. It timed out during synthesis rather than completing the tour. Preserve that actual outcome. A new explicit `--from-now` amendment can grant a bounded continuation when the owner approves that basis; it records old/new deadlines and leaves start, counters, status and accounting unchanged. Tests reject missing evidence, uncertain operations, completed jobs, unbounded increments and shortened deadlines. The owner subsequently approved extension and the 30-minute allowance was applied at actual resumption, preserving original start, non-time counters and accounting.

**Observed handoff repairs, 7 October (GEN-001/004, REVIEW-001, ROUTE-003):** the second physical report preserved a failed map-identification lead as an unused source with empty passage and a mistyped URL. The pipeline now records exclusions of only unused empty non-image sources; original outputs/gaps remain, depended-on or malformed substantive evidence still fails. Research qualification arrays contained candidate IDs and editorial instructions: factory writing now treats these as semantic constraints for independent review rather than requiring them verbatim in narration. Legacy literal-qualifier checks remain available and their regressions unchanged. Reviewers can reopen exact retained map identities and validated archived pixels through constrained source readers; no new discovery or image refetch is needed. Tests cover source-dependency preservation, metadata kept out of speech, actual reviewer pixels, allowlists and tampered evidence.

**Route planning correction:** the generic Route Designer expected routed geometry before the factory had selected stops, and anonymous entrance nodes crowded out the station in broad map output. A new undispatched-phase protocol makes stop order provisional, explicitly defers measured geometry to the next router/scout stages, and exposes a bounded station-specific lookup. Saved protocol versions preserve existing prompt/tool bindings. Actual live lookup returned the named station entrances, station building and underground node with their distinct tags. The next 15m map request hit an undocumented 20m parser minimum although the public adapter supports smaller bounded radii; parsing now aligns with that adapter. An explicit, once-only recovery completes the already requested read-only tool call and uses only the remaining synthesis slot. No model request, proposal counter or paid charge is reset. The 15m lookup subsequently returned actual mapped pavement/entrance context. These are desktop evidence and workflow repairs, not physical access acceptance.


**Crossing and review handoff correction, 7 October (GEN-002/004; ROUTE-003/004):** the first independent Scout rejected the real third Hampstead route because the ordinary map query omitted unnamed crossing nodes and a focused query failed. A separate bounded crossing query returned actual zebra node420703265 beside New End; a single Scout disposition retained the original report, geometry and stops while replacing road-centre maneuver text with complete pedestrian directions. Small2–5m standing associations remain within the existing10m contract, with actual standing coordinates unchanged. No field acceptance follows. An apparent tool-authorization violation was a model error: operations24–25 allowed tools; only26 required tool-free synthesis and made no calls. Clarified current-request wording prospectively; original contexts remain unchanged. Focused regressions reject a negative disposition and missing/reordered legs. The live timing estimate remains about36minutes versus the requested60, so upper-budget fit alone cannot establish the requested experience.


**Verifier evidence handoff observed, 7 October (GEN-004):** operation32 requested the real crossing-map URL but the source reader allowed only the historical researcher’s sources. The accepted Scout’s later evidence was retained yet inaccessible. Added a separate frozen manifest from successful, hash-checked tool receipts in explicitly scoped route/Scout phases; only those exact URLs expand the verifier allowlist. Failed/pending requests, unrelated fetched pages, invalid hashes and arbitrary URLs remain excluded. Operation32’s missing receipts are completed once under the existing checked-tool recovery; its original context and usage are preserved. Newly dispatched downstream review contexts also receive the original rejection and full disposition, while dispatched phase bindings remain frozen. Six retained-evidence regressions and the306-test suite pass; those tests do not establish historical truth.


**Canonical player navigation and final receipts,7October (GEN-004/ROUTE-004):** Hampstead revealed that model-written story directions could describe the incoming leg while TourPlayer displays them as Next directions. The compiler now copies the exact independently reviewed onward leg; initial approach and final return have explicit visual fields. It owns concise production status rather than exporting stale writer audit warnings. Spoken paragraphs remain immutable. Actual package regression checks all legs and text identity, and rejects overflow instead of dropping directions. Builder returns revision-linked full-decode/hash/duration/text/parser evidence; package-specific failure/manual checks run against the saved package. The tester receives these receipts and the exact draft/input/package/review manifest before its decision.321tests/type/lint/docs pass; this is neither native playback nor physical acceptance. The measured Hampstead result is31m28, materially short of60; new planners receive whole-tour allocations, with a fresh Highgate benchmark still required.


**Final-review retry correction,7October (GEN-004):** independent review found newly timestamped decode/package receipts would change a failed tester's frozen input on retry. The producer now snapshots tester inputs before dispatch, verifies all evidence/identities on resume, and reuses original receipt timestamps. An actual synthetic settled-failure/retry regression sends only the tester again, preserves the failure/deadline/counters and rejects changed source, navigation, package or check evidence. This fixes resume integrity; it does not authorize automatic retries or hide failed usage.


**Fresh Highgate regression,7October (GEN-004/RES-006):** the initial researcher added a station endpoint as an unsurveyed place. Its bounded repair could not reopen retained map/image evidence because it had only network read_page; it emptied valid map passages, then failed validation at m01. Repair tools now reopen exact same-job map/page text and observed pixels, preserving all original returns. A completed invalid repair can use the remaining existing research allowance for source/physical correction; caps and failures stay recorded. Highgate is a supervised benchmark after this intervention, not an unattended success. Public Overpass also returned504/429: queries now declare32MiB instead of its512MiB default, with the same12-second/250m/200-element bounds; failed response bodies close promptly. The [provider documentation](https://dev.overpass-api.de/overpass-doc/en/preface/commons.html) identifies504 resource-admission failures, so this is a resource-envelope correction, not evidence that reliability is fixed.


**Highgate routing contract,7October (ROUTE-004/GEN-004):** three differently worded plans sent identical stop coordinates to the router, repeating carriageway-midpoint turns despite precise Scout feedback. Through points now let a new plan bind complete crossing endpoints, sidewalk continuations and gates to actual same-job map vertices. The real router must visit them in order; the tool never offsets or fabricates geometry to satisfy a check. Mere footway/sidewalk preference was observed insufficient. Live diagnostics exposed the public provider's10-location cap (HTTP400/code150), requiring sequential per-leg requests for larger constrained routes, with full response provenance and connected endpoint checks. New protocol versions preserve all dispatched legacy bindings. First Highgate remains a failed32-request trial, not an accepted route.

**Narration allocation correction (ROUTE-006):** the old route gate reserved12minutes even for four short stories, rejecting a route before actual writing/measurement could use its smaller available narration budget. New planner protocol uses an80-second-per-stop feasibility floor; actual content quality, rendered audio, walking, allowances and return still determine acceptance. A complete synthetic factory regression covers400seconds of available stationary narration and measured final output. Stationary-only narration can also be selected without changing stop/route geometry when walking windows cross decisions. No physical timing or audible observation is inferred.

**Underlength diagnosis (ROUTE-006), 7 October; superseded for new jobs by the implementation below:** Hampstead's31m28 draft came from a1.296km four-stop route,5m28 of complete audio and8minutes of allowances. Generation deadline extensions were separate; no final recording was cut short. The builder checks a maximum (`totalSeconds <= targetSeconds`), while the factory only reports a substantial shortfall and lacks an automatic early duration-repair loop. Current planner prompts seek the requested length but have not demonstrated an accepted hour-long result. Revisit with bounded route/content redesign before freezing, then actual audio measurement; avoid filler, fake waiting allowances or a retroactive duration pass. [Diagnosis and exact basis](content/generation/factory/RESULTS.md#observed-progress).


**Constrained routing proof and dispatch review:** nine actual read-only routing requests established the public10-location error and a five-leg constrained response passing14ordered point checks (maximum deviation about4.2cm). That diagnostic route still has detours/carriageway segments and exceeds the hour with narration; it is not an accepted tour and supplies no authored input to the next job. Independent implementation review also found that split requests needed a fresh deadline/status check after the rate wait. The public adapter now checks immediately before each outbound fetch; a regression expires the deadline after the first component and verifies no second transport while retaining the first cache.


**Physical-readiness handoff observed (GEN-004/ROUTE-003):** the second Highgate trial passed source/schema checks with essential physical unknowns on every researched place. Real candidate IDs reached the router but failed preparation; that branch did not invoke the unused research allowance, so subsequent plans repeated the same blocker. The final stream interruption is a separate provider failure, not the cause of unusable places. Add a versioned pre-route readiness gate: targeted physical research within the original two-round cap, then require four eligible places before consuming route proposals. Preserve all already dispatched bindings and closed trial outcomes. A complete synthetic regression must demonstrate both recovery and honest research-cap failure. [Trial evidence](content/generation/factory/HIGHGATE-SECOND-RUN.json).


**Final Highgate evidence (ROUTE-003/004, GEN-004):** the final fresh run exercised readiness repair before route1 and honored all21/23/22 requested through points. It still failed three Scouts and a frozen disposition because actual North Road approaches/departures used crossing midpoints without an established complete pavement/island sequence. Explicit `sidewalk=both` tags were considered, not ignored as proof of impassability. Ordered proximity does not verify connected pedestrian meaning. Keep this retained failure for future pavement-side/full-crossing regression; a fourth route cannot be disguised as technical recovery. Final run24m22,37requests,1,936,810known tokens, no unknown usage/intervention, no scripts/audio/package. [Evidence](content/generation/factory/HIGHGATE-FINAL-RUN.json).

**Post-benchmark metadata/navigation corrections:** a composite route's cached last leg made its overall retrieval timestamp older than newly fetched middle legs; it now reports the newest constituent retrieval while preserving all component records and existing manifests. A raw zero-distance final leg said to walk north; new jobs now normalize only exactly coincident0m/0s final arrival, leaving real movement and legacy dispatched bindings unchanged. Focused tests cover mixed-age cache recomposition, immutable manifests, short/nonzero/intermediate legs and protocol replay. The actual v3 route was inspected read-only; no frozen job artifact or acceptance was rewritten. These corrections do not resolve the physical routing blocker.

**Duration and practical-access implementation (ROUTE-006/004, GEN-004),7October:** new versioned factory jobs reject an infeasibly short/long actual route before writing and require actual rendered narration plus walking/allowances within the target range. The writer receives a route-derived audio/word budget; measured underfill uses the existing two correction batches. Canonical directions are reviewed under reliable crossing identity/public approach/onward direction criteria; partial kerb geometry alone no longer blocks. Wrong crossings, contradictory directions and essential access gaps still do. Legacy transport/evidence regression fixtures explicitly retain policy1; new regressions exercise policy2 route rejection, measured fit and underfill correction. Fresh Sol6.1 Highgate run pending; software enforcement is not proof of a completed or enjoyable hour.

**Sol6.1 synthesis timeout (GEN-004),7October:** the fresh run retained27,449characters of incomplete research JSON before the factory's180-second request deadline aborted it. This was active output, not a source rejection. No completed artifact or token usage was invented. Raise the single-request transport/task ceiling to360seconds, always bounded by the original job deadline; renew the existing grant for that interval. One explicit checked retry uses the remaining original research request slot and preserves the failed operation, unknown tokens, same evidence/context, and all job caps. Regression covers360seconds with ample time and17seconds near deadline. This is supervised recovery and must appear in the benchmark.

**Provider setup accounting correction (GEN-004),7October:** the first timeout-recovery initialization requested420,000ms credential validity, exceeding the existing helper's300,000ms maximum. Its guard threw before credential/network access and before provider request(); operation8 was conservatively marked unknown by the old generic catch. Reconciled only this inspected local setup failure to zero inference tokens/direct charge, preserving its operation/task/context and explicit evidence. Provider-construction failures now retain a not-dispatched receipt and settle separately; an explicit setup recovery uses the still-unused inference slot without increasing real request caps or hiding the prior timed-out request. Renewal uses the supported300,000ms window; request timeout remains360seconds and original job deadline unchanged. A focused two-inference/three-operation regression proves the distinction and retained failures.

**Preparation ordering and stale provisional timing (GEN-004/ROUTE-004/006),7October:** Sol6.1 Scout1 accepted the public standing places and3.284km geometry but correctly rejected generic router directions and the planner's stale650-second narration suggestion. The producer's new canonical-directions step was placed after Scout acceptance, so these reparable preparation findings triggered unnecessary historical research and route proposals. New undispatched route-preparation phases compile complete canonical directions before independent Scout review; Scout protocol3 receives the actual producer experienceBudget, explicitly superseding provisional prose. Real access contradictions still reject the proposal. Research protocol4 excludes future route/audio work and routine current conditions from essentialUnknowns. Dispatched legacy Scout/research bindings remain frozen; the in-flight trial records its earlier sequencing. Regression asserts directions precede Scout, measured timing remains enforced and wrong-crossing directions still block within three proposals.

**Accepted-verdict/required-issue contradiction (GEN-004),7October:** the Sol6.1 engineering run's frozen disposition returned accepted and corrected directions, yet kept resolved historical defects marked required. reviewPasses correctly refused this inconsistent artifact; the run stopped after38operations (37inference attempts plus one proven no-dispatch setup failure). Clarified that accepted requires no unresolved required issue and returned directions are compiled atomically. For direction reviews only, an explicitly accepted but contradictory verdict may use one tool-free clarification within the original three-request allowance. Directions, geometry, sources and budget stay frozen; actual unresolved issues must remain negative, and the original output is preserved. Negative verdicts receive no such bypass. New regressions cover both wrong-crossing rejection and retained contradictory-output clarification. The closed engineering run is not relabelled successful.

**Pinned public-address availability (GEN-004),7October:** the second Sol6.1 trial stopped before routing after all map connections selected162.55.144.139, which refused connections. DNS also advertised65.109.112.52; a same-host TLS status probe returned200 there. The SSRF-safe transport pinned only the first validated answer, needlessly losing the healthy backend. GET now tries at most two distinct, already validated public addresses on refusal/unreachable errors, sharing the existing timeout and checking the caller deadline again. It keeps hostname/TLS validation and the same service/query. No retry on HTTP429, TLS/body/reset errors or POST; no new mirror or endpoint. Successful raw response caches retain connection attempts. Regressions cover fallback, shared abort, TLS/reset/POST refusal and existing all-address privacy validation. The failed trial and its two research rounds remain closed; fresh verification follows the fix.

**Interrupted-stream diagnostics (GEN-004),7October:** the third Sol6.1 job retained two non-timeout interruptions (survey39.781seconds, research76.208seconds); the old catch reported stream_or_transport_error for both socket and parser exceptions, so neither precise cause can be reconstructed. Added allowlisted failure stage, exception class and native code without messages, stacks, credentials or server text. Regression distinguishes malformed SSE JSON from UND_ERR_SOCKET and keeps missing usage unknown. No automatic retry or model/billing fallback was introduced. Explicit per-phase technical recoveries retain failed operations, phase request caps and the original deadline; this run is therefore supervised, not unattended.

**Direction-array limit (GEN-004/ROUTE-004),7October:** independent Scout twice found the exact station-return crossing omitted from an eight-line final leg. The factory imposed max8 although the existing player supports20lines, up to1,500characters each. New preparation/disposition schemas match that existing contract; dispatched eight-line phase bindings stay frozen. An actual package regression preserves a ninth terminal crossing in both onward directions and finish text. A negative frozen disposition may use only its remaining original request (three total across disposition/clarification/completion) for a complete direction correction, with unchanged route, stops and retained evidence; it cannot overrule missing essential access or create a fourth route. No mobile code or installed parser changed.


**Retained navigation formatting (7 October 2026).** The final accepted Sol6.1 route contained a 1,621-character direction line and a 2,649-character return before numbering, beyond the unchanged player's 1,500-character line and 2,000-character finish limits. The compiler now splits oversized lines at sentence boundaries with exact wording equality, retaining all return directions under the last story's existing Read / directions button. When the duplicate finish cannot fit, it explicitly points to that button instead of truncating any return step. The actual package parser/build regression checks full wording preservation and the named fallback. An earlier invalid pre-render projection may be retained as historical review only when all draft/source/route/evidence inputs are identical, followed by one explicit independent integration review; a real unresolved content finding still requires correction. This is a local generation formatting fix; no player or native change.


**Spoken research-audit padding (7 October 2026).** The first fresh Sol6.1 Highgate draft repeatedly narrated excluded invented residents, performances, detainees and patient memories, while the Gatehouse stop stretched one useful theatre fact into repeated reflection. The independent editor rejected that exact draft. New writing protocol3 explicitly keeps research-workflow exclusions out of speech, preserves material historical qualifications, and treats per-story words as an average so stronger evidence can receive more time. Existing dispatched writing protocol2 stays frozen; the actual correction pass remains independently reviewed. No listening/enjoyment result is inferred.


**Optimistic narration reserve (ROUTE-006/GEN-004, 7 October).** Highgate Sol6.1 v3 froze2.617km because its44m21 walking/allowance base could reach55minutes with almost three minutes at every story. The independent editor then removed genuine repetition and shortened the thin Gatehouse encounter, leaving918 spoken words. Policy2 keeps the actual lower-bound check, but its early feasibility assumption was too optimistic. New experience-policy3 requires the route to reach the lower tour bound with only80seconds per stop, while retaining an upper bound and actual post-render measurement. For four stops,8minutes allowance and1.2m/s, this means at least3.0km for a55-minute lower bound. The writer rate estimate becomes2.3words/sec, based on the previously measured George infrastructure calibration759words/328.1seconds (not reused authored input). It is a planning estimate, never substituted for actual audio duration. Existing jobs remain policy2 with immutable bindings; the regression rejects the actual2.617km route under policy3 and preserves the historical policy2 result. Live v3 subsequently rendered all four recordings:383.9seconds audio and3045.1196seconds total (50m45), with full decode/hash/player-parser checks passing. The lower-bound gate correctly refused acceptance after its two correction batches; the job is closed and not relabelled successful. Fresh v4 tests the conservative policy from the start.


**Unavailable map service and unused duration repair (GEN-004/ROUTE-006), 7 October.** Fresh Sol6.1 v4 stopped after 17 inference calls and 538,964 known tokens (none unknown): three short route proposals, no accepted route or audio. Early Overpass calls exercised the healthy-address fallback, then HTTP429 and refusal on both advertised IPv4 backends prevented access research. This is a remaining service outage, not evidence that the address-fallback fix failed its intended case. A planner requested resolving an existing longer-route candidate, but the duration failure branch did not use either remaining research round. New duration-research protocol2 uses remaining physical research for existing unresolved places before spending another proposal; a focused regression proves ordering and preserves the existing two-research/three-route limits and historical protocol1 bindings.

Map tools now optionally query a checksum-bound, dated Geofabrik London OSM extract locally. The fresh v5 brief binds a 27,990-feature Highgate snapshot, sourced from 6 October 2026 data; exact map receipts, original tags, source checksum, dates and query identity remain reviewable. This removes Overpass availability from these bounded map queries; online page reading and pedestrian routing still have network dependencies. The snapshot is infrastructure, not prior authored research. Real local station/crossing/ordinary queries passed without network access. Regressions cover tampering, query extent, private-access tags, source retention and routing evidence, plus actual Pyosmium XML node/way extraction. Relations, out-of-extent data and clipped geometry are explicitly absent; current access is not certified. For another area/date, prepare and bind a new extract. Fresh full-run verification remains necessary.


**Route correction without measured leg feedback (GEN-004/ROUTE-004/006), 7 October.** Fresh Sol6.1 v5 completed research and all local map queries, but three proposals failed: first outside offline-map coverage, second/third about4.72/4.75km, too long before audio. It closed after14m48.322s,19inferences and1,491,120known tokens, none unknown. The planner received only a total timing budget, so it repeatedly altered the station return while leaving827m and1088m village/park legs unchanged. The initial planning context also omitted the actual playback-map bounds, and the shaping prompt still encouraged complete pavement endpoints despite the later proportionate-policy override. New planning protocol5 supplies offline bounds from the real catalog and the prior router's per-leg measured/provider lengths, endpoints and maneuvers. Direct endpoint distance is diagnostic, never accepted as a shortcut. Optional shaping now addresses concrete crossings/gates rather than demanding all separate pavement connectors; source-vertex checks and independent review remain. The old protocols stay immutable. A regression exercises the actual rejected-proposal handoff and preserved route cap, alongside runtime version replay.

A bounded no-model diagnostic of v5's Pond Square–Institute leg retained834m with the same shaping under neutral costs, versus215m unshaped with walkway preference and193m unshaped neutral. These are actual router comparisons, not access acceptance or inputs to the next fresh tour. Their public response caches remain in ignored `local-data/generation-map-data/route-diagnostic`. The evidence supports removing unnecessary shaping, not altering geometry by hand. Fresh v6 integration remains pending.


**Ordinal route-leg schema (GEN-004), 7 October.** The v6 first proposal used descriptive routing leg IDs after planning protocol5 omitted the legacy prompt's ordinal examples. The router correctly rejected them before dispatch; the second allowed proposal recovered automatically with no shaping and passed duration feasibility. This was an instruction regression exposed by the fresh run, not an external service failure. The shared structured-output schema for new protocol6 now enumerates `leg-1` through `leg-7` and describes the station approach/return convention. Existing source-vertex and plan-length checks remain. Regression checks both runtime parsing and the exact JSON-schema enum delivered to the model; legacy protocol4/5 schema bindings remain unchanged. The live v6 process continues on its original committed version, so its automatic recovery is observed evidence, not live verification of this later schema correction.365automated tests, typecheck and lint pass; the wire-schema check is also run directly.


**Scout wording correction misrouted to research (GEN-004/ROUTE-004), 7 October.** V6's second route was duration-feasible and its Scout supported the actual loop, but required replacing an unsupported station “turn left” with a named street direction. The producer always sent a negative pre-final Scout to physical research, even though the Scout explicitly said no new research was required. That phase correctly preserved the existing evidence without searching, then failed its mandatory hosted-search check. The run closed17m34.195s after20inferences and1,475,960known tokens, none unknown, before writing. The search requirement is not weakened. New disposition-timing protocol2 moves the existing single frozen-route correction allowance earlier, before research/replanning; it still allows at most three requests shared with its contradiction closure, once per job. Stops, geometry and evidence remain frozen. If it cannot close the required findings, normal research and remaining proposals apply. The original negative Scout and corrected directions are retained with proposal identity and hashes. A full synthetic builder/tester regression proves the wording-only path uses one route and zero research repairs; a paired genuine-access regression proves three-route/two-research caps and no repeated disposition. Historical dispatched jobs retain timing1.


**Request timer wall-time limitation (GEN-004), 7 October.** V7 research operation7 completed normally with known usage after543.189seconds despite the configured360-second AbortSignal timer. Its complete output and actual elapsed time are retained; no retry or counter reset occurred. The exact cause (including possible host suspension/timer scheduling) is unproven; no transport-cleanup hypothesis is labelled a confirmed diagnosis. The90-minute job deadline is separately checked using wall-clock timestamps before subsequent work. Treat the request timer as best-effort transport cancellation, not a demonstrated strict wall-clock bound. This completed, recoverable delay is non-blocking for the personal draft; revisit with timestamp/abort-state instrumentation if it recurs while the host is known awake or causes a true indefinite stall.
