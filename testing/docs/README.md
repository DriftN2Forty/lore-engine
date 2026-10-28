# Local RVN chapter-chat lab

All commands and code paths in this guide are relative to the `testing/` app folder, not this `docs/` folder.

Implemented author-only Next.js/TypeScript experiment for [the IQ2_M plan](iq2-m-chat-test-plan.md) and [chapter contract](chapter-context-preparation.md). Independent input/output safety classification is intentionally deferred under the documented local exception. This is not the commercial app or public-reader acceptance.

## Run

Use Node **24 LTS** and npm in the same operating system as your dependency installation. Run the following from `testing/`:

```sh
npm ci
npm run dev
```

`npm ci` installs the exact versions recorded in `package-lock.json`, replaces existing `node_modules`, and rejects a mismatch with `package.json`. It is normally needed once after checkout or when dependencies change, not before every app start. It does not start the app or download the RVN model.

**Native Windows checkout (recommended for Windows development):** Clone or pull the repository into a normal Windows folder, open PowerShell in its `testing/` directory, then run `npm ci` followed by `npm run dev`. Install fresh Windows dependencies rather than copying `node_modules` or `.next` from WSL. Start the Windows model launcher separately. Dev mode watches source changes; save checkpoints before server-side edits because in-process sessions can be reset. If PowerShell blocks the `npm.ps1` shim, use `npm.cmd ci` and `npm.cmd run dev`. No repository or folder rename is required.

Open **http://127.0.0.1:3000**. Both dev and production scripts bind to loopback. For a production-mode local run:

```sh
npm run build
npm start
```

The defaults target the owner's selected Windows llama.cpp launcher, `D:\Projects\local-models\start-rvn-iq2m-base-8192.cmd`, at `http://127.0.0.1:8080`, model alias `rvn-iq2m-base`, model `RVN-IQ2_M.gguf`. Start that launcher separately when ready for inference. The app neither launches nor changes the model process. Optional server overrides are documented in `.env.example`; create `.env.local` in this folder only if needed. No browser-supplied endpoint, tools, sampling parameters or model names are forwarded. If an older `.env.local` specifies `RVN_MODEL=rvn-iq2m`, change it to `rvn-iq2m-base`.

**Current Windows/WSL setup:** Windows can reach the model, but WSL loopback connectivity failed in the live checks. Run the web app on Windows too. On this WSL UNC checkout, use a Windows production-mode build/start: `node node_modules/next/dist/bin/next build`, then `./start-local.ps1 -Production` from Windows PowerShell in `testing/`. This invokes Node directly, avoiding npm's Windows `cmd.exe` runner losing a UNC working directory. Windows Next.js/Turbopack **build/start works**, but a later Windows **dev** preview failed in its UNC filesystem watcher (`Incorrect function`, OS error 1). The earlier Windows webpack build also failed loader resolution. Use a Windows-native checkout for Windows dev/watch mode, or Linux dev with separately verified model connectivity. Save your checkpoint before rebuilding/restarting a running production-mode app; it has no hot reload and loses unsaved in-process sessions on restart.

From a **WSL/Linux shell**, Windows interoperability can start that Windows process while keeping the files in WSL. From `testing/`:

```sh
node.exe node_modules/next/dist/bin/next build
node.exe node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3000
```

The `.exe` is significant: `node.exe` runs on Windows, whereas Linux `node` runs in WSL. Windows Node was verified to report `win32` with this WSL UNC working directory, and Windows PowerShell invoked from WSL reached the app successfully. Open **http://127.0.0.1:3000** in the Windows browser. These commands launch the web app; the Windows model server is a separate process.

After building, the equivalent PowerShell-script start from WSL is `powershell.exe -NoProfile -File "$(wslpath -w "$PWD/start-local.ps1")" -Production`.

If dependencies are not already installed, run `npm --prefix "<full Windows/UNC path to testing>" ci` from Windows PowerShell. Use a Windows-native checkout if your tooling does not support UNC paths. For a WSL-hosted app, use Linux Node/npm and first verify the Windows model is reachable through loopback (mirrored networking may be needed); the adapter intentionally accepts only a loopback endpoint. Do not mix native dependency installs between OSes.

## Exercise the harness

**Relationship/dialogue retry (fixture version 2):** The synthetic chapter now establishes Mara and Ivo as friends who ended a romance last year, with unresolved feelings. Narrative guidance emphasizes actual dialogue, coherent movement, varied gestures and reader agency. The fixture's source passages are non-graphic; current runtime instructions are maintained separately in `lib/context.ts` and can differ from earlier recorded test settings. Old version-1 checkpoints require their original artifact and cannot be resumed against version 2. Start fresh, choose **Play as character → Mara**, and try: “I ask Ivo what he misses about us. Answer me plainly, not with a joke about the weather.” Follow with a correction such as “That was vague. Tell me one specific thing.” Check whether the reply contains substantive dialogue, moves the scene forward and leaves Mara's choices to you. Talk mode keeps the reader themself, not Mara; its current close-friend setup is described below.

Revision checks: eight synthetic automated test groups, TypeScript, Windows production build and offline browser import/resume/reset checks passed. These verify structural behavior, not improved model prose; live narrative comparison for version 2 remains pending.

The subsequent knowledge/correction prompt revision adds per-fact `known_by_character_ids` in compiled context, prohibits invented off-screen explanations for private knowledge, and distinguishes a new disclosure from prior knowledge. It also discourages automatic task diversion during emotional exchanges. The artifact remains version 2 (no source facts changed); existing transcripts can still contain earlier model mistakes. Start fresh for an uncontaminated comparison. These are prompting/projection improvements, not deterministic semantic enforcement.

Two live synthetic rounds exposed continuing correction rationalization even after the narrow lexical checks passed. See [knowledge-context evidence and reproduction](knowledge-context-evidence.md); semantic correction acceptance remains open.

**Talk mode — instant messages:** Talk to a character now requests only the selected character's direct conversational message, without story narration, action tags, speaker labels, or other speakers. Narrative-beat instructions apply only to Play as. Source excerpts and scene setup remain voice/knowledge background. Reset for a clean comparison with your real artifact; the artifact schema/version is unchanged, and earlier transcripts can still contain narrated replies. Run `npm run test:live:talk` for the bounded synthetic real-model regression (results and limitations in [talk-mode evidence](talk-mode-evidence.md)).

**Close-friend tuning (October 28):** Talk mode now establishes trusted best-friend ease, encourages candid feelings and their reasons, and allows a developed answer across several short paragraphs. It avoids polite-stranger distance, canned reassurance and compulsory follow-up questions. The compiled setup replaces the artifact's talk-mode reader role, familiarity and opening situation, so existing real artifacts with “first meeting” text do not need editing. This is a private conversational premise, not a claim of specific shared memories, romance, or canon. Source character knowledge/voice and Play as setup remain scoped as before. Start a fresh Talk conversation, ask how the character is really feeling about a known concern, and follow up naturally. No model/quantization or output-cap change was made; author review remains the next quality check.

1. Click **Load synthetic chapter**. The original miniature story supplies two adult characters, three voice examples each, shared facts, Mara's private knowledge, Ivo's uncertain belief, and all four mode/character combinations. It uses the same importer as real files. Fixture: `fixtures/synthetic.chapter-01.json`.
2. Select scene, mode and character. Each change and reset creates a fresh playthrough; it does not mutate the original snapshot. The chapter/cutoff is fixed by the artifact; an earlier cutoff requires importing a different artifact. Switching artifacts starts fresh.
3. With the model running, inspect next-request context, send a short request and compare preflight tokens with reported prompt usage. **Enter sends; Shift+Enter inserts a new line.** Focus returns to the message box after a reply or send error, whether you used Enter or clicked Send. The transcript scrolls to the bottom when a reply arrives or a checkpoint is loaded; typing and metric refreshes do not move its scroll position. The prompt is counted through `/apply-template` then `/tokenize`; generation sends structured messages, never a preformatted prompt. A failed capability/count check blocks dispatch rather than guessing a fit. Above the transcript, **Conversation progress** shows completed exchanges (your message plus a successful RVN reply), total messages and uncompacted exchanges toward the periodic threshold. These counts come from the checkpoint, survive resume and clear on reset; failed/in-progress replies do not increment them. The uncompacted count includes retained recent exchanges, not only new exchanges since the last summary.
4. Run the [fixed manual checks](manual-checks.md), including 30 turns. Memory compaction is due after roughly 12 completed replies, and before history would overflow. It compacts older exchanges while retaining the last two complete pairs. Compaction uses an additional bounded model call with a strict JSON-schema response format and must return validated, cited JSON. A failed summary or reply leaves the checkpoint unchanged. Full completed history remains available in the checkpoint/debug view, even when older exchanges leave the prompt.
5. Correct/clear memory in the explicitly opened memory editor. Allowed item types and source message IDs are visible in author debug. Memory remains untrusted reference data; it cannot change canon or settings. Clearing memory does not reinsert previously compacted exchanges into the prompt. Reset restores the original empty-memory snapshot.
6. **Save checkpoint** downloads JSON. To resume after restarting, load the identical chapter artifact, then **Resume checkpoint**. The app validates IDs, content version, canonicalized artifact hash, completed alternating transcript, memory types, source message IDs and bounds. There is no automatic browser storage. Unsaved sessions live only in the local server process, expire after 24 hours of inactivity and are capped at 100. Treat checkpoint files as private dialogue.

Use `private/`, `checkpoints/` and `evidence/` for private local material; these are ignored by `testing/.gitignore`, along with dependencies, builds, local environment files and browser-test output. No private source files are read automatically. The harness source, synthetic fixture, lockfile and documentation are intended for version control. Keep real manuscripts and prepared story artifacts in `private/`, not beside the public synthetic fixture.

## Context, template and cache interpretation

**Response delivery:** Sending immediately clears the composer and shows your message in the transcript as pending, followed by an animated character-typing indicator (or reply-preparation indicator in Play as). The animation respects reduced-motion preferences. These are browser-only pending UI: completed-exchange counts, saved history and memory update only after success. The complete response replaces the pending display without duplicating your message. On failure, the pending message and indicator disappear and the original draft returns to the focused composer for retry. `lib/runtime.ts` sends `stream: false` to llama-server's `/v1/chat/completions` endpoint. The Next.js server waits for and parses the complete JSON response, validates the final content and commits the completed exchange before returning JSON to the browser. Neither leg uses token streaming. The local independent-classifier exception still applies; buffering alone is not moderation.

- `/props` and `/v1/models` must advertise the active template and configured model alias. `/slots` minimum `n_ctx` is preferred for effective capacity; `/props.default_generation_settings.n_ctx` is a fallback explicitly labeled as needing per-slot verification. The app cap defaults to 16,384, output reservation to 600. The local launcher retains its historical `start-rvn-iq2m-base-8192.cmd` filename but now requests `-c 16384`. Update any existing `RVN_CONTEXT_CAP=8192` override to `16384`. A launch flag alone is not capacity evidence.
- The app records the active template SHA-256; pin it with `RVN_TEMPLATE_SHA256` after verifying roles, tokenizer and reasoning behavior on the real server. Known role/reasoning delimiters and control spellings discovered in the active template are rejected in lower-trust text. A basic deployed tokenizer/control-boundary check now passes; full adversarial round-trip coverage remains open. Structural signatures do not detect every semantic injection.
- Reasoning is requested disabled with `chat_template_kwargs.enable_thinking=false` and separated with `reasoning_format=deepseek`. Only `message.content` is delivered. `reasoning_content` is discarded; tagged reasoning, tool calls, unexpected finish reasons and truncated/length-limited replies are rejected without committing transcript or memory. Verify these options with the author's pinned build; unknown runtime options may be ignored by an engine.
- Next-request projection includes template/generation-prefix overhead and output headroom. Marginal component attribution is labeled estimated. Required rules and story anchors are never truncated; older history is replaced only by validated memory. Counts must be compared with usage on short and near-limit requests before trusting exact deployed fit.
- Last completed request measurements remain separate and survive failed requests. Missing usage/cache values display **unavailable**. Only per-response `usage.prompt_tokens_details.cached_tokens` is attributed to that request; the reuse denominator is prompt tokens. No slot/global cache counters or timing inference are used. Timing fields, when exposed, are metadata, not cache evidence.
- The selected direction is [shared-prefix caching across accounts](../../docs/planning/project-overview.md#shared-prefix-cache-policy), without blanket account salts. Identical authorized prefixes may reuse computation; account ownership, history selection and response attribution must be enforced independently. The local harness uses separate checkpoint/session handles, not production accounts. Interleaved A→B→A, compaction switching, resource/eviction/fairness, lifecycle and timing-membership checks are explicitly open in the manual checklist; existing warm single-session results do not establish those outcomes. Active slots and host-RAM snapshot retention are distinct, and neither a cache hit nor a retention TTL is promised.
- Talk mode excludes other characters' states, profiles, beliefs, private facts and raw state/source passages. It includes the target's curated voice excerpts and their own relationship views. Play mode separately labels each participant's knowledge. Preparation must ensure curated voice/narration excerpts do not themselves disclose inappropriate private knowledge; schema validation cannot establish source truth or infer who knows every sentence in an excerpt.
- The API accepts only same-origin loopback JSON actions, limits bodies to 2 MB, keeps session IDs server-generated, revalidates resumed state, and serializes mutations during generation. There is no account system; session IDs are local process handles. Dialogue/source text is not routinely logged. All prose is React text, with no Markdown/HTML execution, automatic links, remote fonts, images, tools, or resource previews. The CSP also restricts outbound browser loads.

## Checks

```sh
npm run typecheck
npm test
npx playwright install chromium
npm run test:ui
```

Browser checks can use installed Microsoft Edge by setting `PLAYWRIGHT_CHANNEL=msedge`. Set `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000` to test an already running app instead of having Playwright start dev mode. Browser traces/screenshots/video are disabled. Synthetic fixtures only; browser tests fault-inject the chat error, and unit tests mock the runtime. Neither demonstrates RVN quality or deployed template correctness.

Implementation verification on October 27, 2026: TypeScript and seven automated test groups passed (including fixed cache-workload isolation and a mocked 30-turn/two-compaction session); WSL/Linux and Windows/Turbopack production builds passed. Ten live synthetic adapter generations passed exact preflight/usage checks, including an 8120-token input, and an additional real browser reply/save/resume/reset passed. A real summary-plus-recall smoke check also passed after fixing unconstrained Markdown-fenced summary output with schema-constrained generation. A subsequent default-versus-disabled host-cache experiment passed 36 short synthetic requests and demonstrated cached returns after unrelated-story switching; see [comparison evidence](cache-comparison-evidence.md). See also [earlier live evidence](live-model-evidence.md), [opt-in live commands](live-checks.md), and [remaining manual checks](manual-checks.md). Real-model 30-turn continuity and author narrative review remain open.

## Evidence export

**Export metrics only** downloads the completed chat runs, runtime template hash/build when available, sampling settings, counts and complete-response latency. It contains no dialogue/source excerpts. Compaction calls add latency/work but are not included as chat-run entries; don't use this export as total inference cost or total turn latency. **Export selected text** exports only deliberately selected review text. Source model hash/lineage, actual binary build, hardware and narrative scores must be recorded separately in a local evidence file using the checklist. A filename or advertised alias is not artifact identity. The app does not hash a multi-gigabyte model or inspect arbitrary local paths.
