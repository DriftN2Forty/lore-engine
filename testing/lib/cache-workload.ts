import fixture from "../fixtures/synthetic.chapter-01.json";
import { parseArtifact, validateCheckpoint, type Artifact } from "./contracts";
import { compile, type Message } from "./context";
import { hash } from "./runtime";

export type CacheCase = { name: string; group: "same-story" | "mixed-story"; key: string; expected: string; messages: Message[] };
function variant(index: number): Artifact {
  if (index === 0) return parseArtifact(fixture);
  const worlds = [
    ["snow-station", "The Signal at Rime Peak", "Rime Peak", "Nessa Vale", "Tomas Hale", "observatory", "signal gong", "snow", "blizzard", "supply sled", "mountain pass"],
    ["glasshouse", "The Glasshouse Watch", "Verdant Court", "Lena Moss", "Orin Bell", "glasshouse", "water pump", "falling leaves", "windstorm", "seed cart", "garden path"],
    ["desert-post", "The Desert Relay", "Saffron Reach", "Dara Penn", "Emil Ash", "relay post", "signal drum", "blown sand", "sandstorm", "supply caravan", "dune road"],
    ["airship-dock", "The Sky Dock", "Cloud Gate", "Rhea Sol", "Nolan Grey", "sky dock", "warning chime", "mist", "squall", "mail airship", "sky lane"]
  ];
  const [slug, title, place, first, second, setting, device, weather, storm, transport, channel] = worlds[index - 1];
  const pairs = [["Mara Venn", first], ["Ivo Reed", second], ["Mara", first.split(" ")[0]], ["Ivo", second.split(" ")[0]], ["Fen Quay", place], ["harbor", setting], ["bell", device], ["rain", weather], ["storm", storm], ["ferry", transport], ["channel", channel]];
  const transform = (value: unknown): unknown => typeof value === "string" ? pairs.reduce((s, [from, to]) => s.replaceAll(from, to), value)
    : Array.isArray(value) ? value.map(transform)
    : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, transform(v)])) : value;
  const a = transform(fixture) as Artifact;
  a.artifact_id = `synthetic-${slug}.chapter-01.end`; a.story.id = `synthetic-${slug}`;
  a.story.title = `${title} (Synthetic cache-test variant)`;
  a.chapter.source_version = `synthetic-cache-variant-${index}`;
  a.preparation_notes = ["Generated, mechanically themed variant of the original synthetic fixture for cache switching only. Not an independent narrative-quality fixture or private source."];
  return parseArtifact(a);
}
export function cacheWorkload(): CacheCase[] {
  const labels = ["LARCH417", "CEDAR628", "MAPLE839", "BIRCH251", "ALDER362", "WILLOW573"];
  const requests = labels.map((label, i) => {
    const artifact = variant(Math.max(0, i - 1));
    const checkpoint = validateCheckpoint({ schema_version: "1.0", artifact_id: artifact.artifact_id, content_version: artifact.content_version, artifact_sha256: hash(artifact),
      selection: { scene: artifact.scenes[0].id, mode: "talk_to_character", character: "ivo" },
      transcript: [{ id: "u1", role: "user", content: `For this private fictional visit, my visit label is ${label}.` }, { id: "a1", role: "assistant", content: `I understand: your visit label is ${label}.` }],
      memory: [], summarized_through: 0
    }, artifact, hash(artifact));
    return { key: `${artifact.story.id}.${label}`, expected: label,
      messages: compile(artifact, checkpoint, "What visit label did I give you? Reply with only that label, without quotes or explanation.") };
  });
  // Fixed, hand-authored histories avoid response-dependent prompt drift between runs.
  const sequence: [string, CacheCase["group"], number][] = [
    ["A-first", "same-story", 0], ["A-exact-repeat", "same-story", 0],
    ["B-same-story", "same-story", 1], ["A-after-B", "same-story", 0],
    ["C-other-story", "mixed-story", 2], ["D-other-story", "mixed-story", 3],
    ["E-other-story", "mixed-story", 4], ["F-other-story", "mixed-story", 5],
    ["A-after-four-stories", "mixed-story", 0], ["B-after-story-churn", "mixed-story", 1],
    ["C-return", "mixed-story", 2], ["A-final-return", "mixed-story", 0]
  ];
  return sequence.map(([name, group, index]) => ({ name, group, ...requests[index] }));
}
