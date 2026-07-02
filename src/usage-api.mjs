// Claude.ai OAuth usage cache. The /api/oauth/usage endpoint is what the
// claude.ai usage UI shows: session + weekly-all-models + weekly top-model
// (Fable/Opus) — the statusline stdin only carries the first two.
// Render never blocks on the network: it reads the cache file, and when the
// cache is stale spawns a detached refresher (bin/cc-usage-refresh.mjs).

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

export const USAGE_CACHE = path.join(os.tmpdir(), "claudegochi-usage.json");
const TTL_MS = 60_000; // refresh when the cache is older than this
const RETRY_GAP_MS = 20_000; // min gap between refresher spawns

export function readUsageCache() {
  try {
    const j = JSON.parse(fs.readFileSync(USAGE_CACHE, "utf8"));
    return j && j.limits ? j : null;
  } catch {
    return null;
  }
}

// Kick a background refresh if the cache is stale. Fire-and-forget; the
// current render uses whatever is cached (or stdin fallbacks).
export function ensureFreshUsage() {
  let mtime = 0;
  try {
    mtime = fs.statSync(USAGE_CACHE).mtimeMs;
  } catch {}
  if (Date.now() - mtime < TTL_MS) return;

  const marker = USAGE_CACHE + ".refreshing";
  try {
    if (Date.now() - fs.statSync(marker).mtimeMs < RETRY_GAP_MS) return;
  } catch {}
  try {
    fs.writeFileSync(marker, "");
  } catch {}

  const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "bin", "cc-usage-refresh.mjs");
  try {
    spawn(process.execPath, [script], { detached: true, stdio: "ignore", windowsHide: true }).unref();
  } catch {}
}
