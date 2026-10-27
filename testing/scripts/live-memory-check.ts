import assert from "node:assert/strict";
import fixture from "../fixtures/synthetic.chapter-01.json";
import { act } from "../lib/store";
import { memorySchema, validateMemory } from "../lib/contracts";
import { parseJSON } from "../lib/json";

// Two real inference calls: compaction plus reply. Earlier history is explicitly
// synthetic hand-authored evidence, not a claimed 12-turn model-quality result.
async function main() {
  const initial: any = await act({ action: "import", artifact: fixture, selection: { scene: "tide-station", mode: "talk_to_character", character: "ivo" } });
  const turns = [
    ["My name is Rowan.", "Ivo greeted Rowan by name."],
    ["I leave a red scarf on the bench.", "Ivo noticed the visitor's scarf on the bench."],
    ["I will wait here until the rain stops.", "Ivo agreed to keep the visitor company."],
    ["Please do not ring the damaged bell.", "Ivo agreed that it should remain silent."],
    ["I ask for an empty cup, without tea.", "Ivo set an empty cup on the bench."],
    ["I want to inspect the bell later, not yet.", "Ivo left the mechanism alone."],
    ["I ask whether you have seen the ferry.", "Ivo said he had only heard a sound and was uncertain."],
    ["I stay near the door.", "Ivo remained beside the window."],
    ["Correction: the scarf I left on the bench is green, not red.", "Ivo acknowledged the correction: Rowan's scarf is green."],
    ["I still plan to wait out the storm.", "Ivo agreed that there was no need to rush."],
    ["I watch the rain for a moment.", "Rain continued to tap against the glass."],
    ["I ask you to stay a moment.", "Ivo stayed near the window."]
  ];
  const checkpoint = { ...initial.checkpoint, transcript: turns.flatMap(([user, assistant], i) => [
    { id: `u-${i + 1}`, role: "user", content: user }, { id: `a-${i + 1}`, role: "assistant", content: assistant }
  ]) };
  const restored: any = await act({ action: "import", artifact: fixture, checkpoint });
  if (process.argv.includes("--diagnose")) {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      const response = await originalFetch(input, init);
      const body = init?.body ? JSON.parse(String(init.body)) : null;
      if (new URL(String(input)).pathname === "/v1/chat/completions" && body?.messages?.[0]?.content?.startsWith("Summarize")) {
        const candidate = (await response.clone().json()).choices?.[0]?.message?.content;
        const diagnostics: Record<string, unknown> = { kind: "summary-validation-diagnostics", characters: typeof candidate === "string" ? candidate.length : null, fenced: typeof candidate === "string" && candidate.trim().startsWith("```") };
        try {
          const parsed = memorySchema.safeParse(parseJSON(candidate));
          if (!parsed.success) diagnostics.schemaIssues = parsed.error.issues.map(x => ({ code: x.code, path: x.path }));
          else { try { validateMemory(parsed.data, checkpoint.transcript.slice(0, 20)); diagnostics.validation = "pass"; } catch (e) { diagnostics.validation = e instanceof Error ? e.message : "failed"; } }
        } catch { diagnostics.json = "invalid"; }
        console.log(JSON.stringify(diagnostics));
      }
      return response;
    }) as typeof fetch;
  }
  const before = performance.now();
  const result: any = await act({ action: "chat", session: restored.session, text: "In at most two short sentences, what is my name and what color is the scarf I left on the bench?" });
  assert.equal(result.checkpoint.summarized_through, 20);
  assert.equal(result.checkpoint.transcript.length, 26);
  assert.ok(result.checkpoint.memory.length > 0);
  const memory = JSON.stringify(result.checkpoint.memory);
  const reply = result.checkpoint.transcript.at(-1).content as string;
  assert.match(memory, /Rowan/i); assert.match(memory, /green/i);
  assert.match(reply, /Rowan/i); assert.match(reply, /green/i);
  assert.equal(result.last.preflightMatchesUsage, true);
  console.log(JSON.stringify({ status: "pass", label: "local unguarded synthetic memory smoke test", handAuthoredPriorPairs: 12, realInferenceCalls: 2, summarizedThroughMessage: 20, memoryItems: result.checkpoint.memory.length, nameAndCorrectedColorRecalled: true, wallTimeMsIncludingCompaction: Math.round(performance.now() - before), replyMeasurement: result.last, limitation: "Does not replace a 30-turn live-model continuity and voice review" }));
}
main().catch(e => { console.error(JSON.stringify({ status: "failed", error: e instanceof Error ? e.message : "Unknown failure" })); process.exitCode = 1; });
