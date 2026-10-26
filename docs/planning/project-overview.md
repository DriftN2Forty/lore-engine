# LoreEngine — Project Overview

**Status:** Selected launch plan, revised October 23, 2026 under the owner's delegation to make practical decisions. These are planning decisions, not claims that anything has been implemented or commercially validated.  
**Decision record and remaining work:** [project-decisions.md](project-decisions.md).  
**Historical source:** [Gemini summary](gemini-conversation.md); its example code is discarded.

**Inference clarification:** Target **RunPod Serverless + vLLM + a compatible quantization of the owner's RVN checkpoint**, with Q4_K_M as the writing/style reference, not a mandatory serving format. **Defer Flash-Next; initially compare RVN 27B Q2/Q3 variants and prefer the smallest with acceptable author-reviewed quality that passes the independent technical checks.** GGUF serving must demonstrate actual per-account-isolated prefix caching. Public research does not yet prove this combination, our context capacity, or economics; see [inference verification](inference-verification.md). The owner has identified `RVN-Q4_K_M-multilingual.gguf` from the 27B GGUF repository; runtime/settings and parent-revision lineage remain to be completed.

**Maintained production guidance:** [Character engineering](../character-engineering/README.md) covers context/voice production, adult-content and self-harm boundaries, deterministic pre-dispatch controls, prompt-injection defense, and reviewed output delivery. These controls are specified, not implemented yet.

**Provider discovery update (October 24 UTC):** The connected MCP has supplied initial catalog/schema/Pod evidence; see [live RunPod discovery](runpod-discovery.md).

## 1. Objective and business strategy

**Build a profitable subscription companion to the owner's published stories.** Readers pay to talk with characters they already care about, or to play those characters in private interactive scenes. Optimize for recurring contribution profit and low owner workload, rather than message volume or technical sophistication.

The initial audience is existing readers. Link to character/scene landing pages from chapter endings, publication profiles, and existing reader channels. Each landing page should let a reader reach a recognizable character and a compelling opening scene quickly.

The differentiators are author-grounded characterization, scene-specific knowledge, continuity between visits, and access to new scenes as the stories grow. A generic chatbot with character names is insufficient.

### Launch scope

- One published story, two recognizable characters, and three reusable starting scenes drawn from already-published material. If only one character has enough source material, launch with one rather than delaying for invented content.
- Both **Talk to a character** and **Play as a character**, using the same validated story assets and separate mode instructions.
- Mobile-first web application, reviewed replies, saved playthroughs, brief continuity memory, subscription checkout, self-service cancellation, and basic support/report controls. At launch, buffer and check the full response before displaying it; raw live-token streaming is deferred.
- One small new or refreshed scene per month, usually tied to published material. Do not promise an ongoing stream of original commissioned fiction or a weekly release schedule.
- First build one character/scene end to end; expand to the launch catalog after it works. No multi-character group chat, voice, images, public community, user-uploaded characters, or bespoke GPU orchestration at launch. A pinned compatible vLLM worker image is part of inference setup if required.

## 2. Reader experience and retention

### Interaction modes

| Mode | Reader controls | Model controls |
| --- | --- | --- |
| Talk to a character | Their own persona, dialogue, and actions. | The selected character, brief environmental reactions, and necessary supporting characters. It does not decide the reader's thoughts or actions. |
| Play as a character | The selected protagonist's dialogue, decisions, and actions. | The world and supporting cast. It does not seize control of the protagonist to force the plot back on track. |

Mode, character, starting scene, spoiler ceiling, and content version are fixed for a playthrough. Changing them creates a new playthrough; **Start over** never silently destroys the old one.

### Canon policy

Published events are authoritative background. Each playthrough starts at an authored chapter snapshot, then becomes a **private, non-canonical what-if**. Allow meaningful personal consequences instead of repeatedly refusing choices that diverge from the book. Choices never change the published story or other readers' sessions.

Readers select the latest chapter they have read; default to chapter one. This is a spoiler preference, not a claim to verify purchase or reading completion. Only published, access-eligible chapter snapshots may be selected. Future facts stay outside the prompt and retrieval scope. Do not reveal a later fact merely because the reader guesses it. Prompting reduces spoilers but does not guarantee their elimination.

### Reasons to return

- Recognizable voice and short, responsive exchanges rather than repetitive exposition.
- A useful **Continue your scene** entry point and a concise recap after an absence.
- A private scene-state summary and a small set of persistent relationship/preferences facts per playthrough. Readers can inspect, correct, or clear memory.
- Two or three optional opening hooks per scene; avoid railroading or compulsory choice menus.
- New scene notifications in-app, with optional monthly email. No unsolicited daily reminders or artificial relationship pressure.
- Save a new branch from a checkpoint using existing transcript/summary data, without an extra model call. A new generation or requested continuation uses one reply; the save itself does not.

Evaluate the complete experience in both modes. Better memory, voice, and scene hooks take priority over a larger catalog.

### Adult-content and safety boundary

RVN is also selected for willingness to support reader-initiated NSFW fictional interactions. Allow eligible consensual adult content only in an explicitly enabled adult setting; launch preview is non-explicit. Never facilitate self-harm/suicide or allow character roleplay to override application protections. Recovery/support and non-instructional difficult themes remain permitted. See the detailed [content and safety policy](../character-engineering/content-safety.md), including age/consent boundaries and crisis-response handling.

Before dispatch, enforce ownership, access/settings, scope, schema/token limits, and structural injection controls in deterministic code; apply independent category-aware semantic moderation as well as context instructions. Review complete output before release. No filter or system prompt guarantees perfect semantic safety; the live character model has no tools, secrets, or authority over accounts. [Prompt-injection defense](../character-engineering/prompt-injection.md) defines the maintained layered design.

## 3. Subscription offer

Prices are **USD per month, before applicable tax**. Use monthly billing only initially. These are selected launch hypotheses to measure, not proven willingness-to-pay or profit forecasts.

| Plan | Price | Generated replies | Saved active playthroughs | Access |
| --- | --- | --- | --- | --- |
| Preview | Free, once per verified account | 20 total; at most 10/day | 1 | One designated sample scene, both modes. No monthly refill. |
| Reader | $12/month | 500 per billing period; at most 100/day | 10 | Full released interactive catalog, both modes, memory, and new scenes. |
| Storyweaver | $24/month | 1,200 per billing period; at most 200/day | 30 | Reader benefits with more playthroughs and replies. |

**One reply** means one successfully completed, safety-approved assistant generation saved and available to the reader, including a regenerate or requested continuation. Saving, loading, editing memory, browsing scenes, billing/support actions, application boundary/support messages, and blocked candidates do not consume replies. Both paid tiers get the same model quality and maximum response length; the higher tier buys capacity, not relief from a deliberately degraded experience.

### Billing and entitlement rules

- Reply allowances are shared across all characters and modes. Show remaining allowance and the exact reset date outside the fictional dialogue; warn unobtrusively at 80% and 95% use.
- Paid allowances reset on successful renewal at the billing provider's period boundary. No rollover. Daily limits use UTC and are disclosed in the usage panel.
- At exhaustion, keep history readable and offer renewal-date information or upgrade. Do not surprise-charge for overages. No top-ups or annual/lifetime offers at launch.
- Upgrades take effect only after successful payment of the provider-calculated proration. Add `floor(700 × fraction of billing period remaining)` replies to the current period's allowance without resetting usage; grant the full 1,200 on the next successful renewal. Show the exact immediate grant before purchase and make the grant idempotent. This avoids selling 700 extra replies for a tiny end-of-period payment. Downgrades apply next renewal.
- Cancellation preserves paid access through the already-paid period. Payment failures get a 72-hour grace period with the existing allowance, but no new allowance until renewal payment succeeds. Refund/revocation events remove the refunded period's paid entitlement without deleting history.
- Accounts can always manage billing, export, or delete their data. After lapse, conversations are read-only; new paid generations require renewal. Above a downgraded plan's active-slot limit, let readers choose which sessions stay active and archive the rest without generation or data loss.
- Automatically refund an unused initial subscription on request within seven days; duplicate charges are always investigated/refunded where confirmed. Other requests use a short support workflow; processor rules and applicable consumer rights take precedence.
- Do not reduce existing paid-period allowances after purchase. Change public pricing or benefits only deliberately, with appropriate notice and grandfathering for the current paid period.

### Acquisition and pricing review

Use a recognizable scene to demonstrate value before asking for payment. Require verified email before free inference; use coarse network throttling and a challenge only when automated signups are evident. Avoid an indefinitely replenishing free plan that attracts inference expense without subscription intent.

Review the funnel monthly after at least 100 verified previews or 30 paying subscribers: landing-to-preview, preview-to-paid within 14 days, second-month renewal, use of both modes, allowance exhaustion, and contribution margin. Test scene openings/onboarding before introducing more plans. Do not automatically alter prices from a small sample.

## 4. Economics and spending limits

Use a **65% minimum contribution margin at full allowance** as the launch viability floor and a 75%+ blended target in normal use. Contribution margin here is receipts excluding sales tax, less payment/platform fees, refunds/chargeback reserve, inference, memory generation, and other variable service costs; fixed hosting and owner time come afterward.

Initial planning assumptions:

| Item | Selected planning limit |
| --- | --- |
| Fees plus refund/chargeback reserve | Model conservatively as 25% of plan price until actual channel costs are known. |
| Fully loaded inference/guard cost per delivered reply | Initial target at most $0.002; unverified for RVN on RunPod. Include worker startup/idle/storage, memory, moderation/input-output checks, blocked candidates, failures, and cancellations over realistic traffic. |
| Fixed hosting, database, email, and monitoring | Target at most $75/month before growth; verify actual vendor quotes. |
| Initial development/provider test spend | At most $25 total. |
| Monthly inference authorization | $50 baseline plus 15% of net collected subscription receipts for the current month, capped at $250/month until deliberately increased. Net receipts here exclude tax, refunds, and channel/payment fees. |
| Free-preview inference | At most $10/month within, not in addition to, the inference authorization. |

At the $0.002 assumption, a fully used Reader allowance costs $1 and Storyweaver costs $2.40 in inference. After the 25% reserve, contribution is approximately **$8 (66.7%)** and **$15.60 (65%)** respectively, before fixed overhead. At $75 fixed cost, approximately ten fully utilizing Reader subscribers cover infrastructure in this simplified model. This is not break-even after owner labor, acquisition expense, or income taxes.

Validate RVN on RunPod against these assumptions before selling these allowances. GPU execution billing is not a per-token quote: cold starts, warm idle time, batching, and storage affect the effective reply cost, especially at low volume. The prices/allowances and cost targets remain provisional until measured together. If the preferred model cannot meet the commercial target, optimize its deployment first, then revise the offer or authorized budget before checkout opens; do not silently substitute a different model or degrade paid responses.

The researched Flash-Next NVFP4 candidate has approximately 180 GB of weights and publisher-reported dual ~96 GB GPU execution, with caching disabled and only 2K context tested. **It is not the owner's now-confirmed RVN 27B writing model and does not substantiate these small budgets or per-reply targets.** A more expensive test requires one concrete budget exception, not an assumed authorization. See [evidence and limitations](inference-verification.md).

### Automatic budget protection

- Maintain a durable internal cost ledger and a conservative reservation for each provider request. Reserve for background memory work as well as visible replies; reconcile to actual usage/cost.
- Account separately for non-request RunPod charges such as storage and warm/startup worker time. Reserve these from the same inference authorization and reconcile against provider billing; token counts alone cannot enforce a GPU-billed spending limit. Bound worker concurrency and warm-worker lifetime so background charges cannot grow unobserved.
- At 70% of authorized monthly inference spend, notify the owner and pause new free previews and optional background generation. At 90%, disable nonessential evaluations and send one actionable alert.
- At 100%, reject new inference requests before dispatch; existing reservations cover in-flight work. Keep history, billing, export, and cancellation available and show a service notice. This is an emergency cost boundary, not the normal capacity plan.
- Notify the owner when forecast spend will hit the cap before renewal periods end; resolve capacity early. Use provider-side spending controls where supported, but do not assume they are exact hard caps.
- Before accepting new subscriptions or upgrades, forecast remaining paid allowances at the validated full-use cost plus a 20% operating buffer. If commitments would exceed the available authorization, pause new enrollment/upgrades and notify the owner rather than sell capacity that cannot be funded. Include upcoming renewals in the rolling forecast so this is caught before existing readers are affected.
- No autonomous increase in spending authorization, infrastructure plan, or provider minimum commitment. The formula above permits routine inference growth within the $250 ceiling without individual approvals.

## 5. Selected technical approach

### Application and hosting

- **TypeScript, Next.js on the Node.js LTS runtime, and PostgreSQL**, as one modular application and repository. Use Drizzle for schema/migrations and Zod for request/content validation. Pin supported versions when implementation begins.
- Develop locally in WSL, then deploy the application to a rented VPS when it is ready for hosting; the owner intends to route an owned domain through Cloudflare at that stage. VPS provider, sizing, database placement, and Cloudflare Tunnel versus proxied-DNS routing remain to be selected and cost-checked against the $75 fixed-hosting target. See the [VPS setup plan](vps-setup.md).
- Use supported TLS, health checks, secret handling, releases, and restart behavior appropriate to the selected VPS design. Keep PostgreSQL network-restricted and separately verify backups/restores. This changes the earlier managed-hosting default; do not assume Render or any VPS product has been provisioned.
- PostgreSQL also holds short background jobs with leases, retries, and an idempotent scheduled runner. No separate message broker. A provider scheduler may call the application's authenticated maintenance endpoint; do not rely on a web process staying awake after a request finishes.
- Use Better Auth email-code login and Resend transactional email. Store secure server-side sessions. Keep stable local user IDs independent of any story publication or billing platform.

The application-hosting model has since changed to a future VPS deployment; see the [VPS setup plan](vps-setup.md). The remaining named vendors/libraries are selected defaults, not verified current quotes or compatibility claims. Implementation should verify them once. If a default cannot support the intended content, region, cost, or required API, an agent should identify the closest compatible substitute and bring only that material exception to the owner.

### Billing and Fansly

Use **standalone subscriptions with hosted Stripe Checkout and the customer portal** if the actual published content/business is eligible for Stripe. Keep payment details out of the application; synchronize entitlement from verified, idempotent billing events with daily reconciliation.

Verify billing eligibility for the now-explicit **adult fictional chat offering**, not merely the published text, before activating checkout. Stripe is not an approved payment choice for this offering merely because hosted checkout is convenient. Select a compatible subscription processor with supported entitlement APIs if it is ineligible. An unsupported billing dependency is a specific implementation exception, not a reason to leave every product decision open.

Fansly is a potential acquisition/publication channel, **not the login or billing dependency for the baseline product**. Do not build scraping, shared redemption codes, screenshot verification, or recurring manual entitlement checks. A platform-specific benefit can be added later only through a supported, automatable integration. Do not promise automatic Fansly subscriber access at launch.

### Inference: RunPod Serverless + vLLM + quantized RVN

```text
Reader → application → authenticated RunPod Serverless endpoint
                              → GPU worker → pinned RVN model
             |
             └→ PostgreSQL: subscriptions, playthroughs, memory, usage
```

- **RunPod Serverless is the selected inference provider and vLLM the preferred serving engine**, separate from the planned application VPS. Match the writing Q4_K_M file to its parent RVN checkpoint, then select a compatible quantization of that checkpoint. Pin repository/revision, file checksum, tokenizer/template, engine/image, and settings. Do not substitute another RVN family because its name looks similar.
- **Initial candidates:** with the RVN 27B multilingual Q4_K_M writing file now identified, compare same-checkpoint Q3_K_M and Q2_K GGUF against that reference after checking lineage/calibration metadata. Use matched prompts/settings and blind author comparisons where practical, then run the narrative/long-session and separate safety/injection checks for finalists. Prefer the smallest acceptable candidate, including lower-bit variants if further tests justify them; no four-bit minimum is selected. Flash-Next is deferred. Existing 27B FP16/GSQ and Flash-Next evidence is retained in the [verification record](inference-verification.md); it does not validate the Q2/Q3 serving/cache path.
- GGUF is distinct from AWQ/NVFP4. vLLM's experimental GGUF plugin must prove native chat, exact quantized-operator compatibility, **actual APC hits and per-account cache isolation**, then our context/concurrency and measured performance. Model loading or an accepted cache flag alone does not meet the owner's objective. If this path fails, investigate a saved same-checkpoint native-format export; W4A16 is a tooling candidate, not a precision floor. llama.cpp remains a reference engine for quality screening or an explicitly evaluated fallback. Do not re-quantize low-bit GGUF by default or relabel its metadata.
- Quantization is chosen to reduce weight storage and transfer/memory requirements. It does not guarantee a particular loading time, throughput, or character fidelity; benchmark the actual file and hardware. Quantized weights also do not remove context/KV-cache memory requirements.
- Use the connected **RunPod MCP system** for live reads and eventual bounded deployment validation. Initial GPU offerings, endpoint schema, storage/mount and worker-source inspection are recorded in the [discovery report](runpod-discovery.md); current stock/prices must be refreshed before spending. Resolve its provider eligibility blocker, then prove actual image/plugin behavior, billing, job lifecycle, scaling and cold/warm quality. This is validation of the **primary deployment**, not an optional alternative; metadata/source inspection is not a runtime benchmark.
- Begin the bounded deployment test with zero minimum workers and one maximum worker, on a verified compatible GPU. Determine per-worker concurrency empirically. Ten application requests is an admission ceiling, not a promise that one worker can serve ten promptly; lower admission/queue limits if measurements require it. Pin image/model revisions and automate worker build/deployment.
- Scale-to-zero is the initial idle-cost policy. Compare measured cold starts with warm capacity or bounded idle retention available on the chosen setup. Warm capacity is permitted only if it fits existing authorization and commercial forecast; measure preparation plus complete-output review instead of promising live first-token latency. Display a clear preparation state outside the fictional dialogue.
- Select routing/scaling explicitly: LOAD_BALANCER requires REQUEST_COUNT; a QUEUE worker needing idle retention uses QUEUE_DELAY because QUEUE + REQUEST_COUNT rejects `idleTimeout` in the current schema. Global volumes now support region-independent GPU Serverless model storage (beta), with separate request charges and filesystem limitations; compare against host caching and regional volumes from evidence. Account for the documented seven-day dormant-endpoint max-worker cutoff in service recovery rather than promise indefinite automatic availability.
- No default OpenRouter fallback, cheapest-model selection, automatic model replacement, premium routing, multi-agent reply chains, per-turn generative quality judges, or web-search tools in the live chat path. Independent input/output safety moderation is a required exception, with measured cost/latency. Use one RVN response plus occasional bounded memory compaction. Service failure should produce a recoverable service notice, not an unannounced character/model change.
- Target **tested vLLM APC** with deterministic static-first context. It saves repeated prefill work, not decode or all GPU costs. The hybrid RVN architecture requires explicit support testing; the publisher's cache-disabled evidence is insufficient. Compare APC off/on at realistic traffic and budget without guaranteed hits or warm state. Use server-generated per-account cache salts and cryptographic hashing where supported, verifying handler propagation; this deliberately forgoes cross-account cache sharing. Never gain cache efficiency by mixing private data or weakening guards. Full acceptance criteria are in [inference verification](inference-verification.md).

### Character-style consistency

Using RVN is the strongest available baseline because the owner already writes with it; it is not a guarantee of identical output. The published prose also reflects prompts, selected generations, edits, sampling settings, and narrative context.

For each character/scene, supply a compact **voice packet**: spoiler-eligible excerpts of actual dialogue/prose, characteristic diction and sentence rhythm, behavior/relationship anchors, and examples of unwanted generic narration. Preserve third-person story voice in narrator mode and adapt it deliberately to direct interaction in character mode. Do not imitate the book by copying long passages into every response.

Compare RVN outputs against author-selected story excerpts and calibration examples across both modes and long conversations. Use the writing workflow's template/settings as a starting reference, then tune for interaction. More context improves access to facts/examples but cannot make any arbitrary model equally good at using them; excess context may also increase cost and dilute relevant voice cues.

Keep the RVN checkpoint unless measured evidence establishes a compelling reason for an agreed change. A vLLM-compatible quantization of the same checkpoint is now an authorized deployment choice, with mandatory style/safety comparison against the Q4_K_M writing reference. A different model family is not an autonomous replacement. Follow the maintained [character/context production guide](../character-engineering/character-context.md) rather than relying on model identity alone.

## 6. Story content, memory, and data

### Agent-assisted content production

Keep published source text, chapter manifests, and validated character/scene definitions in versioned project content files. Include source references, stable IDs, chapter knowledge boundaries, voice examples, and mode instructions. Only published material designated for this product enters the publishing pipeline.

An agent extracts profiles and scene seeds, checks facts against cited chapter passages, runs both-mode evaluations, and publishes derived interactive assets automatically after checks pass. The owner selects the initial story and supplies published source material; routine extraction, indexing, scene refreshes, and derivative deployment do not need repeated approval. Creating or publishing new canonical story chapters remains the author's creative decision.

The [RVN authoring workflow](../authoring/README.md) records a personal scale-to-zero llama.cpp endpoint for occasional project work and NSFW chapter processing, using the exact multilingual Q4_K_M writing file. RVN is a candidate producer of cited character/voice/scene assets, not its own validator; having generated story prose does not give a fresh session memory of that story. Draft preparation stays unpublished. Future scoped tools may publish passing derivatives under the established workflow or carry out specifically author-authorized canonical publication; live reader inference receives no such tools.

Do not build a general RAG platform or vector database at launch. Precompile bounded chapter/character context. Add chapter-filtered PostgreSQL retrieval only if evaluation shows missing detail; retrieval must enforce story/content-version/spoiler scope before returning text.

New playthroughs use the latest passing content version. Existing playthroughs pin their version. Correct critical factual/spoiler defects with a compatible patch and a release record; do not silently rewrite reader choices or session history.

### Concrete generation limits

| Limit | Launch policy |
| --- | --- |
| Reader input | At most 4,000 characters and 1,000 model tokens per send; reject over-limit text with an editable UI, not silent truncation. |
| Total model input | At most 8,000 tokens: up to 2,000 story/system, 1,000 memory, 4,000 recent transcript, and 1,000 current input. |
| Output | Paid: up to 600 tokens; preview: up to 300. Target natural responses of roughly 100–200 words, shorter for brief dialogue. |
| Model context capacity | At least 16,000 tokens, leaving room above the enforced input/output budgets. |
| Concurrency | One in-flight generation per account; six new requests/minute and 60/hour, in addition to plan allowances. |
| Response timing | Buffer and review the whole reply before first text. Initial warm goal: p95 reviewed reply available within 30 seconds; cold goal within 60 seconds, both unverified. Use a 120-second end-to-end deadline including preparation/checks. The former five-second live first-token goal is retired for launch. |
| Memory | Compact scene state, commitments, and reader-established facts approximately every 12 completed replies and before needed history eviction. Keep each compaction within the global spend ledger. |

Budgets are maximum allocations, not instructions to pad prompts. Carry fewer recent messages when necessary. Never remove system constraints to fit history. Keep a deterministic fallback using the last valid memory and recent turns if compaction fails. If important evicted state cannot be retained, use the existing transcript for an explicit checkpoint/restart rather than silently pretending complete recall.

The 2,000-token story/system allocation is a starting configuration, not evidence that every character's voice fits. Test short versus richer spoiler-scoped voice packets by reallocating the 8,000-token input budget first. If evaluation needs a larger total, remeasure GPU/KV-cache capacity, latency, and margin before changing the launch allowance economics. Verify that the actual RVN artifact supports the configured context; do not infer its capacity from a filename.

### Persistence and accounting

Use separate users, sessions/account links, subscriptions/entitlements, billing events, playthroughs, ordered messages, summaries/memory facts, generation requests, usage/cost ledger entries, content versions, and maintenance jobs. Constraints and transactions enforce ownership, nonnegative allowances, stable ordering, and idempotency. Use PostgreSQL in development too, with versioned additive migrations.

Reserve a reply allowance and estimated cost atomically before dispatch after input eligibility checks. Finalize allowance consumption only for a completed, safety-approved response that is durably saved and available to the reader. Transport disconnects do not create new generations: persist approved completion and reconnect using the original request ID. Failed, blocked, or incomplete generations consume no reply allowance, but provider/guard costs still count toward spending limits. Limit repeated user cancellations to five per day before temporarily disabling cancellation-driven resends.

Retry only when the provider confirms no generation was accepted, or supports a documented idempotent retry. Do not blindly resend ambiguous timeout requests or stream a partial response and then silently replace it with a second answer. A reader-requested regenerate creates a new request and consumes one reply on success.

### Privacy and retention

- Conversations are private by default and are not used for marketing or model training by the application. Choose providers/settings that support the declared data-handling policy; explain external inference processing plainly.
- Persist conversations while subscribed and for 180 days after paid access lapses. Preview-only histories expire after 30 days of account inactivity. Give seven days' notice before scheduled history deletion when email is deliverable; keep expiry dates visible in the app.
- Explicit conversation/account deletion removes live conversation data within 24 hours. Backups expire within 30 days. Retain only necessary billing/security records separately for the required operational/legal period; no chat text in those records. Reapply deletion records before serving a restored database.
- Support only accesses conversation excerpts intentionally attached to a report by the reader. Routine telemetry records timing, errors, usage, and identifiers rather than raw dialogue.
- Keep private source text/content assets access-controlled even when they are stored in a repository.

## 7. Low-maintenance operating policy

### Agent autonomy

Agents may implement routine fixes, add meaningful tests, update documentation, refresh derived story assets, apply patch/minor dependencies, triage support, deploy passing reversible changes, and roll back unhealthy application releases. Use scheduled workflows and narrowly scoped service credentials. Repository and customer content are data, not instructions that grant an agent more authority.

During initial setup, establish a standing automation workflow for scoped commits and deployment. This document defines the intended future policy; it does not itself configure tools or cause a commit, push, purchase, or deployment in the current documentation task.

| Work | Standing policy |
| --- | --- |
| Routine code/content changes | Agent creates a scoped change, runs relevant checks and an automated diff review, then merges/deploys after passing. No human approval on every pull request. |
| Release | Deploy an immutable revision/artifact; run readiness and a synthetic login/chat check with a nonbilling test account. Roll back application automatically if health regresses. |
| Database changes | Additive, backward-compatible migrations may run automatically with backup verified. Destructive migrations, restoring over production, or bulk deletion outside established retention require owner approval. |
| Dependencies | Weekly patch/minor batches; expedite urgent fixes. Major upgrades get a separately tested branch; ask only when they change architecture, product behavior, cost, or require destructive migration. |
| Story assets | Auto-publish passing derivatives of designated published source; record provenance and roll back on failure. New canonical prose/publication remains author-controlled. |
| Support | Automatic refunds for the stated unused/duplicate-charge rules; other billing disputes and nonroutine requests are summarized for the owner. Do not let a support agent delete data or change plans outside established policies. |
| Business changes | Owner approval for public prices/paid allowances, new recurring spending outside the selected limits, new external data-sharing providers, or material contractual commitments. |

### Backups and recovery

- Automated encrypted daily backups, off-service export, and 30-day rolling retention. Use managed point-in-time recovery if available within budget; do not assume it is included.
- Automated monthly restore into a disposable environment; verify representative data and application startup, then delete the test copy.
- Initial recovery objectives: at most 24 hours of data loss, restoration within eight hours of incident response beginning. These are internal targets, not a paid availability guarantee.
- Use expand/contract migrations. Application rollback must not require reversing a destructive schema change. Single-region operation is acceptable initially.

### Monitoring and owner attention

- External availability check every five minutes. Alert on five minutes of unavailability, more than 5% generation failures over 15 minutes with at least 20 attempts, backup failure, entitlement reconciliation failure, or the spend thresholds above.
- Group related alerts and suppress duplicates. Escalate an actionable outage/cost incident immediately; routine successful jobs produce no owner notifications.
- One weekly email digest: collected revenue, active subscribers, renewal/churn, conversion, contribution margin, inference cost, failures, notable feedback, and only decisions actually needed. Calculate paid renewal metrics by billing cohorts, not raw account counts.
- Target owner maintenance time below one hour/week, excluding writing stories. If support/operations exceeds that for two consecutive weeks, simplify the problem before expanding features.

## 8. Implementation sequence and launch checks

Use automated checks at milestone boundaries, not a chain of owner approval meetings.

1. **Supply source and prove dependencies:** complete writing-file/settings provenance, choose the first story, extract one scene/voice packet through an eligible processing path, then validate vLLM quantization/APC/context/hardware/cost through the connected RunPod MCP environment.
2. **Build the revenue slice:** email login, one scene in both modes, durable generation with pre-dispatch defenses and full-response safety review, memory, reply/cost ledgers, eligible hosted checkout, and cancellation. Use payment test mode until validation passes.
3. **Complete the paid pilot:** load the launch catalog, implement retention/export, monitoring, automatic release/rollback, and restore check. Open to the first 25 paying readers from existing channels; cap enrollments rather than overload support.
4. **Expand automatically when healthy:** after two weeks, open enrollment if error/latency/cost targets pass, no billing/data-loss defect remains unresolved, and the support workload is manageable. Notify the owner; routine expansion within the spend policy needs no separate approval.

### Minimum evidence before paid activation

- Billing sandbox proves checkout, renewal, duplicate/out-of-order events, upgrade/downgrade, cancellation, grace period, and refund handling.
- Quota/cost tests prove one account cannot overspend through concurrent sends, retries, stream disconnects, or background jobs. Run a 10-concurrent-reader load test within the test budget; start with an application-wide cap of ten simultaneous generations, two of them at most previews, and wait up to ten seconds before returning a no-charge busy response.
- Thirty fixed narrative cases span both modes: voice, user agency, continuity, spoiler scope, contradictory requests, and long sessions. Agent scoring must reach at least 90% acceptable with no observed spoiler-boundary or reader-agency violation in the critical subset. This finite test is a regression signal, not proof that failures are impossible.
- Separate maintained safety and injection suites each contain at least 24 fixtures, including allowed near-neighbors, multi-turn/memory attacks, adult opt-in, and self-harm support. Critical cases require no observed prohibited-output release or privilege/scope escape; no averaging them into the prose score. Verify checks occur before any text is exposed and continue to apply on resume.
- Measure RVN's fully loaded cost per delivered safe reply at sparse/busy traffic and APC off/on, including startup/idle/storage, failures, blocked candidates, memory, and moderation. Validate the $0.002 target or revise the unsold offer/budget explicitly. Prove reviewed-response latency and disclose/resolve cold preparation delays. Automatic scoring/evaluation spend is included in the test budget.
- A backup restore, failed-release rollback, account deletion, and reading/exporting history after subscription lapse have been demonstrated.
- Owner provides a one-time voice spot-check of ten sample responses against their own story; subsequent routine regressions use those fixtures and automated comparisons. This is creative calibration, not a recurring release gate.

At 30 paying subscribers or 100 verified previews, evaluate the business funnel. Investigate preview-to-paid conversion below 5%, second-month paid retention below 60%, or more than 10% of active paid accounts exhausting allowance. These are initial diagnostic thresholds, not reasons to promise results or automatically increase costs. Improve activation, memory, and scene value before scaling acquisition spend.
