# LoreEngine — Decisions and Suggestion Review

**Status:** All decisions open. Recommendations are proposals, not approvals.  
**Overview:** [Project overview](project-overview.md).  
**Source:** [Gemini conversation summary](gemini-conversation.md).

## How to use this document

Work through the checklist in priority order. Check an item only when its decision is recorded; add the selected option, rationale, date, and any validation evidence beneath it. Then update the overview to match. A decision can deliberately defer a feature.

The review below assesses the supplied summary, not the full original conversation. Provider/API/model capabilities have not been independently verified. Where evidence is missing, verification is part of the decision rather than an assumed fact.

## 1. Product and feasibility decisions — resolve first

- [ ] **D01 — Define the audience, value proposition, and first milestone.**
  - **Issue:** The source jumps to infrastructure without explaining the reader journey or whether this is a prototype or a launchable product.
  - **Options:** Backend proof of concept; private reader pilot; public reader-facing release.
  - **Recommendation:** Describe a single reader session and choose a narrow pilot scope. Establish whether the audience is existing Fansly followers or a broader readership. Use one character/chapter/timeline initially.
  - **Done when:** Intended reader, core interaction, first-release scope, and explicit success criteria are written down.
  - **Resolution:** _Open._

- [ ] **D02 — Choose the first interaction mode.**
  - **Issue:** Companion roleplay and protagonist-driven narration require different behavior and quality evaluation.
  - **Options:** Companion only; mirror protagonist only; both at launch.
  - **Recommendation:** Pick one. Companion is the simpler continuation of the character-chat premise; choose mirror protagonist if interactive narration is the actual differentiator. Define who controls actions and whether the model may narrate for the reader.
  - **Done when:** A short example conversation establishes the reader/model roles and acceptable output style.
  - **Resolution:** _Open._

- [ ] **D03 — Define canon, alternate timelines, and progression.**
  - **Issue:** The source combines strict canon with user actions and alternate timelines without specifying what can change or who unlocks chapters.
  - **Options:** Fixed chapter sandbox; controlled branching; freeform alternate universe. Progression can be reader-selected, entitlement-gated, or application-controlled.
  - **Recommendation:** Begin with a fixed chapter sandbox and explicit application-owned progression. Add branching only when its rules and content-authoring burden are justified.
  - **Done when:** Allowed deviations, spoiler boundaries, chapter unlocks, resets, and effects of switching mode/timeline are specified.
  - **Resolution:** _Open._

- [ ] **D04 — Verify Fansly integration and select identity/access mechanisms.**
  - **Issue:** OAuth2, session validation, tier APIs, and webhooks are asserted without documentation or proof of access.
  - **Options:** Supported platform login and entitlement integration if available; independent login with a separately validated entitlement link; a deliberately limited/manual pilot access process.
  - **Recommendation:** Verify official capabilities, developer access, permitted use, identity fields, token lifecycle, and event delivery/authenticity mechanisms before building around Fansly. If a required capability is unavailable, revise the access model before implementation.
  - **Done when:** Documentation or a working integration spike demonstrates the required flow, or an alternative access model is selected. Record the evidence.
  - **Resolution:** _Open._

- [ ] **D05 — Define tiers, benefits, and entitlement freshness.**
  - **Issue:** `free`, `subscriber_tier_1`, and `subscriber_tier_2` have no defined behavior; a stored tier can become stale.
  - **Options:** A fixed small tier set; configurable plans; a simpler pilot allowlist. Synchronization may use verified events, supported polling, or reconciliation.
  - **Recommendation:** Define actual benefits first, then model them. Record external entitlement identity/status and freshness. Specify cancellation, expiry, upgrades, and what happens during synchronization outages. If events are used, handle duplicates and out-of-order delivery.
  - **Done when:** An access matrix and synchronization/reconciliation rules exist; confirm whether billing remains entirely on the external platform.
  - **Resolution:** _Open._

- [ ] **D06 — Define usage limits and charging semantics.**
  - **Issue:** Fifty free messages, an unused `last_message_at`, and a rate-limiter placeholder do not define a quota system or a cost ceiling.
  - **Options:** One-time allowance; periodic message allowance; token/credit budget; combinations with request-size limits.
  - **Recommendation:** Select a reader-friendly allowance with input/output/context caps. Use atomic reservation and reconciliation; define reset times, concurrent sends, retries, failed jobs, cancellation, and idempotency. Separate throttling from quota accounting.
  - **Done when:** The allowance rules and example success/failure/duplicate-request charges are unambiguous and support a cost estimate.
  - **Resolution:** _Open._

- [ ] **D07 — Choose the reader interface and delivery experience.**
  - **Issue:** The source specifies backend routes but no way for readers to use them or receive long-running results.
  - **Options:** Minimal web chat; an existing external interface where integration is supported; backend-only prototype. Results can stream or use queued job/status responses.
  - **Recommendation:** Use a minimal web interface for a reader pilot. Verify the inference provider's actual delivery contract before selecting streaming. Include loading, retry, error, resume, and reset behavior.
  - **Done when:** The first end-to-end reader flow and response-delivery contract are defined.
  - **Resolution:** _Open._

## 2. Architecture and data decisions

- [ ] **D08 — Define privacy and data lifecycle requirements.**
  - **Issue:** “Anonymous” infrastructure is presented as a property without a defined requirement; external inference necessarily processes the submitted context.
  - **Options:** Minimized stored identity/history; persistent history with a defined retention period; stronger isolation/self-hosted inference if requirements justify its cost.
  - **Recommendation:** Specify what must be private and from whom. Map identity data, prompts, messages, logs, provider retention, backups, access, and deletion. Store only needed external account fields. Evaluate provider claims against those requirements.
  - **Done when:** Data locations, access, retention/deletion behavior, and acceptable provider handling are documented.
  - **Resolution:** _Open._

- [ ] **D09 — Choose application and database hosting.**
  - **Issue:** A monolith plus same-host PostgreSQL is economical but creates a shared failure domain and operating responsibilities.
  - **Options:** VPS with local PostgreSQL; VPS with managed PostgreSQL; managed application hosting and database.
  - **Recommendation:** Keep the modular monolith. Choose hosting based on budget and maintenance appetite; evaluate Njalla/BuyVM as candidates rather than assumptions. Define TLS termination, resource needs, region, backup destination, and recovery expectations.
  - **Done when:** A hosting choice, monthly baseline estimate, ownership of operations, and recovery targets are recorded.
  - **Resolution:** _Open._

- [ ] **D10 — Select runtime and repository structure.**
  - **Issue:** JavaScript examples, Express/FastAPI alternatives, and Node/Python deployment commands are mixed together.
  - **Options:** Node.js with an appropriate web framework; Python with FastAPI; another stack justified by maintainer experience.
  - **Recommendation:** Pick one runtime and lockfile/toolchain. Node.js is the smallest departure from the examples. Structure modules around auth, integrations, stories, conversations, inference, migrations, and operations; choose JavaScript versus TypeScript explicitly if using Node.
  - **Done when:** The runtime/framework, dependency workflow, and minimal source layout are agreed.
  - **Resolution:** _Open._

- [ ] **D11 — Select story authoring, validation, and versioning rules.**
  - **Issue:** Static JSON is workable, but its schema, publishing process, and effect on active conversations are absent.
  - **Options:** Versioned validated files; database-managed content; an authoring interface later.
  - **Recommendation:** Start with schema-validated files and stable IDs. Use allowlisted lookups, not untrusted dynamic paths. Version content and decide whether active conversations pin their original version or migrate. Distinguish factual constraints from prose instructions.
  - **Done when:** Content schema, validation/publishing workflow, identifier rules, and revision behavior are defined.
  - **Resolution:** _Open._

- [ ] **D12 — Select conversation and progress persistence.**
  - **Issue:** One row per user/character conflates history, playthrough, chapter, and timeline; a growing JSONB array is difficult to update concurrently.
  - **Options:** Conversation and ordered message tables; bounded JSONB conversation documents; a hybrid with structured messages and JSONB metadata/summaries.
  - **Recommendation:** Explicit conversations plus ordered messages, separate progress as needed, and flexible metadata where useful. Define whether progress belongs to a reader, story, or playthrough, and whether readers may have parallel conversations. Record request/job states and provider references for recovery.
  - **Done when:** Entity boundaries, ownership, ordering, concurrency, reset, and deletion behavior are agreed.
  - **Resolution:** _Open._

- [ ] **D13 — Choose database version and migration workflow.**
  - **Issue:** The sample SQL lacks a migration lifecycle and sufficient invariants; SQLite is suggested despite PostgreSQL-specific enums, JSONB, and extensions.
  - **Options:** PostgreSQL in development and production; an explicitly supported multi-database design.
  - **Recommendation:** PostgreSQL throughout with versioned migrations. Choose UUID generation for the selected version. Add required `NOT NULL`, foreign-key, unique, and counter/state constraints; define `updated_at` handling and indexes from access patterns. Remove the duplicate unique-column index. Reconsider enum rigidity if plans change frequently.
  - **Done when:** Database version, migration tooling, schema invariants, and local setup approach are selected.
  - **Resolution:** _Open._

## 3. Model behavior and inference decisions

- [ ] **D14 — Define prompt behavior and quality acceptance.**
  - **Issue:** Absolute instructions cannot guarantee canon adherence, spoiler prevention, or immersion. The two perspectives assign different model roles.
  - **Options:** Prompt-only baseline; prompt plus explicit state controls and output checks; more elaborate narrative orchestration if evaluation demonstrates a need.
  - **Recommendation:** Start with deterministic prompts and application-owned state. Exclude future story material where possible; define in-world handling for out-of-scope requests. Evaluate character voice, agency, chapter knowledge, contradictions, and attempts to override instructions using representative conversations. Avoid blanket “never apologize/reveal constraints” wording as a substitute for behavior design.
  - **Done when:** Example acceptable/unacceptable responses and a small repeatable evaluation set exist.
  - **Resolution:** _Open._

- [ ] **D15 — Set context and history budgets.**
  - **Issue:** Indefinitely appending history conflicts with finite context and predictable cost; 32,768 tokens is arbitrary.
  - **Options:** Recent-turn window; recent turns plus summary; retrieval of selected memories if later warranted.
  - **Recommendation:** Begin with bounded recent history, adding summaries if continuity needs them. Allocate budgets for instructions, history, current input, and output. Preserve durable history separately according to retention policy; evaluate summary drift and lost story facts.
  - **Done when:** Context/output caps, overflow behavior, continuity expectations, and cost implications are documented.
  - **Resolution:** _Open._

- [ ] **D16 — Decide whether prefix caching is an initial optimization.**
  - **Issue:** Static-first ordering is sensible, but “100%,” “indefinitely,” and “FREE” are false guarantees. A JSONB history array does not itself improve GPU prefix-cache reuse.
  - **Options:** Correct baseline without relying on cache; measured caching optimization; worker-routing/affinity work later if supported and worthwhile.
  - **Recommendation:** Use deterministic static-first prompts where appropriate. Verify the deployed engine/template/cache configuration and measure hit rate, prefill latency, and cost under representative warm and cold traffic. Do not base economics on perfect reuse.
  - **Done when:** Caching is either deferred or justified by measured benefit with known limitations.
  - **Resolution:** _Open._

- [ ] **D17 — Choose a model and inference provider from evidence.**
  - **Issue:** The exact model repository, quantization, suitability, and RunPod/vLLM compatibility are unverified.
  - **Options:** RunPod Serverless/vLLM; managed model API; dedicated GPU deployment.
  - **Recommendation:** Benchmark a small shortlist against D14 and D15. Verify model availability, revision, license, supported chat template, quantization, memory fit, provider content compatibility, and data handling. Confirm the actual request envelope, job lifecycle, authentication, timeouts, and streaming support. Use a provider adapter rather than assuming a messages array is the full API request.
  - **Done when:** A working inference spike and a quality/latency/cost comparison justify a selected model/provider pair.
  - **Resolution:** _Open._

- [ ] **D18 — Set tested worker, storage, scaling, and budget configuration.**
  - **Issue:** The proposed image, GPU pool, storage path, flags, scale limits, and queue delay are presented as universally valid.
  - **Options:** Scale-to-zero; one or more warm workers; dedicated capacity. Use provider-supported storage/caching appropriate to the chosen setup.
  - **Recommendation:** Pin tested image/model revisions. Verify actual hardware offerings rather than assuming L4/4090/3090 share the cited `ADA_24` pool. Benchmark weights plus KV-cache/concurrency memory, including cold model loading. Confirm volume availability, mount paths, region, permissions, and cost; `HF_HOME` alone does not attach storage. Set max workers, queue policy, request caps, and spending controls from measurements.
  - **Done when:** Cold/warm latency, concurrency, memory headroom, storage behavior, idle/active cost, and failure behavior have been measured against an agreed budget.
  - **Resolution:** _Open._

## 4. Delivery and release decisions

- [ ] **D19 — Choose deployment tooling and release semantics.**
  - **Issue:** The proposed scripts auto-commit everything, deploy a moving branch, install mutable dependencies, and claim health without checking it.
  - **Options:** Explicit manual release script; CI/CD release pipeline; container-based release workflow. Process management can use PM2, systemd, or a container supervisor.
  - **Recommendation:** Deploy an explicit revision using lockfile-based installation (for example, `npm ci --omit=dev` when appropriate, with build dependencies handled separately). Fail on errors, sequence migrations, check health, and define rollback. Separate application and inference-worker images. Keep commits as an intentional development step.
  - **Done when:** The release path, process supervision, health check, migration sequencing, and rollback procedure are demonstrated.
  - **Resolution:** _Open._

- [ ] **D20 — Choose secret storage and deployment access.**
  - **Issue:** A `.github/deploy-keys/` directory invites credential storage; the local SSH key and remote Git deploy key serve different purposes. Trust-on-first-use is not prior host verification.
  - **Options:** Local developer SSH workflow; CI-managed deployment secrets; platform-native deployment identity where available.
  - **Recommendation:** Keep credentials outside the repository. Use placeholder-only `.env.example`, an ignored local environment file or suitable secret store, scoped credentials, verified host identity, and a dedicated deployment account. Decide whether any OpenCode integration is actually useful before adding tool-specific configuration; the source's `.open-code/tools/` path is unverified.
  - **Done when:** Credential locations, access scope, host verification, replacement/revocation process, and invocation workflow are defined.
  - **Resolution:** _Open._

- [ ] **D21 — Define backups, observability, and operational ownership.**
  - **Issue:** A restart success message and disabled inference request logs do not establish service health, recoverability, or end-to-end privacy.
  - **Options:** Lightweight operational monitoring initially; managed monitoring/backup services when justified.
  - **Recommendation:** Track request failures, latency, usage/cost, queue depth, and entitlement-sync failures with identifiers rather than routine raw prompts. Set backup frequency/retention, use off-host backups, test restore, and assign responsibility for alerts and maintenance.
  - **Done when:** A restore has been demonstrated and key failure/cost signals have an owner and an action path.
  - **Resolution:** _Open._

- [ ] **D22 — Set validation gates before a reader release.**
  - **Issue:** The source asks an agent to scaffold immediately, before resolving dependencies or defining success.
  - **Options:** Prototype first with explicitly disposable assumptions; dependency spikes followed by a vertical slice; full implementation after requirements approval.
  - **Recommendation:** Resolve D01–D07, prove platform/inference dependencies, then build one end-to-end slice. Set explicit acceptable latency, per-session cost, story quality, access enforcement, and recovery outcomes. Replace the source's initialization prompt with instructions reflecting the decisions actually made.
  - **Done when:** Evidence shows the thin slice meets the agreed criteria and unresolved issues have explicit defer/block decisions.
  - **Resolution:** _Open._

## 5. Source suggestion evaluation

This table covers the distinct proposals in the source, including details that should be corrected rather than carried forward. Line ranges refer to the supplied `gemini-conversation.md`.

| Source lines | Suggestion | Evaluation and recommended treatment | Decisions |
| --- | --- | --- | --- |
| 1–4 | LoreEngine/custom platform; privacy-first monolith, local PostgreSQL, RunPod | Useful working concept. Keep the monolith as a candidate; privacy, hosting, and inference choices need independent requirements and evidence. | D01, D08–D09, D17 |
| 4, 21–26, 52–60, 196–200 | Fansly OAuth2, session validation, tier webhooks, callback routes | Unverified dependency. Route names and sample code cannot establish API availability or access rights. Verify login, token/session handling, entitlement delivery, and event authenticity before implementation. | D04–D05 |
| 8–38 | Initialize the exact directory tree | A reasonable sketch of responsibilities, not a binding architecture. Missing migrations, conversation/inference lifecycle, interface, and operational concerns. Choose the runtime first and organize accordingly. | D07, D10, D12–D13, D19 |
| 12–14 | `.github/deploy-keys/` for credentials | Reject repository storage of deployment credentials, including raw or casually encrypted private keys. Store secrets outside the repository with scoped access. | D20 |
| 14–16, 135–153 | `.open-code/tools/deploy.sh` invoked by OpenCode | Optional convenience, not a product requirement; do not assume this path is recognized. A normal release command is sufficient unless agent integration is deliberately selected. | D19–D20 |
| 18–23, 37 | Database pool, inference client, auth/rate-limit modules, `.env.example` | Useful separation. Use one selected SDK or HTTP client, placeholders only in the example environment, and distinguish authorization, throttling, and quota accounting. Pool sizing/timeouts depend on deployment. | D04, D06, D10, D17, D20 |
| 25–27 | OAuth callback, webhook, and `/api/chat/message` routes | Reasonable route responsibilities if dependencies exist. Actual contracts also need input validation, request IDs, retry handling, job/stream delivery, and authorization. | D04–D07, D17 |
| 28–34 | Static character and chapter JSON; canon/what-if files | Good small-project starting point. Add schemas, stable IDs, versioning, and explicit lookup/transition rules; branching is a product choice. | D03, D11 |
| 35 | Optional Dockerfile baking AWQ model into a worker | Conditional optimization. Model-baked images may avoid some downloads but increase image size/build/distribution cost and still require cold-start measurement. Keep worker packaging separate from the application. | D17–D19 |
| 36, 38 | Server deployment script and `package.json` | Sensible only once the runtime/deployment workflow is chosen. `package.json` presumes Node; Python needs its own reproducible dependency tooling. | D10, D19 |
| 44–50 | “Anonymous” PostgreSQL, UUID extension, tier enum | PostgreSQL is suitable; it does not confer anonymity. Choose UUID generation for the actual version. A fixed enum is acceptable for truly fixed plans but awkward for changing benefits. | D05, D08, D13 |
| 52–62 | Fansly-linked users, mandatory username, local tier, 50 messages, timestamps, extra ID index | Revise. Store only necessary external fields; define account linking, entitlement freshness, quota/reset behavior, and timestamp semantics. Add counter constraints. The extra Fansly-ID index duplicates the unique constraint's index. | D04–D06, D08, D13 |
| 64–74 | Progress row per user/character with chapter, timeline, and perspective | Useful state categories, but names are weak identifiers and one row may forbid desired parallel playthroughs. Ownership fields need appropriate non-null constraints; modes/transitions need validation and update rules. | D02–D03, D11–D13 |
| 76–84 | JSONB chat array, unique user/character, called “stateless chat storage” | Durable history is stateful even if workers are stateless. Prefer conversation/message entities for concurrency and multiple sessions. JSONB remains useful for metadata or bounded snapshots. Storage format does not establish prefix-cache effectiveness. | D12–D13, D16 |
| 90–98 | Payload compiler and dynamic `require` of chapter files | Centralizing context construction is a strong idea. Replace arbitrary path construction with validated lookups; account for content validation, module caching/reloads, and pinned revisions. | D11, D14 |
| 99–105 | Companion and mirror-protagonist instructions | Both are plausible but substantially different products. Define agency and role expectations; avoid mixing “you are the character” with “you narrate everything else.” | D02, D14 |
| 107–122 | One system block with profile, prose style, setting, condition, knowledge constraints | Good baseline organization, subject to the selected model's template. Separate facts from behavior rules and use consistent serialization. Application rules must own authoritative state. | D11, D14, D17 |
| 113–121 | Absolute canon/spoiler rules, no apologies or disclosure of constraints | Revise. Instructions are fallible, especially if later events are in model knowledge. Define practical in-world behavior and evaluate it; avoid treating tone instructions as enforcement. | D03, D14 |
| 91–93, 124–129 | Static-first “ChatML” messages with 100% prefix reuse, indefinitely free system context | Keep static-first construction when appropriate; reject guarantees. A message array is not universally ChatML or the full worker API envelope. Cache reuse depends on tokens, templates, routing, eviction, and worker lifetime; cache consumes resources. | D16–D17 |
| 127–129 | Append all history linearly | Reject unbounded context growth. Keep bounded model context and select a continuity strategy independently of durable storage. | D08, D15 |
| 135–147 | Agent stages all files, auto-commits, and pushes `main` during deployment | Reject as the default release workflow. It can include unintended files and makes deployment mutate source history. Commit intentionally and deploy a reviewed, explicit revision. | D19–D20 |
| 148–153 | SSH with an agent key, `accept-new`, admin account, hidden VPS | SSH is reasonable; hidden/anonymity claims are unsupported. Verify host identity, scope deployment credentials, and use a dedicated deployment account. The final success message needs actual health verification. | D08, D19–D20 |
| 158–169 | Remote `git pull`, production `npm install`, or interchangeable `pip install` | Revise. Use a known revision, fail on errors, select one runtime, install reproducibly, and handle builds/migrations. A mutable checkout and unpinned install do not define a reproducible release. | D10, D13, D19 |
| 171–175 | PM2 restart/fallback start as isolation, clean swap, and proof of health | PM2 is a viable Node supervisor, not a security isolation boundary or health check. Restart may interrupt requests. Choose supervision and demonstrate startup, readiness, failure handling, and rollback. | D19, D21 |
| 181–187 | `runpod/serverless-vllm:latest` or community container; exact model and AWQ flags | Unverified. Pin a tested image/model revision, confirm availability and engine compatibility, and validate the supported worker configuration interface rather than copying arguments. | D17–D18 |
| 184 | `ADA_24` allegedly groups L4, RTX 4090, RTX 3090 | Do not rely on this grouping. Verify current provider pool IDs, actual hardware, regional availability, price, and memory/performance. Nominal VRAM alone is insufficient. | D18 |
| 186 | `HF_HOME=/workspace/huggingface` forces use of a Global Network Volume | Incorrect as a guarantee. It selects a cache directory; a compatible volume must separately be provisioned, attached, mounted, and accessible. Confirm provider storage support and cold-load behavior. | D18 |
| 187 | `--quantization awq`, `--enable-prefix-caching`, `--max-model-len 32768` | Conditional settings. Verify model quantization format, kernel/hardware support, memory needs, concurrency, and context requirements on the selected engine version. | D15–D18 |
| 187 | `--disable-log-requests` | Potentially useful for reducing one source of prompt logging, if supported. Does not cover proxy/application/provider logs, error traces, or retention. Retain privacy-conscious operational signals. | D08, D18, D21 |
| 189–191 | Minimum zero, maximum ten workers | Scale-to-zero trades idle savings for cold-start latency. Ten workers is arbitrary and may be costly; worker count alone is not a spending cap. Choose measured limits and budget controls. | D18 |
| 192 | Two-second queue delay guarantees shared warm GPU memory/continuous batching | Reject the guarantee. Queue policy influences scaling; batching/cache reuse depend on the actual workers and routing. Measure delay, throughput, and cold starts under load. | D16, D18 |
| 196–200 | Immediately scaffold SQLite/PostgreSQL, Express/FastAPI, placeholders, webhooks, RunPod, and `.env` | Keep the idea of a small scaffold after decisions. Resolve stack and external dependencies first. Prefer production-parity PostgreSQL over accidental SQLite divergence; placeholder routes do not prove integration. Secrets need handling beyond merely using `.env`. | D04, D10, D13, D17, D20, D22 |

## 6. Gaps identified during review

These are additions from this review, not claims that the source specified them:

- Reader-facing UX and synchronous/streaming/queued response delivery (**D07**).
- Account lifecycle, entitlement expiry/reconciliation, and integration failure handling (**D04–D05**).
- Conversation/playthrough boundaries, concurrent sends, request idempotency, and failure-aware metering (**D06, D12**).
- Content validation, revision pinning, authoring/publishing workflow, and quality evaluation (**D11, D14**).
- Finite context budgets and real per-session unit economics (**D15, D17–D18**).
- Repeatable migrations/releases, recovery, backups, and operational ownership (**D13, D19–D21**).
- Evidence-based acceptance criteria before scaffolding expands into a full implementation (**D22**).
