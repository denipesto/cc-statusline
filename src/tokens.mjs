// Shared context-token logic: used by the `context` and `tamagotchi` widgets.
//
// Source of truth is Claude Code's own `context_window` stdin field (v2.1.132+):
// it uses the official input-only formula and goes empty right after /compact,
// so we never show stale pre-compact numbers. Older CC versions don't send it —
// there we fall back to walking the transcript.

import fs from "node:fs";

// Default window 200k; 1M for [1m]-suffixed models. config.contextWindow overrides,
// and CC's own context_window_size (when present) beats the heuristic.
export function detectWindow(data, config) {
  if (config?.contextWindow) return config.contextWindow;
  if (data.context_window?.context_window_size) return data.context_window.context_window_size;
  const id = `${data.model?.id || ""} ${data.model?.display_name || ""}`;
  if (/\[?1m\]?|1[\s,]?000[\s,]?000/i.test(id)) return 1_000_000;
  return 200_000;
}

// Official formula: input + cache writes + cache reads. No output_tokens —
// that's how CC computes used_percentage, and we must match it.
function sumInput(u) {
  return (
    (u.input_tokens || 0) +
    (u.cache_creation_input_tokens || 0) +
    (u.cache_read_input_tokens || 0)
  );
}

// Fallback for CC versions without the context_window stdin field.
// Walk the transcript from the END, return the first MAIN-chain usage we hit.
// Skips sub-agent entries (isSidechain) — they have their own context.
export function currentContextTokens(transcriptPath) {
  let raw;
  try {
    raw = fs.readFileSync(transcriptPath, "utf8");
  } catch {
    return null;
  }
  const lines = raw.split(/\r?\n/);
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (!line) continue;
    let obj;
    try {
      obj = JSON.parse(line);
    } catch {
      continue;
    }
    if (obj.isSidechain) continue;
    const u = obj.message?.usage;
    if (!u) continue;
    const used = sumInput(u);
    if (used > 0) return used;
  }
  return null;
}

// Tokens currently in context, from CC's stdin data. null when the field is
// absent (old CC) so the caller can fall back; null also right after /compact
// or before the first API call — then there's nothing meaningful to show yet.
function officialContextTokens(data) {
  const cw = data.context_window;
  if (!cw) return null;
  const used = cw.current_usage ? sumInput(cw.current_usage) : cw.total_input_tokens || 0;
  return used > 0 ? used : null;
}

// Convenience: returns { used, window, ratio, left } or null.
export function contextState(data, config) {
  let used;
  if (data.context_window) {
    used = officialContextTokens(data);
  } else {
    const path = data.transcript_path;
    if (!path) return null;
    used = currentContextTokens(path);
  }
  if (used == null) return null;
  const window = detectWindow(data, config);
  const ratio = Math.min(used / window, 1);
  return { used, window, ratio, left: Math.max(window - used, 0) };
}
