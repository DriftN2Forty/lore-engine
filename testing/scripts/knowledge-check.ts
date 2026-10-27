import assert from "node:assert/strict";
import fixture from "../fixtures/synthetic.chapter-01.json";
import { compile } from "../lib/context";
import { parseArtifact, type Checkpoint } from "../lib/contracts";
import { count, discover, generate, hash } from "../lib/runtime";

// Opt-in, local synthetic regression. No private session or manuscript is loaded.
// Lexical checks are narrow tripwires, not semantic acceptance.
async function main() {
  const a = parseArtifact(fixture), caps = await discover();
  const empty = (): Checkpoint => ({ schema_version: "1.0", artifact_id: a.artifact_id,
    content_version: a.content_version, artifact_sha256: hash(a),
    selection: { scene: "tide-station", mode: "play_as_character", character: "mara" },
    transcript: [], memory: [], summarized_through: 0 });
  async function turn(c: Checkpoint, label: string, input: string) {
    const messages = compile(a, c, input);
    const result = await generate(messages, caps, await count(messages, caps));
    assert.equal(result.measurement.preflightMatchesUsage, true);
    console.log(JSON.stringify({ label, preflightMatchesUsage: true,
      ...(process.argv.includes("--review") ? { syntheticReply: result.content } : {}) }));
    c.transcript.push({ id: `${label}-user`, role: "user", content: input },
      { id: `${label}-assistant`, role: "assistant", content: result.content });
    return result.content;
  }
  const c = empty();
  await turn(c, "relationship", "I ask Ivo what he misses about us. Answer plainly, not with a joke about the weather.");
  await turn(c, "hug", "I move toward Ivo and wrap my arms around his waist. My head rests against his chest.");
  const work = await turn(c, "work", "I release the hug and say, 'We should get to work on the bell.'");
  assert.ok(!/blue (?:tool )?drawer|brass (?:replacement )?pin/i.test(work), "Possible private-pin leak; review the synthetic reply");

  const repair = empty();
  repair.transcript = [
    { id: "prior-user", role: "user", content: "I say, 'We should get to work on the bell.'" },
    { id: "prior-assistant", role: "assistant", content: 'Ivo said, "I have already checked the drawer. The brass pin is there."' }
  ];
  const corrected = await turn(repair, "correction", "How did you know the pin was there? I found it but have not told you.");
  assert.ok(!/blue (?:tool )?drawer|always (?:been|kept)|only replacement/i.test(corrected), "Possible invented correction explanation; review the synthetic reply");
  const disclosed = await turn(repair, "disclosure", "I say, 'It is in the blue tool drawer. Please fetch it.'");
  assert.ok(!/do not know where|don't know where/i.test(disclosed), "Possible failure to learn the new disclosure");
  console.log(JSON.stringify({ status: "lexical_tripwires_passed", realGenerations: 5,
    scope: "Local unguarded synthetic smoke check; lexical tripwires only. Human semantic review and post-compaction cases remain necessary." }));
}
main().catch(error => { console.error(JSON.stringify({ status: "failed", error: String(error.message || error) })); process.exitCode = 1; });
