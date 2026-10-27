# Default versus disabled host-RAM cache — October 27, 2026

**Local unguarded synthetic experiment.** This tests the running Windows base RVN setup, not public-reader security, capacity limits or production narrative quality. No cloud resources or paid tests were used.

## Configuration and method

- Same base model, hash, runtime `b11046-60081bb2b`, active template hash, Vulkan backend, one slot and 8192 context as [the earlier local record](live-model-evidence.md). Sampling remains temperature 0.7, top-p 0.9, seed 42; other runtime defaults unchanged. Output reservation is 64 tokens; actual replies were six or seven tokens.
- Compare **no explicit cache-RAM flag** against **`--cache-ram 0`**. The build's documented no-override default is 8192 MiB of host RAM. This flag controls host snapshot retention, not all active-slot prefix reuse.
- The original running process was observed to have no explicit cache-RAM argument. An initial observational default run was followed by an explicit disabled-cache restart, then a fresh default restart and rerun. The fresh disabled/default runs are the primary table below; the original warmed process's first result is not treated as a clean cold baseline. The agent's launch environment had no `LLAMA_ARG_CACHE_RAM` override. Restored/default and disabled command lines were verified.
- All twelve request bodies are fixed across conditions: two synthetic visits A/B to the same story/character, plus four mechanically themed synthetic story variants C–F. They pass the existing artifact/checkpoint schemas and use the app's context compiler, tokenizer and generation adapter. Variant titles occur early in story data, reducing the matching prefix to 246 tokens even though shared app rules remain the same.
- Histories are hand-authored and unchanged by generated replies, avoiding response-dependent prompt drift. Each contains a unique visit label; each generated answer must recall its own label and contain no other test label. This is a finite recall/switching check, not authenticated account enforcement.
- Model API latency includes model request/response, but not separate token-count requests, server restart/model loading or whole browser-turn preparation. No VRAM/RAM sampler was used. Live comparisons ran sequentially, not randomized or repeated enough for p95/confidence intervals; timing variation and ordinary machine load remain possible.

## Results (fresh-process rounds)

| Case | Input tokens | Default reused tokens | Disabled reused tokens | Default model API time | Disabled model API time |
| --- | ---: | ---: | ---: | ---: | ---: |
| A first | 1012 | 0 | 0 | 6.131 s | 6.553 s |
| A exact repeat | 1012 | 1008 | 1008 | 0.620 s | 0.675 s |
| B, same story | 1012 | 938 | 938 | 1.285 s | 1.376 s |
| A after B | 1012 | 938 | 938 | 1.325 s | 1.376 s |
| C, other story | 1022 | 0 | 0 | 6.414 s | 6.529 s |
| D, other story | 1027 | 0 | 0 | 6.418 s | 6.636 s |
| E, other story | 1021 | 0 | 0 | 6.335 s | 6.514 s |
| F, other story | 1023 | 0 | 0 | 6.408 s | 6.581 s |
| A after four other stories | 1012 | 1008 | 0 | **0.843 s** | **6.475 s** |
| B after story churn | 1012 | 938 | 938 | 1.294 s | 1.392 s |
| C return | 1022 | 1018 | 0 | **0.847 s** | **6.558 s** |
| A final return | 1012 | 938 | 0 | **1.511 s** | **6.557 s** |

Total model API time across these twelve short requests: default **39.431 s**, disabled **57.222 s**. These totals are exploratory observations, not a sustained-throughput claim. Cache figures are per-response `usage.prompt_tokens_details.cached_tokens`, not inferred from timings or global counters. All input preflight counts matched reported prompt usage, and all visit-label/no-foreign-label assertions passed in all three twelve-request rounds (36 requests).

The earlier observational default round also restored A after four other stories (1008 reused tokens / 0.855 s) and C on return (1018 / 0.845 s). Its initial cache was already populated, so its first request/total is excluded from the main comparison.

## Interpretation and limits

- Disabling the host cache leaves exact-repeat and same-story active-slot prefix reuse working. It is not a cache-off-versus-cache-on comparison for every form of caching.
- Default host caching retained useful alternate-story state in this small single-slot test. Returning to a previous story is where the clearest observed difference appeared; new stories still required prompt processing in both conditions.
- New-story requests shared 246 initial tokens but reported zero reuse in both runs. Token overlap alone does not guarantee that this runtime/model has a suitable reusable saved state at that boundary; the exact cause was not diagnosed. Do not equate calculated common-prefix length with actual cached-token count or insist that every matching token must be reused.
- With a larger catalog, **returns to previously active stories** may benefit even when adjacent users share little context. More distinct stories/longer histories also increase eviction pressure. This six-visit/five-story workload does not locate the cache's capacity limit, establish a retention TTL, or predict the hit rate at production catalog size.
- Still open: longer histories/catalog sweeps, larger-context and actual 16 GB hardware fit, host/GPU memory measurements, noisy-neighbor/concurrency/fairness, chat→compaction→chat switching, deletion/invalidation, timing-membership exposure and full production authorization/output-delivery checks.

## Restoration and reproduction

After the disabled round, the server was restarted with the original model/alias/loopback/context/slot/GPU/Jinja arguments and **no explicit cache-RAM flag**. The model health endpoint and Windows-hosted app both responded successfully. Original launcher files outside this repository were not edited.

See [benchmark commands](live-checks.md#default-versus-disabled-host-cache-comparison). The `default`/`disabled` script argument labels a run; it does not secretly change the server. Configure/restart the model separately and verify its command line. Use a fresh process for each primary comparison and keep the other settings/workload fixed.
