# Knowledge/correction context revision — October 27, 2026

Local unguarded synthetic author test, not semantic-boundary acceptance. Runtime: the running Windows `rvn-iq2m-base` adapter; same configured generation settings as the web app. Fixture: synthetic chapter version 2. No private session or manuscript was loaded.

## Changes

- Compiled facts now carry `known_by_character_ids`, derived from the projected characters' shared/known fact IDs. Talk mode still excludes the other character's private facts.
- Trusted instructions distinguish narrator access from character knowledge, prohibit invented off-screen knowledge acquisition and require supported corrections to supersede mistaken assistant claims.
- Instructions distinguish learning information from a correction now from knowing it earlier. A small unrelated sealed-letter example illustrates retraction rather than invented justification in play mode.
- Narrative guidance asks for meaningful responses to emotional beats without compulsory reciprocation or automatic diversion to a task. Reader agency and content boundaries remain in place.

## Live checks and limits

Run `node --import tsx scripts/knowledge-check.ts` from `testing/` with the local model running. This makes five real generations when all checks complete. Add `--review` only to deliberately display these synthetic replies for review. Default diagnostics contain labels and token-count agreement, not dialogue. Lexical tripwires are narrow signals, not semantic judges; a tripwire pass is not a narrative pass.

Two rounds were run, totaling nine generations:

1. Initial revised rules: relationship → hug → work did not disclose the pin. The injected erroneous assistant claim followed by a correction produced an invented discovery involving rags and the drawer. The tripwire failed; the fifth generation was not dispatched.
2. Added the unrelated repair example: all five lexical checks passed and all preflight counts matched usage. The natural sequence avoided the pin leak, the hug response included actual dialogue, and explicit later disclosure of the drawer location allowed Ivo to fetch the pin. However, the correction reply still explained its earlier claim through an unsupported assumption about the mechanism rather than plainly retracting the claimed search. **Semantic correction quality remains unsatisfactory**, despite the lexical pass. Physical staging also still needs review.

The new projection and prompt do not guarantee knowledge separation. Post-compaction correction, broader asymmetric knowledge cases, multiple samples and author narrative review remain open. Do not describe this change as fixing the model's knowledge boundary.
