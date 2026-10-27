# Runpod Serverless: RVN IQ2_M via Ollama/llama.cpp

**Record updated:** October 27, 2026 UTC.

**Purpose:** Test loading the exact `RVN-IQ2_M.gguf` artifact using a GGUF-native inference engine, after vLLM's experimental GGUF plugin failed on this Qwen3.5 model.

**Current state:** Endpoint `0lzkez4m911xvp` was recreated with the configuration below. It has not yet received a request since recreation. At read-back, Runpod reported one idle worker.
**Previously tested endpoint:** `gajr19rqyaspkl` was deleted after the experiment to stop further charges. Its test observations are retained here.

## Current endpoint configuration

| Setting | Value |
| --- | --- |
| Runpod endpoint name / ID | `rvn-iq2m-ollama-test` / `0lzkez4m911xvp` |
| Worker source | Official Runpod Hub `runpod-workers/worker-ollama` (`cmso0h2l0000007ji81cc6z0d`); generated template `y3p3awzwuo` |
| Worker image | `registry.runpod.net/runpod-workers-worker-ollama-main-dockerfile:1848765ec` |
| GPU pool | `AMPERE_48`; catalog names A40 and RTX A6000 as eligible. The successful prior test ran on an A40. |
| Container disk | 100 GB |
| Network volume / global volume | None |
| Runpod model-cache references | None; this avoids prefetching the repository's other quantizations. |
| Worker scaling | Minimum 0, maximum 1; idle timeout 120 seconds; FlashBoot enabled |
| Execution timeout | 1,800 seconds |
| Hugging Face repo | `0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF` |
| Exact model file | `RVN-IQ2_M.gguf` (`HF_MODEL_FILE`); `HF_QUANTIZATION=IQ2_M` |
| Artifact revision | Not pinned; the Hub worker resolves the repository's current default revision. Record a commit and file hash before treating future runs as matched comparisons. |
| Context / parallel requests | 4,096 tokens / 1 |
| Other relevant settings | `OLLAMA_KEEP_ALIVE=-1`, `OLLAMA_LOAD_TIMEOUT=60m`, Flash Attention on, f16 KV cache |

The endpoint's `HF_MODEL_FILE` selects one file from Hugging Face at worker startup. It does not use Runpod's model-store pre-download or persistent storage. This worker's documentation recommends sizing temporary disk at about three times the model file for the Ollama import/rewrite path; the 100 GB container disk was selected to provide room for this approximately 9.3 GiB file and transient copies.

## Reproduced test (prior endpoint)

**Artifact and runtime:** The worker log reported `RVN-IQ2_M.gguf` as 9.3 GiB, Ollama 0.32.15, an NVIDIA A40 with 44.4 GiB reported available memory, and a 4,096-token context. The worker downloaded the file directly from Hugging Face to container disk; no volume was mounted.

**Observed results:**

- The model loaded and generated with the exact IQ2_M GGUF.
- A streaming chat request asking for only `OK` returned `OK`. The model also emitted reasoning tokens before its final content.
- On the initial cold request, Runpod reported `delayTime=96,408 ms` and `executionTime=37,387 ms`. vLLM-style `TTFT` was not directly supplied by the worker; llama.cpp reported 31,630 ms of prompt evaluation for a 57-token raw-completion prompt. This is a cold first-request observation, not a steady-state latency benchmark.
- A warmed short chat request reported 205.6 ms prompt evaluation and 487.6 ms generation for 21 generated tokens (about 41 tokens/sec). Its first streamed token arrived approximately 0.2–0.4 seconds after the request began; the final `OK` arrived about 0.46 seconds after the first streamed reasoning token.
- The file download began at approximately `2026-10-27T03:05:31.7Z`; GGUF loading metadata appeared around `03:06:00Z`, suggesting roughly 28 seconds for the initial 9.3 GiB transfer. This is inferred from log timestamps, not an explicit download-completion timer.

These are short exploratory requests on one A40, not a deployment benchmark. No context-capacity sweep, sustained throughput, cache isolation, cold restart repeatability, quality comparison against the writing Q4_K_M, or complete billed-cost audit was performed. Ollama's own prompt-cache messages indicate local prompt reuse; they do not establish the planned vLLM APC requirement or per-account isolation.

The successful short test endpoint was deleted after measurement. Its settings were recreated as endpoint `0lzkez4m911xvp`; its model must download again when a request starts a fresh worker because no persistent storage/model cache is attached. The configured idle timeout is 120 seconds, but the previous endpoint was explicitly deleted rather than waiting to verify timeout-driven shutdown.

## Failed vLLM GGUF attempt

The separate vLLM experiment used vLLM 0.32.0 with `vllm-gguf-plugin` 0.0.5 on a Runpod A40. It did not load the same GGUF:

1. The plugin first raised `Unknown gguf model_type: qwen3_5`. A local compatibility alias let initialization proceed further.
2. The next run failed because the plugin expected `vision_config.num_hidden_layers`, while the Qwen3.5 config exposed `depth`.
3. After a local fallback to `vision_config.depth`, the plugin failed to map 432 model parameters, notably Qwen3.5 `linear_attn` tensors.

The vLLM endpoints were deleted after failures. These results show this tested plugin/runtime combination was incompatible with this artifact; they do not prove that the plugin cannot support other Qwen architectures or that future plugin versions cannot support this one. The working Ollama/llama.cpp result does not meet the project's selected vLLM/APC requirement.

## Recreate / inspect

The endpoint was created with the connected Runpod CLI using Hub listing `cmso0h2l0000007ji81cc6z0d`, explicitly overriding the Hub GPU defaults with `NVIDIA A40` and setting the configuration above. Current endpoint ID and values are recorded here so future testing can proceed without relying on shell history. Do not put the Runpod API key or Hugging Face credentials in commands committed to this repository.

Related: [RVN inference notes](../planning/inference-verification.md#test-results).
