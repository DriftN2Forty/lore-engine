# LoreEngine

A subscription-based interactive-fiction companion to the author's published stories. Readers can **talk to a character** or **play as a character** in private, chapter-grounded scenes that remember their choices.

The goal is a profitable, immersive experience readers return to, with AI-assisted content preparation and low ongoing maintenance for the author.

## Project status

**Planning and documentation.** This repository does not yet contain a runnable application, dependency manifest, migrations, deployed inference worker, or implemented safety controls. There are no installation or test commands yet.

The product and operating defaults have been selected. Model identity, deployment compatibility, provider eligibility, and real unit economics still require validation. Documentation distinguishes selected policies from implemented or tested behavior.

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

- Modular monolith with managed application/database hosting and independently automated billing entitlements.
- RunPod Serverless with vLLM and a compatible quantization of the author's RVN checkpoint. The author's Q4_K_M writing model is the style reference, not a mandatory production file format.
- Bounded context, durable playthrough/message storage, memory compaction, and atomic reply/cost accounting.
- Deterministic pre-dispatch controls, independent input/output safety checks, and complete-response review before reader-visible delivery at launch.
- Agent-assisted story asset production, routine releases, backups, maintenance, and business/operations reporting.

**Inference remains a validation task:** a public Flash-Next RVN NVFP4 companion has publisher-reported custom vLLM execution, but the documented profile does not prove prefix caching, our context budget, or low-cost serverless deployment. It is also a large model. Do not infer fit or cost from the word “quantized.” Read the [verification record](docs/planning/inference-verification.md) before provisioning.

## Documentation

| Document | Contents |
| --- | --- |
| [Project overview](docs/planning/project-overview.md) | Commercial offer, reader experience, architecture, budgets, operating policies, and launch sequence. |
| [Decision record and remaining work](docs/planning/project-decisions.md) | Selected defaults, rationale, owner inputs, and executable implementation tasks. |
| [RVN/vLLM verification](docs/planning/inference-verification.md) | Dated primary-source research, artifact/runtime findings, cache limitations, and required deployment tests. |
| [Character engineering](docs/character-engineering/README.md) | Index and maintenance conventions for believable, consistent characters. |
| [Character/context production](docs/character-engineering/character-context.md) | Voice packets, source grounding, modes, knowledge boundaries, prompt layout, memory, and evaluation. |
| [Content/safety policy](docs/character-engineering/content-safety.md) | Adult-content eligibility, selected boundaries, self-harm support, guards, and reviewed delivery. |
| [Prompt-injection defense](docs/character-engineering/prompt-injection.md) | Deterministic trust boundaries, context instructions, memory/source attacks, and adversarial testing. |
| [Agent instructions](AGENTS.md) | Repository working conventions and automation boundaries. |
| [Original Gemini summary](docs/planning/gemini-conversation.md) | Historical input only; its code examples are not an implementation specification. |

## Next work

1. Identify the exact RVN writing artifact, parent checkpoint, template, and sampling settings; designate the first story source.
2. Use the later RunPod-MCP-enabled environment to validate a compatible vLLM worker, quantization, actual prefix caching, context capacity, hardware, and itemized cost.
3. Build one end-to-end revenue slice with both modes, reviewed generation, memory, usage accounting, and eligible test-mode billing.
4. Validate narrative quality, safety/injection boundaries, economics, and recovery before opening the small paid pilot.

Use the [remaining-work checklist](docs/planning/project-decisions.md#6-remaining-inputs-and-executable-work) for task details and progress. Routine implementation should proceed under the selected defaults rather than reopen every decision.
