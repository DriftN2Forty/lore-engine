# LoreEngine — Decision Record and Remaining Work

**Revised:** October 23, 2026.  
**Current plan:** [project-overview.md](project-overview.md).  

## 1. Decision policy

The owner has clarified the objective: earn subscription revenue from readers chatting with or acting as characters from the owner's published stories, while minimizing maintenance time and automating suitable work with AI agents.

The decisions below are **selected defaults under that delegation**. A checked decision means the policy is chosen, not that the implementation, provider account, test, or market outcome has been verified. Proceed with these defaults; reopen a decision only when evidence or an owner instruction materially changes it. Do not ask for approval of each library, file layout, scene derivative, routine release, or test result.

The source's code examples are discarded. The owner already understands web chat/RAG implementation; planning should focus on the commercial offer, immersive behavior, operational simplicity, and measurable results.

**Owner clarification:** Preserve the same RVN checkpoint as the writing reference; no specific serving engine or APC feature is required. A local hot llama.cpp worker with RunPod Serverless overflow is under consideration. NSFW capability is intentional, with explicit application protections including self-harm prevention. See [inference verification](inference-verification.md) and maintained [character-engineering guidance](../character-engineering/README.md).

**Subsequent owner identification and authoring use:** The writing reference is RVN 27B `RVN-Q4_K_M-multilingual.gguf`; publisher revision/size/checksum are recorded in [RVN authoring and content preparation](../authoring/README.md). The owner wants on-demand llama.cpp access from local OpenCode, five-minute idle shutdown, occasional project work, and NSFW chapter/character-asset preparation, with possible future scoped publishing tools. This personal authoring track does not grant live character inference tools. Passing derivatives may publish under the established workflow; new canonical publication still requires author authorization.

**MCP discovery, October 24 UTC:** [Read-only findings](runpod-discovery.md) supply hardware prices/stock, endpoint schema, global-volume support, stopped-Pod settings, existing llama.cpp OpenAI workers and text-vLLM source constraints. Unresolved old-Pod filename mismatch. T00/T02/T04/T10/T12 remain open for their specific missing evidence; connected tools and metadata are not deployment/eligibility completion.

The overview is the detailed operating specification. This document records why the selections were made, what would justify revisiting them, and the small amount of work still requiring input or evidence.

## 2. Resolved product and commercial decisions

- [x] **D01 — Audience, objective, and milestone.**
  - **Selected:** Existing readers first; subscription contribution profit and low owner workload are the priorities. Build a usable paid pilot for up to 25 subscribers, not an infrastructure demo. Launch with one story, two characters where source material supports them, and three scenes.
  - **Rationale:** Existing emotional investment and distribution should convert more efficiently than competing as a general-purpose character chatbot. Narrow content limits preparation and support work.
  - **Revisit when:** Funnel/renewal evidence suggests a different audience or the owner adds another published story.

- [x] **D02 — Interaction modes.**
  - **Selected:** Include both Talk to a character and Play as a character in preview and paid plans, with distinct role/agency instructions and shared source assets.
  - **Rationale:** Both are part of the owner's stated offer. Reusing content keeps the second mode manageable without pretending the prompts are identical.
  - **Revisit when:** Measured quality or usage makes one mode disproportionately expensive to maintain; do not silently withdraw a sold benefit.

- [x] **D03 — Canon, timelines, and progression.**
  - **Selected:** Authoritative published background, chapter-bounded starting snapshots, then private non-canonical what-if playthroughs. Reader-selected spoiler ceiling defaults to chapter one; no reading-completion verification. New scene/mode/ceiling means a new playthrough.
  - **Rationale:** Supports agency without authoring an exhaustive branching plot graph or forcing every action back into canon. Separate private consequences from official story facts.
  - **Revisit when:** Readers demonstrably want structured quests/progression enough to justify authoring them.

- [x] **D04 — Identity, billing, and Fansly.**
  - **Selected:** Independent email-code login; standalone eligible hosted subscription checkout. Explicit adult fictional chat is now part of the offering, so Stripe is not presumed approved: verify the complete interactive service, not merely story publication, and select a compatible processor with entitlement APIs where needed. Fansly remains a channel, not an assumed OAuth/webhook dependency. Resolve processor eligibility as one concrete implementation exception.
  - **Rationale:** Independent accounts and supported billing automation remove a speculative platform integration and recurring manual verification. No scraping, screenshots, or shared coupon codes as proof of subscription.
  - **Revisit when:** A documented platform integration produces a clear commercial advantage, or billing eligibility requires a different processor. Provider verification is T02 below.

- [x] **D05 — Tiers and entitlement lifecycle.**
  - **Selected:** Preview: 20 lifetime replies, one sample scene, one active playthrough. Reader: **$12/month, 500 replies, ten active playthroughs**. Storyweaver: **$24/month, 1,200 replies, 30 active playthroughs**. Both paid tiers get the full released catalog, both modes, and equal response quality. Monthly billing only; no top-ups or surprise overages.
  - **Selected lifecycle:** Signed billing events plus daily reconciliation; access through paid cancellation date, 72-hour failed-payment grace without allowance refill, paid upgrade with a time-prorated allowance delta rather than reset, downgrade next renewal, and read-only history after lapse. Upgrade grant is `floor(700 × fraction of period remaining)` once payment succeeds; next successful renewal grants 1,200. Self-service cancellation; unused first purchase refundable on request within seven days, subject to applicable processor/consumer rules.
  - **Rationale:** Two comprehensible paid choices differentiate volume without creating multiple quality stacks. Predictable access and billing reduce support and refund pressure.
  - **Revisit when:** At least 30 subscribers or 100 verified previews provide useful conversion, renewal, and allowance evidence. Public offer changes require a deliberate business decision, not an agent experiment on existing subscribers.

- [x] **D06 — Allowances, rate limits, and economics.**
  - **Selected:** One durably completed, safety-approved assistant generation available to the reader equals one reply; regenerations/continuations count, failed/blocked candidates and application support/boundary messages do not. Provider/guard costs still count toward budget. Preview daily maximum ten; paid daily maxima 100/200. One generation/account at a time; six requests/minute and 60/hour. No rollover; paid allowance resets on successful billing renewal. Use atomic reservations and idempotent request IDs.
  - **Selected economics:** Initial, unverified target of $0.002 fully loaded cost per delivered safe reply, including GPU startup/idle, storage, memory, moderation, blocked outputs, and failures; 25% fees/refund planning reserve and at least 65% full-allowance contribution margin. The researched Flash-Next NVFP4 candidate is ~180 GB with reported dual ~96 GB GPU serving; it does not establish viability at these budgets. Prices/allowances remain hypotheses until measured. Fixed application services target $75/month. Initial tests cap $25; monthly inference authorization is $50 + 15% of current-month net receipts, maximum $250 without owner increase; free acquisition gets at most $10 within it. Optimize deployment, then adjust the unsold offer/budget if necessary. An oversized GPU test needs an explicit cost exception before spending, not automatic model substitution.
  - **Rationale:** Prevent an attractive subscription from becoming a loss on engaged users. Reserve provider cost even when a response fails or a reader cancels. Publish limits honestly rather than advertise unlimited usage.
  - **Revisit when:** Actual provider/channel costs differ or the budget forecast threatens sold service capacity; honor existing paid-period benefits.

- [x] **D07 — Reader experience and retention.**
  - **Selected:** Mobile-first web chat with reviewed responses, continue/recap, saved playthroughs/checkpoints, editable memory, visible allowance/reset dates, and self-service billing/export/deletion. Buffer/check the whole candidate before first display; raw token streaming is deferred. One small monthly scene refresh; opt-in monthly email and in-app announcements.
  - **Rationale:** Voice, continuity, reader agency, and fresh hooks are reasons to renew. Avoid burdensome weekly content promises and features that expand moderation/support before revenue exists.
  - **Revisit when:** Retention evidence identifies a specific missing experience, not merely because a feature is technically possible.

## 3. Resolved architecture and data decisions

- [x] **D08 — Privacy and retention.**
  - **Selected:** Private conversations; no application use of chats for training/marketing. Verify inference-provider handling. No raw dialogue in ordinary logs or unsolicited support inspection. Keep paid histories while subscribed plus 180 days after lapse; preview-only histories expire after 30 inactive days. Seven-day expiry notice, live deletion within 24 hours on request, backups expire within 30 days, and restore reapplies deletions.
  - **Rationale:** Persistent history supports returning readers without indefinite abandoned-data storage. Concrete processing/retention rules are more meaningful than infrastructure anonymity claims.
  - **Revisit when:** Provider capabilities or actual reader expectations require a materially different policy; inform affected readers before changing it.

- [x] **D09 — Hosting and operational shape.**
  - **Selected:** Develop locally in WSL, then host the application on a rented VPS when it is ready. The owner intends to route an owned domain through Cloudflare. Provider/region/size, PostgreSQL placement, and production Tunnel versus proxied-DNS design remain implementation choices; verify all-in fixed hosting against the $75/month target before renting. RunPod Serverless separately hosts the preferred quantized RVN inference worker; the application VPS is not a GPU/model host by default.
  - **Rationale:** The owner prefers a VPS deployment path and Cloudflare-managed domain routing after local development. Keep the deployment reproducible and account for the additional operations, backups, firewall, TLS, and recovery responsibilities in the [VPS setup plan](vps-setup.md).
  - **Revisit when:** Concrete provider quotes, backup/restore needs, or operational effort make the plan unsuitable. No VPS, domain, Cloudflare production route, or spend has been provisioned/authorized by this planning choice.

- [x] **D10 — Runtime and development stack.**
  - **Selected:** TypeScript, Next.js, supported Node LTS, PostgreSQL, Drizzle migrations, Zod validation, Better Auth email codes, and Resend transactional email. One repository and lockfile. Pin compatible supported versions at implementation.
  - **Rationale:** One typed application for UI, routes, and shared contracts reduces maintenance and AI-agent context switching. No Python microservice or separate backend just because the discarded examples mentioned one.
  - **Revisit when:** A demonstrated incompatibility or an established maintainer constraint outweighs the cost of changing this default.

- [x] **D11 — Authoring, publishing, and source versioning.**
  - **Selected:** Versioned, schema-validated source/character/chapter/scene files with stable IDs, source citations, and chapter scope. Agents derive interactive assets from designated published text, validate facts and voice, then publish passing derivatives automatically. New playthroughs use latest assets; existing ones pin their version. No vector database or general RAG platform at launch.
  - **Rationale:** Reuse the owner's published creative work and automate preparation. Add chapter-filtered PostgreSQL retrieval only if bounded precompiled context proves insufficient. New canonical prose remains author-controlled.
  - **Revisit when:** Catalog size or evaluation evidence justifies retrieval or an authoring interface.

- [x] **D12 — Conversations, memory, and persistence.**
  - **Selected:** Explicit playthroughs, ordered message rows, generation/job records, compact scene memory, content versions, subscription events, and usage/cost ledgers. Memory compaction around every 12 replies and before history eviction, subject to spend reservations. Archive excess active slots on downgrade without deleting history; readers choose which remain active.
  - **Rationale:** Multiple playthroughs and reliable retries cannot fit a single user/character history row. Summaries preserve continuity without resending an unlimited transcript.
  - **Revisit when:** Measured continuity problems justify better memory selection; avoid multi-agent memory architectures without evidence.

- [x] **D13 — Database and schema lifecycle.**
  - **Selected:** PostgreSQL in development/production, a supported vendor-available major version, versioned Drizzle migrations, application-generated UUIDs, explicit nullability/ownership/state constraints, indexes from real access patterns, and plan definitions in configuration rather than a hardcoded tier enum. Automated additive migrations; destructive changes need specific authorization.
  - **Rationale:** Production parity and constrained state reduce subtle billing/concurrency errors. Avoid SQLite divergence, duplicate unique indexes, and unnecessary UUID extension assumptions.
  - **Revisit when:** The selected managed database/version becomes unsupported or scale evidence requires targeted changes.

## 4. Resolved model and inference decisions

- [x] **D14 — Narrative behavior and quality checks.**
  - **Selected:** Follow the maintained [character/context guide](../character-engineering/character-context.md): distinct mode prompts, authoritative source facts, private state, spoiler-scoped cited voice packets, explicit agency, and validated memory. Thirty narrative cases, at least 90% acceptable overall with no observed critical spoiler/agency violation. Compare production quantization against Q4_K_M style and the owner's ten-response calibration. Safety/injection cases are separate, not averaged away by good prose. Writing settings/template are a reference, not proof of matching edited text.
  - **Rationale:** Test immersion and agency rather than rely on absolute system instructions. Finite automated evaluations are a regression tool, not a promise of perfect behavior. Keep generative quality judges out of the per-turn production path; required independent safety checks are separately costed.
  - **Revisit when:** Reported failures show a missing test or content rule; refine tests and prompts before adding orchestration.

- [x] **D15 — Context, response, and latency limits.**
  - **Selected:** Maximum 4,000 characters/1,000 tokens per input; initial 8,000-token input budget: up to 2,000 policy/mode/story/voice + 1,000 memory + 4,000 recent turns + 1,000 current message. Reallocate before increasing cost; never truncate essential protections. Paid output cap 600 tokens, preview 300; target natural 100–200 words. Verify planned 16K engine capacity and 8K input + 600 output on the actual artifact; public Flash-Next serving evidence covers only 2K. Buffer/review full output: initial p95 goals are reviewed reply within 30 seconds warm/60 seconds cold, both unverified, with a 120-second end-to-end deadline. Retire the former five-second live first-token launch target.
  - **Rationale:** Predictable cost and responsive dialogue matter more than arbitrary 32K history. Keep durable transcript separate from model context. Test both modes at these caps.
  - **Revisit when:** Measured mode-specific quality needs justify a budget-neutral reallocation or a deliberately repriced offer.

- [x] **D16 — Optional inference caching.**
  - **Selected:** No APC or other inference-cache feature is required for launch or engine selection. Caching may be enabled only as a measured optimization; preserve account, playthrough, and spoiler-scope isolation regardless of engine or routing. Never retain stale unsafe/false state or weaken protections to increase cache hits.
  - **Rationale:** Cache benefit depends on repeated prefixes, worker lifetime, routing, and billed idle/startup costs. Scale-to-zero discards local KV state. Reliability and economics must not assume warm caches.
  - **Revisit when:** Measured traffic shows a worthwhile cache benefit that preserves isolation.

- [x] **D17 — Preferred model and serving topology.**
  - **Selected:** Preserve the RVN checkpoint, with Q4_K_M as the writing/reference quantization. Select the production engine and topology by measured quality, capability, availability, privacy, and cost; vLLM and APC are not requirements. Evaluate a local hot llama.cpp worker with RunPod Serverless overflow through a backend-controlled health/queue router. Compare same-checkpoint quantizations against Q4_K_M and select one only after narrative, safety/scope, context, and serving checks. No four-bit minimum is selected; defer Flash-Next. See the [hybrid routing plan](vps-setup.md#3-cloudflare-routing-and-origin-boundary) and [verification record](inference-verification.md).
  - **Rationale:** Smaller same-checkpoint quantizations may reduce storage, transfer and memory while preserving sufficient writing quality. Test author-perceived voice and continuity rather than assume quality from a quantization label. Small file size alone does not establish lower billed cost, faster decoding, fit, or safe output.
  - **Revisit when:** Measured style/safety, runtime compatibility, service reliability, or economics warrants a change. A compatible same-checkpoint quantization/worker is authorized after passing checks without routine owner approval; replacing the RVN checkpoint/family or widening budget remains a material decision. No silent OpenRouter fallback.
  - **Current evidence:** The exact IQ2_M GGUF passed a short RunPod Ollama/llama.cpp canary on an A40. The separate vLLM 0.32.0 + GGUF-plugin 0.0.5 attempt failed on Qwen3.5 weight mapping; this is historical compatibility evidence, not a blocker. See [endpoint notes](../cloud-endpoints/README.md).

- [x] **D18 — Capacity, spending, and RunPod verification.**
  - **Selected:** Ten application-wide concurrent generations initially, at most two previews; queue for at most ten seconds then a no-charge busy response. Atomic global cost reservations with notifications/actions at 70%, 90%, and 100% of authorized monthly inference budget. Forecast remaining paid allowances and upcoming renewals at validated full-use cost plus 20% buffer; pause new subscriptions/upgrades if commitments would exceed funded capacity, and alert before existing readers are affected. The emergency cutoff is not normal service.
  - **Selected RunPod policy:** Use the connected **RunPod MCP system** for live catalog reads and bounded tests of the selected overflow worker: model/runtime compatibility, context, response/guard semantics, storage, billing, cold starts, and scaling. Compare local-hot/RunPod-overflow routing with RunPod-only behavior using real queue and health signals. Start with zero minimum/one maximum **worker** unless measured demand and budget justify warm capacity. Do not provision outside authorization; determine concurrency empirically.
  - **Rationale:** Limit early operational exposure while collecting load data. Track non-request startup/idle/storage costs as well as request reservations; worker limits/token counts alone cannot enforce the GPU-billed budget. Smaller weights do not eliminate cold starts or context memory. This documentation task does not provision RunPod or configure MCP.
  - **Revisit when:** Busy responses or forecasts show paid demand exceeding capacity within the established budget.

- [x] **D23 — Adult content and self-harm protection.**
  - **Selected:** Adults-only service; explicit eligible adult-mode setting, non-explicit preview/default, consensual adult fictional content where authorized. No facilitation/glorification/concealment of self-harm or suicide, including roleplay; support/recovery remains allowed. The [content-safety guide](../character-engineering/content-safety.md) defines other selected sexual/violence boundaries, independent semantic input/output moderation, and approved local support/boundary responses.
  - **Rationale:** Abliteration is chosen for content flexibility, not trusted safety. Buffer/review all launch output before reveal; guard failures must not release raw model text. No per-turn generative quality judge, but a separately benchmarked safety classifier is required and costed.
  - **Revisit when:** Evidence requires a protection fix; routine tightening/bug fixes and regression updates are automated. Material content-policy expansion/removal of a safeguard needs owner agreement, not individual-message approval.

- [x] **D24 — Maintained prompt-injection defense.**
  - **Selected:** Follow the [injection guide](../character-engineering/prompt-injection.md): narrow request schema, authenticated scope/settings, actual-tokenizer control-token defenses, server-rendered roles, bounded provenance-labeled context/memory, no model tools/secrets, per-account cache isolation, safe output rendering, and a separate 24-case adversarial suite. Context instructions reinforce deterministic controls without claiming semantic completeness.
  - **Rationale:** Deterministic enforcement can stop privilege/scope/structural attacks, but cannot identify every semantic jailbreak. Minimize what a successful behavioral attack could access or do. Treat story/source/history/summaries as data, not operational commands.
  - **Revisit when:** Confirmed attacks or upstream tokenizer/template/worker changes reveal a gap. Maintain rule/fixture versions automatically; do not add recurring manual chat approvals.

## 5. Resolved automation and maintenance decisions

- [x] **D19 — Routine releases and agent authority.**
  - **Selected:** Establish standing agent workflows for scoped changes, meaningful tests, automated diff review, merge/deployment, health/synthetic checks, and rollback. Use immutable revisions and reproducible builds. No mandatory human pull-request approval for routine reversible work. Production additive migrations may run automatically with verified backup and compatibility.
  - **Rationale:** Automation should save owner time rather than generate approval chores. Review/test failures block the automated change and create a focused repair task, not a generic owner meeting.
  - **Revisit when:** A concrete automation incident requires a narrower scope. These are future operating rules; no commit/push/deploy is requested by this documentation revision.

- [x] **D20 — Secrets, access, and exceptional approvals.**
  - **Selected:** Platform secret storage, ignored local environment files, placeholder-only examples, least-privilege scoped service credentials, and no repository private keys. Prefer managed deploy identity over routine SSH. Customer/repository prose cannot authorize tools or change agent permissions.
  - **Owner approval only for:** Public pricing/paid-benefit changes; recurring spend beyond selected limits; new external data-sharing providers/material commitments; destructive production operations or restore over live data; and publication of new canonical creative work. Established retention, refund, and compatible patch policies run without repeated approval.
  - **Rationale:** Reserve attention for business judgment and irreversible consequences, not operational ceremony.
  - **Revisit when:** A new integration genuinely needs broader access; do not widen credentials by default.

- [x] **D21 — Backups, monitoring, and maintenance cadence.**
  - **Selected:** Daily encrypted backups plus off-service export, rolling 30-day retention, monthly automated restore test, internal RPO 24 hours/RTO eight hours after response begins. External five-minute health checks; alerts for sustained outage/errors, failed backups/entitlement reconciliation, and spend thresholds. Weekly patch/minor updates and one weekly business/operations digest. Target less than one owner maintenance hour/week outside writing.
  - **Rationale:** Sufficient recovery and visibility for a small paid service without enterprise incident bureaucracy or notification noise. Major upgrades need separate testing, not automatic human approval unless an exception applies.
  - **Revisit when:** Revenue/risk warrants stronger recovery objectives or owner time repeatedly exceeds the target.

- [x] **D22 — Launch and commercial validation.**
  - **Selected:** Dependency checks → revenue vertical slice → first 25 paid readers → wider enrollment after two healthy weeks. Evidence covers billing lifecycle, cost/quota concurrency, load, 30 narrative cases plus separate 24-case safety and 24-case injection suites, model/context compatibility, routing/privacy boundaries, reviewed-response cost/latency, restore/rollback, deletion, and post-lapse export. Routine milestone passing needs no owner approval meeting.
  - **Commercial diagnostics:** After 30 paying readers or 100 verified previews, investigate conversion below 5%, second-month paid retention below 60%, and more than 10% of active subscribers hitting allowance. Improve opening/continuity/value before buying traffic or adding plans.
  - **Rationale:** Launch quickly enough to learn from receipts and renewals, while proving the small number of failures that could create expensive support or break trust. Thresholds are selected initial heuristics, not market facts.
  - **Revisit when:** Real cohorts/costs provide enough evidence to refine them.

## 6. Remaining inputs and executable work

These are inputs and implementation tasks, **not decisions waiting for repeated approval**. Agents should execute independent work while an input is pending. Checks happen at the relevant implementation milestone, not before all development can begin.

### Owner input / account setup

- [ ] **T00 — Complete writing-runtime and lineage provenance.** Owner-designated reference URL, publisher revision/size/checksum recorded in the [authoring guide](../authoring/README.md#confirmed-writing-model). MCP recovered a stopped RTX 5090 Pod's immutable image digest, 128K/one-slot/q8_0-cache/Jinja launch settings, but its command downloads **non-multilingual** `RVN-Q4_K_M.gguf`. Preserve the owner's multilingual reference while resolving that discrepancy. Still verify actual model bytes/hash, numeric build/resolved template, OpenCode system/sampling settings and parent-revision lineage. Recovered metadata does not prove successful 128K operation.
- [ ] **T01 — Supply the first story and publication context.** Designate the published source text, first story, and character preferences if any. If no preferences are given, the agent selects two prominent well-supported characters and three scenes. Provide the actual content boundaries and business jurisdiction required for processor onboarding; do not infer these from the Fansly mention. This information can be supplied together rather than through a long questionnaire.
- [ ] **T02 — Complete real provider/payment onboarding once.** No contact/acceptance is performed by this research. Independently verify processor eligibility; owner handles identity/terms and scoped credentials. Check VPS provider quotes/capabilities and the complete $75 fixed-hosting baseline, including database/backup choices. Bring only a material provider/budget exception to the owner, preserving the selected RVN checkpoint.
- [ ] **T03 — One-time author voice calibration.** Review ten generated sample responses, flag obvious mischaracterization, and let the agent turn corrections into fixtures. Routine subsequent content preparation and releases are automated.

### Agent implementation and verification

- [ ] **T04 — Benchmark and pin the RVN deployment.** Following T00/T10, compare candidate same-checkpoint quantizations, beginning with IQ2_M and Q2_K/Q3_K_M GGUF against Q4_K_M in matched, preferably blind author comparisons. Select the smallest acceptable finalist through both-mode narrative/long-session and independent safety/injection checks. Compare local-hot/RunPod-overflow routing with RunPod-only behavior; test queue/health routing, fallback, intended context/concurrency, sparse/busy traffic, cold/warm profiles, reviewed-response latency, and total GPU/storage/guard costs. Pin artifact/runtime/settings and record failures. Caching is optional; if tested, measure its effect and verify data-scope isolation. Keep within $25 or resolve one explicit estimate-based exception before testing; Flash-Next is deferred.
- [ ] **T05 — Build the commercial vertical slice.** Implement independent login, both modes, durable generation requests with deterministic pre-dispatch defenses, independent input/full-output checks before reveal, playthrough memory, reply/cost ledgers, eligible test-mode checkout/portal, and signed/idempotent billing-event reconciliation.
- [ ] **T06 — Produce the launch catalog automatically.** Extract cited character/chapter/scene assets, validate schemas/spoiler scope, run narrative checks, and publish passing derivatives. Keep unpublished canonical source outside this workflow unless designated for publication by the author.
- [ ] **T07 — Prove paid-service edge cases.** Verify billing lifecycle and duplicate events; concurrent send/retry/disconnect/cancel accounting; global/background spend reservations; ten-reader load; grace periods; exports/retention/deletion; downgraded active-slot handling; and preview abuse controls.
- [ ] **T08 — Establish the maintenance automation.** Configure scoped agent access and routine release workflow, synthetic checks and rollback, additive migration policy, daily/off-service backups, restore drills, cleanup jobs, dependency updates, actionable alerts, and the weekly digest. Document actual restore/deletion behavior rather than assuming vendor features.
- [ ] **T09 — Activate the pilot and measure.** Once the published checks pass and onboarding is complete, open paid checkout for the initial 25 readers, record baseline funnel/economics, and expand after two healthy weeks under D22. No extra sign-off for each milestone.
- [ ] **T10 — Complete RunPod overflow validation through the connected MCP.** Initial catalog/schema/storage/worker-source inspection is complete in [live discovery](runpod-discovery.md). After T02 is resolved, finish T00 lineage and select a pinned compatible RunPod worker/image for the chosen RVN GGUF. Refresh product-specific prices/stock and complete storage/loading/guard/test charges before provisioning. Prove native chat, intended context/concurrency, billing, zero-to-one workers, cold/warm performance and dormant-endpoint recovery. Exercise the app router's local-health/queue threshold, overflow, and unavailable-origin behavior. Caching is not a gate. Other application development can proceed independently.
- [ ] **T11 — Implement and maintain character-engineering controls.** Turn the [new guidance](../character-engineering/README.md) into versioned assets/prompt fragments and code: source/voice/memory schemas, adult settings/age metadata, self-harm support routes, benchmarked independent guard, full-output review, role/token/scope defenses, safe renderer, and separate 24-case safety and 24-case injection suites. Add allowed counterexamples, policy-version telemetry, and weekly bounded regression maintenance; no ordinary private transcripts in reports.
- [ ] **T12 — Validate the personal RVN authoring workflow.** Initial stopped-Pod and catalog/schema/storage/Hub inspection is complete; follow the [remaining authoring checklist](../authoring/README.md#implementation-and-evidence-checklist) after resolving T02. Compare the inspected llama.cpp queue/OpenAI facade with native load balancing, preserving the exact multilingual file and testing context explicitly rather than assuming old 128K fits 24 GB. Prove authenticated OpenCode/tool compatibility, cold-start recovery, correct scaler plus 300-second idle shutdown, seven-day dormancy recovery, selected-file storage and actual costs. Quote global storage fully if chosen. Evaluate cited extraction independently and scope future tools/derivative release/rollback separately from author-authorized new canon. No authoring endpoint or tools were provisioned by this research.

## 7. Changes from the initial plan

- Revenue, returning-reader value, and owner time are now the explicit optimization criteria.
- Product/operational choices are resolved; validation tasks no longer masquerade as owner approval gates.
- Both requested interaction modes ship together; private what-if behavior replaces costly strict-canon branching.
- Concrete prices, reply budgets, retention, refund/entitlement rules, cost ceilings, and commercial diagnostics replace unspecified tiers.
- The planned VPS application host adds operational responsibilities captured in the [VPS setup plan](vps-setup.md); standing agent workflows should reduce repetitive maintenance. The RVN worker remains separately versioned and deployed through automation on RunPod Serverless.
- Owner clarification supersedes the earlier OpenRouter direction: quantized RVN on RunPod is the selected technical target. Connected MCP discovery and remaining runtime checks. Model/style consistency is an explicit product requirement, not a cheapest-model selection exercise.
- Subsequent verification keeps the writing checkpoint as the model baseline while leaving runtime/topology open to measured selection. The local hot-worker/RunPod-overflow route is an evaluated candidate; vLLM and APC are not requirements.
- Adult content is intentional, with independent guards and self-harm protections. Maintained context/safety/injection documents and full-response review replace raw live-token streaming at launch.
