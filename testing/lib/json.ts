// Validate syntax with native JSON first, then walk tokens to reject duplicate keys.
// Never eval artifact/checkpoint text.
export function parseJSON(source: string): unknown {
  const result: unknown = JSON.parse(source);
  let i = 0;
  const ws = () => { while (/\s/.test(source[i] ?? "") && i < source.length) i++; };
  const string = () => {
    const start = i++;
    while (i < source.length) { const c = source[i++]; if (c === "\\") i++; else if (c === '"') break; }
    return JSON.parse(source.slice(start, i)) as string;
  };
  const value = (): void => {
    ws();
    if (source[i] === '"') { string(); return; }
    if (source[i] === "{") {
      i++; ws(); const keys = new Set<string>();
      if (source[i] !== "}") while (true) {
        ws(); const key = string();
        if (keys.has(key)) throw new Error("Duplicate JSON object key"); keys.add(key);
        ws(); i++; value(); ws(); if (source[i] !== ",") break; i++;
      }
      i++; return;
    }
    if (source[i] === "[") {
      i++; ws(); if (source[i] !== "]") while (true) { value(); ws(); if (source[i] !== ",") break; i++; }
      i++; return;
    }
    while (i < source.length && !/[\s,}\]]/.test(source[i])) i++;
  };
  value(); return result;
}
