# RVN Authoring and Content Preparation

**Recorded:** October 23, 2026.  
**Status:** Owner-selected use case and proposed setup; no serverless authoring endpoint, tools, or publishing workflow has been implemented or tested here.

**Live discovery update (October 24 UTC):** [RunPod findings](../planning/runpod-discovery.md) recover the stopped Pod configuration, quote Serverless hardware, confirm global-volume support and the five-minute API setting, and identify existing queue workers with an OpenAI facade. Catalog and source inspection are not a reproduced deployment.

## Purpose

Give the owner on-demand access to the same RVN model used in writing, through OpenCode on their local computer. Use it for occasional project work, story-chapter processing, and preparation of character/context assets for LoreEngine. Eligible NSFW fiction is an intentional use case, including material that a GPT-based workflow may decline to generate or process. Do not assume every hosted model has identical content restrictions or route private chapters to a different provider automatically.

The owner previously used this model on a manually started/stopped RunPod Pod with llama.cpp. The desired replacement starts on demand and scales to zero after **five minutes without work**, avoiding forgotten running GPUs while retaining a short warm window between writing prompts.

This authoring endpoint uses the existing GGUF with llama.cpp as its starting point. The reader application's selected [RunPod/vLLM deployment](../planning/project-overview.md#inference-runpod-serverless--vllm--quantized-rvn) remains a separate serving/evaluation track. An authoring model can receive project tools through a controlled host; the live reader-facing character model remains tool-free.

## Confirmed writing model

The owner supplied the [exact file](https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF/blob/main/RVN-Q4_K_M-multilingual.gguf). The following metadata was checked against its [pinned LFS pointer](https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF/raw/506f3027460d29a4c982a2ebf46bb4d11bd4a3c0/RVN-Q4_K_M-multilingual.gguf), without downloading the weights:

| Field | Value |
| --- | --- |
| Repository | `0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF` |
| Filename | `RVN-Q4_K_M-multilingual.gguf` |
| Family / format | RVN 27B / multilingual-calibrated Q4_K_M GGUF |
| Inspected file revision | `506f3027460d29a4c982a2ebf46bb4d11bd4a3c0` |
| Weight-file size | **16,547,400,224 bytes**, approximately 16.55 GB / 15.41 GiB |
| Publisher SHA-256 | `9ed40ccc8b8432f38b9a85d0ca67928167f5719e8c10bd299e56d34facaf6e61` |
| Previous client / engine | Local OpenCode → remote llama.cpp, owner-reported |

The URL identifies the intended reference file. Live MCP reads have since recovered an RTX 5090 Pod's image digest and launch flags: **131072 context, one slot, flash attention and q8_0 K/V caches**. However, its download command specifies **`RVN-Q4_K_M.gguf`**, not the multilingual file. See the [recovered configuration and discrepancy](../planning/runpod-discovery.md#2-the-old-pod-provides-configuration-not-a-benchmark). Preserve the owner-designated multilingual reference; do not assume the two files are interchangeable. Local checksum, numeric llama.cpp build, resolved chat template, OpenCode system/sampling settings and complete parent lineage remain open. Verify staged bytes against the publisher checksum when deploying. Select the exact multilingual filename rather than a generic `:Q4_K_M` shortcut that could resolve another variant.

## Proposed serverless setup

```text
Local OpenCode / bounded chapter-preparation workflow
    → authenticated RunPod Serverless endpoint
        → pinned llama-server + exact RVN multilingual GGUF

Local workflow host
    → authorized source reads and candidate asset writes
    → independent validation / evaluation
    → scoped publishing tool when established
```

Tool execution belongs to the authorized workflow host, not to arbitrary commands printed by the inference server. Keep credentials outside prompts and private source text out of routine telemetry.

| Setting | Initial candidate |
| --- | --- |
| Active/minimum workers | 0, allowing scale-to-zero |
| Maximum workers | 1 for this personal workload |
| Idle timeout | 300 seconds after the last job completes; this waiting time is billed |
| Runtime | Pinned compatible llama.cpp build/image; preserve the working template/settings initially |
| GPU | Catalog confirms 24/32/48 GB candidates; test the desired context explicitly, especially the old Pod's configured 128K |
| FlashBoot | Enabled initially; measure rather than promise faster revival |

These lifecycle settings follow RunPod's [endpoint configuration reference](https://docs.runpod.io/serverless/endpoints/endpoint-configurations); they are proposed values, not an existing endpoint configuration.

Live schema inspection confirms `idleTimeout: 300` is valid for **LOAD_BALANCER + REQUEST_COUNT** or **QUEUE + QUEUE_DELAY**. **QUEUE + REQUEST_COUNT rejects idleTimeout.** Set values explicitly rather than rely on conflicting console/API defaults. The provider also documents setting maximum workers to zero after seven request-free days, requiring a control-plane re-enable action; automatic worker startup is not guaranteed after indefinite endpoint dormancy. See the [routing and dormancy findings](../planning/runpod-discovery.md#4-five-minute-shutdown-is-expressible-with-routing-constraints).

The weight file is not the total memory requirement. Measure GPU/host memory, context/cache allocations, load peaks, and simultaneous request handling. Long chapter-processing prompts and OpenCode histories may need different limits from the reader app; do not silently truncate chapters or inherit the app's context budget without testing. One maximum worker limits scaling, not total spending.

### OpenCode API and cold starts

`llama-server` offers an OpenAI-compatible API. RunPod's raw queue job API is a different contract, but the inspected `eniewold/llama-cpp-runpod` **b11723** queue worker already documents an OpenAI/SSE facade at `https://api.runpod.ai/v2/<endpoint-id>/openai/v1`. A custom adapter is therefore not automatically required. Inspect this existing worker before building a custom image; retain **native load balancing** as the direct-HTTP comparison. These are different image/API contracts, not interchangeable endpoint switches. See [worker findings and exact-file settings](../planning/runpod-discovery.md#6-existing-workers-and-actual-compatibility-evidence). Verify model discovery/aliasing and OpenCode's actual request format, tool-call parsing, timeouts, and error handling before relying on either route. Serving prose successfully does not establish reliable tool use.

RunPod's [load-balancing documentation](https://docs.runpod.io/serverless/load-balancing/overview) currently lists a two-minute no-worker request timeout and a 5.5-minute processing timeout. It also documents possible no-worker errors during initialization and no built-in queue/retry. Test readiness handling against llama.cpp's actual health responses; the documented healthy/initializing codes are 200/204, not an assurance that every image implements that contract. Avoid frequent external keepalive requests that defeat idle shutdown.

If a cold start exceeds the client/request window, use bounded readiness polling or a small adapter rather than blindly resending an ambiguously accepted generation. Long chapter work should be chunked/checkpointed into bounded requests; investigate a queue adapter if those jobs need asynchronous execution. Do not build a general orchestration platform for this workload.

### Model storage

Check [RunPod model caching](https://docs.runpod.io/serverless/endpoints/model-caching) before purchasing a persistent volume. RunPod says it prefers cached hosts and performs a cache-miss model download before billed worker startup. This can still increase request wait time, and engine loading/warmup remain separate work. Custom llama.cpp workers must resolve and load the selected cached file correctly.

The current cache limitation is important here: **all quantizations in the selected Hugging Face repository are downloaded**, and this repository contains multiple variants. Verify actual inventory and revision handling before selecting it. Host caching is not a guarantee of an immediately available GPU or retained GPU prefix state.

Alternatively, stage just this GGUF and needed assets on a [network volume](https://docs.runpod.io/storage/network-volumes). A 30–50 GB allocation is a starting estimate for one file plus headroom; inspect real requirements first. Network volumes persist at zero workers but are data-center-bound, not global storage. Standard published pricing inspected for this discussion is $0.07 per allocated GB/month for the first TB, or about $2.10–$3.50/month for that allocation; recheck before provisioning. Persistent files do not keep model weights or prefix caches in GPU memory.

**Global volumes are a separate, now-confirmed Serverless option (beta).** They preserve region-independent access to one selected model package and mount at `/runpod-volume`, but add storage/request costs and have object-backed filesystem limitations. They cannot be combined with network volumes on one endpoint. The [live storage findings](../planning/runpod-discovery.md#5-storage-global-is-real-speed-and-full-price-remain-unmeasured) document supported MCP attachment, published request rates, missing base storage quote, immutable staging requirements, and why faster loading remains a measurement rather than a guarantee. Do not reuse the old Pod's atomic-rename download script unchanged on a global volume.

Compare the total cost of startup, generation, five-minute idle tails, storage, and failures with the old Pod's full running time. Use the [current project spending limits](../planning/project-overview.md#4-economics-and-spending-limits) for project-funded preparation/testing; this document creates no separate budget or paid deployment authorization. Record authoring/preparation costs separately from reader reply costs while reconciling shared provider charges.

## Chapter-to-character asset workflow

RVN is a strong candidate for producing the character data because it was used in the writing process and can work directly with eligible explicit source material. **That is a quality hypothesis, not retained memory of the story:** generating chapters did not train those chapters into the checkpoint. A fresh worker knows only what its weights and supplied context provide. The edited source remains authoritative, and the author may have selected or rewritten earlier generations.

Follow the existing [character/context production contract](../character-engineering/character-context.md), using RVN as the candidate extractor and voice-packet producer:

1. **Select source and scope.** Read only owner-designated chapters. Record story/chapter IDs, source hash/version, publication status, and stable passage references. Draft preparation is allowed in a separate unpublished workspace; drafts cannot enter reader-serving bundles until the source is published and designated for this product by the author.
2. **Extract cited candidates.** Produce facts, beliefs, uncertainty, relationships, motives, character knowledge, and voice excerpts with passage citations. Preserve the meaning of eligible adult scenes rather than replacing them with generic euphemisms that lose characterization. Mark unknowns instead of inventing ages, motives, or off-page events.
3. **Compile chapter-scoped assets.** Build character/voice packets, scene snapshots/hooks, eligibility metadata, and mode-specific context using the shared contract. A whole-story processing pass may help find relationships, but each exported runtime packet must exclude future facts and examples beyond its chapter ceiling. Keep private author notes separate from runtime content.
4. **Validate independently.** Check schemas, references, source/publication scope, token budgets, eligibility, and instruction-bearing fields outside RVN. Valid citations do not by themselves prove a claim is supported; verify claims against passages. RVN must not certify its own extraction as publishable.
5. **Evaluate usefulness.** Compare packets on the same representative chapters and generated scenes, with the owner's calibration. Measure citation support, fact/belief distinctions, spoiler correctness, voice recognizability, unsupported embellishment, and context size. Record allowed-content false refusals separately from factual or safety failures. Same-model familiarity may help voice selection but can also reinforce its own invented interpretation.
6. **Release passing derivatives.** Publish an immutable, versioned bundle through the established release workflow, with source/model/prompt/schema/evaluation provenance and a rollback target. New playthroughs use the latest passing bundle; existing ones retain coherent pinned versions.

Use RVN for the content-sensitive extraction and writing steps where it adds value. Deterministic validation and ordinary project tooling need not depend on a model's willingness to generate explicit prose. Keep manuscripts and explicit excerpts access-controlled; do not add them to public diagnostics or this documentation.

## Future tools and publishing

The owner is interested in letting this authoring agent publish when work is ready. Implement narrow tools for reading designated sources, writing candidate assets, running checks, staging a versioned bundle, and requesting release of that exact passing bundle. These are proposed capabilities, not existing tools or newly established deployment credentials.

The workflow host must authorize tool names, arguments, source/output paths, story/version scope, and side effects. Chapter prose, model outputs, and retrieved files remain untrusted data; they cannot grant tools or turn a quoted instruction into a shell command. Follow the [content-agent injection boundaries](../character-engineering/prompt-injection.md#5-indirect-injection-and-memory-laundering). Keep extraction isolated from production credentials; a separate release component can publish validated bundles using narrowly scoped credentials.

Passing **derivative app assets from designated published text** may publish automatically once the standing workflow is established, as already selected in D11/D19. Publishing **new canonical chapters or prose** requires the author's specific designation/authorization. A future tool may carry out that authorized publication; “it seems ready” from the model alone is not authorization. Do not add repeated human gates to ordinary passing derivative releases.

Tool-enabled authoring remains separate from live character inference. The app's [content policy](../character-engineering/content-safety.md), independent guards, and reviewed reader-visible delivery still govern released app behavior; using RVN for NSFW source preparation does not certify or expand those boundaries.

## Implementation and evidence checklist

- [x] Recover the stopped Pod's image digest, launch flags, configured context/cache and GPU from MCP metadata; record its non-multilingual filename discrepancy.
- [x] Inspect live Serverless GPU offerings, endpoint schema, Hub candidates, and global/network/cache options; record evidence and limitations in the discovery report.
- [ ] Resolve the cited provider content/data-handling conflict and obtain a complete storage/staging/test quote before NSFW uploads or paid tests.
- [ ] Complete model-file lineage/client settings, pin the new runtime/template and verify the staged multilingual model checksum.
- [ ] Prove the authenticated OpenCode request path, cold-start recovery, streaming termination, and actual memory/context fit with this file.
- [ ] Verify idle scale-to-zero after 300 seconds, restart/resume, and billed startup/idle/storage costs over a realistic writing session.
- [ ] Test cited extraction on designated chapters, including eligible explicit content, and evaluate the resulting chapter-scoped packets under the existing narrative and separate safety/injection criteria.
- [ ] Before enabling agent tools, test malformed/forged calls, source-injected commands, path/scope escapes, and unauthorized publication attempts using minimized synthetic fixtures.
- [ ] Establish scoped derivative publishing with immutable bundle checks, retry/idempotency behavior, release records, and rollback; retain author authorization for new canon.

**Evidence limits:** Owner-reported prior Pod use, public metadata/provider documentation, and authenticated read-only MCP discovery through October 24, 2026 UTC. No weights were downloaded and no serverless load, GPU fit, tool execution, billing, or quality result was reproduced. See the [discovery report](../planning/runpod-discovery.md) for live evidence and the [app inference record](../planning/inference-verification.md) for separate vLLM research and pending checks.
