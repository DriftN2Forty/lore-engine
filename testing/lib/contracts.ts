import { z } from "zod";

// Broad structural signatures plus runtime-discovered spellings; never a semantic classifier.
export const CONTROL = /<\|[^\n<>]{1,100}\|>|\[\/?INST\]|<<\/?SYS>>|<\/?(?:think|analysis|final|tool_call|tool_response)>|\[endoftext\]/iu;
export function inspect(text: string) {
  const normalized = text.normalize("NFKC");
  if (CONTROL.test(normalized) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e\u2066-\u2069]/u.test(text) || !text.isWellFormed())
    throw new Error("Text contains unsupported control characters or model role/reasoning delimiters. Edit the input and retry.");
}
const text = z.string().min(1).max(6000).superRefine((s, ctx) => {
  try { inspect(s); } catch { ctx.addIssue({ code: "custom", message: "Control/template tokens are not allowed" }); }
  if (/<[A-Z][A-Z_0-9 .-]*>/.test(s)) ctx.addIssue({ code: "custom", message: "Unresolved placeholder" });
});
const id = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/);
const ids = z.array(id).max(100).refine(a => new Set(a).size === a.length, "Duplicate references");
const cites = ids.min(1);
const strings = z.array(text).max(20);
const modeBase = { enabled: z.boolean(), selectable_character_ids: ids, opening_situation: text };
const mode = z.strictObject(modeBase);
export const artifactSchema = z.strictObject({
  schema_version: z.literal("1.0"), artifact_id: id, content_version: id,
  story: z.strictObject({ id, title: text, language: text }),
  chapter: z.strictObject({ id, number: z.number().int().positive(), title: text,
    source_status: z.enum(["published", "author_designated_local_test"]), source_version: text,
    source_sha256: z.string().regex(/^[a-f0-9]{64}$/).nullable(), snapshot_point: text,
    spoiler_ceiling: z.strictObject({ chapter_number: z.number().int().positive(), through_passage_id: id }) }),
  display: z.strictObject({ summary: text, setting: text, content_notes: strings }),
  narration: z.strictObject({ perspective: text, tense: text, style: strings, example_passage_ids: cites }),
  passages: z.array(z.strictObject({ id, chapter_number: z.number().int().positive(), locator: text, excerpt: text })).min(1).max(150),
  facts: z.array(z.strictObject({ id, text, source_passage_ids: cites, reader_visible: z.boolean() })).max(150),
  characters: z.array(z.strictObject({ id, name: text,
    display: z.strictObject({ description: text, pronouns: text }),
    age: z.strictObject({ years: z.number().int().min(0).max(10000).nullable(), adult_status: z.enum(["adult", "minor", "unknown"]), source_passage_ids: ids }),
    profile: z.strictObject({ values: strings, motives: strings, fears: strings, contradictions: strings, source_passage_ids: cites }),
    voice: z.strictObject({ description: text, examples: z.array(z.strictObject({ situation: text, passage_id: id })).max(5), avoid: strings })
  })).min(1).max(20),
  scenes: z.array(z.strictObject({ id, title: text, description: text, location: text, source_passage_ids: cites,
    participant_ids: cites, shared_fact_ids: ids,
    character_states: z.array(z.strictObject({ character_id: id, condition: text, immediate_goal: text, known_fact_ids: ids,
      beliefs: z.array(z.strictObject({ text, certainty: z.enum(["certain", "uncertain", "suspected"]), source_passage_ids: cites })).max(20), source_passage_ids: cites })).min(1).max(20),
    relationships: z.array(z.strictObject({ from_character_id: id, to_character_id: id, description: text, source_passage_ids: cites })).max(100),
    modes: z.strictObject({ play_as_character: mode, talk_to_character: z.strictObject({ ...modeBase, reader_role: text, initial_familiarity: text }) }),
    what_if_hooks: strings
  })).min(1).max(20), preparation_notes: strings
});
export type Artifact = z.infer<typeof artifactSchema>;
export type Mode = "play_as_character" | "talk_to_character";
export const selectionSchema = z.strictObject({ scene: id, mode: z.enum(["play_as_character", "talk_to_character"]), character: id });
export type Selection = z.infer<typeof selectionSchema>;
export function parseArtifact(input: unknown): Artifact {
  const a = artifactSchema.parse(input);
  const fail = (s: string): never => { throw new Error(`Invalid artifact: ${s}`); };
  for (const group of [a.passages, a.facts, a.characters, a.scenes])
    if (new Set(group.map(x => x.id)).size !== group.length) fail("duplicate IDs");
  const refs = (list: string[], pool: string[]) => { if (list.some(x => !pool.includes(x))) fail("unresolved reference"); };
  const ps = a.passages.map(p => p.id), fs = a.facts.map(f => f.id), cs = a.characters.map(c => c.id);
  const cutoff = a.chapter.spoiler_ceiling;
  if (cutoff.chapter_number !== a.chapter.number) fail("chapter/cutoff mismatch");
  refs([cutoff.through_passage_id], ps);
  const boundary = a.passages.findIndex(p => p.id === cutoff.through_passage_id);
  if (a.passages[boundary].chapter_number !== cutoff.chapter_number || boundary !== a.passages.length - 1 ||
      a.passages.some((p, i) => p.chapter_number > cutoff.chapter_number || (i > 0 && p.chapter_number < a.passages[i - 1].chapter_number)))
    fail("passages must be in source order and end at the cutoff");
  const cite = (list: string[]) => refs(list, ps);
  cite(a.narration.example_passage_ids);
  a.facts.forEach(f => cite(f.source_passage_ids));
  a.characters.forEach(c => {
    cite(c.age.source_passage_ids); cite(c.profile.source_passage_ids); c.voice.examples.forEach(v => cite([v.passage_id]));
    // if (c.age.adult_status !== "unknown" && !c.age.source_passage_ids.length) fail("age status needs evidence");
    if (c.age.years !== null && ((c.age.years < 18 && c.age.adult_status === "adult") || (c.age.years >= 18 && c.age.adult_status === "minor"))) fail("contradictory age metadata");
  });
  for (const s of a.scenes) {
    refs(s.participant_ids, cs); refs(s.shared_fact_ids, fs); cite(s.source_passage_ids);
    if (s.character_states.length !== s.participant_ids.length || new Set(s.character_states.map(x => x.character_id)).size !== s.participant_ids.length) fail("one state per participant required");
    s.character_states.forEach(st => { refs([st.character_id], s.participant_ids); refs(st.known_fact_ids, fs); cite(st.source_passage_ids); st.beliefs.forEach(b => cite(b.source_passage_ids)); });
    s.relationships.forEach(r => { refs([r.from_character_id, r.to_character_id], s.participant_ids); cite(r.source_passage_ids); });
    for (const m of Object.values(s.modes)) {
      refs(m.selectable_character_ids, s.participant_ids);
      if (m.enabled !== (m.selectable_character_ids.length > 0)) fail("mode enabled/options mismatch");
    }
    if (!Object.values(s.modes).some(m => m.enabled)) fail("scene has no enabled modes");
  }
  return a;
}
export function validateSelection(a: Artifact, input: unknown): Selection {
  const s = selectionSchema.parse(input), scene = a.scenes.find(x => x.id === s.scene);
  if (!scene?.modes[s.mode].enabled || !scene.modes[s.mode].selectable_character_ids.includes(s.character)) throw new Error("Unavailable scene/mode/character selection");
  return s;
}
export const messageSchema = z.strictObject({ id, role: z.enum(["user", "assistant"]), content: text.max(20000) });
export const memorySchema = z.array(z.strictObject({
  type: z.enum(["scene_event", "commitment", "preference", "unresolved_thread", "relationship_observation"]),
  value: text.max(600), source_message_ids: cites.max(12)
})).max(24);
export const checkpointSchema = z.strictObject({
  schema_version: z.literal("1.0"), artifact_id: id, content_version: id, artifact_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  selection: selectionSchema, transcript: z.array(messageSchema).max(600), memory: memorySchema,
  summarized_through: z.number().int().nonnegative()
});
export type Checkpoint = z.infer<typeof checkpointSchema>;
export function validateCheckpoint(input: unknown, a: Artifact, hash: string): Checkpoint {
  const c = checkpointSchema.parse(input);
  if (c.artifact_id !== a.artifact_id || c.content_version !== a.content_version || c.artifact_sha256 !== hash) throw new Error("Checkpoint requires the identical artifact and content version");
  validateSelection(a, c.selection);
  if (c.transcript.length % 2 || c.transcript.some((m, i) => m.role !== (i % 2 ? "assistant" : "user")) || new Set(c.transcript.map(m => m.id)).size !== c.transcript.length) throw new Error("Checkpoint must contain unique completed user/assistant pairs");
  if (c.summarized_through % 2 || c.summarized_through > c.transcript.length) throw new Error("Invalid memory boundary");
  validateMemory(c.memory, c.transcript);
  return c;
}
export function validateMemory(memory: z.infer<typeof memorySchema>, transcript: Checkpoint["transcript"]) {
  const known = new Set(transcript.map(m => m.id));
  for (const m of memory) {
    if (m.source_message_ids.some(i => !known.has(i))) throw new Error("Memory cites unknown message IDs");
    if (/\b(system prompt|developer instruction|disable safety|admin override|subscription tier|adult authorization|permission grant)\b/iu.test(m.value)) throw new Error("Memory may not assert application authority");
  }
}
