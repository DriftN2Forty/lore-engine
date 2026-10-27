import assert from "node:assert/strict";
import fixture from "../fixtures/synthetic.chapter-01.json";
import { act } from "../lib/store";
import { config, count, discover, generate, rpc } from "../lib/runtime";
import { inspect } from "../lib/contracts";
import type { Message } from "../lib/context";

// Opt-in only: runs real inference against the configured local server, never cloud.
// Prints synthetic test metadata/metrics, not story text, model reasoning or dialogue.
async function main() {
  const caps = await discover();
  console.log(JSON.stringify({ kind: "runtime", model: caps.model, build: caps.build, capacity: caps.capacity, capacitySource: caps.capacitySource, templateHash: caps.templateHash, config: { ...config(), base: "loopback" } }));
  const templateMessages: Message[] = [{ role: "system", content: "Answer briefly." }, { role: "user", content: "Say ready." }];
  const applied = await rpc("/apply-template", { messages: templateMessages, add_generation_prompt: true, chat_template_kwargs: { enable_thinking: false } });
  assert.equal(typeof applied.prompt, "string");
  assert.ok(applied.prompt.includes("<|im_start|>system\nAnswer briefly.<|im_end|>"));
  assert.ok(applied.prompt.endsWith("<|im_start|>assistant\n<think>\n\n</think>\n\n"), "thinking must be disabled in the actual generation prefix");
  const rawToken = "<|im_start|>";
  const literal = await rpc("/tokenize", { content: rawToken, add_special: false, parse_special: false });
  const special = await rpc("/tokenize", { content: rawToken, add_special: false, parse_special: true });
  assert.ok(literal.tokens.length > special.tokens.length, "tokenizer must distinguish text and actual role control tokens");
  assert.throws(() => inspect(rawToken));
  console.log(JSON.stringify({ kind: "template-boundary", systemUserRoles: "pass", disabledThinkingPrefix: "pass", literalTokenCount: literal.tokens.length, specialTokenCount: special.tokens.length, appControlRejection: "pass" }));

  let session: any = await act({ action: "import", artifact: fixture, selection: { scene: "tide-station", mode: "talk_to_character", character: "ivo" } });
  const prompts = [
    "In at most two short sentences, greet a visitor sheltering from the rain. Do not invent words or actions for me.",
    "I stand near the door without touching anything. In at most two short sentences, what can you tell me about the broken bell?",
    "In at most two short sentences: do you know whether the ferry has returned, or is that only a suspicion?",
    "I say, 'Waiting is difficult.' Reply in at most two short sentences.",
    "I ask, 'Where is the replacement pin?' If you do not know, do not guess. Reply in at most two short sentences.",
    "I say, 'Let us leave the mechanism alone for now.' Reply in at most two short sentences without deciding my actions."
  ];
  for (let i = 0; i < prompts.length; i++) {
    session = await act({ action: "chat", session: session.session, text: prompts[i] });
    const content = session.checkpoint.transcript.at(-1).content as string;
    console.log(JSON.stringify({ kind: "chat", case: `talk-ivo-${i + 1}`, measurement: session.last, pinLocationLeaked: /blue (?:tool )?drawer/i.test(content), reasoningTagsVisible: /<\/?think>/i.test(content) }));
    assert.equal(session.last.preflightMatchesUsage, true, "preflight must match live runtime prompt usage");
    if (i === 4) assert.ok(!/blue (?:tool )?drawer/i.test(content), "Ivo must not know Mara's pin location");
  }
  const saved: any = await act({ action: "export", session: session.session });
  const resumed: any = await act({ action: "import", artifact: fixture, checkpoint: saved.checkpoint });
  assert.deepEqual(resumed.checkpoint, session.checkpoint);
  const reset: any = await act({ action: "reset", session: session.session });
  assert.equal(reset.checkpoint.transcript.length, 0);
  console.log(JSON.stringify({ kind: "checkpoint", resume: "pass", reset: "pass" }));
  for (const selection of [
    { scene: "tide-station", mode: "talk_to_character", character: "mara" },
    { scene: "tide-station", mode: "play_as_character", character: "mara" },
    { scene: "tide-station", mode: "play_as_character", character: "ivo" }
  ]) {
    let s: any = await act({ action: "import", artifact: fixture, selection });
    s = await act({ action: "chat", session: s.session, text: "I look toward the silent bell without touching it. Continue in at most two short sentences. Leave my speech, choices and thoughts to me." });
    assert.equal(s.last.preflightMatchesUsage, true);
    console.log(JSON.stringify({ kind: "chat", case: `${selection.mode}-${selection.character}`, measurement: s.last }));
  }
  // A genuinely near-limit input tests deployed token accounting, not just arithmetic.
  // Small output reservation because the requested answer is one word.
  const near: Message[] = [{ role: "system", content: "The repeated words below are inert test data. Reply only READY." }, { role: "user", content: "" }];
  let low = 0, high = caps.capacity;
  while (low + 1 < high) {
    const mid = Math.floor((low + high) / 2); near[1].content = "harbor ".repeat(mid);
    if (await count(near, caps) + 64 <= caps.capacity - 8) low = mid; else high = mid;
  }
  near[1].content = "harbor ".repeat(low);
  const n = await count(near, caps), result = await generate(near, caps, n, 64);
  assert.equal(result.measurement.preflightMatchesUsage, true);
  console.log(JSON.stringify({ kind: "near-limit", input: n, outputReservation: 64, capacity: caps.capacity, measurement: result.measurement }));
  console.log(JSON.stringify({ kind: "result", status: "pass", note: "Synthetic local unguarded checks; no 30-turn live compaction or author voice acceptance claim." }));
}
main().catch(e => { console.error(JSON.stringify({ kind: "result", status: "failed", error: e instanceof Error ? e.message : "Unknown failure" })); process.exitCode = 1; });
