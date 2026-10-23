# LoreEngine — Project Overview

**Status:** Working draft; recommendations await owner decisions.  
**Source:** [Gemini conversation summary](gemini-conversation.md).  
**Companion document:** [Decision checklist and suggestion review](project-decisions.md).

This document organizes the proposed project into a product direction and a practical technical approach. The source is a set of suggestions, not an approved specification. Nothing in it establishes that a platform integration, model, provider configuration, or performance claim has been tested. Decision IDs below link the proposed direction to the checklist.

## 1. Project concept

LoreEngine is a proposed interactive-fiction application where readers interact with fictional characters within a defined chapter and story timeline. Responses should reflect the character's personality, current circumstances, and knowledge at that point in the story.

The central value proposition is **story-aware interaction without casually breaking characterization or revealing later plot developments**. How strictly conversations must follow canon is still a product decision; prompting alone cannot guarantee it.

### Proposed interaction modes

| Mode | Reader's role | Model's role | Assessment |
| --- | --- | --- | --- |
| Companion | Interacts with the character as an outside participant. | Speaks and responds as the character. | A reasonable first mode; the reader's place in the fictional world still needs definition. |
| Mirror protagonist | Plays the protagonist and supplies their thoughts or actions. | Narrates the world and secondary characters. | A distinct narration experience, not simply a change in character voice. Defer unless this is the core experience. |

The source also proposes canonical and alternate timelines. Alternate timelines can support replay and experimentation, but multiply content authoring, progression rules, and evaluation work. Start with one defined story path unless branching is essential. See **D01–D03**.

## 2. Audience, access, and business model

The source assumes an audience connected to Fansly and proposes a free allowance plus two subscriber tiers. It does not define the intended audience, tier benefits, allowance reset period, pricing, or who owns billing.

Recommended direction:

- Define the experience and the benefits being sold before designing subscription tables.
- Treat Fansly as a candidate identity/entitlement integration, subject to verification of supported APIs and access requirements.
- Keep local application identity separate from an external platform account so authentication and access rules can evolve.
- Define usage limits in terms that can be enforced and costed. Message counts are understandable to readers, but do not directly bound inference cost when message lengths vary.

The source's OAuth2 endpoints, session-validation assumptions, and webhook support are **unconfirmed**. Integration feasibility is an early dependency, not an implementation detail. See **D04–D06**.

## 3. Proposed first release

The following is a recommended narrow starting point, not a recorded user commitment:

1. One character, one chapter, one timeline, and one selected interaction mode.
2. A minimal reader interface for starting or resuming a conversation and sending messages.
3. Persistent conversations and explicit story context selected by the server.
4. Authentication and entitlement checks appropriate to the chosen access model.
5. An enforceable usage allowance and bounded request/context sizes.
6. A remote model integration with measured response quality, latency, and cost.
7. A repeatable deployment, database backup/restore procedure, and basic operational visibility.

The reader interface, administrative workflow, and content publishing process were missing from the source. A backend alone is useful as a prototype, but is not a complete reader-facing release. Decide whether the first milestone is a technical proof of concept or a usable product (**D01, D07**).

Suggested later scope: additional characters and chapters, alternate timelines, a second perspective mode, richer progression, and scaling beyond a single application server.

## 4. Recommended system shape

Use a **modular monolith** as a starting point: one application with clearly separated responsibilities, rather than independently deployed services.

```text
Reader interface
      |
      v
Application backend
  - Authentication and entitlement checks
  - Conversation and story-state management
  - Usage accounting and rate limits
  - Prompt/context construction
  - Inference job lifecycle
      |                |                 |
      v                v                 v
 PostgreSQL     Versioned story     External inference
                definitions         provider

External identity/entitlement platform (if selected)
      -> verified login and synchronization paths -> backend
```

### Hosting

A Linux VPS with PostgreSQL on the same host is a plausible low-volume starting point. It reduces service count but couples application/database availability and requires the operator to manage patching, backups, recovery, and capacity. A managed database is an alternative when reducing operational work matters more than minimizing infrastructure cost.

Njalla and BuyVM are candidates named in the source, not validated selections. Provider choice should follow actual requirements for location, cost, support, and data handling. A VPS, private repository, or provider marketed for privacy does not establish anonymity. Prompts still leave the application host when sent to external inference. See **D08–D09**.

### Runtime and project organization

The source mixes Node.js/Express examples with FastAPI/Python and interchangeable install commands. Choose one application runtime before scaffolding. Node.js is the most direct continuation of its examples; Python remains viable if it better fits the maintainer's experience.

Organize by responsibility: configuration, authentication, integrations, story content, conversations, inference, database migrations, and operations. Exact file names are secondary to those boundaries. Keep application deployment separate from any custom GPU worker image. See **D10, D19**.

## 5. Story definitions and progression

Versioned JSON files are a reasonable first content-authoring format. Each story definition should have a stable identifier and a validated schema, including:

- Character identity, personality, and writing style.
- Chapter setting and character condition.
- Facts known at this point and information excluded from this context.
- Timeline identity and allowed transitions, if branching is supported.
- Supported perspective modes and their instructions.

Use validated identifiers and an explicit content lookup rather than constructing arbitrary file paths from request input. Validate content before publication and define how revisions affect ongoing conversations.

Persist explicit progress; do not treat model-generated statements as authoritative chapter unlocks or timeline transitions. Decide whether progression is reader-selected, externally unlocked, or controlled by application rules. See **D03, D11**.

## 6. Persistence and usage accounting

PostgreSQL is a good candidate for users, external account links, entitlements, progression, conversations, messages, and usage records. This is a conceptual model, not a final schema.

Recommended changes to the source schema:

- Give users stable local IDs and model external identity links separately if platform independence is needed.
- Treat entitlement state as synchronized data with provenance and freshness, rather than assuming a `current_tier` value remains correct indefinitely.
- Model conversations explicitly. A unique `(user, character)` pair prevents separate playthroughs, alternate timelines, and independent sessions for the same character.
- Prefer ordered message records for durable history. JSONB can hold flexible metadata or bounded snapshots; a single indefinitely growing array creates rewrite, concurrency, and retention difficulties.
- Make required ownership/state fields non-null and constrain counters and allowed states. Define timestamps and update behavior explicitly.
- Apply schema changes through versioned migrations. Use the same database engine for development and production unless portability is an explicit requirement.
- Enforce allowances atomically and define how failed, retried, cancelled, or duplicate requests affect usage. Request throttling and billable usage accounting solve different problems.

The SQL in the source is illustrative and should not be run as a production migration. Its separate Fansly ID index duplicates the index provided by its unique constraint. Its UUID extension choice should follow the selected PostgreSQL version rather than be copied automatically. See **D05–D06, D12–D13**.

## 7. Response generation and context management

For each message, the backend should:

1. Authenticate the reader, verify access, validate input, and identify the conversation.
2. Reserve allowance if required and prevent duplicate/concurrent requests from corrupting state.
3. Resolve the authorized character, chapter, timeline, and content version.
4. Build context from story instructions, a bounded history or summary, and the new message.
5. Submit a request through a provider-specific adapter with timeouts and defined retry behavior.
6. Deliver the response using the chosen streaming or job-status flow.
7. Persist the result and reconcile usage or release a reservation on failure.

### Prompt design

Putting stable instructions before changing conversation history is sensible. Keep character facts, chapter constraints, and mode instructions consistent and deterministically serialized when possible. Use the selected model's supported chat template; a roles/content array is not itself a universal ChatML or RunPod request format.

Exclude later-chapter material from the active context when feasible. Add representative quality checks for characterization, perspective, spoilers, and attempts to override story rules. The model may already know published stories or infer future events, so excluding future text is risk reduction, not a guarantee.

The source's blanket instruction to never mention constraints or produce an apology is not a reliable control. Define the desired in-world handling of out-of-scope requests and test it. See **D14**.

### History and prefix caching

Set input/output token budgets and a context-overflow strategy, such as recent turns plus a maintained summary. Persisted history and model-visible context need not be identical. Summaries can lose or distort story facts and need evaluation.

Automatic prefix caching may reduce repeated prompt processing when a worker retains an identical token prefix. It does **not** guarantee a 100% hit rate, indefinite retention, zero cost, or free historical context. Worker replacement, routing, eviction, and changed templates/content affect reuse. Dynamic tokens still require processing, and cached prefixes still consume resources.

Choose prompt organization primarily for correctness; measure caching as an optimization. See **D15–D16**.

## 8. Model and inference infrastructure

RunPod Serverless with vLLM is one candidate, not a settled dependency. A managed inference API may reduce setup effort; a persistent GPU worker may reduce cold-start variability at the cost of idle spending. Compare candidates against the same sample conversations.

The proposed `0bserverx/RVN-Qwen3.8-Flash-Next-Abliterated-Uncensored` model identifier and its AWQ compatibility are unverified. Its label does not establish quality, suitability, licensing, context capacity, or memory fit. Verify availability and actual configuration before estimating deployment cost.

Select a model using:

- Character and narrative quality in the selected mode.
- Instruction following and chapter-boundary behavior.
- Measured latency, including cold starts and concurrent requests.
- Prompt/completion token use and cost per representative session.
- License, provider terms, and data handling suitable for the intended content.

Do not adopt the source's container tag, hardware pool, storage path, or execution flags as a working configuration. Pin a tested image/model revision; verify worker-specific request/streaming contracts, hardware availability, storage mounts, quantization support, and memory requirements. A 32,768-token context is a proposal to benchmark, not a free default. See **D17–D18**.

Scale-to-zero is useful when idle-cost savings outweigh cold-start delays. Maximum workers and a queue-delay threshold require load and budget measurements; ten workers and two seconds are arbitrary starting guesses. Queue delay does not itself guarantee batching or cache sharing. Worker limits alone do not cap total spend. See **D18**.

## 9. Deployment, privacy, and operations

Use a repeatable release process tied to an explicit revision. Keep code review/commits separate from deployment; avoid scripts that blindly stage everything, create commits, and deploy a moving branch.

Recommended minimum:

- An example environment file containing placeholders, with actual secrets supplied outside version control.
- Deployment credentials outside the repository; a scoped repository deploy key and separate server access credentials where appropriate.
- Verified SSH host identity, a dedicated deployment account, and narrowly scoped permissions.
- Reproducible dependency installation from a lockfile, explicit migrations, failure handling, and an application health check.
- A known rollback procedure that accounts for database compatibility.
- Database backups outside the application host and a tested restore path.
- Operational metadata for failures, latency, usage, and queue depth without routinely logging private conversation content.

PM2 is a viable Node.js process manager, not evidence of process isolation or a zero-downtime deployment. Systemd or a container-based deployment may also fit. `git pull`, dependency installation, and `pm2 restart` alone do not verify a healthy release.

Define privacy concretely: what identity/chat data is stored, where it is processed, who can access it, how long it is kept, and how it is deleted. Disabling request logs in one inference component does not establish an end-to-end retention policy. See **D08, D19–D21**.

## 10. Suggested validation sequence

1. **Define the experience:** decide first milestone, interaction mode, canon rules, and access model (**D01–D07**).
2. **Resolve external dependencies:** verify platform capabilities and benchmark a small model/provider shortlist (**D04, D17–D18**).
3. **Build a thin vertical slice:** one story context, one conversation, bounded inference, persistence, and a minimal interface.
4. **Validate behavior and economics:** story-quality cases, access/allowance behavior, failure recovery, and representative latency/cost measurements.
5. **Prepare a small release:** choose hosting, prove deployment/restore, and define data handling and launch thresholds (**D08–D09, D19–D22**).

The [decision checklist](project-decisions.md) contains the alternatives, recommendations, and a source-by-source evaluation. As decisions are made, update this overview and record the resolution there.
