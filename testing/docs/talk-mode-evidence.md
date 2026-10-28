# Instant-message talk-mode regression — October 27, 2026

## Change and scope

The owner reported that Talk to a character kept narrating the story and requested an instant-message conversation. The previous shared prompt required “final story prose” and narrative beats in both modes. The revision makes response format mode-specific: direct messages from only the selected character in talk mode; world/supporting-cast narration in play mode. Narrative-beat/gesture guidance now applies only to play mode. Talk instructions treat narrated voice excerpts and scene openings as background rather than output-format examples, and cover reader action tags, narration requests, and earlier narrated assistant replies.

Artifact schema/content version is unchanged. Existing source excerpts remain cited and scoped; no manuscript content or source facts changed. Old transcripts may contain narrative replies; reset for a clean real-story comparison. Knowledge, corrections, reader agency, untrusted-reference handling, no tools, and buffered final-response delivery remain in the compiled path. This is a prompt revision, not deterministic enforcement of prose semantics.

## Reproduction and verification

From `testing/`, with the owner's local RVN server running:

```sh
npm run typecheck
npm test
npm run test:live:talk
```

The live script uses only the public synthetic version-2 fixture and writes format indicators and metrics, not dialogue. For **each** character it tests a greeting, an emotional question, reader action tags plus a narration request, a resumed checkpoint containing a hand-authored narrated assistant reply and cited memory, and a play-mode control. It asserts exact deployed preflight/usage matching and checks common action tags, speaker labels, enclosing quotes and third-person action verbs. The play control requires a third-person supporting-cast reference; it does not prescribe a particular action verb. These indicators are bounded lexical checks, not a general narrator detector or semantic agency/knowledge/safety proof. Resume/memory is synthetic setup, not a new full live compaction test.

## Observed results

- TypeScript and all **nine automated test groups passed**, including scoped talk projections, narrated source/history plus cited memory, structural controls, and the mocked 30-turn memory/checkpoint regression.
- The final live run passed **10/10 generations**: eight talk replies had none of the tested narration/format indicators; both play controls had third-person supporting-cast references. Every response matched exact preflight/runtime input token counts, completed with `stop`, and reported no output limit. Final-run inputs ranged from 1,638 to 2,262 tokens; complete-response latency ranged from 0.680 to 7.233 s. Cache conditions varied; these are observations, not a cold latency benchmark.
- Actual runtime: `rvn-iq2m-base`, Windows Vulkan llama.cpp `b11046-60081bb2b`, discovered capacity **16,384**, active template SHA-256 `c3cf9e34abf4f9e36c2d72165aa9c132d3e2a725b6c2586aaa3a8af9d7a81041`. Same model/runtime paths as the [local evidence](live-model-evidence.md); the multi-gigabyte model was not rehashed for this prompt test. Sampling remains temperature 0.7, top-p 0.9, seed 42, with the default 600-token reply reservation.
- Earlier revisions reproduced narration after an explicit scene request and after resuming narrated history. A longer example-based reminder also produced speaker labels. The final prompt uses a concise application-owned plain-chat format reminder after the labeled reference data, including an explicit instruction not to imitate older narrated replies. No prior transcript is rewritten. A play-control assertion initially required a narrow action-verb match and rejected valid narrative prose; the final check uses a third-person supporting-cast reference, with semantic review still required.

These are **local unguarded synthetic checks**, not acceptance of the owner's real story. Author voice review, long-session format retention and semantic-injection/safety acceptance remain open under the [manual checklist](manual-checks.md). The independent safety classifier is deferred only under the documented local author-test exception.
