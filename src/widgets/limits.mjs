// Usage-limits widget: Claude.ai (Pro/Max) rate-limit windows.
// Two styles (config.limitsStyle):
//   "meter"   — two lines of dot-meters (current / weekly), from stdin rate_limits
//   "compact" — one inline chunk `c8/100(2h58m) a27/100 f43/100`, appended to
//               the previous widget's line; data from the OAuth usage API cache
//               (the only source that carries the per-model weekly window),
//               falling back to stdin for c/a while the cache warms up.
// Add to normal mode:  { "widgets": [..., "limits"], "limitsStyle": "compact" }
// Hidden automatically when no data is available (e.g. API-key usage).

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { c256, dim, THEMES } from "../colors.mjs";
import { readUsageCache, ensureFreshUsage } from "../usage-api.mjs";

const MON = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function levelColor(pct, theme) {
  return pct >= 85 ? theme.high : pct >= 60 ? theme.mid : theme.low;
}

function dots(pct, theme) {
  const n = Math.max(0, Math.min(10, Math.round(pct / 10)));
  return c256(levelColor(pct, theme))("●".repeat(n)) + dim("○".repeat(10 - n));
}

function fmtReset(epoch, now) {
  if (!epoch) return "";
  const d = new Date(epoch * 1000);
  let h = d.getHours();
  const ap = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  const time = `${h}:${String(d.getMinutes()).padStart(2, "0")}${ap}`;
  const sameDay = d.toDateString() === new Date(now).toDateString();
  return sameDay ? time : `${MON[d.getMonth()]} ${d.getDate()}, ${time}`;
}

// compact style: fixed identity colors (not usage-level colors)
const COMPACT = { current: 80, all: 75, model: 136 }; // teal / steel blue / brown-gold

// "2h58m" / "43m" / "3d5h" until the epoch-seconds timestamp
function fmtLeft(epochSec, now) {
  if (!epochSec) return "";
  const s = Math.max(0, epochSec - Math.round(now / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d${h}h`;
  if (h > 0) return `${h}h${String(m).padStart(2, "0")}m`;
  return m > 0 ? `${m}m` : "<1m";
}

function fromStdin(w) {
  return w ? { pct: Math.round(w.used_percentage || 0), resetsAt: w.resets_at } : null;
}

// effortLevel isn't on the statusline stdin — it's a global CLI setting,
// so read it straight from ~/.claude/settings.json (cheap, small file).
function readEffortLevel() {
  try {
    const raw = fs.readFileSync(path.join(os.homedir(), ".claude", "settings.json"), "utf8");
    return JSON.parse(raw).effortLevel || null;
  } catch {
    return null;
  }
}

// "Sonnet 5" -> "S5", "Opus 4.8" -> "O4.8", "Haiku 4.5" -> "H4.5"
function shortModel(name) {
  const words = name.trim().split(/\s+/);
  const initial = words[0][0].toUpperCase();
  const version = words.slice(1).join("");
  return version ? `${initial}${version}` : initial;
}

const EFFORT_SHORT = { low: "lo", medium: "md", high: "hi", xhigh: "xh", max: "mx" };

function modelEffort(data) {
  const name = data.model?.display_name;
  if (!name) return null;
  const effort = readEffortLevel();
  const tag = effort ? EFFORT_SHORT[effort] || effort.slice(0, 2) : null;
  return dim(shortModel(name)) + (tag ? dim(`·${tag}`) : "");
}

function renderCompact(data, now, theme) {
  ensureFreshUsage();
  const cached = readUsageCache()?.limits;
  const rl = data.rate_limits;
  // stdin rate_limits reflects this exact running session live (no network,
  // no cache lag) — always prefer it for session/weekly-all. The OAuth usage
  // API can be a little stale (our own 60s cache, plus whatever Anthropic
  // caches server-side), so it's used only as a fallback for those two, and
  // as the sole source for the per-model weekly bar (not in stdin at all).
  const session = fromStdin(rl?.five_hour) ?? cached?.session;
  const weeklyAll = fromStdin(rl?.seven_day) ?? cached?.weeklyAll;
  const weeklyModel = cached?.weeklyModel ?? null;

  // identity color on the letter (which window), urgency color on the
  // number (how close to the limit) — carries more signal than one flat tone.
  const item = (letter, w, identity, withReset) => {
    if (!w) return null;
    const left = withReset && w.resetsAt ? dim(`(${fmtLeft(w.resetsAt, now)})`) : "";
    return c256(identity)(letter) + c256(levelColor(w.pct, theme))(String(w.pct)) + dim("/100") + left;
  };

  const parts = [
    item("c", session, COMPACT.current, true),
    item("a", weeklyAll, COMPACT.all, false),
    weeklyModel ? item((weeklyModel.label || "m")[0].toLowerCase(), weeklyModel, COMPACT.model, false) : null,
    modelEffort(data),
  ].filter(Boolean);
  return parts.length ? parts.join(" ") : null;
}

export default {
  name: "limits",
  // compact style rides on the previous widget's line instead of its own
  inline(config) {
    return config?.limitsStyle === "compact";
  },
  render(data, ctx) {
    const now = ctx.now ?? Date.now();
    const theme = THEMES[ctx.config?.petTheme] || THEMES.warm;
    if (ctx.config?.limitsStyle === "compact") return renderCompact(data, now, theme);

    const rl = data.rate_limits;
    if (!rl || (!rl.five_hour && !rl.seven_day)) return null;

    const row = (label, w) => {
      if (!w) return null;
      const pct = Math.round(w.used_percentage || 0);
      return `${dim(label.padEnd(7))} ${dots(pct, theme)} ${c256(levelColor(pct, theme))(`${pct}%`)}  ${dim("↻ " + fmtReset(w.resets_at, now))}`;
    };

    return [row("current", rl.five_hour), row("weekly", rl.seven_day)].filter(Boolean).join("\n");
  },
};
