import { act } from "../../../lib/store";
import { parseJSON } from "../../../lib/json";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const LIMIT = 2_000_000;
export async function POST(request: Request) {
  try {
    // Next can normalize request.url to localhost even when the browser used 127.0.0.1.
    // Validate the actual Host and exact Origin pair, never forwarded-host headers.
    const host = request.headers.get("host"), origin = new URL(`http://${host || "invalid"}`);
    if (!host || origin.host !== host || !["127.0.0.1", "localhost", "[::1]"].includes(origin.hostname) || request.headers.get("origin") !== origin.origin || request.headers.get("sec-fetch-site") === "cross-site")
      return Response.json({ error: "Same-origin loopback requests only" }, { status: 403 });
    if (!request.headers.get("content-type")?.startsWith("application/json")) return Response.json({ error: "JSON required" }, { status: 415 });
    if (Number(request.headers.get("content-length")) > LIMIT) throw new Error("Request too large (2 MB maximum)");
    const reader = request.body?.getReader(); if (!reader) throw new Error("Missing request body");
    const chunks: Uint8Array[] = []; let bytes = 0;
    while (true) { const { done, value } = await reader.read(); if (done) break; bytes += value.byteLength; if (bytes > LIMIT) { await reader.cancel(); throw new Error("Request too large (2 MB maximum)"); } chunks.push(value); }
    const result = await act(parseJSON(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks))));
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    // Zod errors can contain input excerpts; don't return or log them.
    const message = error instanceof Error && !["ZodError", "SyntaxError"].includes(error.name) ? error.message : "Invalid JSON, unknown fields, or invalid artifact/checkpoint structure";
    return Response.json({ error: message }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
}
