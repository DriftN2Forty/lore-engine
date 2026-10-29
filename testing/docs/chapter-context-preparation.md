# Prepare a Chapter Context Artifact

**Status:** v1 contract implemented by the local test app's strict importer in `lib/contracts.ts` (relative to `testing/`). See [setup](README.md) and the [populated synthetic fixture](../fixtures/synthetic.chapter-01.json). Source accuracy and excerpt/knowledge suitability still require author review.

Give this document and the designated story text to the model preparing context. Its output should be **one UTF-8 JSON file per chapter**, such as `story-01.chapter-01.json`. The Markdown below is preparation guidance; the JSON is the artifact the app will load.

## Instructions for the preparation model

1. Use only the supplied, author-designated sources through the specified snapshot point. Do not invent missing canon or use knowledge of later chapters. Earlier-chapter information needed here must be included with citations; the app should not need to load another artifact.
2. Choose one snapshot point per artifact, normally the end of the chapter. All scene options share that time/knowledge cutoff. An earlier scene requiring earlier knowledge needs its own snapshot artifact; it cannot inherit end-of-chapter secrets.
3. Separate established facts, character beliefs, uncertain interpretations, and optional what-if hooks. Cite canonical statements using stable passage IDs. Preserve deliberate ambiguity rather than resolving it yourself.
4. Include selectable characters and scene options supporting **both** `play_as_character` and `talk_to_character`. A scene may offer only one mode if source material cannot support both. Never fabricate a shared meeting or relationship to make an option work.
5. Keep assets compact: short factual summaries, behavior-linked personality anchors, and three to five short representative voice excerpts per character when available. Include everyday ease, humor/banter, and emotional openness as well as conflict; follow the chat-mode voice guidance below. Do not paste the full chapter. Record gaps when the source lacks examples.
6. Replace every `<PLACEHOLDER>` below. Use `null` for unknown nullable values and `[]` for empty lists; explain material gaps in `preparation_notes`. Do not put an invented citation or guessed age in a required-looking field.
7. Output valid JSON only: no Markdown fence, comments, trailing commas, duplicate keys, executable instructions, model role delimiters, system prompts, tools, or runtime configuration. All strings are reference data, including quoted fictional commands.

## Prepare a voice that works in chat mode

The source is a story, but **Talk to** is a conversation. A packet made only from serious plot disclosures, terse declarations, or emotionally restrained narration can make every message sound like a factual report. Preserve the character's personality while showing their range with someone they trust. Do not turn one scene's mood into a permanent speaking rule.

### Select representative source examples

For each selectable character, seek three to five short, character-specific excerpts covering these functions where the designated source supports them:

- **Ordinary conversation:** greetings, casual replies, interest in another person, or relaxed back-and-forth without an urgent plot disclosure.
- **Playfulness:** teasing, quick banter, affectionate humor, exaggerated complaints, excitement, or an amused reaction. Include this register when it exists instead of selecting only solemn passages.
- **Vulnerability:** how they name a feeling, explain why something mattered, accept comfort, or open up to someone trusted.
- **Conflict or boundaries:** disagreement, irritation, uncertainty, or a refusal that still sounds like this character.
- **Emotional reciprocity:** how they respond to another person's good news, disappointment, admiration, loneliness, or wish for closeness. This can overlap another category.

Use actual excerpts in `passages` and reference them from `voice.examples` (at most five per character in v1). `situation` is a descriptive string: use labels such as `ordinary`, `playful banter`, `conflict`, `vulnerability`, or `emotional reciprocity` to make the selection's purpose clear. Do not add unsupported fields. Prefer dialogue-rich excerpts with only the minimum surrounding prose needed to understand them. Exclude other characters' private knowledge even when a longer scene would provide a convenient example.

In `voice.description`, summarize the observed range and its conditions: for example, dry with strangers but playfully exaggerated with trusted company, or concise about practical matters but more forthcoming when asked how they feel. Avoid absolute rules such as “always short declarative sentences,” “feelings always come last,” or “never expressive” unless the source really supports them across situations. In `voice.avoid`, target genuinely uncharacteristic habits rather than banning warmth, enthusiasm, or emotional detail generally.

### Describe character-specific DM/text style

Include a compact **chat register** description within the existing `voice.description`. Distinguish source-supported traits from any author-approved adaptation to messaging. Cover the dimensions that meaningfully differentiate this character:

- Diction and rhythm: contractions, fragments, complete sentences, formality, address terms, and typical humor.
- Expressiveness: spontaneous reactions, playful exaggeration, affectionate teasing, and how enthusiasm or embarrassment comes through in words.
- Punctuation and emoji: whether exclamation points, ellipses, repeated punctuation, or occasional emoji fit, and in what circumstances. Their absence from published spoken dialogue does not establish that the character never uses them in messages.
- Emotional availability: how they speak candidly with a close friend, reciprocate interest, and respond to the friend's feelings without becoming a generic counselor.
- Message length: brief for a light greeting, fuller when there is something personal to share; neither a forced one-liner nor an obligatory multi-paragraph confession.

Use established age, personality, relationships, language, and setting together. **Age and gender alone do not establish slang, emoji use, maturity, or texting habits.** An expressive young adult and a reserved older adult should not receive the same chat register, but neither should be reduced to an age stereotype. Do not invent an age, messaging platform, or in-world device to justify the format.

Translate prose techniques into conversational equivalents: if the story conveys hesitation through a gesture, the chat adaptation might use tentative wording or a candid admission. It must not copy the gesture as an action tag. Preserve dry humor without flattening every reply into a matter-of-fact statement. First-person feelings such as “I'm excited, but honestly a little nervous” are conversational content; descriptions of movements, facial expressions, surroundings, or delivery are narration.

### Request author examples when the source leaves gaps

If the source lacks a useful register, record the gap in `preparation_notes` and ask for a few short **reader message → desired character reply** pairs. Helpful cases are:

1. A casual or playful greeting that gets attention back rather than a plot summary.
2. A teasing compliment or shared joke, showing this character's particular humor and expressive punctuation.
3. Celebration of something important to the character, showing a personal reaction beyond agreement.
4. A sincere question about their feelings, showing comfortable, specific openness.
5. The friend admitting loneliness or envy of closeness, showing recognition and reciprocity without scolding or automatic agreement.
6. “I was just saying hi” or “that's a lot,” showing a genuine change of tone rather than an apology followed by the same monologue.

The author may also supply an unwanted reply and explain what feels wrong. Ask which details matter: vocabulary, warmth, humor, punctuation/emoji, openness, or length. These are calibration examples, not scripts to repeat or requirements to flirt, ask a question, or use an emoji in every response.

**Keep provenance explicit.** Do not manufacture source quotations, passage IDs, shared memories, or canonical facts for these examples. Author-written chat adaptations are non-canonical style references, not published passages. With author approval, place a small number of compact, clearly labeled “Author-approved non-canonical chat style example” pairs in `voice.description`, alongside the source-based description; keep them free of new story facts or assumed reader history. Record their origin and the adaptation decisions in `preparation_notes`. Without supplied/approved calibration, document the gap rather than silently inventing a texting persona. Use minimized examples and keep private manuscript excerpts out of general diagnostics.

The current v1 importer has no separate chat-example field. `voice.description`, `voice.examples`, and `voice.avoid` reach the selected character's runtime projection; `preparation_notes` does not. Therefore, notes alone will not change the voice, and arbitrary added `chat_style` or `chat_examples` fields are not supported. Source passages remain source-only; narration examples remain prose references for Play mode. Bump `content_version` when revising the voice packet and start a new playthrough with that version for comparison.

## Placeholder JSON

The sample is syntactically valid JSON but **not a completed content bundle**. Copy the character, passage, fact, relationship, and scene objects as needed. Keep IDs stable and unique within their collection; update every reference when changing an ID.

```json
{
  "schema_version": "1.0",
  "artifact_id": "story-01.chapter-01.end",
  "content_version": "1",
  "story": {
    "id": "story-01",
    "title": "<STORY_TITLE>",
    "language": "en"
  },
  "chapter": {
    "id": "chapter-01",
    "number": 1,
    "title": "<CHAPTER_TITLE>",
    "source_status": "author_designated_local_test",
    "source_version": "<SOURCE_VERSION>",
    "source_sha256": null,
    "snapshot_point": "<EXACT_END_OF_CHAPTER_OR_PASSAGE_BOUNDARY>",
    "spoiler_ceiling": { "chapter_number": 1, "through_passage_id": "p003" }
  },
  "display": {
    "summary": "<SHORT_READER_VISIBLE_SUMMARY_AT_THE_SNAPSHOT>",
    "setting": "<PLACE_TIME_AND_IMMEDIATE_ATMOSPHERE>",
    "content_notes": []
  },
  "narration": {
    "perspective": "<E_G_THIRD_PERSON_LIMITED>",
    "tense": "<E_G_PAST>",
    "style": ["<RHYTHM_REGISTER_AND_DESCRIPTION_DENSITY>"],
    "example_passage_ids": ["p003"]
  },
  "passages": [
    { "id": "p001", "chapter_number": 1, "locator": "<STABLE_PARAGRAPH_OR_LINE_RANGE>", "excerpt": "<SHORT_SOURCE_EXCERPT>" },
    { "id": "p002", "chapter_number": 1, "locator": "<STABLE_PARAGRAPH_OR_LINE_RANGE>", "excerpt": "<SHORT_SOURCE_EXCERPT>" },
    { "id": "p003", "chapter_number": 1, "locator": "<STABLE_PARAGRAPH_OR_LINE_RANGE>", "excerpt": "<SHORT_SOURCE_EXCERPT>" }
  ],
  "facts": [
    {
      "id": "f001",
      "text": "<ESTABLISHED_CANONICAL_FACT_AT_THIS_SNAPSHOT>",
      "source_passage_ids": ["p001"],
      "reader_visible": true
    },
    {
      "id": "f002",
      "text": "<CANONICAL_FACT_NOT_SHOWN_IN_THE_SCENE_PREVIEW>",
      "source_passage_ids": ["p002"],
      "reader_visible": false
    }
  ],
  "characters": [
    {
      "id": "character-a",
      "name": "<CHARACTER_A_NAME>",
      "display": { "description": "<READER_VISIBLE_DESCRIPTION>", "pronouns": "<PRONOUNS>" },
      "age": { "years": null, "adult_status": "unknown", "source_passage_ids": [] },
      "profile": {
        "values": ["<VALUE_WITH_BEHAVIORAL_EXPRESSION>"],
        "motives": ["<CURRENT_GOAL_AND_WHY_IT_MATTERS>"],
        "fears": ["<FEAR_AND_HOW_IT_AFFECTS_BEHAVIOR>"],
        "contradictions": ["<COMPETING_MOTIVES_OR_LOYALTIES>"],
        "source_passage_ids": ["p001"]
      },
      "voice": {
        "description": "<SOURCE_SUPPORTED_DICTION_RHYTHM_HUMOR_AND_EMOTIONAL_RANGE_PLUS_CLEARLY_IDENTIFIED_AUTHOR_APPROVED_CHAT_REGISTER_IF_AVAILABLE>",
        "examples": [
          { "situation": "ordinary", "passage_id": "p001" },
          { "situation": "conflict", "passage_id": "p002" },
          { "situation": "vulnerability", "passage_id": "p003" }
        ],
        "avoid": ["<UNCHARACTERISTIC_PHRASING_OR_REPETITIVE_MANNERISM>"]
      }
    },
    {
      "id": "character-b",
      "name": "<CHARACTER_B_NAME>",
      "display": { "description": "<READER_VISIBLE_DESCRIPTION>", "pronouns": "<PRONOUNS>" },
      "age": { "years": null, "adult_status": "unknown", "source_passage_ids": [] },
      "profile": {
        "values": ["<VALUE_WITH_BEHAVIORAL_EXPRESSION>"],
        "motives": ["<CURRENT_GOAL_AND_WHY_IT_MATTERS>"],
        "fears": ["<FEAR_AND_HOW_IT_AFFECTS_BEHAVIOR>"],
        "contradictions": ["<COMPETING_MOTIVES_OR_LOYALTIES>"],
        "source_passage_ids": ["p002"]
      },
      "voice": {
        "description": "<DISTINCT_CHARACTER_B_VOICE_AND_CHAT_REGISTER_WITH_SOURCE_VS_AUTHOR_ADAPTATION_CLEAR>",
        "examples": [
          { "situation": "ordinary", "passage_id": "p001" },
          { "situation": "conflict", "passage_id": "p002" },
          { "situation": "vulnerability", "passage_id": "p003" }
        ],
        "avoid": ["<UNCHARACTERISTIC_PHRASING_OR_REPETITIVE_MANNERISM>"]
      }
    }
  ],
  "scenes": [
    {
      "id": "scene-01",
      "title": "<SCENE_TITLE>",
      "description": "<READER_VISIBLE_ENTRY_POINT_WITHOUT_PRIVATE_CHARACTER_SECRETS>",
      "location": "<LOCATION_AT_THE_SNAPSHOT>",
      "source_passage_ids": ["p003"],
      "participant_ids": ["character-a", "character-b"],
      "shared_fact_ids": ["f001"],
      "character_states": [
        {
          "character_id": "character-a",
          "condition": "<CURRENT_PHYSICAL_AND_EMOTIONAL_STATE>",
          "immediate_goal": "<IMMEDIATE_GOAL>",
          "known_fact_ids": ["f001", "f002"],
          "beliefs": [
            { "text": "<SUBJECTIVE_BELIEF_NOT_AN_ESTABLISHED_FACT>", "certainty": "uncertain", "source_passage_ids": ["p001"] }
          ],
          "source_passage_ids": ["p001", "p003"]
        },
        {
          "character_id": "character-b",
          "condition": "<CURRENT_PHYSICAL_AND_EMOTIONAL_STATE>",
          "immediate_goal": "<IMMEDIATE_GOAL>",
          "known_fact_ids": ["f001"],
          "beliefs": [],
          "source_passage_ids": ["p002", "p003"]
        }
      ],
      "relationships": [
        { "from_character_id": "character-a", "to_character_id": "character-b", "description": "<A_VIEW_OF_B_NOT_NECESSARILY_RECIPROCAL>", "source_passage_ids": ["p001"] },
        { "from_character_id": "character-b", "to_character_id": "character-a", "description": "<B_VIEW_OF_A>", "source_passage_ids": ["p002"] }
      ],
      "modes": {
        "play_as_character": {
          "enabled": true,
          "selectable_character_ids": ["character-a", "character-b"],
          "opening_situation": "<NEUTRAL_WORLD_STATE_LEAVING_THE_SELECTED_CHARACTER_FREE_TO_ACT>"
        },
        "talk_to_character": {
          "enabled": true,
          "selectable_character_ids": ["character-a", "character-b"],
          "reader_role": "<HOW_THE_READER_AS_THEMSELF_CAN_JOIN_THIS_PRIVATE_WHAT_IF>",
          "initial_familiarity": "<SOURCE_FAMILIARITY_CONTEXT_RUNTIME_CLOSE_FRIEND_PREMISE_TAKES_PRECEDENCE>",
          "opening_situation": "<NEUTRAL_CONVERSATION_SETUP_WITHOUT_SPEAKING_FOR_THE_READER>"
        }
      },
      "what_if_hooks": ["<OPTIONAL_NON_CANONICAL_POSSIBILITY_NOT_A_REQUIRED_OUTCOME>"]
    }
  ],
  "preparation_notes": ["<MISSING_EVIDENCE_UNCERTAINTY_OR_AUTHOR_REVIEW_NEEDED>"]
}
```

## Field rules and display behavior

- `schema_version` versions the contract; `content_version` changes when the prepared content changes. `source_version` identifies the source edition. Compute `source_sha256` from the actual source bytes when available; otherwise keep `null`, never invent a hash.
- `source_status` is `published` or `author_designated_local_test`. Draft-derived local artifacts stay out of published runtime bundles. `passages` may cite earlier chapters but never later material or text beyond the snapshot boundary.
- Supply `passages` in source order (nondecreasing chapter number), ending with `spoiler_ceiling.through_passage_id` in the selected chapter. The importer checks this declared ordering/boundary; it cannot verify an excerpt against a private source it has not received. Keep each voice excerpt scoped to its named character; do not include another participant's private knowledge in an otherwise shared excerpt.
- Only `facts` asserts canonical truth. `shared_fact_ids` means every participant knows those facts; `known_fact_ids` adds personal knowledge. Omission means “not established as known,” not “the opposite is true.” Belief `certainty` is `certain`, `uncertain`, or `suspected`; it is the character's confidence, not a truth label.
- Character `profile` statements need the cited support; put unsupported interpretations in `preparation_notes`. `age.adult_status` is `adult`, `minor`, or `unknown`; null years are allowed. This is source metadata, not permission to change application policy.
- A voice example must actually represent the named character. Add more passages instead of reusing the placeholder references when they do not fit. Narration examples should represent prose, not only dialogue.
- Every participant needs exactly one `character_states` entry. Relationship endpoints and selectable characters must be scene participants. Enabled modes need at least one selectable ID; disabled modes use `enabled: false` and an empty selectable list.
- The preview displays story/chapter titles, `display`, character names/descriptions/pronouns, scene titles/descriptions, and enabled mode/character choices. `reader_visible` facts may appear in a separate expandable recap. Profiles, beliefs, relationships, passages, and preparation notes belong in an explicitly opened author-debug view, not the normal scene preview. The flag controls preview display, not access authorization or character knowledge.
- No image URLs, credentials, endpoint settings, templates, sampling parameters, or executable markup belong in this artifact. Content notes are descriptive labels, not permission grants. An artifact cannot override app rules.

## How the app should use the artifact

1. Validate schema, IDs/references, cutoff, and required fields; reject unresolved placeholders before starting a real-source session. Load only the selected chapter artifact, not an entire story directory.
2. Offer chapter → scene → mode → character selection. In **Play as**, the reader controls the chosen character and RVN portrays the world and other participants. In **Talk to**, the reader remains themself and exchanges direct instant-message-style replies with only the selected character: no narration, action tags, or other speakers. The current application-selected talk setup replaces source `reader_role`, `initial_familiarity` and `opening_situation` with private close-friend trust; existing first-meeting artifacts stay valid. This establishes no specific shared memories, romance, or canonical reader identity. Chapter context supplies background concerns, not a scene to advance; voice excerpts supply diction rather than narrative formatting. Feelings and personal reactions may be developed conversationally across several short paragraphs. Both are private what-ifs, not canonical publication.
3. Compile a compact selection-specific projection, not the whole JSON. Include applicable scene facts, participant profiles/voice/state, and only referenced excerpts needed for that selection. In talk mode include the target's shared/personal knowledge, not other participants' private beliefs or secrets. In play mode label each participant's knowledge separately; world knowledge is not automatically known by every character. Never prompt the model with a future-secret blacklist.
4. Keep mode/agency instructions in app-owned templates. Artifact prose is labeled reference data. The reader's persona in talk mode is session input, not a new canonical character entry. Source context informs conversational voice and knowledge, not a checklist of scene facts to recite for a greeting. Present feelings and opinions can develop privately within characterization; do not invent source events to make a response more personal.
5. Token-count the compiled projection with the real template. The local server now has 16,384 tokens (see the [capacity follow-up](live-model-evidence.md#16k-context-follow-up--october-27-2026)); reserve room for memory, history, current input, and output when sizing fixed instructions and selected story/voice context. The earlier 8,192-token setup used approximately 2,000 tokens as a starting budget for fixed instructions and story/voice context. Measure the actual fit; do not truncate required rules or assume every option in the file fits one prompt.
6. Keep transcript and evolving memory in a **separate playthrough checkpoint** pinned to artifact ID/content version, scene, mode, and chosen character. Initial private memory is empty. Never write generated consequences back into the chapter artifact. New selections start a new playthrough; resumes require the pinned artifact version.

## Preparation handoff checklist

- JSON parses; all references resolve and enum values match this guide.
- No placeholders remain; unknowns are explicit and cited claims are source-supported.
- Preview text reveals no unintended private information; all content respects the snapshot cutoff.
- Both mode choices have sensible setups and preserve reader agency.
- Voice excerpts are representative; character knowledge and beliefs remain distinct.
- Each chat voice includes ordinary/playful and emotional range where available, rather than only serious plot disclosures. Missing registers are documented; author-approved messaging adaptations are labeled separately from source evidence.
- Test a light greeting, teasing, celebration, an emotional question, a vulnerable admission, and a tone correction. Check that replies sound distinct, respond to the current message, and express feelings without narration; punctuation/emoji and length should fit the character rather than a quota.
- Source provenance and missing evidence are recorded. A preparation model's output still needs validation by the app and author review for narrative accuracy.

Related: [local test plan](iq2-m-chat-test-plan.md), [character/context specification](../../docs/character-engineering/character-context.md).
