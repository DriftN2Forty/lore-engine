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

## Close-friend depth tuning — October 28, 2026

The owner found the message format improved but the replies short and impersonal. The runtime now establishes private best-friend ease and trust, permits several short conversational paragraphs, and encourages candid feelings, reasons and reciprocal personal contributions. It explicitly distinguishes first-person emotional self-report from scene narration and discourages generic reassurance, compulsory questions and repeated coaxing. Character voice, opinions, knowledge limits and reader agency still apply; the premise establishes no specific shared memories, romance or reader biography.

The talk projection now replaces the source artifact's `reader_role`, `initial_familiarity` and `opening_situation` with application-selected close-friend setup. This intentionally overrides old “first meeting” guidance for existing real artifacts without rewriting source files or changing artifact hashes/schema/content versions. The synthetic fixture deliberately retains its original first-meeting fields as a regression case; Play as still uses its authored setup. UI guidance now describes the effective premise instead of showing the stale source talk opening. Old distant/narrated transcripts can still influence replies; start fresh for author comparison.

Verification:

- TypeScript and all **nine automated test groups passed**, including replacement of deliberately distant source setup without borrowing another character's identity/private facts, and the existing mocked memory/scope/role cases.
- The revised `test:live:talk` passed **10/10 local synthetic generations** on the same advertised build, template hash, alias and 16,384-token capacity as above. All input token counts matched runtime usage; all replies finished with `stop`. Eight talk replies had none of the tested format indicators; both play controls retained third-person supporting-cast references.
- The emotional prompt now asks what has been weighing on each character about the known bell problem, rather than only asking whether they experience loneliness. Both emotional replies in this run were **164 words in two paragraphs**; greetings were 39 and 101 words. Word/paragraph counts are recorded as descriptive metrics, never minimum-length acceptance criteria. The changed prompt and cache conditions mean this is not a controlled before/after quality or latency benchmark.
- A separate four-generation synthetic spot review (greeting plus emotional follow-up for each character) produced direct first-person discussion of feelings about the supplied bell problem and, for Mara, the established relationship history. No manuscript or reader dialogue was used. This small review does not establish authentic real-story voice or broad semantic compliance.
- No model, quantization, sampling or output reservation changed. The next quality step is the owner's fresh real-story conversation and selected example review, not a claim of IQ2/Q4 equivalence. Full live compaction, long-session format retention and independent safety/injection acceptance remain open.

## Conversational responsiveness follow-up — October 28, 2026

The owner supplied a private example showing an unsolicited scene-context dump after a playful greeting, apology without tone change, flat acknowledgment of celebration and distancing responses to envy/admiration. The private dialogue and story details were **not** added to fixtures or routine diagnostics. The revised prompt matches conversational intent, makes disclosure conditional on the invitation, asks for a personal contribution beyond agreement, and distinguishes a tone correction from a permanent request for terse answers. It allows plausible present feelings/opinions within characterization without fabricating past events, shared memories, private knowledge or later canon. The final format reminder retains explicit no-narration instructions.

`test:live:talk` now attempts **18** public-synthetic generations: for each character, playful greeting, repair after a hand-authored context-heavy prior reply, invited emotional question, celebration, jealousy, clarified vulnerability, narration request, resumed narrated history with cited memory, and a play-mode control. The cited loneliness memory now references the correct emotional-question message after adding the repair case. By default it exports metrics/flags only; `--review-synthetic` also displays these public-synthetic replies for deliberate qualitative inspection. Lexical format checks cannot establish warmth, reader-directed attention, factual grounding or absence of first-person narrated actions.

### Actual checks and limits

- Final TypeScript and all **nine automated test groups passed** after the prompt iterations; `git diff --check` also passed. No passing full live conversational suite is claimed.
- Multiple bounded local candidate trials exposed persistent problems: greetings sometimes still mentioned background scene details; responses after tone repair could collapse to empty agreement; a longer example-based candidate copied a repair example and later narrated a scene. That example block was removed. Another candidate passed several lexical checks while still giving first-person action descriptions and unsupported source embellishment, illustrating why lexical passes are not semantic acceptance.
- The final candidate's **first four requests** matched actual preflight/runtime token counts and finished with `stop`. Its playful greeting and tone repair were 28 and 30 words; the invited emotional answer was 130 words in two paragraphs; celebration fell back to four words. A subsequent jealousy request failed the adapter's existing “no usable final prose or attempted a tool call” validation, so the run stopped. Other candidate runs hit the same validation error at different turns. The generic error does not identify whether final text was empty or another rejected response shape occurred; root cause is unverified. Failed candidates were not committed as exchanges.
- Runtime discovery still reported `rvn-iq2m-base`, build `b11046-60081bb2b`, template hash `c3cf9e34abf4f9e36c2d72165aa9c132d3e2a725b6c2586aaa3a8af9d7a81041`, and capacity 16,384. `/props` reported default `max_tokens=-1`, `n_predict=-1`, repeat penalty 1.0 and DRY multiplier 0.0; the adapter still supplied its 600-token output limit, temperature 0.7, top-p 0.9 and seed 42. No engine, model, quantization or sampling settings were changed. Prompt tuning alone has not resolved all observed failures, and no cause is attributed to IQ2 versus Q4 without a matched comparison.

The changes implement the requested conversational direction, but **live semantic quality remains open**, including short/impersonal replies, unsupported personal embellishment, and response-format reliability. The owner's fresh real-story trial is a quality comparison, not an acceptance claim. Keep these failures distinct from the automated schema/scope/transactional checks and from independent safety acceptance.
