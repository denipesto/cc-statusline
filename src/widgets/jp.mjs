// Japanese-learning widget. Rotates a word/phrase: 日本語 + romaji + RU gloss.
// Add to normal mode:  { "mode": "normal", "widgets": ["jp"] }
// Pool lives in src/data/jp.json — extend or regenerate it freely.
// Rotation interval shared with vocab via vocabEvery.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dim, c256, THEMES } from "../colors.mjs";

const file = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "jp.json");
let POOL = [];
try { POOL = JSON.parse(fs.readFileSync(file, "utf8").replace(/^﻿/, "")); } catch {}

export default {
  name: "jp",
  render(data, ctx) {
    if (!POOL.length) return null;
    const now = ctx.now ?? Date.now();
    const every = Math.max(1, ctx.config?.vocabEvery || 60) * 1000;
    const e = POOL[Math.floor(now / every) % POOL.length];
    const accent = c256((THEMES[ctx.config?.petTheme] || THEMES.warm).low);
    return accent("🗾 " + e.jp) + " " + dim("(" + e.romaji + ")") + dim(" · " + e.ru);
  },
};
