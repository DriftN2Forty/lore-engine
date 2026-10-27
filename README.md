# LoreEngine

A subscription-based interactive-fiction companion to the author's published stories. Readers can **talk to a character** or **play as a character** in private, chapter-grounded scenes that remember their choices.

The goal is a profitable, immersive experience readers return to, with AI-assisted content preparation and low ongoing maintenance for the author.

## Project status

**Planning and documentation.** This repository does not yet contain a runnable application, dependency manifest, migrations, production inference worker, or implemented safety controls. One experimental Runpod Serverless GGUF endpoint exists for further testing. There are no installation or test commands yet.

The product and operating defaults have been selected. The owner has identified the RVN 27B multilingual Q4_K_M writing file; runtime/settings, deployment compatibility, provider eligibility, and real unit economics still require validation. Documentation distinguishes selected policies from implemented or tested behavior.

**RunPod discovery and experiment update:** Read-only catalog/schema findings are recorded in the [discovery report](docs/planning/runpod-discovery.md). A short RVN IQ2_M load/inference test through the official Runpod Ollama worker succeeded; the deployed configuration and evidence are recorded in [cloud endpoint notes](docs/cloud-endpoints/README.md). This does not validate production quality, capacity, routing, or economics. A separate vLLM GGUF-plugin attempt failed for this artifact; vLLM and APC are not requirements.

## Product direction

- Start with one published story, up to two characters, and three scene entry points.
- Support both character conversation and protagonist-controlled narration.
- Ground each scene in a published chapter, then allow private, non-canonical what-if consequences.
- Preserve character voice, reader agency, spoiler boundaries, and continuity through scoped context and editable playthrough memory.
- Permit eligible reader-initiated consensual and non-consensual adult fictional content under explicit settings, with application-enforced safety boundaries, including no facilitation of self-harm.
- Use a small one-time preview and two monthly paid tiers. Prices and allowances are launch hypotheses pending measured inference costs; see the [subscription offer](docs/planning/project-overview.md#3-subscription-offer).

## Planned architecture

```text
Reader → TypeScript / Next.js application/router → local hot llama.cpp worker (Cloudflare Tunnel)
                                               ├→ RunPod Serverless overflow
                                               └→ PostgreSQL
```

- Modular monolith planned for a rented VPS application host, with database placement to be decided and billing entitlements automated independently.
- Preserve the author's RVN checkpoint and writing-quality reference. A local llama.cpp worker with RunPod Serverless overflow is a candidate serving topology; runtime, model quantization, and cost remain subject to validation.
- Bounded context, durable playthrough/message storage, memory compaction, and atomic reply/cost accounting.
- Deterministic pre-dispatch controls, independent input/output safety checks, and complete-response review before reader-visible delivery at launch.
- Agent-assisted story asset production, routine releases, backups, maintenance, and business/operations reporting.

**Inference remains a validation task:** compare same-checkpoint RVN quantizations against the confirmed multilingual Q4_K_M writing reference. Prefer a smaller variant only if author-reviewed quality and independent safety checks pass. Validate the local-worker/RunPod-overflow route, artifact lineage, context budget, cold-start behavior, and full economics. Caching is optional; any enabled caching must respect data isolation. Read the [verification record](docs/planning/inference-verification.md) before provisioning.

## Documentation

| Document | Contents |
| --- | --- |
| [Project overview](docs/planning/project-overview.md) | Commercial offer, reader experience, architecture, budgets, operating policies, and launch sequence. |
| [Decision record and remaining work](docs/planning/project-decisions.md) | Selected defaults, rationale, owner inputs, and executable implementation tasks. |
| [RVN inference notes](docs/planning/inference-verification.md) | Short model-size summary, reproduced GGUF test, historical vLLM plugin failure, and remaining validation. |
| [Live RunPod discovery](docs/planning/runpod-discovery.md) | MCP catalog/schema evidence, recovered Pod settings, storage/worker findings, provider blockers, and unresolved runtime questions. |
| [Cloud endpoint notes](docs/cloud-endpoints/README.md) | Dated configurations and observations for Runpod cloud inference endpoints. |
| [VPS setup and Cloudflare plan](docs/planning/vps-setup.md) | Future WSL-to-VPS deployment details, Cloudflare routing choices, operational capture fields, and acceptance checks. |
| [RVN authoring and content preparation](docs/authoring/README.md) | Exact writing model, personal llama.cpp serverless plan, NSFW chapter processing, cited character assets, and future publishing tools. |
| [Character engineering](docs/character-engineering/README.md) | Index and maintenance conventions for believable, consistent characters. |
| [Character/context production](docs/character-engineering/character-context.md) | Voice packets, source grounding, modes, knowledge boundaries, prompt layout, memory, and evaluation. |
| [Content/safety policy](docs/character-engineering/content-safety.md) | Adult-content eligibility, selected boundaries, self-harm support, guards, and reviewed delivery. |
| [Prompt-injection defense](docs/character-engineering/prompt-injection.md) | Deterministic trust boundaries, context instructions, memory/source attacks, and adversarial testing. |
| [Agent instructions](AGENTS.md) | Repository working conventions and automation boundaries. |

## Next work

1. Complete the confirmed RVN writing file's parent-revision/runtime/template/settings record; designate the first story source.
2. Use the connected RunPod MCP environment to validate a pinned compatible worker, quantization, actual prefix caching, context capacity, and complete itemized cost.
3. Build one end-to-end revenue slice with both modes, reviewed generation, memory, usage accounting, and eligible test-mode billing.
4. Validate narrative quality, safety/injection boundaries, economics, and recovery before opening the small paid pilot.

Use the [remaining-work checklist](docs/planning/project-decisions.md#6-remaining-inputs-and-executable-work) for task details and progress. Routine implementation should proceed under the selected defaults rather than reopen every decision.
