// English-for-standups widget. Rotates a useful word/phrase with IPA + RU,
// so you passively pick up meeting English during Zoom syncs.
// Add to normal mode:  { "mode": "normal", "widgets": ["vocab"] }
// Pool lives in src/data/vocab.json — extend or regenerate it freely.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dim, bold, c256 } from "../colors.mjs";

const file = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "vocab.json");
let POOL = [];
try { POOL = JSON.parse(fs.readFileSync(file, "utf8").replace(/^﻿/, "")); } catch {}

const SLOT = 60000; // a new phrase every ~minute

export default {
  name: "vocab",
  render(data, ctx) {
    if (!POOL.length) return null;
    const now = ctx.now ?? Date.now();
    const e = POOL[Math.floor(now / SLOT) % POOL.length];
    return c256(80)("🗣 ") + bold(e.en) + " " + dim(e.ipa) + dim(" · " + e.ru);
  },
};
