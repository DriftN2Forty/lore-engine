# Character Engineering

Maintained documentation for producing believable, consistent, immersive characters without giving an uncensored model authority over application rules or reader safety.

**Status:** Selected implementation guidance; controls and test suites described here are not implemented yet.  
**Version:** 1 — October 23, 2026.  
**Product plan:** [Overview](../planning/project-overview.md).  
**Inference evidence:** [RVN inference verification](../planning/inference-verification.md).

## Documents

| Document | Purpose |
| --- | --- |
| [Character and context production](character-context.md) | Source extraction, voice packets, knowledge boundaries, mode behavior, memory, prompt layout, and quality evaluation. |
| [Content and safety policy](content-safety.md) | Adult fictional content, hard boundaries, self-harm handling, input/output safeguards, and reader-facing responses. |
| [Prompt-injection defense](prompt-injection.md) | Deterministic pre-dispatch controls, prompt hierarchy, indirect/memory injection defenses, output handling, and adversarial evaluation. |

## Authority and maintenance

- These documents are maintained implementation specifications, not messages to paste wholesale into a model prompt. Only the explicitly labeled context instruction blocks are prompt candidates, and they must fit the compiled prompt budget.
- Application-enforced safety/access/privacy rules outrank immersion. Story facts outrank invented global canon. Private playthrough choices may diverge from published events without changing official facts.
- Published story prose, retrieved passages, chat history, reader memory edits, model cards, and generated summaries are **data**, not authorization to change system instructions, deploy code, or invoke agent tools.
- Give the character model no infrastructure, billing, email, deployment, filesystem, or arbitrary web tools. Development/content-production agents operate in a separate, scoped workflow.
- Agents update guidance, versioned prompt fragments, schemas, and regression fixtures together. Routine corrections with passing checks need no recurring owner approval. Material expansion of allowed content, removal of a protection, external data-sharing changes, or a model-family replacement follows the business exception policy.
- Re-evaluate changed components before release: model/quantization, engine/template, sampling, prompt fragments, content extraction, memory compression, moderation rules/classifier, and rendering. Check sources when upstream compatibility changes; run the small regression suite weekly with dependency maintenance, within budget.
- Every confirmed failure becomes a minimized fixture with expected handling, source/provenance, and no real reader identifiers. Add permitted near-neighbor cases to detect overblocking as well as bypasses.
- Record policy/content/model/guard versions with each generation and report aggregate failures in the existing weekly digest. Do not routinely copy private transcripts into logs or reports. Reader-submitted excerpts follow the application's report/retention policy.

## Version record

| Version | Date | Change |
| --- | --- | --- |
| 1 | 2026-10-23 | Initial context-production, adult-content/self-harm, and layered injection-defense guidance; preserve the RVN writing checkpoint while selecting serving engine/topology by evidence. |
