#!/usr/bin/env node
// cc-statusline installer. Wires (or removes) the statusLine entry in
// ~/.claude/settings.json. Uses absolute node + script paths (PATH-proof),
// backs up settings.json, and leaves the rest of the config untouched.
//
//   node bin/install.mjs                    # install
//   node bin/install.mjs --uninstall         # remove
//   node bin/install.mjs --mode tamagotchi   # set config.json mode
//   node bin/install.mjs --lang ru           # set config.json language

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ── tiny ANSI styling ───────────────────────────────────────────────
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const x = (c) => (s) => (useColor ? `\x1b[${c}m${s}\x1b[0m` : s);
const grn = x("38;5;78"), dim = x("38;5;244"), bold = x("1"), cyan = x("38;5;80"), red = x("38;5;203"), white = x("97");
const ok = grn("✓");

function box(lines) {
  const visLen = (s) => s.replace(/\x1b\[[0-9;]*m/g, "").length;
  const w = Math.max(...lines.map(visLen));
  const top = dim("╭" + "─".repeat(w + 2) + "╮");
  const bot = dim("╰" + "─".repeat(w + 2) + "╯");
  const body = lines.map((l) => dim("│ ") + l + " ".repeat(w - visLen(l)) + dim(" │"));
  return [top, ...body, bot].join("\n");
}

// ── args ────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const uninstall = args.includes("--uninstall");
const arg = (flag) => (args.indexOf(flag) !== -1 ? args[args.indexOf(flag) + 1] : null);
const wantMode = arg("--mode");
const wantLang = arg("--lang");

// ── paths ───────────────────────────────────────────────────────────
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scriptPath = path.join(repoRoot, "src", "statusline.mjs").replace(/\\/g, "/");
const nodePath = process.execPath.replace(/\\/g, "/");
const settingsPath = path.join(os.homedir(), ".claude", "settings.json");
const configPath = path.join(repoRoot, "config.json");
const short = (p) => p.replace(os.homedir(), "~").replace(/\\/g, "/");

function loadJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8").replace(/^﻿/, ""));
  } catch (e) {
    if (e.code === "ENOENT") return fallback;
    throw new Error(`${file} is not valid JSON: ${e.message}`);
  }
}
function saveJson(file, obj) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + "\n");
}

console.log("");
console.log("  " + bold(cyan("cc-statusline")) + dim("  ·  status line for Claude Code"));
console.log("");

const settings = loadJson(settingsPath, {});

let bak = null;
if (fs.existsSync(settingsPath)) {
  bak = settingsPath + ".bak";
  fs.copyFileSync(settingsPath, bak);
}

if (uninstall) {
  delete settings.statusLine;
  saveJson(settingsPath, settings);
  console.log(box([
    `${ok} ${white("removed")} cc-statusline`,
    `${dim("settings")}  ${short(settingsPath)}`,
    bak ? `${dim("backup")}    ${short(bak)}` : "",
  ].filter(Boolean)));
  console.log("");
  process.exit(0);
}

settings.statusLine = {
  type: "command",
  command: `"${nodePath}" "${scriptPath}"`,
  padding: 0,
};
saveJson(settingsPath, settings);

const cfgChanges = [];
if (wantMode || wantLang) {
  const cfg = loadJson(configPath, {});
  if (wantMode) { cfg.mode = wantMode; cfgChanges.push(`mode → ${wantMode}`); }
  if (wantLang) { cfg.lang = wantLang; cfgChanges.push(`lang → ${wantLang}`); }
  saveJson(configPath, cfg);
}

console.log(box([
  `${ok} ${white(bold("cc-statusline installed"))}`,
  ``,
  `${dim("settings")}  ${short(settingsPath)}`,
  `${dim("script  ")}  ${short(scriptPath)}`,
  bak ? `${dim("backup  ")}  ${short(bak)}` : "",
  ...cfgChanges.map((c) => `${dim("config  ")}  ${c}`),
]));
console.log("");
console.log("  " + grn("→") + " " + bold("Restart Claude Code") + dim(" (close & reopen the terminal) to apply."));
console.log("");
