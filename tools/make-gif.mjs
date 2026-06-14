// Generates SVG frames of the claudegochi animation for the README GIF.
// Then assemble with ImageMagick:
//   magick -dispose previous -delay 9 -loop 0 C:/tmp/ccframes/f*.svg docs/demo.gif
import fs from "node:fs";

const OUT = "C:/tmp/ccframes";
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const W = 760, H = 232;
const PAL = ["#46d07a", "#5fd06a", "#8fd05a", "#c9c75c", "#e6a45a", "#f0883e", "#f0626c"];
const BARN = 14;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function heart(x, y, filled) {
  const fill = filled ? "#f0626c" : "none";
  const stroke = filled ? "none" : "#39414e";
  return `<path transform="translate(${x},${y}) scale(0.8)" d="M9 4.5C9 3 7.5 1.5 5.5 1.5 3 1.5 1 3.5 1 6.5 1 9.5 5 12.5 9 16 13 12.5 17 9.5 17 6.5 17 3.5 15 1.5 12.5 1.5 10.5 1.5 9 3 9 4.5Z" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>`;
}

function bar(ratio) {
  const fill = Math.round(ratio * BARN);
  let s = "";
  for (let i = 0; i < BARN; i++) {
    const on = i < fill;
    const col = on ? PAL[Math.min(PAL.length - 1, Math.floor((i / BARN) * PAL.length))] : "#222a35";
    s += `<rect x="${i * 16}" y="0" width="12" height="15" rx="2.5" fill="${col}"/>`;
  }
  return s;
}

function frameSVG(st) {
  const { eyes, mouth, phrase, ratio, color } = st;
  const sat = 1 - ratio;
  const hN = Math.max(0, Math.min(5, Math.round(sat * 5)));
  const pct = Math.round(ratio * 100);
  const fx = 34, fs = 27; // face x, font-size

  let hearts = "";
  for (let i = 0; i < 5; i++) hearts += heart(196 + i * 20, 119, i < hN);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" rx="16" fill="#0b0e14"/>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="15" fill="#0f131b" stroke="#1e2530"/>
<rect x="1" y="1" width="${W - 2}" height="44" rx="15" fill="#0d1119"/>
<rect x="1" y="30" width="${W - 2}" height="15" fill="#0d1119"/>
<circle cx="26" cy="23" r="6" fill="#ec6a5e"/><circle cx="46" cy="23" r="6" fill="#f4bf4f"/><circle cx="66" cy="23" r="6" fill="#61c554"/>
<text x="92" y="28" font-family="monospace" font-size="14" fill="#5d6675">claudegochi — live</text>
<g font-family="'DejaVu Sans Mono','Cascadia Mono',monospace" font-size="${fs}">
  <text x="${fx}" y="100" fill="${color}" xml:space="preserve"> /\\_/\\</text>
  <text x="${fx}" y="134" fill="${color}" xml:space="preserve">( ${esc(eyes)} )</text>
  <text x="${fx}" y="168" fill="${color}" xml:space="preserve"> &gt; ${esc(mouth)} &lt;</text>
  ${hearts}
  <g transform="translate(300,121)">${bar(ratio)}</g>
  <text x="${300 + BARN * 16 + 8}" y="134" font-size="20" fill="#8b95a5">${pct}%</text>
  <text x="196" y="166" font-size="18" fill="#5d6675">${esc(phrase)}</text>
</g>
</svg>`;
}

// mood by ratio (mirrors the widget)
function mood(r) {
  if (r < 0.2) return { eyes: "^_^", mouth: "w", phrase: "purring", color: "#5ad17a" };
  if (r < 0.45) return { eyes: "^_^", mouth: "w", phrase: "full & happy", color: "#5ad17a" };
  if (r < 0.65) return { eyes: "o_o", mouth: "u", phrase: "feeling good", color: "#cdbf63" };
  if (r < 0.8) return { eyes: "o_o", mouth: "~", phrase: "getting peckish...", color: "#cdbf63" };
  if (r < 0.9) return { eyes: ";_;", mouth: "~", phrase: "tummy rumbling...", color: "#e0a85a" };
  return { eyes: "x_x", mouth: "!", phrase: "FEED ME! /compact", color: "#f0626c" };
}

const frames = [];
const push = (st) => frames.push(st);

// fill: 0.26 -> 0.96
let r = 0.26;
for (let i = 0; i < 19; i++) {
  const m = mood(r);
  if (i % 6 === 5) m.eyes = "-_-"; // blink
  push({ ...m, ratio: r });
  r += 0.038;
}
// starving hold (shake-ish via eyes)
for (let i = 0; i < 3; i++) push({ ...mood(0.96), eyes: i % 2 ? "x_x" : "@_@", ratio: 0.96 });
// feed: ratio drops, nom nom
let rf = 0.9;
for (let i = 0; i < 4; i++) { push({ eyes: "^_^", mouth: "u", phrase: "nom nom nom...", color: "#5ad17a", ratio: rf }); rf -= 0.2; }
// celebrate
for (let i = 0; i < 6; i++) push({ eyes: i % 4 === 3 ? "-_-" : "^_^", mouth: "w", phrase: "+life !  thanks", color: "#5ad17a", ratio: 0.14 });

frames.forEach((st, i) => {
  fs.writeFileSync(`${OUT}/f${String(i).padStart(3, "0")}.svg`, frameSVG(st));
});
console.log(`wrote ${frames.length} frames to ${OUT}`);
