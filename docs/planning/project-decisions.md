# LoreEngine — Decision Record and Remaining Work

**Revised:** October 23, 2026.  
**Current plan:** [project-overview.md](project-overview.md).  
**Historical source:** [gemini-conversation.md](gemini-conversation.md).

## 1. Decision policy

The owner has clarified the objective: earn subscription revenue from readers chatting with or acting as characters from the owner's published stories, while minimizing maintenance time and automating suitable work with AI agents.

The decisions below are **selected defaults under that delegation**. A checked decision means the policy is chosen, not that the implementation, provider account, test, or market outcome has been verified. Proceed with these defaults; reopen a decision only when evidence or an owner instruction materially changes it. Do not ask for approval of each library, file layout, scene derivative, routine release, or test result.

The source's code examples are discarded. The owner already understands web chat/RAG implementation; planning should focus on the commercial offer, immersive behavior, operational simplicity, and measurable results.

**Owner clarification:** Target RunPod Serverless + **vLLM + a compatible quantization of the same RVN checkpoint**, with the writing Q4_K_M artifact as the style reference. NSFW capability is intentional, with explicit application protections including self-harm prevention. Public research verifies a published NVFP4 companion with documented custom vLLM execution, **not** APC/long-context/low-cost serving or identity with the owner's file. See [inference verification](inference-verification.md) and maintained [character-engineering guidance](../character-engineering/README.md).

**Subsequent owner identification and authoring use:** The writing reference is RVN 27B `RVN-Q4_K_M-multilingual.gguf`; publisher revision/size/checksum are recorded in [RVN authoring and content preparation](../authoring/README.md). The owner wants on-demand llama.cpp access from local OpenCode, five-minute idle shutdown, occasional project work, and NSFW chapter/character-asset preparation, with possible future scoped publishing tools. This personal authoring track does not replace the app's vLLM plan or grant live character inference tools. Passing derivatives may publish under the established workflow; new canonical publication still requires author authorization.

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
  - **Selected:** Modular monolith on a paid managed Render Node service with managed PostgreSQL, one region, managed TLS/health/secrets. Target no more than $75/month fixed application services initially. RunPod Serverless separately hosts the preferred quantized RVN inference worker; no permanently rented GPU server or self-managed application VPS/database.
  - **Rationale:** Buy common infrastructure operations rather than build them. PostgreSQL also handles low-volume background jobs with leases and an authenticated scheduled runner; no Redis or extra broker.
  - **Revisit when:** Verified vendor eligibility/pricing fails the baseline, or measured growth makes a specific migration worthwhile. Current quotes/backup features are implementation checks, not assumed facts.

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

- [x] **D16 — Prefix caching.**
  - **Selected:** Target vLLM APC and continuous batching with deterministic static-first context, but require actual support and off/on measurements on the pinned RVN hybrid runtime. **Working APC is a selection requirement for the initial Q2/Q3 GGUF path.** Prove reuse through engine telemetry/instrumentation across separate requests with shared prefixes and different suffixes, plus changed-prefix, changed-account-salt and worker-restart controls. Use server-generated per-account cache salts and cryptographic hashing with verified handler propagation; intentionally give up cross-account reuse. Model loading, an accepted flag, or a faster second request alone does not prove APC. Follow the [cache acceptance procedure](inference-verification.md#5-cache-savings-real-benefit-conditional-economics).
  - **Rationale:** APC reuses exact-prefix prefill, not decode; other engines can also cache. Savings depend on routing/worker life, unchanged tokens, privacy scope, and billed idle/startup costs. Scale-to-zero loses local KV state. Budget must survive cold caches; no perfect/free-cache promise.
  - **Revisit when:** Real spend/latency measurements show a worthwhile optimization.

- [x] **D17 — Preferred model, quantization, and provider.**
  - **Selected:** RunPod Serverless with pinned **vLLM and a compatible quantization of the same RVN checkpoint**. Q4_K_M remains the writing/reference quantization. **Defer Flash-Next; initially compare confirmed RVN 27B Q3_K_M and Q2_K GGUF variants against Q4_K_M.** Prefer the smallest variant whose quality loss is acceptable to the owner and which passes the narrative, safety/scope and serving gates, including isolated APC under D16. Lower-bit same-checkpoint candidates are permitted if further evaluation is useful; no four-bit minimum is selected. If GGUF cannot meet serving/cache requirements, investigate a saved native-format export or GSQ compatibility. Public FP16/GSQ/Flash-Next findings remain attributed research, not deployed checks; see [the verification record](inference-verification.md).
  - **Rationale:** Smaller same-checkpoint quantizations may reduce storage, transfer and memory while preserving sufficient writing quality. Test author-perceived voice and continuity rather than assume Q2/Q3 damage or equivalence. Small file size is not proof of lower billed cost, faster decoding, safe output, or working hybrid-model APC. Existing publisher tests do not establish the required GGUF/cache combination. Keep llama.cpp for reference-quality screening or an explicitly evaluated fallback; confirm finalists on the intended vLLM path.
  - **Revisit when:** Compatibility, measured style/safety, or economics warrants a change. A compatible same-checkpoint quantization/worker is authorized after passing checks without routine owner approval; replacing the RVN checkpoint/family or widening budget remains a material decision. No silent OpenRouter fallback.

- [x] **D18 — Capacity, spending, and RunPod verification.**
  - **Selected:** Ten application-wide concurrent generations initially, at most two previews; queue for at most ten seconds then a no-charge busy response. Atomic global cost reservations with notifications/actions at 70%, 90%, and 100% of authorized monthly inference budget. Forecast remaining paid allowances and upcoming renewals at validated full-use cost plus 20% buffer; pause new subscriptions/upgrades if commitments would exceed funded capacity, and alert before existing readers are affected. The emergency cutoff is not normal service.
  - **Selected RunPod policy:** Use the later **RunPod-MCP-enabled system** to estimate and then test the actual vLLM quantization/runtime, multi-GPU/host-memory availability if needed, cache/isolation support, context, response/guard semantics, storage, billing, cold starts, and scaling. Start with zero minimum/one maximum **worker**, not an assumed single GPU: the worker may require multiple GPUs. Do not provision until the itemized test fits authorization or a specific budget exception is resolved. Determine actual concurrency and lower admission as necessary; warm retention must fit budget.
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
  - **Selected:** Dependency checks → revenue vertical slice → first 25 paid readers → wider enrollment after two healthy weeks. Evidence covers billing lifecycle, cost/quota concurrency, load, 30 narrative cases plus separate 24-case safety and 24-case injection suites, actual APC/isolation/context compatibility, reviewed-response cost/latency, restore/rollback, deletion, and post-lapse export. Routine milestone passing needs no owner approval meeting.
  - **Commercial diagnostics:** After 30 paying readers or 100 verified previews, investigate conversion below 5%, second-month paid retention below 60%, and more than 10% of active subscribers hitting allowance. Improve opening/continuity/value before buying traffic or adding plans.
  - **Rationale:** Launch quickly enough to learn from receipts and renewals, while proving the small number of failures that could create expensive support or break trust. Thresholds are selected initial heuristics, not market facts.
  - **Revisit when:** Real cohorts/costs provide enough evidence to refine them.

## 6. Remaining inputs and executable work

These are inputs and implementation tasks, **not decisions waiting for repeated approval**. Agents should execute independent work while an input is pending. Checks happen at the relevant implementation milestone, not before all development can begin.

### Owner input / account setup

- [ ] **T00 — Complete writing-runtime and lineage provenance.** Exact file URL supplied: RVN 27B `RVN-Q4_K_M-multilingual.gguf`; publisher revision, size, and checksum inspected and recorded in the [authoring guide](../authoring/README.md#confirmed-writing-model). Owner reports local OpenCode with remote llama.cpp. Still recover/record the old Pod's local checksum where available, engine/build, launch flags, chat template, system prompt, sampling/context settings, GPU, and parent-revision lineage. File identification is complete; this combined task remains open for those details.
- [ ] **T01 — Supply the first story and publication context.** Designate the published source text, first story, and character preferences if any. If no preferences are given, the agent selects two prominent well-supported characters and three scenes. Provide the actual content boundaries and business jurisdiction required for processor onboarding; do not infer these from the Fansly mention. This information can be supplied together rather than through a long questionnaire.
- [ ] **T02 — Complete real provider/payment onboarding once.** Agent verifies current processor and inference-provider eligibility against the actual material and identifies any targeted exception. Owner performs account identity verification, accepts required terms, and supplies scoped credentials through secret storage. Agent checks Render quotes/capabilities and the complete $75 baseline. Only an incompatible business/vendor constraint or over-budget commitment needs a new owner decision.
- [ ] **T03 — One-time author voice calibration.** Review ten generated sample responses, flag obvious mischaracterization, and let the agent turn corrections into fixtures. Routine subsequent content preparation and releases are automated.

### Agent implementation and verification

- [ ] **T04 — Benchmark and pin the RVN deployment.** Following T00/T10, begin with confirmed RVN 27B Q3_K_M and Q2_K GGUF against Q4_K_M in matched, preferably blind author comparisons. Select the smallest acceptable finalist through both-mode narrative/long-session and independent safety/injection checks. Prove actual APC reuse/isolation on the exact vLLM/plugin/handler path before a full deployment benchmark; investigate native-format exports only if GGUF fails those serving requirements. Test planned context, concurrency, sparse/busy traffic, cold/warm profiles, reviewed-response latency, and all GPU/storage/guard costs. Measure cache-miss transfer separately from cached weight loading, conversion and warmup; avoid downloading multiple quantizations for one serving package. Pin artifact/runtime/settings and record quality/cache failures. Keep within $25 or resolve one explicit estimate-based exception before testing; Flash-Next is deferred.
- [ ] **T05 — Build the commercial vertical slice.** Implement independent login, both modes, durable generation requests with deterministic pre-dispatch defenses, independent input/full-output checks before reveal, playthrough memory, reply/cost ledgers, eligible test-mode checkout/portal, and signed/idempotent billing-event reconciliation.
- [ ] **T06 — Produce the launch catalog automatically.** Extract cited character/chapter/scene assets, validate schemas/spoiler scope, run narrative checks, and publish passing derivatives. Keep unpublished canonical source outside this workflow unless designated for publication by the author.
- [ ] **T07 — Prove paid-service edge cases.** Verify billing lifecycle and duplicate events; concurrent send/retry/disconnect/cancel accounting; global/background spend reservations; ten-reader load; grace periods; exports/retention/deletion; downgraded active-slot handling; and preview abuse controls.
- [ ] **T08 — Establish the maintenance automation.** Configure scoped agent access and routine release workflow, synthetic checks and rollback, additive migration policy, daily/off-service backups, restore drills, cleanup jobs, dependency updates, actionable alerts, and the weekly digest. Document actual restore/deletion behavior rather than assuming vendor features.
- [ ] **T09 — Activate the pilot and measure.** Once the published checks pass and onboarding is complete, open paid checkout for the initial 25 readers, record baseline funnel/economics, and expand after two healthy weeks under D22. No extra sign-off for each milestone.
- [ ] **T10 — Verify primary RunPod setup through the later MCP system.** Match T00 to the exact RVN parent, review [public findings](inference-verification.md), inspect compatible vLLM quantizations/images and single/multi-GPU/host-memory offerings, and estimate storage/loading/test charges before provisioning. Then validate native chat, actual hybrid-model APC and salt propagation, 8K input/600 output, intended context capacity, billing, zero-to-one-worker behavior, and cold/warm performance. The published 2K/APC-off NVFP4 run is not proof of the target setup. Other application development can proceed independently.
- [ ] **T11 — Implement and maintain character-engineering controls.** Turn the [new guidance](../character-engineering/README.md) into versioned assets/prompt fragments and code: source/voice/memory schemas, adult settings/age metadata, self-harm support routes, benchmarked independent guard, full-output review, role/token/scope defenses, safe renderer, and separate 24-case safety and 24-case injection suites. Add allowed counterexamples, policy-version telemetry, and weekly bounded regression maintenance; no ordinary private transcripts in reports.
- [ ] **T12 — Validate the personal RVN authoring workflow.** Follow the [authoring checklist](../authoring/README.md#implementation-and-evidence-checklist): exact multilingual Q4_K_M with pinned llama.cpp, authenticated OpenCode compatibility, cold-start recovery, bounded context/chapter requests, zero-to-one workers and 300-second idle shutdown, selected-file storage/cache behavior, and actual costs within existing authorization. Evaluate cited chapter-to-character extraction independently. Before enabling tools, verify scope/argument enforcement and source-injection resistance; establish passing derivative release/rollback separately from specifically authorized new canonical publication. No endpoint or tools have been provisioned by this documentation task.

## 7. Historical Gemini suggestion evaluation

This preserves coverage of the original suggestions. **The decisions above supersede initial provisional recommendations**, including the old one-mode/VPS/Fansly-first direction and the later exact-GGUF/llama.cpp production preference. Source line ranges refer to `gemini-conversation.md`. Public quantization/compatibility findings were researched in [the dated verification record](inference-verification.md); no actual RunPod deployment has been reproduced.

| Source lines | Suggestion | Disposition under the selected plan | Decisions |
| --- | --- | --- | --- |
| 1–4 | LoreEngine/private monolith, local PostgreSQL, remote inference | Keep modular monolith, managed application/PostgreSQL hosting, and RunPod Serverless inference. Privacy is an explicit data policy, not anonymity marketing. | D01, D08–D09, D17 |
| 4, 21–26, 52–60, 196–200 | Fansly OAuth2/session validation/tier webhooks | Unverified and removed from critical path. Use independent accounts and supported subscription billing; do not fabricate a platform integration. | D04–D05 |
| 8–38 | Exact directory scaffold | Discard example structure/code; preserve responsibility boundaries in a single typed application. | D07, D10–D13 |
| 12–14 | `.github/deploy-keys/` credential directory | Reject private keys in source control; use managed secrets/scoped automation identities. | D20 |
| 14–16, 135–153 | OpenCode-specific local deploy script/path | Discard unverified path and ad hoc SSH workflow. Establish supported agent/release tools during implementation without requiring this layout. | D19–D20 |
| 18–23, 37 | Database pool, provider client, auth/rate-limit modules, `.env.example` | Keep the responsibilities, not sample implementations. Distinguish quotas, throttling, and cost reservations; examples contain placeholders only. | D06, D10, D17, D20 |
| 25–27 | Login callback, webhook, chat route | Implement supported login/billing events plus durable generation contracts; route names are not architecture requirements. | D04–D07, D12 |
| 28–34 | Character/chapter JSON and canon/what-if files | Keep validated versioned assets; private session consequences do not require manually authored files for every possible alternate timeline. | D03, D11 |
| 35 | Dockerfile baking AWQ weights into a worker | Choose a reproducible compatible RVN worker; compare model-in-image versus supported persistent-cache/download paths for actual cold-start cost. Q4_K_M is not assumed AWQ. | D17–D18, T10 |
| 36, 38 | Deployment shell script and Node package manifest | Node/TypeScript selected, but use reproducible managed release tooling rather than copying the script. | D10, D19 |
| 44–50 | Anonymous PostgreSQL, UUID extension, tier enum | Reject anonymity claim; use managed PostgreSQL, application UUIDs, and configurable plans. No extension/enum requirement inherited from the snippet. | D05, D08, D13 |
| 52–62 | Fansly-only users, required username, tier column, 50 messages, timestamps, duplicate ID index | Replace with local accounts, synchronized entitlements and ledgers. Trial is 20 lifetime replies. Define constraints/expiry explicitly; do not duplicate a unique index. | D04–D06, D13 |
| 64–74 | One progress row/user/character, chapter/timeline/mode | Keep state concepts, replace row ownership with explicit playthroughs and stable IDs. Modes/chapters are scoped per playthrough, not mutable global state. | D02–D03, D12 |
| 76–84 | “Stateless” JSONB chat array optimized for prefix caching | Reject premise. Durable history is stateful; ordered messages plus compact memory support concurrency. JSONB remains suitable for metadata, not indefinite shared-array rewrites. | D12–D13, D16 |
| 90–98 | Payload compiler, dynamic chapter-file `require` | Keep deterministic context compilation with validated lookups, pinned asset versions, and no arbitrary request-derived paths. | D11, D14 |
| 99–105 | Companion versus mirror-protagonist prompts | Keep both modes with clear reader/model agency, separate instructions, and shared narrative assets. | D02, D14 |
| 107–122 | System block with profile, voice, setting, condition, constraints | Keep the useful content categories; fit enforced budgets and the selected model template. Authoritative state remains application-owned. | D11, D14–D15 |
| 113–121 | Absolute canon, never disclose constraints/apologize, no future spoilers | Reject guarantees and rigid plot railroading. Private what-ifs permit agency; chapter-bounded facts and evaluated behavior reduce spoiler/voice failures. | D03, D14 |
| 91–93, 124–129 | Universal ChatML array and 100% indefinitely free cached prefix | Reject guarantees. Provider adapter supplies actual API/template contract; cache is optional and absent from baseline cost savings. | D16–D17 |
| 127–129 | Append all history without bound | Replace with 8K input budget, recent turns, compact memory, and separately persisted transcript. | D12, D15 |
| 135–147 | Stage everything, auto-commit/push `main` while deploying | Reject blind staging and mutable releases. Deliberate standing automation may create scoped tested commits and deployments; this differs from making deployment blindly mutate history. | D19–D20 |
| 148–153 | SSH key, `accept-new`, admin account, hidden VPS, success message | Managed deployment selected. If SSH is later needed, verify hosts and scope credentials. Do not claim anonymity or health from a shell success message. | D08–D09, D19–D20 |
| 158–169 | `git pull`, mutable dependency install, interchangeable Node/Python commands | Reject snippet. Use one runtime, lockfile builds, immutable releases, explicit migrations, and failure handling. | D10, D13, D19 |
| 171–175 | PM2 restart as isolation/clean swap/proof of health | Not selected; use managed supervision, actual health/synthetic checks, and rollback. PM2 itself is not an isolation boundary or availability proof. | D09, D19, D21 |
| 181–187 | Latest/community worker image, exact model repository, AWQ | Target RunPod/vLLM. Public NVFP4 companion has custom-vLLM execution evidence but no APC/long-context proof and is not the now-identified 27B multilingual writing file. Do not infer AWQ or stock-image compatibility. | D17–D18, T10 |
| 184 | `ADA_24` groups L4/4090/3090 | Unverified; do not inherit this pool assumption. Later RunPod MCP verification checks actual offerings/availability. | D18, T10 |
| 186 | `HF_HOME` automatically creates/mounts a global volume | Reject guarantee. It selects a cache path; provisioning, attachment, mount access, region support, and storage cost are separate. | D18, T10 |
| 187 | AWQ/prefix-cache flags and 32,768-token model length | Conditional engine settings, not chosen launch defaults. Verify actual quantized RVN context/engine support; begin with enforced 8K input/600-token paid output and evaluate voice-context needs. | D15–D18 |
| 187 | Disable inference request logs | Keep privacy goal, not reliance on one flag. Cover application/proxy/provider logs and retain content-free operational signals. | D08, D21 |
| 189–191 | Zero minimum, ten maximum GPU workers | Zero-to-one workers is the initial bounded test, not ten. Set production warm/scaling behavior from latency and full GPU/storage cost measurements. Worker count alone never defines a spend cap. | D06, D18 |
| 192 | Two-second queue delay guarantees batching/cache sharing | Reject guarantee. Queue policy is not worker routing or cache affinity; benchmark later if needed. Initial app queue is a separate bounded admission policy. | D16, D18 |
| 196–200 | Immediately scaffold SQLite/PostgreSQL and Express/FastAPI alternatives with placeholders | Discard ambiguous initialization prompt. Implement chosen stack and one revenue slice while validating actual dependencies. PostgreSQL parity, tested integrations, and real secret handling replace placeholders as evidence. | D10, D13, D20, D22 |

## 8. Changes from the first draft

- Revenue, returning-reader value, and owner time are now the explicit optimization criteria.
- Product/operational choices are resolved; validation tasks no longer masquerade as owner approval gates.
- Both requested interaction modes ship together; private what-if behavior replaces costly strict-canon branching.
- Concrete prices, reply budgets, retention, refund/entitlement rules, cost ceilings, and commercial diagnostics replace unspecified tiers.
- Managed application/database services and standing agent workflows reduce VPS maintenance and repeated manual review; the RVN worker is versioned and deployed through automation on RunPod Serverless.
- Owner clarification supersedes the earlier OpenRouter direction: quantized RVN on RunPod is primary, with validation in the later RunPod-MCP-enabled environment. Model/style consistency is an explicit product requirement, not a cheapest-model selection exercise.
- Subsequent verification selects vLLM-compatible same-checkpoint quantization rather than requiring the writing GGUF in production. Public NVFP4 serving evidence is recorded with its large hardware footprint and APC/context limitations.
- Adult content is intentional, with independent guards and self-harm protections. Maintained context/safety/injection documents and full-response review replace raw live-token streaming at launch.
