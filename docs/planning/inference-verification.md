# RVN Inference Notes

**Updated:** October 27, 2026. This is a short decision/evidence summary. The active cloud experiment and its exact configuration are in [cloud endpoint notes](../cloud-endpoints/README.md).

## Current direction

The owner-designated writing reference is the RVN 27B multilingual `RVN-Q4_K_M-multilingual.gguf` ([authoring record](../authoring/README.md#confirmed-writing-model)). Compare smaller same-checkpoint candidates only against that reference; file size or quantization label alone does not establish quality, fit, or cost. Selected app direction remains Runpod Serverless with a compatible RVN quantization; serving/cache, context, safety, and unit economics still need validation ([decisions D16–D18](project-decisions.md#4-resolved-model-and-inference-decisions)).

Useful published size comparisons:

- RVN Q4_K_M GGUF: about **16.55 GB**.
- Full-precision RVN 27B safetensors: about **53.80 GB**.
- `GSQ-3bit/`: about **28.39 GB**; this is MLP-only quantization with many tensors retained at higher precision, so it is larger than the Q4 GGUF.

These are artifact sizes, not VRAM requirements. The public GSQ Transformers receipt is not evidence of vLLM execution. See the [pinned artifact/source discussion](https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored/tree/c2cb2cfb239f2964595bee87fcfda55ad5fe33dd).

## Test results

- **GGUF-native route passed a short canary:** the exact `RVN-IQ2_M.gguf` loaded through Runpod's official Ollama worker (llama.cpp) on an A40 without a network volume. Download was about 9.3 GiB; logs imply roughly 28 seconds. First cold prompt evaluation was 31.6 seconds for 57 tokens; a warmed short chat had about 0.21 seconds of prompt evaluation and about 41 generated tokens/sec. This is a brief exploratory run, not a broader benchmark. See the [endpoint record](../cloud-endpoints/runpod-rvn-iq2m-ollama-2026-10.md).
- **Tested vLLM GGUF route failed:** vLLM 0.32.0 + `vllm-gguf-plugin` 0.0.5 did not map 432 Qwen3.5 parameters, including `linear_attn` tensors, after temporary architecture/config compatibility patches. This establishes failure for that tested combination, not every Qwen model or future plugin version.

Neither result proves production quality, intended context capacity, safety, concurrency, full cost, or cross-account cache isolation. The successful llama.cpp test does not meet the project's vLLM cache requirement. Before making a production decision, capture the exact Hugging Face commit and GGUF hash, test both modes and representative prompts, measure context/concurrency and full billed cost, and verify whatever caching/privacy behavior the chosen serving route requires. APC acceptance criteria remain in [decision D16](project-decisions.md#4-resolved-model-and-inference-decisions).
