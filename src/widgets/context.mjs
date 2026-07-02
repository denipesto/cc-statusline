// ⭐ MVP widget: how much of the context window is used + how much is left.

import { gradientBar, c256, THEMES, dim, fmtTokens } from "../colors.mjs";
import { contextState } from "../tokens.mjs";

export default {
  name: "context",
  render(data, ctx) {
    const s = contextState(data, ctx.config);
    if (!s) return null;
    const theme = THEMES[ctx.config?.petTheme] || THEMES.warm;
    const ctxBar = gradientBar(s.ratio, 10, theme.grad);
    const toneN = s.ratio >= 0.85 ? theme.high : s.ratio >= 0.6 ? theme.mid : theme.low;
    const pct = c256(toneN)(`${Math.round(s.ratio * 100)}%`);
    const left = dim(fmtTokens(s.left));
    return `${ctxBar} ${pct} ${dim("·")} ${left}`;
  },
};
