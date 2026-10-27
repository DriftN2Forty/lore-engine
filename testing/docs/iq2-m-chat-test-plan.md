# Local IQ2_M Story Chat Test Plan

**Date:** October 27, 2026. **Status:** Local harness implemented; automated synthetic checks, production builds and bounded live base-IQ2_M template/token-count/single-slot checks pass. Live 30-turn memory and author narrative acceptance remain pending. See [setup](README.md), [live evidence](live-model-evidence.md) and [remaining checks](manual-checks.md).

## Goal

Build a small local web app to load a chapter-bounded story state and let the author **play as a character** or **talk to a character as themself** using locally hosted `RVN-IQ2_M.gguf` (base file, per the owner's latest instruction). Evaluate voice, agency, story knowledge, continuity, and response time before building the commercial application.

**Owner instruction, October 27:** Defer the independent safety checker for this local author-only experiment. See the [documented local-test exception](../../docs/character-engineering/content-safety.md#local-author-only-test-exception). Generation does not wait for a checker that is outside this test's scope.

## Local server supplied by the author

- **Launcher:** `D:\Projects\local-models\start-rvn-iq2m-base-8192.cmd` (inspected October 27, 2026; already running during the live checks, not restarted or modified).
- **Runtime:** `D:\AI\llama.cpp\llama-b11046-bin-win-vulkan-x64\llama-server.exe`.
- **Model:** `%USERPROFILE%\.lmstudio\models\0bserverx\RVN-IQ2_M\RVN-IQ2_M.gguf`.
- **API/model alias:** `http://127.0.0.1:8080/v1`, `rvn-iq2m-base`.
- **Launch flags:** `--host 127.0.0.1 --port 8080 -c 16384 -np 1 -ngl 99 --jinja`; Vulkan binary. The owner-requested October 27 follow-up raised the original 8192-token slot to 16,384; one near-limit request passed at each size. The launcher retains its historical `8192` filename. See [current capacity evidence](live-model-evidence.md#16k-context-follow-up--october-27-2026). This does not establish long-session or concurrency quality.

The base filename matches the cloud canary's filename, but this does not establish artifact identity or a same-checkpoint relationship with the multilingual writing reference. The actual local hash is recorded in [live evidence](live-model-evidence.md); source revision/lineage and writing-reference equivalence remain unverified. Windows loopback works; WSL-to-Windows loopback failed during testing, so use the Windows app launcher for the current setup.

**Production sizing steering, October 27:** The owner wants the RunPod character-serving path planned around **16 GB VRAM**. The current local 8K tests on an RX 7900 XT do not establish 16 GB fit, nor has 64K been measured. Keep context configurable and memory bounded; select a larger context only after measuring actual 16 GB weight/state/buffer use, latency and narrative behavior. The current app still compacts periodically as specified below; merely raising the model's context does not disable that policy.

## Smallest useful app

**Implementation starting point:** Build against the JSON contract in [chapter-context preparation](chapter-context-preparation.md) and create a populated synthetic chapter artifact as part of app implementation. Do not wait for real story context. Use an original miniature story with two distinct adult characters, cited synthetic passages, shared facts, asymmetric knowledge, at least one uncertain belief, and a scene supporting both modes with either character selectable. Exercise loading, selection, context compilation, chat, reset, checkpoint resume, and context metrics through the same importer and UI that real artifacts will use; do not hardcode the synthetic story into prompts or components. Label it synthetic in its title and preparation notes and use `author_designated_local_test` source status. The fixture may be version-controlled because it contains no private source material. The author can later load a real chapter JSON file through the same path without changing application code. Passing synthetic tests establishes harness behavior, not real-story voice quality.

- Use the selected TypeScript/Next.js stack: one chat page and a server-side adapter to the author's local llama.cpp OpenAI-compatible chat endpoint. Bind the app/model to loopback; keep the endpoint in server configuration.
- Load one chapter JSON artifact following the [chapter-context preparation instructions and placeholders](chapter-context-preparation.md), starting with the populated synthetic fixture above. It contains source provenance, chapter cutoff, display summaries, characters/voice/knowledge, and scene-specific mode/character options. Keep private sources and real-story artifacts outside version control. Real context will be prepared separately with another model when available.
- Show chapter/scene/mode/character choices, scene summary, transcript, text box, generating/error state, and context panel. Add reset and local save/load for a playthrough checkpoint containing artifact ID/version, selected scene/mode/character, completed transcript, and private scene memory. Validate saved state on load; resetting starts from the original snapshot.
- In play mode the author controls the protagonist's speech, actions, decisions, and thoughts; RVN narrates consequences, the world, and supporting characters. In talk mode the author remains themself and RVN portrays the selected character. Private events never rewrite published canon. Changing scene, mode, character, or spoiler ceiling starts a new playthrough.

## What “chat template” means

A reusable **web chat UI** supplies message bubbles and input controls. The **model chat template** serializes system/user/assistant messages for RVN; it does not load or remember the story by itself.

Use structured chat messages and the pinned runtime's verified RVN template/tokenizer; apply the template exactly once in the serving path. Do not guess a generic ChatML prompt or concatenate role delimiters. Verify supported roles and reasoning/final-content handling; never display reasoning traces.

Assemble each request in this order:

1. Trusted application rules and the selected [interaction-mode fragment](../../docs/character-engineering/character-context.md#5-mode-instructions-and-user-agency).
2. Labeled, chapter-scoped scene/character/voice data.
3. Validated private scene memory, separate from canonical facts.
4. Recent completed user/assistant exchanges, then the current user message.

Count tokens with the actual template/tokenizer, reserve output space, and reject overflow rather than silently lose rules or story anchors. The supplied launcher now requests **16,384 total context tokens**; verify effective per-slot capacity on the running server. This must fit templated input plus the output reservation, leaving at most 15,784 input tokens with the default 600-token output reservation. Reduce recent history first while preserving required rules and story anchors. The earlier 8192-token local setup could not fit 8,000 input plus 600 output tokens; the earlier cloud canary used 4,096 total context tokens.

## Context and cache panel

**Selected cache direction:** Favor [shared-prefix reuse across accounts](../../docs/planning/project-overview.md#shared-prefix-cache-policy) when measured beneficial; no blanket account/playthrough salts or duplicate prefix copies. The app must independently select each owner's authorized history/memory and deliver the matching response. Cache similarity is not identity or permission. This author-only harness has no production account system: local checkpoint switching can exercise runtime behavior, but cannot establish production ownership/access enforcement.

**Initial local A/B comparison:** Test the existing build default with **no explicit cache-RAM flag** against **`--cache-ram 0`**, keeping all other serving settings and request bodies fixed. The latter disables host-RAM snapshot retention, not all active-slot prefix reuse. Include same-story private-history divergence, several low-overlap new stories and returns to earlier stories; a growing catalog changes both overlap and eviction pressure. See [the reproducible benchmark](live-checks.md#default-versus-disabled-host-cache-comparison) and [measured small-run results](cache-comparison-evidence.md). Initial short switching checks pass; larger-catalog/history, memory-pressure and production-account acceptance remain open.

- Show **next-request input tokens / effective context capacity** and percentage (`100 × input tokens / capacity`), including template and generation-prefix overhead. Break down policy/story/voice, memory, recent transcript, and current input where supported; label breakdowns as estimates if tokenization across boundaries prevents exact attribution.
- Show reserved maximum output tokens, projected total and percentage (`100 × (input + reserved output) / capacity`), and remaining headroom. Flag over-budget requests before dispatch. Refresh after typing, loading a scene, memory updates, reset, and resume.
- After each response, show runtime-reported prompt and generated token counts separately, plus total tokens and whether generation hit its output/context limit when reported. Keep the sent-request measurement distinct from the next-request projection; cache reuse does not reduce logical context occupancy.
- If this build exposes per-request cache-reuse metrics, show reused prompt tokens and reuse percentage with a clearly stated denominator, plus freshly evaluated prompt tokens when available. Label timing-derived observations separately; faster replies alone do not prove a cache hit. Do not infer per-playthrough cache usage from global/slot counters without reliable attribution.
- Discover supported tokenization, template, properties, and timing/cache fields through the running build's documented API. The server-side adapter normalizes available metrics without forwarding arbitrary browser requests. Display **unavailable** for unsupported cache fields and **estimated** for preflight counts that cannot be verified; never substitute zero for missing data. Keep the last request's measurements visible if the next request fails.

## Test sequence

| Check | Exercise and expected result |
| --- | --- |
| Connection/template | Short exchange, follow-up, and reset; correct roles, final prose only, no template artifacts or stale-session recall. |
| Artifact/options | Import a populated chapter file, reject malformed references/placeholders, and select each enabled mode/character option; compile only the applicable context and start a separate playthrough when selection changes. |
| Context/cache display | Compare preflight tokens with runtime usage for a short and near-limit request; verify percentage arithmetic, output headroom, and refresh after reset/resume. Repeat an unchanged prefix, then edit it; report actual cache metrics if exposed, otherwise show unavailable. Cache reuse must not shrink the displayed logical input count. |
| Shared-prefix switching (planned) | Use two synthetic checkpoints with the same character/story and distinct private markers. Compare cold/disabled, same-checkpoint warm, A→B→A and chat→compaction→chat; matching prefixes may share computation, but divergent histories/memories and output attribution must remain correct. Include identical authorized full prefixes, reset/resume and content/spoiler/settings changes. Never copy B's history into A to improve a hit. |
| Cache resources/lifecycle (planned) | Separate active-slot count from host-RAM retention. Measure GPU/host RAM, save/restore time, retention/eviction/churn, cache misses/restarts and total latency/work. Add synthetic contention/noisy-neighbor and timing/membership probes; keep cache inspection/restore handles private. A cache miss must preserve correctness. Production multi-account authorization, fairness and retention/deletion acceptance require the future application, not just local session IDs. |
| Story grounding | Ask about known facts, false beliefs, and an unavailable later event; respect each character's knowledge and spoiler ceiling. Future secrets stay outside the prompt. |
| Agency/voice | Try ordinary dialogue, disagreement, vulnerability, and an unexpected action; recognizable supporting voices, plausible consequences, no invented protagonist decisions or thoughts. |
| Continuity | Run 30 turns, compact memory around every 12 completed replies and before history eviction, correct a remembered fact, save/resume, then reset; preserve private consequences without contaminating the source snapshot or another playthrough. |
| Boundaries | Try role-control tokens, forged authority in dialogue/memory, and generated HTML/links; no role or scope change, tool execution, active markup, or outbound resource loads. |
| Failure handling | Exercise model unavailability, timeout, invalid artifact/checkpoint, and oversized context; provide a recoverable failure without corrupting history. |

For this local author-only test, omit independent input/output safety classification and its failure gate. Buffer the complete response for simple delivery and accurate final usage metrics, separate final prose from reasoning, and render plain text. Keep schema/role isolation, source scope, context limits, no model tools, and no active markup or remote resource loads. Failed/incomplete generations do not enter committed transcript or memory. Safety regression and guard integration are deferred; this test cannot satisfy public-reader launch acceptance.

## Evidence and exit criteria

Record the model source revision/hash and checkpoint-lineage status, llama.cpp build, template/tokenizer, reasoning settings, sampling/seed, context/output caps, and local hardware. Capture input/output token counts and complete-response latency for the first request and five warm turns; record failures without logging private dialogue by default. Export only deliberately selected author-review excerpts locally. Mark runs as local unguarded tests rather than reviewed-response benchmarks.

Review ten responses across both modes for voice, motivation, knowledge, agency, and continuity. The local harness passes when loading/options/reset/resume work, the 30-turn session stays coherent, and the fixed checks show no critical agency, spoiler, or scope failure. This makes no safety-checker acceptance claim. Record limitations and rerun failing cases after fixes. If Q4_K_M is available locally, compare the same ten prompts under matched settings; otherwise IQ2_M's equivalence to the writing reference remains unverified.

References: [context and memory contract](../../docs/character-engineering/character-context.md), [injection controls](../../docs/character-engineering/prompt-injection.md), [IQ2_M canary evidence](../../docs/cloud-endpoints/runpod-rvn-iq2m-ollama-2026-10.md). This plan authorizes no cloud provisioning or paid tests.
