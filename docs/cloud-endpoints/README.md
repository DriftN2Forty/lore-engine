# Cloud endpoint notes

This folder keeps dated records of cloud inference endpoints created for LoreEngine experiments. Record configuration, artifact identity, measured behavior, teardown/recreation status, and links to relevant verification notes. Keep API keys, HF tokens, and private dialogue out of these records.

## Current and prior experiments

| Note | Endpoint | Status |
| --- | --- | --- |
| [RVN IQ2_M through Runpod Serverless Ollama](runpod-rvn-iq2m-ollama-2026-10.md) | `0lzkez4m911xvp` | Recreated for further testing; idle timeout 120 seconds; no model run since recreation. |

## Prior failure

The vLLM 0.32.0 + GGUF-plugin 0.0.5 attempt for this Qwen3.5 IQ2_M model failed during weight mapping and its endpoints were deleted. Details and error sequence are in the [experiment note](runpod-rvn-iq2m-ollama-2026-10.md#failed-vllm-gguf-attempt).
