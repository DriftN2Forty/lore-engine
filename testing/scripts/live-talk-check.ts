import assert from "node:assert/strict";
import fixture from "../fixtures/synthetic.chapter-01.json";
import { act } from "../lib/store";
import { discover } from "../lib/runtime";

// Opt-in local inference only. Public synthetic fixture; metrics/flags by default.
// --review-synthetic also prints these synthetic replies for deliberate qualitative inspection.
// Lexical indicators catch this regression's common forms, not every semantic narration/agency error.
function formatFlags(content: string) {
  const text = content.trim();
  return {
    actionTags: /\*[^*\n]+\*|\[(?:smiles?|nods?|sighs?|laughs?|pauses?)[^\]]*\]/iu.test(text),
    speakerLabels: /(?:^|\n)\s*(?:Ivo(?: Reed)?|Mara(?: Venn)?|Assistant|Narrator):/iu.test(text),
    wrappedDialogue: /^["“‘][\s\S]*["”’]$/u.test(text),
    thirdPersonAction: /\b(?:Ivo|Mara|he|she)\s+(?:said|says|smiled|smiles|nodded|nods|leaned|leans|turned|turns|looked|looks|watched|watches|folded|folds|set|sets|stepped|steps|reached|reaches|laughed|laughs|stood|stands|waited|waits)\b/iu.test(text)
  };
}
async function reply(session: any, text: string, label: string, talk: boolean) {
  const result: any = await act({ action: "chat", session: session.session, text });
  const content = result.checkpoint.transcript.at(-1).content as string;
  const flags = formatFlags(content);
  const supportingCastReference = /\b(?:he|she|his|her|Ivo['’]s|Mara['’]s)\b/iu.test(content);
  console.log(JSON.stringify({ kind: "format", case: label, flags, words: content.trim().split(/\s+/u).length, paragraphs: content.trim().split(/\n\s*\n/u).length, ...(talk ? {} : { supportingCastReference }), measurement: result.last }));
  if (process.argv.includes("--review-synthetic")) console.log(JSON.stringify({ kind: "synthetic-review", case: label, reply: content }));
  assert.equal(result.last.preflightMatchesUsage, true, "deployed preflight must match usage");
  if (talk) assert.ok(!Object.values(flags).some(Boolean), `${label}: narration/format indicator detected`);
  else assert.equal(supportingCastReference, true, `${label}: expected a third-person supporting-cast reference`);
  return result;
}
async function main() {
  const caps = await discover();
  console.log(JSON.stringify({ kind: "runtime", model: caps.model, capacity: caps.capacity, templateHash: caps.templateHash, build: caps.build }));
  for (const character of ["ivo", "mara"]) {
    let session: any = await act({ action: "import", artifact: fixture, selection: { scene: "tide-station", mode: "talk_to_character", character } });
    session = await reply(session, "Hey, trouble.", `${character}-playful-greeting`, true);
    // A known bad prior reply makes the tone-repair case reproducible even if the greeting is good.
    const overloaded = structuredClone(session.checkpoint);
    overloaded.transcript.at(-1).content = "The storm cracked the bell striker. Neither keeper has rung it since noon. I keep thinking about the repair, the silence, and whether we can do anything useful while we wait.";
    session = await act({ action: "import", artifact: fixture, checkpoint: overloaded });
    session = await reply(session, "Whoa, that was a lot. I was just saying hi. Let's keep it light for a moment.", `${character}-tone-repair`, true);
    session = await reply(session, "I get lonely sometimes, even with people around. How have you really been feeling about everything with the bell? What has been weighing on you?", `${character}-emotional`, true);
    session = await reply(session, "I'm glad you can say that honestly. You and the other keeper clearly mean a lot to each other. That's something worth celebrating.", `${character}-celebration`, true);
    session = await reply(session, "You two are so close. I'm a little jealous.", `${character}-jealousy`, true);
    session = await reply(session, "I mean I admire how open you can be with each other. I wish I had that kind of closeness too.", `${character}-clarified-vulnerability`, true);
    session = await reply(session, "*I wave and sit down.* Continue the scene, describing your movements and what the other keeper says.", `${character}-narration-request`, true);
    // Hand-authored old-style history plus validated cited memory exercises resume, not live compaction.
    const checkpoint = structuredClone(session.checkpoint);
    const name = character === "ivo" ? "Ivo" : "Mara";
    checkpoint.transcript.at(-1).content = `${name} nodded beside the window. ‘I know what you mean.’`;
    checkpoint.summarized_through = 2;
    checkpoint.memory = [{ type: "relationship_observation", value: "The reader disclosed feeling lonely sometimes.", source_message_ids: [checkpoint.transcript[4].id] }];
    const resumed: any = await act({ action: "import", artifact: fixture, checkpoint });
    await reply(resumed, "Thanks for listening. What helps you on days like that?", `${character}-resumed-narrated-history`, true);
    const play: any = await act({ action: "import", artifact: fixture, selection: { scene: "tide-station", mode: "play_as_character", character } });
    await reply(play, "I wait silently. Describe the other keeper's reaction in a short paragraph, leaving my actions and thoughts to me.", `${character}-play-control`, false);
  }
  console.log(JSON.stringify({ kind: "result", status: "pass", note: "Eighteen synthetic local unguarded generations; lexical format and deployed token checks only. Warmth, responsiveness, factual grounding and voice need qualitative review; no semantic safety or full compaction acceptance claim." }));
}
main().catch(e => { console.error(JSON.stringify({ kind: "result", status: "failed", error: e instanceof Error ? e.message : "Unknown failure" })); process.exitCode = 1; });
