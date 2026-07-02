#!/usr/bin/env node
// Fetches claude.ai OAuth usage limits and writes the normalized cache read
// by the limits widget (see src/usage-api.mjs). Spawned detached from the
// statusline; safe to run by hand:  node bin/cc-usage-refresh.mjs
// Uses the local Claude Code OAuth token (~/.claude/.credentials.json).

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CACHE = path.join(os.tmpdir(), "claudegochi-usage.json");

function accessToken() {
  try {
    const cred = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".claude", ".credentials.json"), "utf8"));
    return cred?.claudeAiOauth?.accessToken || null;
  } catch {
    return null;
  }
}

const epoch = (iso) => (iso ? Math.round(Date.parse(iso) / 1000) : null);

async function main() {
  const tok = accessToken();
  if (!tok) return;
  const res = await fetch("https://api.anthropic.com/api/oauth/usage", {
    headers: { Authorization: `Bearer ${tok}`, "anthropic-beta": "oauth-2025-04-20" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) return;
  const j = await res.json();

  // Preferred source: the `limits` array (matches the claude.ai usage UI).
  // `weekly_scoped` is the per-model weekly window (scope names the model).
  const rows = Array.isArray(j.limits) ? j.limits : [];
  const byKind = (kind) => rows.find((r) => r.kind === kind);
  const norm = (r) => (r ? { pct: Math.round(r.percent ?? 0), resetsAt: epoch(r.resets_at) } : null);
  const fromWindow = (w) => (w ? { pct: Math.round(w.utilization ?? 0), resetsAt: epoch(w.resets_at) } : null);
  const scoped = byKind("weekly_scoped");

  const out = {
    fetchedAt: Date.now(),
    limits: {
      session: norm(byKind("session")) ?? fromWindow(j.five_hour),
      weeklyAll: norm(byKind("weekly_all")) ?? fromWindow(j.seven_day),
      weeklyModel: scoped ? { ...norm(scoped), label: scoped.scope?.model?.display_name || "model" } : null,
    },
  };

  const tmp = `${CACHE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(out));
  fs.renameSync(tmp, CACHE);
}

main()
  .catch(() => {})
  .finally(() => {
    try {
      fs.unlinkSync(CACHE + ".refreshing");
    } catch {}
  });
