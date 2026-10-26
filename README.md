# LoreEngine

A subscription-based interactive-fiction companion to the author's published stories. Readers can **talk to a character** or **play as a character** in private, chapter-grounded scenes that remember their choices.

The goal is a profitable, immersive experience readers return to, with AI-assisted content preparation and low ongoing maintenance for the author.

## Project status

**Planning and documentation.** This repository does not yet contain a runnable application, dependency manifest, migrations, deployed inference worker, or implemented safety controls. There are no installation or test commands yet.

The product and operating defaults have been selected. The owner has identified the RVN 27B multilingual Q4_K_M writing file; runtime/settings, deployment compatibility, provider eligibility, and real unit economics still require validation. Documentation distinguishes selected policies from implemented or tested behavior.

**RunPod discovery update:** Authenticated read-only MCP research is recorded in the [discovery report](docs/planning/runpod-discovery.md). It confirms Serverless hardware/configuration and global-volume options, and recovers a stopped Pod's settings with a model-filename discrepancy. No deployment benchmark has passed.

## Product direction

- Start with one published story, up to two characters, and three scene entry points.
- Support both character conversation and protagonist-controlled narration.
- Ground each scene in a published chapter, then allow private, non-canonical what-if consequences.
- Preserve character voice, reader agency, spoiler boundaries, and continuity through scoped context and editable playthrough memory.
- Permit eligible reader-initiated consensual and non-consensual adult fictional content under explicit settings, with application-enforced safety boundaries, including no facilitation of self-harm.
- Use a small one-time preview and two monthly paid tiers. Prices and allowances are launch hypotheses pending measured inference costs; see the [subscription offer](docs/planning/project-overview.md#3-subscription-offer).

## Planned architecture

```text
Reader → TypeScript / Next.js application → RunPod Serverless
                       |                      └→ vLLM + quantized RVN
                       └→ PostgreSQL
```

- Modular monolith planned for a rented VPS application host, with database placement to be decided and billing entitlements automated independently.
- RunPod Serverless with vLLM and a compatible quantization of the author's RVN checkpoint. The author's Q4_K_M writing model is the style reference, not a mandatory production file format.
- Bounded context, durable playthrough/message storage, memory compaction, and atomic reply/cost accounting.
- Deterministic pre-dispatch controls, independent input/output safety checks, and complete-response review before reader-visible delivery at launch.
- Agent-assisted story asset production, routine releases, backups, maintenance, and business/operations reporting.

**Inference remains a validation task:** defer Flash-Next and begin with same-checkpoint RVN 27B Q2/Q3 variants against the confirmed multilingual Q4_K_M writing reference. Prefer the smallest variant with acceptable author-reviewed quality that passes the independent serving/safety checks. The vLLM GGUF path must demonstrate working, per-account-isolated prefix caching; loading alone is insufficient. Parent-revision lineage, our context budget, and serverless economics still require validation. Read the [verification record](docs/planning/inference-verification.md) before provisioning.

## Documentation

| Document | Contents |
| --- | --- |
| [Project overview](docs/planning/project-overview.md) | Commercial offer, reader experience, architecture, budgets, operating policies, and launch sequence. |
| [Decision record and remaining work](docs/planning/project-decisions.md) | Selected defaults, rationale, owner inputs, and executable implementation tasks. |
| [RVN/vLLM verification](docs/planning/inference-verification.md) | Dated primary-source research, artifact/runtime findings, cache limitations, and required deployment tests. |
| [Live RunPod discovery](docs/planning/runpod-discovery.md) | MCP catalog/schema evidence, recovered Pod settings, storage/worker findings, provider blockers, and unresolved runtime questions. |
| [VPS setup and Cloudflare plan](docs/planning/vps-setup.md) | Future WSL-to-VPS deployment details, Cloudflare routing choices, operational capture fields, and acceptance checks. |
| [RVN authoring and content preparation](docs/authoring/README.md) | Exact writing model, personal llama.cpp serverless plan, NSFW chapter processing, cited character assets, and future publishing tools. |
| [Character engineering](docs/character-engineering/README.md) | Index and maintenance conventions for believable, consistent characters. |
| [Character/context production](docs/character-engineering/character-context.md) | Voice packets, source grounding, modes, knowledge boundaries, prompt layout, memory, and evaluation. |
| [Content/safety policy](docs/character-engineering/content-safety.md) | Adult-content eligibility, selected boundaries, self-harm support, guards, and reviewed delivery. |
| [Prompt-injection defense](docs/character-engineering/prompt-injection.md) | Deterministic trust boundaries, context instructions, memory/source attacks, and adversarial testing. |
| [Agent instructions](AGENTS.md) | Repository working conventions and automation boundaries. |
| [Original Gemini summary](docs/planning/gemini-conversation.md) | Historical input only; its code examples are not an implementation specification. |

## Next work

1. Complete the confirmed RVN writing file's parent-revision/runtime/template/settings record; designate the first story source.
2. Use the connected RunPod MCP environment to validate a pinned compatible worker, quantization, actual prefix caching, context capacity, and complete itemized cost.
3. Build one end-to-end revenue slice with both modes, reviewed generation, memory, usage accounting, and eligible test-mode billing.
4. Validate narrative quality, safety/injection boundaries, economics, and recovery before opening the small paid pilot.

Use the [remaining-work checklist](docs/planning/project-decisions.md#6-remaining-inputs-and-executable-work) for task details and progress. Routine implementation should proceed under the selected defaults rather than reopen every decision.
