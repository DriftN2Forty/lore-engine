"use client";
import { useEffect, useRef, useState } from "react";
import synthetic from "../fixtures/synthetic.chapter-01.json";
import type { Artifact, Checkpoint, Mode, Selection } from "../lib/contracts";
import type { Measurement } from "../lib/runtime";

type State = { session: string; artifact: Artifact; checkpoint: Checkpoint; last: Measurement | null; runs: Measurement[]; runtime: Record<string, unknown> | null };
type Projection = { input: number; capacity: number; reservedOutput: number; inputPercent: number; projectedTotal: number; totalPercent: number; headroom: number; overBudget: boolean; countStatus: string; capacitySource: string; breakdown: Record<string, number>; breakdownStatus: string; memoryDue: boolean };
async function api(body: unknown) {
  const r = await fetch("/api/local", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const value = await r.json(); if (!r.ok) throw new Error(value.error || "Local request failed"); return value;
}
function download(name: string, value: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const show = (n: number | null | undefined) => n == null ? "unavailable" : n.toLocaleString(undefined, { maximumFractionDigits: 1 });
export default function Page() {
  const [state, setState] = useState<State | null>(null), [text, setText] = useState(""), [busy, setBusy] = useState(false);
  const [error, setError] = useState(""), [projection, setProjection] = useState<Projection | null>(null), [metricError, setMetricError] = useState("");
  const [memory, setMemory] = useState("[]"), [revision, setRevision] = useState(0);
  const metricSeq = useRef(0);
  const adopt = (s: State) => { setState(s); setMemory(JSON.stringify(s.checkpoint.memory, null, 2)); setProjection(null); setText(""); };
  async function run(task: () => Promise<void>) { setBusy(true); setError(""); try { await task(); } catch (e) { setError(e instanceof Error ? e.message : "Request failed"); } finally { setBusy(false); } }
  useEffect(() => {
    const seq = ++metricSeq.current;
    setProjection(null);
    if (!state || busy) return;
    const timeout = setTimeout(() => {
      api({ action: "project", session: state.session, text }).then(result => {
        if (seq !== metricSeq.current) return;
        setProjection(result.projection); setMetricError("");
        setState(old => old && old.session === state.session ? { ...old, runtime: result.runtime } : old);
      }).catch(e => { if (seq === metricSeq.current) setMetricError(e.message); });
    }, 500);
    return () => { clearTimeout(timeout); metricSeq.current++; };
  }, [state?.session, state?.checkpoint, text, busy, revision]);
  const a = state?.artifact, c = state?.checkpoint, scene = a?.scenes.find(s => s.id === c?.selection.scene);
  const exchanges = (c?.transcript.length ?? 0) / 2;
  const uncompactedExchanges = ((c?.transcript.length ?? 0) - (c?.summarized_through ?? 0)) / 2;
  async function choose(selection: Selection) { await run(async () => adopt(await api({ action: "select", session: state!.session, selection }))); }
  async function upload(file: File | undefined, checkpoint = false) {
    if (!file) return;
    await run(async () => {
      if (file.size > 1_500_000) throw new Error("File exceeds 1.5 MB local limit");
      const source = await file.text();
      if (checkpoint && !state) throw new Error("Load the matching chapter artifact first");
      adopt(await api(checkpoint ? { action: "import", artifact: state!.artifact, checkpoint: source } : { action: "import", artifact: source }));
    });
  }
  return <main>
    <header><p className="eyebrow">LOREENGINE / LOCAL LAB</p><h1>Chapter-grounded character chat</h1><p className="notice">Author-only, unguarded local experiment. Independent safety classification is deferred. Private events never change canon.</p></header>
    <section className="toolbar" aria-label="Files and session">
      <button disabled={busy} onClick={() => run(async () => adopt(await api({ action: "import", artifact: synthetic })))}>Load synthetic chapter</button>
      <label className="file">Import chapter JSON<input disabled={busy} type="file" accept=".json,application/json" onChange={e => { void upload(e.target.files?.[0]); e.target.value = ""; }} /></label>
      <label className="file">Resume checkpoint<input disabled={busy || !state} type="file" accept=".json,application/json" onChange={e => { void upload(e.target.files?.[0], true); e.target.value = ""; }} /></label>
      <button disabled={busy || !state} onClick={() => run(async () => { const r = await api({ action: "export", session: state!.session }); download("lore-checkpoint.json", r.checkpoint); })}>Save checkpoint</button>
      <button disabled={busy || !state} onClick={() => run(async () => adopt(await api({ action: "reset", session: state!.session })))}>Reset to snapshot</button>
    </section>
    <p className="muted">Files and dialogue stay in this app process and your chosen downloads. No automatic browser persistence or transcript logging. Save before restarting; reset/selection creates a fresh playthrough.</p>
    {error && <p className="error" role="alert">{error}</p>}
    {!state ? <section className="empty"><h2>Start with a chapter</h2><p>Use the original synthetic story to exercise the harness, or import a prepared chapter artifact. The model server is only needed for metrics and generation.</p></section> : <div className="columns"><div>
      <section>
        <h2>{a!.story.title}</h2><p>Chapter {a!.chapter.number}: {a!.chapter.title} · version {a!.content_version}</p>
        <p>{a!.display.summary}</p><p className="muted">{a!.display.setting}</p>
        <p>Snapshot: {a!.chapter.snapshot_point}. Spoiler ceiling: chapter {a!.chapter.spoiler_ceiling.chapter_number}, through {a!.chapter.spoiler_ceiling.through_passage_id}.</p>
        <p>{a!.display.content_notes.join(" · ")}</p>
        <div className="selectors"><label>Scene<select aria-label="Scene" disabled={busy} value={c!.selection.scene} onChange={e => {
          const s = a!.scenes.find(x => x.id === e.target.value)!, mode: Mode = s.modes.play_as_character.enabled ? "play_as_character" : "talk_to_character";
          void choose({ scene: s.id, mode, character: s.modes[mode].selectable_character_ids[0] });
        }}>{a!.scenes.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select></label>
        <label>Mode<select aria-label="Mode" disabled={busy} value={c!.selection.mode} onChange={e => { const mode = e.target.value as Mode; void choose({ ...c!.selection, mode, character: scene!.modes[mode].selectable_character_ids[0] }); }}>
          {Object.entries(scene!.modes).filter(([, m]) => m.enabled).map(([key]) => <option key={key} value={key}>{key === "play_as_character" ? "Play as a character" : "Talk to a character"}</option>)}
        </select></label>
        <label>Character<select aria-label="Character" disabled={busy} value={c!.selection.character} onChange={e => void choose({ ...c!.selection, character: e.target.value })}>
          {scene!.modes[c!.selection.mode].selectable_character_ids.map(id => <option key={id} value={id}>{a!.characters.find(x => x.id === id)!.name}</option>)}
        </select></label></div>
        <p>{scene!.description}</p><p>{scene!.modes[c!.selection.mode].opening_situation}</p>
        {a!.characters.filter(ch => scene!.participant_ids.includes(ch.id)).map(ch => <p key={ch.id}><strong>{ch.name}</strong> ({ch.display.pronouns}): {ch.display.description}</p>)}
        <details><summary>Visible canon recap</summary>{a!.facts.filter(f => f.reader_visible).map(f => <p key={f.id}>{f.text}</p>)}</details>
      </section>
      <section aria-label="Transcript"><h2>Private playthrough</h2>
        <div aria-label="Conversation progress" aria-live="polite">
          <p><strong>Completed exchanges: {exchanges}</strong> · {c!.transcript.length} messages total ({exchanges} from you + {exchanges} RVN replies)</p>
          <p className="muted">Uncompacted exchanges: {uncompactedExchanges} / 12. {uncompactedExchanges >= 12 ? "Periodic compaction is due before the next reply." : "Periodic compaction is due before the next reply once this reaches 12."} One exchange is your message plus a completed RVN reply. Retained recent exchanges count toward this threshold; context overflow can trigger compaction sooner.</p>
        </div>
        <p className="muted">{c!.selection.mode === "play_as_character" ? "You control your character's speech, actions, decisions and thoughts." : "You remain yourself; the model portrays the selected character."}</p>
        <div className="transcript" aria-live="polite">{c!.transcript.map(m => <article className={m.role} key={m.id}><strong>{m.role === "user" ? "You" : "RVN"}</strong><p>{m.content}</p></article>)}</div>
        <form onSubmit={e => { e.preventDefault(); void run(async () => adopt(await api({ action: "chat", session: state.session, text }))); }}>
          <label htmlFor="message">Your dialogue or action</label><textarea id="message" value={text} onChange={e => setText(e.target.value)} maxLength={6000} disabled={busy} rows={4} />
          <button disabled={busy || !text.trim()}>{busy ? "Preparing complete response…" : projection?.memoryDue || projection?.overBudget ? "Compact memory and send" : "Send"}</button>
          <p className="muted">Failed/incomplete generations do not enter history. The server rejects overflow after attempting bounded memory compaction.</p>
        </form>
      </section>
      <details><summary>Private memory · inspect, correct or clear</summary><p>JSON items use an allowed type, a value and source_message_ids from the completed transcript. Corrections do not change source facts or app settings.</p>
        <textarea aria-label="Memory JSON" rows={12} value={memory} onChange={e => setMemory(e.target.value)} disabled={busy} spellCheck={false} />
        <button disabled={busy} onClick={() => run(async () => { const next = await api({ action: "memory", session: state.session, memory: JSON.parse(memory) }); setState(next); setMemory(JSON.stringify(next.checkpoint.memory, null, 2)); })}>Apply memory</button>
        <button disabled={busy} onClick={() => run(async () => { const next = await api({ action: "memory", session: state.session, memory: [] }); setState(next); setMemory("[]"); })}>Clear memory</button>
        <p>Compacted through message {c!.summarized_through}; transcript retains every completed exchange. Clearing memory does not restore compacted history to the prompt; reset starts from canon.</p>
      </details>
      <details><summary>Author debug · source evidence and message IDs (may contain private knowledge)</summary><pre>{JSON.stringify({ artifact: a, transcript: c!.transcript }, null, 2)}</pre></details>
    </div><aside>
      <section><h2>Next-request context</h2><button disabled={busy} onClick={() => setRevision(r => r + 1)}>Refresh runtime metrics</button>
        {metricError && <p className="error">{metricError}</p>}
        {!projection ? <p>Token counts unavailable{busy ? " while generating" : " — awaiting runtime template/tokenizer"}.</p> : <>
          <p className={projection.overBudget ? "error" : "big"}>{show(projection.input)} / {show(projection.capacity)} input tokens ({show(projection.inputPercent)}%)</p>
          <p>Reserved output: {show(projection.reservedOutput)}<br />Projected total: {show(projection.projectedTotal)} ({show(projection.totalPercent)}%)<br />Headroom: {show(projection.headroom)}</p>
          <p>{projection.countStatus}</p><p className="muted">{projection.capacitySource}</p>
          <dl>{Object.entries(projection.breakdown).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{show(v)}</dd></div>)}</dl><p className="muted">{projection.breakdownStatus}</p>
          {(projection.memoryDue || projection.overBudget) && <p>Compaction required before the next reply. Projection above is before compaction; the server will recount before dispatch.</p>}
        </>}
      </section>
      <section><h2>Last sent request</h2>{!state.last ? <p>No completed generation yet.</p> : <>
        <dl>{Object.entries({ "Prompt tokens": state.last.promptTokens, "Generated tokens": state.last.generatedTokens, "Total tokens": state.last.totalTokens, "Preflight tokens": state.last.preflightTokens, "Reused prompt tokens": state.last.reusedPromptTokens, "Reuse % (of prompt tokens)": state.last.reusePercent, "Freshly evaluated prompt tokens": state.last.freshlyEvaluatedPromptTokens, "Complete-response latency (ms)": state.last.latencyMs }).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{show(v)}</dd></div>)}</dl>
        <p>Finish: {state.last.finishReason} · output limit: {String(state.last.outputLimit)} · context limit: {state.last.contextLimit === null ? "unavailable" : String(state.last.contextLimit)}</p>
        <p>Preflight matches usage: {state.last.preflightMatchesUsage === null ? "unavailable" : String(state.last.preflightMatchesUsage)}. Cache reuse never reduces logical input occupancy. Timing is not cache evidence.</p>
      </>}</section>
      <section><h2>Local evidence</h2><p>Base IQ2_M lineage and equivalence to the multilingual writing reference still need verification. Metrics exports exclude dialogue and source excerpts.</p>
        <button disabled={!state.runs.length || busy} onClick={() => download("local-unguarded-metrics.json", { label: "local unguarded author test", recorded_at: new Date().toISOString(), runtime: state.runtime, sampling: { temperature: 0.7, top_p: 0.9, seed: 42, enable_thinking: false, reasoning_format: "deepseek" }, runs: state.runs })}>Export metrics only</button>
        <button disabled={!c!.transcript.length || busy} onClick={() => { const excerpt = window.getSelection()?.toString(); if (excerpt) download("selected-author-excerpt.json", { label: "deliberately selected local author excerpt", excerpt }); else setError("Select the excerpt text in the transcript first, then export."); }}>Export selected text</button>
        <details><summary>Runtime metadata</summary><pre>{JSON.stringify(state.runtime, null, 2)}</pre></details>
      </section>
    </aside></div>}
  </main>;
}
