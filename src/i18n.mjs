// Tiny i18n: locales live in /locales/<code>.json. English is the source of truth;
// any missing key in another locale falls back to English. Community can add a
// language by dropping one JSON file — no code changes.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "locales");
const cache = {};

function load(code) {
  if (code in cache) return cache[code];
  try {
    cache[code] = JSON.parse(fs.readFileSync(path.join(dir, `${code}.json`), "utf8").replace(/^﻿/, ""));
  } catch {
    cache[code] = null;
  }
  return cache[code];
}

const dig = (obj, key) => key.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);

// makeT("ru") -> t("tamagotchi.starving"); falls back to en, then to the key itself.
export function makeT(code) {
  const en = load("en") || {};
  const loc = code && code !== "en" ? load(code) || {} : {};
  return (key) => {
    const v = dig(loc, key);
    if (v != null) return v;
    const e = dig(en, key);
    return e != null ? e : key;
  };
}

// list available locale codes + display names (for docs / future UI)
export function listLocales() {
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""))
      .map((code) => ({ code, name: load(code)?.name || code }));
  } catch {
    return [];
  }
}
