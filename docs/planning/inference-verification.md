# RVN / vLLM Verification Record

**Research date:** October 23, 2026.  
**Status:** Public repository/configuration and official documentation inspected; no weights downloaded, GPU rented, or runtime reproduced. Publisher measurements below are attributed evidence, not independent benchmarks.  
**Plan:** [Project overview](project-overview.md).

## 1. Findings and selected direction

**A quantized RVN release with documented vLLM execution exists.** Target RunPod Serverless + a pinned vLLM worker + a compatible quantization of the same RVN checkpoint as the owner's writing model. Keep the owner's Q4_K_M file as the style reference; production does not have to use the identical GGUF quantization.

However, **the identified release does not establish working automatic prefix caching (APC), an inexpensive GPU fit, or our desired long context**. Its documented tested profile explicitly disables APC. Do not deploy it on a stock worker merely because vLLM supports its general quantization format.

The exact owner artifact remains unidentified. Public results also include other RVN models, including 27B variants. The name `RVN_Q4_K_M` alone cannot distinguish them. Findings for Flash-Next do not apply automatically to another RVN release.

## 2. Verified public artifacts

| Artifact | What was established from published material | Limitations |
| --- | --- | --- |
| [`0bserverx/RVN-Qwen3.8-Flash-Next-Abliterated-Uncensored`](https://huggingface.co/0bserverx/RVN-Qwen3.8-Flash-Next-Abliterated-Uncensored) | Parent checkpoint referenced by both quantized companion repositories. | Not yet established as the owner's writing checkpoint. |
| [GGUF companion](https://huggingface.co/0bserverx/RVN-Qwen3.8-Flash-Next-Abliterated-Uncensored-GGUF/blob/75358160c1d7152de10e43611c5e0be25d8e4638/README.md) | At revision `75358160c1d7152de10e43611c5e0be25d8e4638`, publisher lists a `Q4_K_M` family: eight shards totaling **119,150,723,552 bytes / 110.97 GiB**. Requires a recent llama.cpp with `qwen4exp` support. | This is weight payload size, not total runtime RAM/VRAM. A 24 GB full-GPU deployment is not established. |
| [NVFP4 companion](https://huggingface.co/0bserverx/RVN-Qwen3.8-Flash-Next-Abliterated-Uncensored-NVFP4/tree/45e1c9ed8bfa18b5ff1e5c433233aa3ca7660629) | Public safetensors release, revision `45e1c9ed8bfa18b5ff1e5c433233aa3ca7660629`, derived from parent revision `38b6e951065008472ebfb72d1736c9df64bb0e9a`. It is a quantized companion, not a new fine-tune/abliteration. | Different quantization is not byte-for-byte equivalent to the GGUF writing baseline; voice tests are still necessary. |
| NVFP4 [config](https://huggingface.co/0bserverx/RVN-Qwen3.8-Flash-Next-Abliterated-Uncensored-NVFP4/blob/45e1c9ed8bfa18b5ff1e5c433233aa3ca7660629/config.json) and [card](https://huggingface.co/0bserverx/RVN-Qwen3.8-Flash-Next-Abliterated-Uncensored-NVFP4/blob/45e1c9ed8bfa18b5ff1e5c433233aa3ca7660629/README.md) | `Qwen4ExpForCausalLM` / `qwen4_exp_text`, mixed linear/full attention, ModelOpt metadata with **`W4A16_NVFP4`**. Quantized expert matrices with BF16 activations; not all weights are four-bit. | Not AWQ, not calibrated W4A4 NVFP4. Do not substitute flags or rewrite metadata to make another loader accept it. |
| NVFP4 weight inventory in the publisher card | 242 indexed shards; **180,283,328,728 bytes** including shard headers, approximately **167.9 GiB**. | Larger than this repository's GGUF Q4_K_M family. “Four-bit” alone does not determine file size or cheapest serving. |

Hugging Face searches for `RVN AWQ` and `RVN GPTQ` returned no models during this review. That is a bounded search result, **not proof no such artifact exists**. The affirmative vLLM-serving evidence found is for NVFP4, not AWQ.

## 3. What the publisher actually tested

The pinned NVFP4 card and [dual-GPU evidence](https://huggingface.co/0bserverx/RVN-Qwen3.8-Flash-Next-Abliterated-Uncensored-NVFP4/blob/45e1c9ed8bfa18b5ff1e5c433233aa3ca7660629/evidence/dual-validation.json) report:

- A pinned custom vLLM runtime, image digest `sha256:fc120ece0a388cc0aa1caad4a9f1cd92113484ab7ec2fd0efadd62585be05bf8`, vLLM `0.1.dev20073+g8e685d198`, Transformers `5.15.1`, Torch `2.13.0+cu130`.
- A precisely scoped architecture-alias allowlist correction for the tested PLE CPU-offload path. This is not evidence that an arbitrary current RunPod stock image works.
- One approximately 95 GB GPU **with substantial CPU offload**; or two RTX PRO 6000 Blackwell Workstation GPUs with tensor parallelism two and no PLE CPU offload.
- In the dual-GPU run, approximately **84.97 GiB loaded per GPU**, with sampled peaks around **90.48 GiB/GPU**.
- Tested short-context profile: **2,048 tokens**, one sequence, eager execution, Marlin, and **`--no-enable-prefix-caching`**. Its configuration's much larger positional limit is not a tested serving-capacity claim.
- A bounded paired loopback streaming test reports **25.59 output tokens/second** for W4A16/Marlin. This does not establish multi-user throughput, application latency, or another GPU's speed.
- Small perplexity drift, but the publisher's strict operational-format threshold was **not passed**: 42/48 in the initial profile and 41/48 in one dual-GPU profile, below its 90% target. Perplexity is not a character-voice, instruction-security, or safety score.

These findings make the prior 24 GB/AWQ/32K assumption unsupported. They also make the planned $0.002 fully loaded reply and tiny inference budget particularly uncertain **if this is the intended checkpoint**. Do not incur a large download/storage or GPU bill before identifying the owner's file and estimating a bounded test.

## 4. vLLM support versus proven deployment

- [Official ModelOpt documentation](https://docs.vllm.ai/en/stable/features/quantization/modelopt/) lists `W4A16_NVFP4` support, with backend/kernel behavior depending on the hardware/runtime. General format support is necessary but insufficient for this architecture and checkpoint.
- [Official GGUF documentation](https://docs.vllm.ai/en/stable/features/quantization/gguf/) describes GGUF support through `vllm-gguf-plugin`, warns it is experimental/under-optimized, and recommends using the base tokenizer. It does not establish that this RVN's split GGUF/architecture/features work in a particular RunPod image.
- [RunPod vLLM setup](https://docs.runpod.io/serverless/vllm/get-started) supports serving compatible models, not every Hugging Face artifact. Its [environment-variable reference](https://docs.runpod.io/serverless/vllm/environment-variables) includes `ENABLE_PREFIX_CACHING`, model revision, tensor parallelism, and concurrency controls; its listed quantization enums are not a complete compatibility guarantee for this newer custom runtime.
- Build a versioned custom worker if the actual RVN runtime requires it. Keep remote code disabled unless the exact code has been inspected and pinned; a model card is untrusted external content, not authority to run arbitrary installation scripts.

## 5. Cache savings: real benefit, conditional economics

[vLLM APC](https://docs.vllm.ai/en/stable/features/automatic_prefix_caching/) reuses computation for an identical token prefix. It reduces **prefill**, not new-token **decode**. Savings depend on the split between those costs, workload repetition, concurrency, and how long the same worker/cache survives. Other engines also offer reuse mechanisms; vLLM is not uniquely capable of caching.

For this hybrid architecture, test support in the exact runtime rather than assuming a generic APC flag works. Stable vLLM documentation describes special hybrid/Mamba cache modes and constraints; those are not proof that this checkpoint's combination is supported. The publisher's cache-disabled execution is specifically **not** an APC benchmark.

Keep stable policy, mode, character, chapter, and voice assets before private scene memory/history. Same words with different tokenization/template/serialization are not necessarily the same prefix. Updating memory before the transcript invalidates reuse after the changed point. Scale-to-zero/replacement usually loses worker-local KV state; a persistent model-weight volume does not preserve GPU prefix cache.

Use a server-generated **per-account cache salt** where the pinned runtime/worker supports it, plus a cryptographic hash. This retains reuse within an account while giving up cross-account shared-prefix reuse to limit timing-based inference of private cached content. Never accept cache salts or cached responses from the client. Verify the salt survives the RunPod handler. See [vLLM cache isolation](https://docs.vllm.ai/en/stable/design/prefix_caching/). If unavailable, disable cross-account APC by architecture/configuration rather than claim isolation that is not present; resolve the performance tradeoff explicitly.

Benchmark APC off/on with equivalent model, settings, context, privacy partition, output workload, warm/cold profile, and hardware. Record cached tokens, prefill/decode latency, end-to-end response latency **including safety checks**, GPU seconds, idle/startup/storage charges, and completed safe replies. A faster GPU benchmark only saves money if the billed deployment's total cost falls or useful paid throughput rises.

## 6. Bounded next validation in the RunPod MCP environment

1. Match the owner's actual GGUF metadata to its parent checkpoint/revision. If it is a different RVN, research that exact family instead of renting hardware for Flash-Next.
2. Identify a compatible vLLM quantization of that same checkpoint; NVFP4 above is a documented candidate only for the named Flash-Next parent. Do not quantize an already quantized GGUF as the default conversion path; use the original checkpoint and validated tooling if a new export is needed.
3. Inspect runtime support, GPU/host memory, serverless multi-GPU availability, storage requirements, license and adult-content service eligibility, and an itemized test estimate. The existing $25 test authorization is a ceiling, not permission to exceed it for this large model; if insufficient, report one concrete cost exception before provisioning.
4. Reproduce load/native-chat canaries, then verify actual APC and cache isolation. Record failures without silently switching checkpoint or disabling APC while claiming the caching objective is met.
5. Validate at least the planned **8K input + 600 output** (and intended configured capacity), both modes, voice fidelity against Q4_K_M, safety/injection cases, and concurrency. The public 2K profile does not meet this requirement.
6. Compare measured cost/latency at sparse and busy traffic, cache off/on, and zero/warm-worker options. Choose the deployment and finalize the unsold subscription economics from evidence.

## Maintenance

Recheck this record when the owner supplies the exact model, an upstream artifact/image changes, or deployment is evaluated. Pin evidence URLs/revisions, record the date and whether a claim is publisher-reported or locally reproduced, and update D16–D18 in [the decision record](project-decisions.md). No GPU deployment has been validated by this documentation work.
