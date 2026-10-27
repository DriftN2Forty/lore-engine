import { createHash } from "node:crypto";
import { inspect } from "./contracts";
import type { Message } from "./context";

export const hash = (value: unknown) => createHash("sha256").update(typeof value === "string" ? value : JSON.stringify(value)).digest("hex");
const integer = (name: string, fallback: number, min: number, max: number) => {
  const n = Number(process.env[name] || fallback);
  if (!Number.isInteger(n) || n < min || n > max) throw new Error(`Invalid server configuration: ${name}`);
  return n;
};
export function config() {
  const base = new URL(process.env.RVN_BASE_URL || "http://127.0.0.1:8080");
  if (base.protocol !== "http:" || !["127.0.0.1", "localhost", "[::1]"].includes(base.hostname) || base.username || base.password || base.pathname !== "/" || base.search || base.hash) throw new Error("RVN_BASE_URL must be an HTTP loopback origin");
  return { base: base.origin, model: process.env.RVN_MODEL || "rvn-iq2m-base", context: integer("RVN_CONTEXT_CAP", 8192, 512, 131072), output: integer("RVN_OUTPUT_TOKENS", 600, 64, 4096), timeout: integer("RVN_TIMEOUT_MS", 180000, 1000, 600000) };
}
type JSONValue = Record<string, any>; // Runtime API is capability-discovered and checked below.
export async function rpc(path: string, body?: unknown): Promise<JSONValue> {
  const c = config();
  let r: Response;
  try { r = await fetch(c.base + path, { method: body === undefined ? "GET" : "POST", headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(c.timeout), cache: "no-store", redirect: "error" }); }
  catch { throw new Error("Local model unavailable or timed out. Check the author's llama.cpp launcher; history was not changed."); }
  if (!r.ok) throw new Error(`Local runtime ${path} returned HTTP ${r.status}; verify build/API compatibility.`);
  const data = await r.json();
  if (!data || typeof data !== "object") throw new Error("Malformed local runtime response");
  return data;
}
export type Capabilities = { capacity: number; capacitySource: string; templateHash: string; template: string; model: string; build: unknown; controls: string[] };
export async function discover(): Promise<Capabilities> {
  const c = config(), props = await rpc("/props"), models = await rpc("/v1/models");
  if (!models.data?.some((m: JSONValue) => m.id === c.model)) throw new Error(`Configured model alias ${c.model} is not advertised by /v1/models`);
  const template = props.chat_template;
  if (typeof template !== "string" || !template.length) throw new Error("Runtime must expose its active chat_template in /props");
  const templateHash = hash(template);
  if (process.env.RVN_TEMPLATE_SHA256 && process.env.RVN_TEMPLATE_SHA256 !== templateHash) throw new Error("Runtime chat-template hash differs from the configured pin");
  let slotCapacity: number | undefined;
  try {
    const slots = await rpc("/slots");
    if (Array.isArray(slots) && slots.length && slots.every(s => Number.isInteger(s.n_ctx) && s.n_ctx > 0)) slotCapacity = Math.min(...slots.map(s => s.n_ctx));
  } catch { /* /slots is optional; never derive per-request cache metrics from it. */ }
  const advertised = slotCapacity ?? props.default_generation_settings?.n_ctx;
  if (!Number.isInteger(advertised) || advertised < 512) throw new Error("Effective context unavailable: enable /slots or a /props per-slot n_ctx report");
  return { capacity: Math.min(c.context, advertised), capacitySource: slotCapacity ? "/slots minimum per-slot n_ctx, bounded by app cap" : "/props default_generation_settings.n_ctx, bounded by app cap (verify per-slot capacity)", templateHash, template,
    model: c.model, build: props.build_info ?? props.build ?? "unavailable", controls: [...new Set(template.match(/<\|[^<>\n]+\|>/g) || [])] };
}
export async function count(messages: Message[], caps: Capabilities) {
  for (const m of messages) {
    // Only inspect untrusted portions separately upstream; system legitimately names data.
    if (m.role !== "system") inspect(m.content);
    if (caps.controls.some(t => m.content.normalize("NFKC").includes(t))) throw new Error("Input contains a control token from the running template");
  }
  const applied = await rpc("/apply-template", { messages, add_generation_prompt: true, chat_template_kwargs: { enable_thinking: false } });
  if (typeof applied.prompt !== "string") throw new Error("/apply-template did not return a prompt; exact preflight unavailable");
  const tokenized = await rpc("/tokenize", { content: applied.prompt, add_special: true, parse_special: true });
  if (!Array.isArray(tokenized.tokens) || !tokenized.tokens.every((t: unknown) => Number.isInteger(t))) throw new Error("/tokenize did not return token IDs");
  return tokenized.tokens.length;
}
export type Measurement = { promptTokens: number | null; generatedTokens: number | null; totalTokens: number | null; reusedPromptTokens: number | null; reusePercent: number | null; freshlyEvaluatedPromptTokens: number | null; latencyMs: number; finishReason: string; outputLimit: boolean; contextLimit: boolean | null; preflightTokens: number; preflightMatchesUsage: boolean | null; timings: unknown };
const numberOrNull = (v: unknown): number | null => typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : null;
export async function generate(messages: Message[], caps: Capabilities, preflight: number, output = config().output, responseSchema?: Record<string, unknown>) {
  if (preflight + output > caps.capacity) throw new Error("Context exceeds input plus reserved-output capacity");
  const before = performance.now();
  const response = await rpc("/v1/chat/completions", { model: config().model, messages, stream: false, max_tokens: output, temperature: 0.7, top_p: 0.9, seed: 42, n: 1, chat_template_kwargs: { enable_thinking: false }, reasoning_format: "deepseek",
    ...(responseSchema ? { response_format: { type: "json_schema", json_schema: { name: "private_memory", strict: true, schema: responseSchema } } } : {}) });
  const choice = response.choices?.[0], message = choice?.message;
  if (!message || message.role !== "assistant" || message.tool_calls?.length || message.function_call || typeof message.content !== "string" || !message.content.trim()) throw new Error("Runtime returned no usable final prose or attempted a tool call; nothing committed");
  // reasoning_content is intentionally never returned, logged, or persisted.
  const content = message.content.trim(); inspect(content);
  if (content.length > 20000 || !["stop", "length"].includes(choice.finish_reason)) throw new Error("Incomplete or unsupported generation; nothing committed");
  const prompt = numberOrNull(response.usage?.prompt_tokens), generated = numberOrNull(response.usage?.completion_tokens);
  const reused = numberOrNull(response.usage?.prompt_tokens_details?.cached_tokens);
  const validReuse = reused !== null && prompt !== null && reused <= prompt ? reused : null;
  const measurement: Measurement = {
    promptTokens: prompt, generatedTokens: generated, totalTokens: numberOrNull(response.usage?.total_tokens),
    reusedPromptTokens: validReuse, reusePercent: validReuse !== null && prompt ? 100 * validReuse / prompt : null,
    freshlyEvaluatedPromptTokens: validReuse !== null && prompt !== null ? prompt - validReuse : null,
    latencyMs: Math.round(performance.now() - before), finishReason: choice.finish_reason, outputLimit: choice.finish_reason === "length",
    contextLimit: typeof response.truncated === "boolean" ? response.truncated : null,
    preflightTokens: preflight, preflightMatchesUsage: prompt === null ? null : prompt === preflight,
    timings: response.timings ? { prompt_ms: numberOrNull(response.timings.prompt_ms), predicted_ms: numberOrNull(response.timings.predicted_ms) } : null
  };
  if (choice.finish_reason === "length" || response.truncated === true) throw new Error("Generation hit an output/context limit; incomplete reply was not committed. Shorten the request or raise the server-side output cap.");
  return { content, measurement };
}
