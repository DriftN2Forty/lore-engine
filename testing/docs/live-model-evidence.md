# Base IQ2_M local verification — October 27, 2026

**Local unguarded author test.** Synthetic story data only; no independent safety classification or production acceptance claim. Evidence is from the running author's server, not a publisher benchmark.

## Runtime and provenance

| Field | Observed value / provenance |
| --- | --- |
| Owner-selected launcher | `D:\Projects\local-models\start-rvn-iq2m-base-8192.cmd`, inspected; already running, not restarted or modified |
| Local model | `%USERPROFILE%\.lmstudio\models\0bserverx\RVN-IQ2_M\RVN-IQ2_M.gguf` (launcher and `/props`) |
| Model SHA-256 | `a531c26993bb9ed91e299a025006915dc343285dc6dfabfd7d477370e42eb189` (computed from actual local bytes) |
| Model alias/type | `rvn-iq2m-base`; `IQ2_M - 2.7 bpw` |
| Runtime | `D:\AI\llama.cpp\llama-b11046-bin-win-vulkan-x64\llama-server.exe`; `/props.build_info`: `b11046-60081bb2b` |
| Launch settings | Loopback `127.0.0.1:8080`, `-c 8192 -np 1 -ngl 99 --jinja`; Vulkan binary |
| Hardware metadata | Windows video controller: AMD Radeon RX 7900 XT; driver `32.0.31036.15`. This is OS inventory, not measured VRAM use or a GPU-offload profile. |
| Capacity | `/props` and `/slots`: one slot, `n_ctx=8192`; `/v1/models` reports train context 262144, which is not the active slot capacity |
| Active template SHA-256 | `c3cf9e34abf4f9e36c2d72165aa9c132d3e2a725b6c2586aaa3a8af9d7a81041` |
| Tokenizer metadata | `/v1/models`: vocab size 248320; `/props`: BOS `endoftext` and EOS `im_end` special-token spellings. Template/tokenizer counts exercised through this server's actual endpoints. |
| Reasoning settings | Per request: `chat_template_kwargs.enable_thinking=false`, `reasoning_format=deepseek`; actual generation prefix verified to contain the closed, empty thinking block |
| Sampling | Temperature 0.7, top-p 0.9, seed 42; other samplers inherit runtime defaults. `/props` reported top-k 20 and min-p approximately 0.05. Chat output reservation 600; near-limit probe reservation 64. |
| Fixture | `synthetic-tide.chapter-01.end`, content version 1, author-designated synthetic local source |
| Lineage | Source repository revision/parent checkpoint remains unverified. The owner changed the local candidate from the earlier multilingual IQ2_M file to this **base** file. A matching filename does not prove identity with the cloud canary; neither its equivalence to the multilingual Q4_K_M writing reference nor a same-checkpoint relationship is established here. |

## Deployed template and adapter checks

`npm run test:live` (`scripts/live-check.ts`) made ten bounded synthetic inference calls through the real adapter:

- System/user roles rendered with the expected boundaries, and the actual disabled-thinking generation prefix was present.
- The tokenizer recognized the raw `im_start` spelling as one special token with `parse_special=true`, versus six ordinary tokens with `parse_special=false`. Application inspection rejected the raw spelling. This confirms why lower-trust content must be checked; it is not proof against every control-token or semantic attack.
- Preflight `/apply-template` → `/tokenize` counts matched `usage.prompt_tokens` exactly on **all ten requests**, including repeated assistant history and a near-limit prompt. Structured messages were sent to chat generation; no preformatted prompt was passed into chat a second time.
- All four mode/character selections completed with `finish_reason=stop`; no visible reasoning tags or output/context truncation was observed. The app never exposes `reasoning_content`.
- The Ivo pin-location probe did not reveal the blue drawer location withheld from his projection. This is one fixed negative check, not a broad knowledge/agency score.
- Completed checkpoint export/resume matched exactly, and reset cleared transcript. The browser integration also exercised a real reply and save/resume/reset.

### First request and five follow-ups

These are short, at-most-two-sentence responses in Talk/Ivo mode. Latency is the adapter's full model-API request/response duration, excluding separate application projection/compaction work. The server was already loaded; **first below is not a model cold-start benchmark**.

| Request | Input tokens | Generated tokens | Reused prompt tokens | Reuse % of logical input | Model API latency |
| --- | ---: | ---: | ---: | ---: | ---: |
| First | 975 | 57 | 0 | 0.00% | 9.165 s |
| Follow-up 1 | 1071 | 38 | 1031 | 96.27% | 3.348 s |
| Follow-up 2 | 1145 | 42 | 1108 | 96.77% | 3.771 s |
| Follow-up 3 | 1216 | 30 | 1186 | 97.53% | 2.726 s |
| Follow-up 4 | 1287 | 11 | 1245 | 96.74% | 1.457 s |
| Follow-up 5 | 1336 | 26 | 1297 | 97.08% | 2.457 s |

Cache figures are actual per-response `usage.prompt_tokens_details.cached_tokens`, not inferred from timings or slot/global counters. Logical context occupancy remains the full input count. Five follow-ups averaged 2.752 s; their different output lengths prevent treating that average as a fixed-throughput result.

**Subsequent capability correction:** The actual runtime binary's `--help` exposes `--cache-ram` with a documented default of 8192 MiB, prompt caching enabled by default, and idle-slot cache controls. Upstream [host-memory prompt caching](https://github.com/ggml-org/llama.cpp/pull/16391) can retain alternate prompt states in ordinary RAM and restore them into an active slot, including single-slot use. The earlier conversation's simplified claim that a slot was the only place to retain a conversation cache was incomplete. A summary may disturb active GPU state without necessarily evicting its RAM-backed snapshot. No effective process RAM-cache setting, retention TTL, or RVN A→B→A restoration result is established by the help inspection or the contiguous follow-up measurements above.

**Subsequent policy selection, not new evidence:** The owner favors [shared-prefix computation across accounts](../../docs/planning/project-overview.md#shared-prefix-cache-policy), replacing blanket per-account/playthrough salt requirements. Data ownership and response attribution remain application-enforced; a shared prefix is not an identity/access decision. Multi-user divergent-state/A→B→A/compaction, GPU/host-RAM retention/eviction/fairness, lifecycle and timing-membership checks remain open. Neither the consecutive follow-up figures nor the single-author memory smoke test is a passed shared-prefix isolation benchmark. No cache configuration was changed by the planning update.

**Later experiment:** A subsequent, separately recorded [default-versus-disabled host-cache comparison](cache-comparison-evidence.md) exercised short A→B→A and unrelated-story returns with fixed synthetic checkpoints and correct visit-label recall. Those results partially verify local switching/retention; they do not establish production accounts, compaction switching, cache capacity, memory pressure, lifecycle or timing-security acceptance. The paragraphs above describe the evidence available before that experiment.

Other selection checks: Talk/Mara 973 input / 33 generated / 8.098 s; Play/Mara 1581 / 38 / 9.447 s; Play/Ivo 1581 / 21 / 7.912 s. Each reported zero reused prompt tokens.

The near-limit synthetic probe had **8120 input tokens + 64 reserved output = 8184 projected tokens**, within the 8192-token slot. It generated two tokens, reported 8122 total, and completed in 33.198 s (prompt evaluation 32.978 s). This verifies one large single-slot request, not concurrent capacity, long-session coherence or general latency.

## Browser and platform checks

- Windows Node 26.9.0 default Next.js/Turbopack production build passed directly on the WSL UNC checkout. Earlier Windows **webpack** loader resolution failed; the broader assertion that Windows builds could not use this checkout was too strong.
- A Windows-hosted Next server bound to `127.0.0.1:3000` reached the Windows model loopback successfully.
- Microsoft Edge Playwright: two tests passed, including one real synthetic model generation through the web UI, matching visible preflight/usage, checkpoint save/resume and reset. The other test exercised the offline/fault-injected browser cases.
- WSL `curl http://127.0.0.1:8080/health` failed while Windows requests succeeded. Therefore use the Windows app launcher for the current setup; WSL-hosted chat remains blocked until loopback connectivity is configured and verified. No WSL networking or model-server settings were changed.

## Remaining author/live acceptance

### Subsequent live compaction check and fix

An additional memory smoke check loaded twelve **hand-authored synthetic** user/assistant pairs, including a correction from a red to a green scarf. The first unconstrained summary was rejected because the model wrapped its JSON in a Markdown fence; a diagnostic reproduction confirmed the same issue. The checkpoint remained intact. Schema validation was retained, and compaction now supplies a strict `response_format` JSON schema derived from the application memory contract to llama.cpp. No fence-stripping fallback was added.

The constrained rerun passed: eight validated memory items, twenty older messages compacted with the last two pairs retained, and the subsequent reply correctly recalled both the visitor's name and the corrected green color. The whole compaction-plus-reply operation took 25.837 s; the final reply took 5.184 s, used 1323 prompt / 18 generated tokens, and exactly matched preflight. This verifies one actual summary/recall path, not 30 turns of model-generated continuity. The two failure attempts, successful summary/recall pair and eleven preceding live requests are distinct evidence; failed attempts are not counted as successful turns.

### Larger-context discussion

The active launcher still requests 8192 tokens. `/v1/models` advertises a much larger training context, but 64K capacity, VRAM fit, prompt latency and long-history narrative behavior have **not** been measured. The OS reports an RX 7900 XT (normally 20 GB); OS inventory is not a runtime memory measurement. A larger context may postpone or eliminate compaction for a particular session, but cannot be assumed to provide unlimited or cost-free history. Testing 64K requires a separate server configuration/restart. The current periodic compaction policy remains as specified by the original test plan; revising it to capacity-triggered or disabled compaction is a separate behavior change, not an inference from this 8K test.

The owner's subsequent planning constraint is **one 16 GB VRAM GPU for RunPod character serving**. Future capacity tests must establish fit and latency on that class rather than extrapolate from the local card. Context/KV precision, runtime buffers, headroom and accepted concurrency are part of the measured profile; no live provider catalog read, 16 GB runtime test or paid provisioning occurred in this discussion.

Real-source narrative voice, motivation, agency, ambiguity and continuity need author review. A 30-turn **real-model** session remains open. Full adversarial/tokenizer round-trip coverage, exact source lineage, comparison with the writing reference and independent safety integration also remain open. These checks do not establish public-reader readiness.
