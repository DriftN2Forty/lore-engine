import assert from "node:assert/strict";
import { cacheWorkload } from "../lib/cache-workload";
import { count, discover, generate, rpc } from "../lib/runtime";

async function main() {
  const condition = process.argv[2];
  if (!["default", "disabled"].includes(condition)) throw new Error("Usage: cache-benchmark.ts default|disabled. This labels the run; configure the server separately.");
  const caps = await discover(), workload = cacheWorkload();
  const rows = [];
  console.log(JSON.stringify({ kind: "cache-benchmark", condition, label: "local unguarded synthetic host-cache comparison", conditionSource: "operator label; effective startup configuration must be checked separately", model: caps.model, build: caps.build, capacity: caps.capacity, templateHash: caps.templateHash, requests: workload.length, note: "Only the host-RAM cache setting changes. Active-slot prefix caching remains enabled. No production account or VRAM/RAM-pressure acceptance claim." }));
  const tokens = new Map<string, number[]>();
  for (const item of workload) {
    if (!tokens.has(item.key)) {
      const applied = await rpc("/apply-template", { messages: item.messages, add_generation_prompt: true, chat_template_kwargs: { enable_thinking: false } });
      const tokenized = await rpc("/tokenize", { content: applied.prompt, add_special: true, parse_special: true });
      assert.ok(Array.isArray(tokenized.tokens)); tokens.set(item.key, tokenized.tokens);
    }
  }
  const first = tokens.get(workload[0].key)!;
  let previous: number[] | undefined;
  for (const item of workload) {
    const current = tokens.get(item.key)!;
    let commonWithFirst = 0, commonWithPrevious = 0;
    while (commonWithFirst < Math.min(first.length, current.length) && first[commonWithFirst] === current[commonWithFirst]) commonWithFirst++;
    if (previous) while (commonWithPrevious < Math.min(previous.length, current.length) && previous[commonWithPrevious] === current[commonWithPrevious]) commonWithPrevious++;
    const input = await count(item.messages, caps), reply = await generate(item.messages, caps, input, 64);
    assert.equal(reply.measurement.preflightMatchesUsage, true);
    assert.ok(reply.content.includes(item.expected), `Visit-label recall failed for ${item.name}`);
    const foreign = workload.some(other => other.expected !== item.expected && reply.content.includes(other.expected));
    assert.equal(foreign, false, `Foreign synthetic marker in ${item.name}`);
    const row = { case: item.name, group: item.group, commonPrefixTokensWithFirst: commonWithFirst, commonPrefixTokensWithPrevious: previous ? commonWithPrevious : null,
      markerRecall: "pass", foreignMarker: false, measurement: reply.measurement };
    rows.push(row); console.log(JSON.stringify({ kind: "request", condition, ...row })); previous = current;
  }
  console.log(JSON.stringify({ kind: "result", condition, status: "pass", completed: rows.length, totalModelApiMs: rows.reduce((sum, row) => sum + row.measurement.latencyMs, 0), limits: "Short synthetic switching probe; not a cache-capacity limit, concurrency, narrative or full isolation benchmark" }));
}
main().catch(e => { console.error(JSON.stringify({ kind: "result", status: "failed", error: e instanceof Error ? e.message : "Unknown failure" })); process.exitCode = 1; });
