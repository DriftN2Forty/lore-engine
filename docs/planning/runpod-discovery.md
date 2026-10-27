# RunPod Discovery and Open-Question Results

**Evidence window:** October 23, 2026 local session / October 24, 2026 UTC (clock checked at `2026-10-24T01:58:10Z`).  
**Method:** Authenticated read-only RunPod MCP calls, live schemas/catalogs, official documentation, and public worker-source inspection. No resources created, started, changed, or deleted; no jobs submitted or weights downloaded. No RVN benchmark reproduced.  
**Related:** [Inference verification](inference-verification.md), [personal authoring workflow](../authoring/README.md), [remaining work](project-decisions.md#6-remaining-inputs-and-executable-work).

## 1. The old Pod provides configuration, not a benchmark

`list-pods` followed by `get-pod` found one stopped Pod, **`rvn-q4km-128k`**, created October 15, 2026. Its status was **`EXITED`**. `list-endpoints` returned **zero endpoints**. This is the authenticated account's inventory at inspection time, not proof that no other account/profile was ever used.

Recovered configuration:

| Field | Live read |
| --- | --- |
| GPU | One `NVIDIA GeForce RTX 5090`; GPU catalog specifies **32 GB VRAM** |
| Container image | `ghcr.io/ggml-org/llama.cpp@sha256:9dfa49ca795363f5fff96f501469e3565e757951f04701a8ad8a5dc5e3ee916d` |
| Download target | `RVN-Q4_K_M.gguf` from the same 27B GGUF repository's mutable `main` |
| Local model path / alias | `/models/RVN-Q4_K_M.gguf` / `rvn-q4km` |
| Context / parallel slots | `--ctx-size 131072 --parallel 1` |
| GPU/cache flags | `--n-gpu-layers 99 --flash-attn on --cache-type-k q8_0 --cache-type-v q8_0` |
| Template / reasoning | `--jinja --reasoning-format deepseek --no-webui` |
| Network binding | `--host 0.0.0.0 --port 8080`, exposed `8080/http` |
| Disk / mounts | `disk: 40`; `mounts: {}` |
| Host-reported CUDA | `13.2`; not the image's toolkit version |

The Pod has an API-key environment variable; its value is excluded from this record. No private logs or files were read. The launch command downloads into the container filesystem without a persistent mount, and only checks file existence, not a checksum. It does not establish that weights remain on the stopped Pod or were ever loaded successfully.

**Identity discrepancy:** This configuration names the **non-multilingual** file, while the owner explicitly designated **`RVN-Q4_K_M-multilingual.gguf`** as the writing reference. Preserve the owner-designated reference. Do not claim the stopped Pod proves multilingual output quality, byte identity, or 128K capacity. Model bytes/checksum, numeric llama.cpp build, resolved embedded chat template, OpenCode system/sampling settings, and actual memory/latency remain unverified. The 128K launch setting is useful workload evidence, not a reason to assume the same setup fits 24 GB.

## 2. Single-worker GPU candidates and economics

From `list-gpu-types` and subsequent **`get-gpu-type` with `include: [AVAILABILITY]`, `product: [SERVERLESS]`, `count: 1`**. These are the product-specific stock/prices from those reads; not reservations or a model-fit test.

| GPU type ID | VRAM | Pool | Serverless $/hour | Overall stock | Example data-center stock |
| --- | --- | --- | --- | --- | --- |
| `NVIDIA RTX A5000` | 24 GB | `AMPERE_24` | **0.69** | HIGH | `CA-MTL-1`: MEDIUM; `EU-SE-1`: MEDIUM |
| `NVIDIA GeForce RTX 4090` | 24 GB | `ADA_24` | **1.10** | HIGH | `US-IL-1`: HIGH; `EU-RO-1`: MEDIUM |
| `NVIDIA A40` | 48 GB | `AMPERE_48` | **1.22** | HIGH | `CA-MTL-1`: HIGH; `EU-SE-1`: HIGH |
| `NVIDIA GeForce RTX 5090` | 32 GB | `ADA_32_PRO` | **1.58** | HIGH | `EUR-IS-2`: HIGH; `EUR-NO-1`: MEDIUM |

The 15.41 GiB multilingual file makes 24 GB a bounded-context test candidate, not a verified 128K fit. Start memory/quality comparisons at explicit context sizes. A40 offers more headroom at a lower quoted serverless rate than RTX 5090, but throughput is unmeasured. For hardware continuity, the old Pod points to RTX 5090 rather than proving a need for it. `AMPERE_24` also includes L4, RTX 3090, and a 24 GB Blackwell MIG partition in the returned catalog; select exclusions when testing one SKU, and verify the image on every allowed architecture. `ADA_24` is the RTX 4090 pool in this read, not the older combined L4/3090/4090 assumption.

The separate `get-capacity` matrix returned conflicting A5000 availability and different 4090 grading. It does not take the same `SERVERLESS` product selector. The later product-specific `get-gpu-type` results above govern this snapshot; do not mix matrix Pod prices into Serverless estimates. The relevant product reads reported free capacity on host CUDA **13.2**, with older listed versions unavailable. Use an image-compatible minimum CUDA floor rather than an inherited exact allowlist that excludes available newer hosts; test actual kernels, particularly for Blackwell. Driver backward compatibility does not add missing GPU architecture support to an old binary.

Using the quoted hourly rates, a five-minute idle tail costs approximately **$0.0575 / $0.0917 / $0.1017 / $0.1317**, respectively. Those are calculated estimates excluding startup/execution/storage/tax, not billing measurements. The old Pod's returned `cost` was **1.19**, matching its catalog Secure Pod hourly rate; the comparable serverless 5090 rate is **1.58**, not 1.19. At equal hardware/throughput and ignoring storage, serverless breaks even when its billed time is below `1.19 / 1.58 ≈ 75.3%` of the Pod's running time. Avoiding forgotten idle hours can compensate for that rate premium; it is not automatic savings.

For a future bounded canary, one **billed worker-hour** is $0.69/$1.10/$1.22/$1.58 for these candidates, including whatever startup/execution/idle fits within that hour. This is a compute subtotal, not a complete test quote: add container disk, chosen storage/staging requests, guards/evaluation, failures and remaining authorization before provisioning. Financial limits remain centralized in the [overview](project-overview.md#4-economics-and-spending-limits).

[Serverless pricing](https://docs.runpod.io/serverless/pricing) bills from worker start until full stop, rounded up to seconds, including model loading, execution and idle retention. Image pulls and platform-managed cached-model downloads **normally** happen before worker startup and are not billed compute. A `curl`/Hugging Face download performed by your already-running entrypoint is a different path and consumes billed worker time. Container disk is separately metered in five-minute intervals; storage persists/bills independently where applicable.

## 3. Five-minute shutdown is expressible, with routing constraints

The live **`describe-tool(create-endpoint)`** schema confirms this proposed configuration fragment (documentation only):

```json
{
  "type": "LOAD_BALANCER",
  "scaling": { "type": "REQUEST_COUNT", "requestCount": 1 },
  "workers": { "min": 0, "max": 1, "idleTimeout": 300 },
  "flashboot": "FLASHBOOT"
}
```

It still needs a verified image, GPU pool/count/CUDA selection, ports/env/storage and a complete cost estimate. `idleTimeout` accepts **1–3600 seconds**. **QUEUE + REQUEST_COUNT rejects `idleTimeout`; use QUEUE + QUEUE_DELAY when a queue worker needs the five-minute retention setting.** Load balancers require REQUEST_COUNT and permit the setting. Explicitly set FlashBoot, idle retention, and execution timeout: console docs and REST schema advertise different defaults. Endpoint routing type is selected at creation; scaler choice alone does not convert the API contract.

The [endpoint reference](https://docs.runpod.io/serverless/endpoints/endpoint-configurations#idle-endpoint-scale-down) documents another limit to “query any time”: after **seven days without requests**, the platform sets maximum workers to zero and leaves it there until raised again. It also documents a reduction to two after three days; do not interpret that wording as permission to raise a personal max-one cap. A dormant personal endpoint needs an authenticated control-plane re-enable action if this policy applies. Do not send synthetic generation keepalives just to avoid dormancy.

[Load-balancing docs](https://docs.runpod.io/serverless/load-balancing/overview) and RunPod golden path 14 establish direct HTTP/SSE routing, bearer authentication, a two-minute no-worker timeout, 5.5-minute processing timeout, and no built-in backlog/retry. Set `PORT`/`PORT_HEALTH`, expose the matching port, and use `HEALTH_CHECK_PATH=/health` only after verifying llama.cpp's startup/healthy responses against RunPod's 204/200 contract. OpenCode's cold-start/retry behavior still needs an end-to-end test. Prose streaming on the personal authoring endpoint does not alter complete-output review in the reader app.

## 4. Storage: global is real; speed and full price remain unmeasured

| Option | Findings and limitations |
| --- | --- |
| HF host cache | Supported platform path; cache-miss transfer precedes billed worker startup. Public docs still say all repository quantizations are downloaded. A worker's exact-file selector does not prove the platform downloads only that file. Golden path 20 reports another model's branch resolved to a commit; this is not our RVN revision-handling or startup measurement. The inspected endpoint-create MCP schema does not expose model references; use the verified CLI/console path for registration rather than pretend an environment variable registers host caching. |
| Regional network volume | Data-center-bound, allocated capacity; standard published first-TB rate remains $0.07/GB/month. A 30–50 GB allocation is $2.10–$3.50/month before staging/compute. Full filesystem behavior; co-locate with verified product-specific GPU capacity. |
| **Global volume (beta)** | Supported on GPU Serverless, region-independent, elastic capacity, mounts at `/runpod-volume`. One per endpoint, mutually exclusive with network volumes. Current MCP endpoint-create schema has `mounts.global: [{"volumeId": "..."}]`; the volume-create tool takes a name without preallocating capacity. |

[Global-volume docs](https://docs.runpod.io/storage/globalvolume/overview) price Class A writes/creates/lists at **$0.005 per 1,000 requests**, and Class B reads/metadata at **$0.0005 per 1,000 requests**, **in addition to storage**. A filesystem operation can cause multiple requests. The inspected docs do not quote a base storage $/GB/month rate, so a complete global-volume estimate remains open; do not apply the network-volume rate to it. Confirm the account quote before purchase.

Global storage is object-backed: no atomic rename, hard links, file locking, or permission bits; changes after mount are eventually consistent. Stage immutable checksummed weights, then start replacement workers. Do not copy the old `.part` + `mv` download pattern or assume an HF snapshot-cache installer works unchanged on this filesystem. Keep software and mutable compile caches in suitable image/container storage. Benchmark llama.cpp memory-mapped reads/loading against the alternatives; “global” does not establish faster loading. Files can persist, but GPU weight/KV state is not thereby retained. If account balance reaches zero, docs state global volumes are flagged for deletion after 15 days.

## 5. Existing workers and actual compatibility evidence

`list-hub-repos(searchTerm: "llama.cpp", includeConfig: true)` returned community candidates including:

| Repo / listed release | Evidence | Qualification |
| --- | --- | --- |
| `eniewold/llama-cpp-runpod` / `b11723`, release `cmvf46hwl00a507jvhxa1eiac` | Image `registry.runpod.net/eniewold-llama-cpp-runpod-master-dockerfile:0365854c9`; exact-file and cached-file settings; context, slots and KV-cache controls. | Best-matched inspected authoring candidate, not an approved or tested deployment. |
| `Jacob-ML/inference-worker` / `v1.2.3` | Image `registry.runpod.net/jacob-ml-inference-worker-master-dockerfile:029f37afa`; `LLAMA_CACHED_MODEL`, `LLAMA_CACHED_GGUF_PATH`, launch args. | Another queue-worker candidate; no RVN-specific runtime result. |

The [eniewold release README](https://github.com/eniewold/llama-cpp-runpod/blob/b11723/README.md) documents OpenAI routes/SSE at `https://api.runpod.ai/v2/<endpoint-id>/openai/v1`. Its [handler](https://github.com/eniewold/llama-cpp-runpod/blob/b11723/src/handler.py) uses `runpod.serverless.start`: **it is a queue worker with an OpenAI facade, not a native load-balancing HTTP image**. This answers an earlier open question: a queue endpoint need not require us to build an OpenAI adapter if the worker/platform already provides one. Cold-start survival, streaming tool calls and cancellation still need OpenCode testing. For this worker with a 300-second idle setting, choose QUEUE_DELAY rather than REQUEST_COUNT.

Candidate exact-file inputs are `LLAMA_ARG_HF_REPO` set to the owner's repository and `LLAMA_ARG_HF_FILE=RVN-Q4_K_M-multilingual.gguf`; cached mode instead uses `LLAMA_CACHED_MODEL` and `LLAMA_CACHED_GGUF_PATH` plus actual platform cache registration. Its defaults of **131072 context**, f16 KV and eight accepted jobs should not be inherited blindly: start one slot/one accepted job and explicitly choose the measured context/cache profile. Its listed CUDA allowlist is only **12.8/12.9**, while inspected available product capacity is **13.2**; review the image/build and widen to compatible hosts before any launch. Do not deploy its default upstream Qwen weights or the separately listed Qwen Q8 template as an RVN substitute.

The official public-template read returned Pod templates, not a ready-made RVN serverless template. A bounded Hub search for `worker-vllm` under `runpod-workers` returned only `worker-vllm-omni`; that image targets omni/image models. This does not prove the regular text worker is unavailable: its public source exists, and search/listing coverage differs from image availability.

The text worker's public [Dockerfile](https://github.com/runpod-workers/worker-vllm/blob/71d503e6080319e176e77b20515c4aaaf3426b8f/Dockerfile), [requirements](https://github.com/runpod-workers/worker-vllm/blob/71d503e6080319e176e77b20515c4aaaf3426b8f/builder/requirements.txt), [entrypoint](https://github.com/runpod-workers/worker-vllm/blob/71d503e6080319e176e77b20515c4aaaf3426b8f/src/main.py), and [handler](https://github.com/runpod-workers/worker-vllm/blob/71d503e6080319e176e77b20515c4aaaf3426b8f/src/handler.py) were inspected from `main`; contemporaneous `git ls-remote` resolved HEAD to `71d503e6080319e176e77b20515c4aaaf3426b8f`. This is source evidence, not an inspected container package inventory:

- Dockerfile selects base vLLM **v0.32.0** and installs the BnB plugin; neither it nor its wrapper requirements explicitly installs `vllm-gguf-plugin`. [vLLM's GGUF docs](https://docs.vllm.ai/en/stable/features/quantization/gguf/) require that plugin and call support experimental. This records the inspected worker's historical package compatibility, not a required deployment path.
- The inspected handler forwards `openai_input` bodies directly to local vLLM; its legacy shorthand reconstructs a body from `sampling_params` plus prompt/messages. This is historical worker-interface/cache-transport research, not a current engine or cache requirement. Keep the application's own request allowlist and prevent reader-supplied routes or operational metadata.
- On certain startup revision failures, the entrypoint calls `drop_pinned_revisions()` and removes `MODEL_REVISION`, `TOKENIZER_REVISION`, and `CODE_REVISION` before retrying the current branch. **This conflicts with our immutable-artifact requirement.** A selected worker must fail on a missing pin, or use verified immutable local artifacts with equivalent checks; do not adopt this recovery behavior silently. It can also retry OOM with changed eager/batch settings; record or disable such changes for matched benchmarks.

## 6. What remains open

- **T00:** Resolve old-Pod non-multilingual versus owner-specified multilingual provenance; recover actual local hashes, template/build and client settings. Metadata alone cannot determine which file wrote which chapter. Attempts to reread the pinned HF model card timed out; prior lineage evidence remains attributed, not newly verified.
- **T04/T10:** Compare selected RVN artifact/engine candidates, local-hot/RunPod-overflow routing, context, quality, guards, concurrency, cold/warm latency and total billing. Caching is optional; favor the subsequently selected [shared-prefix policy](project-overview.md#shared-prefix-cache-policy) without blanket account salts. Verify application-owned context/output attribution, compatible exact-prefix reuse, interleaved A→B→A and compaction restoration, memory/eviction/fairness and timing findings through the actual worker. This policy update does not change the historical catalog readings above; no task is passed by catalog/source inspection.
- **T12:** Actual OpenCode/model/tool path; choose queue OpenAI facade versus native LB from measured behavior, preserve five-minute retention with the correct scaler, handle seven-day dormancy, benchmark selected-file storage and fully quote global storage if chosen.

Next sequence: resolve provider blocker → assemble a pinned worker/storage/configuration and complete within-budget estimate → run the smallest synthetic canary → perform the existing quality/cache/scope checks. Do not replace the checkpoint or upload private chapters merely to resolve infrastructure questions.
