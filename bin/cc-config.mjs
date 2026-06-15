#!/usr/bin/env node
// cc-statusline config editor. Backs the /claudegochi slash command.
//   node bin/cc-config.mjs                 -> show current settings + options
//   node bin/cc-config.mjs <key> <value>   -> set (with validation)
//   node bin/cc-config.mjs theme cool      -> friendly aliases
//
// Config is re-read on every status-line render, so changes apply live
// (only refreshInterval needs a Claude Code restart).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const configPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "config.json");

// friendly alias -> real key
const ALIAS = { theme: "petTheme", style: "petStyle", name: "petName", project: "petNameProject", animate: "petAnimate", git: "petReactGit" };

// key -> validator/coercer; returns {value} or {error}
const ENUM = (...vals) => (v) => (vals.includes(v) ? { value: v } : { error: `expected one of: ${vals.join(", ")}` });
const BOOL = (v) => (["true", "false", "on", "off", "1", "0"].includes(String(v).toLowerCase())
  ? { value: ["true", "on", "1"].includes(String(v).toLowerCase()) } : { error: "expected true/false" });
const STR = (v) => ({ value: String(v) });
const KEYS = {
  mode: ENUM("normal", "tamagotchi"),
  petStyle: ENUM("sprite", "compact"),
  petTheme: ENUM("warm", "cool", "mono"),
  lang: STR,
  petName: STR,
  petNameProject: BOOL,
  petReactGit: BOOL,
  petAnimate: BOOL,
  contextWindow: (v) => (v === "null" || v === "auto" ? { value: null } : Number.isFinite(+v) ? { value: +v } : { error: "expected a number or 'auto'" }),
  refreshInterval: (v) => (Number.isInteger(+v) && +v >= 1 ? { value: +v } : { error: "expected an integer ≥ 1" }),
};

function load() {
  try { return JSON.parse(fs.readFileSync(configPath, "utf8").replace(/^﻿/, "")); }
  catch (e) { if (e.code === "ENOENT") return {}; throw new Error(`config.json is invalid JSON: ${e.message}`); }
}
function save(cfg) { fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2) + "\n"); }

const C = process.stdout.isTTY ? { g: (s) => `\x1b[38;5;114m${s}\x1b[0m`, d: (s) => `\x1b[2m${s}\x1b[0m`, b: (s) => `\x1b[1m${s}\x1b[0m` }
                              : { g: (s) => s, d: (s) => s, b: (s) => s };

function show(cfg) {
  console.log(C.b("cc-statusline settings") + C.d("  (" + configPath.replace(/\\/g, "/") + ")"));
  for (const k of Object.keys(KEYS)) console.log("  " + k.padEnd(16) + C.g(JSON.stringify(cfg[k] ?? null)));
  console.log(C.d("\nset with:  /claudegochi <key> <value>   e.g.  /claudegochi theme cool"));
  console.log(C.d("keys: mode, petStyle, petTheme, lang, petName, petNameProject, petReactGit, petAnimate, contextWindow, refreshInterval"));
  console.log(C.d("aliases: theme=petTheme, style=petStyle, name=petName, project=petNameProject, git=petReactGit, animate=petAnimate"));
}

const [rawKey, ...rest] = process.argv.slice(2);
const cfg = load();

if (!rawKey || rawKey === "show" || rawKey === "list") { show(cfg); process.exit(0); }

const key = ALIAS[rawKey] || rawKey;
if (!(key in KEYS)) { console.error(C.b("✗") + ` unknown setting "${rawKey}".`); show(cfg); process.exit(1); }
if (!rest.length) { console.error(`✗ no value given. usage: /claudegochi ${rawKey} <value>`); process.exit(1); }

const res = KEYS[key](rest.join(" "));
if (res.error) { console.error(`✗ ${rawKey}: ${res.error}`); process.exit(1); }

const old = cfg[key];
cfg[key] = res.value;
save(cfg);
console.log(C.g("✓") + ` ${key}: ${C.d(JSON.stringify(old ?? null))} → ${C.b(JSON.stringify(res.value))}`);
if (key === "refreshInterval") console.log(C.d("  (restart Claude Code for refreshInterval to take effect)"));
else console.log(C.d("  applies on the next status-line render"));
