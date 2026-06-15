// Pet characters. Each is a 4-line sprite renderer (eyes, mouth) => [l0..l3].
// Eyes are 3 chars (e.g. "^_^"), mouth is 1 char (e.g. "w"). Pick with petChar.
// The egg (Lv.0) is universal — see EGG below.

export const EGG = (e) => ["  .---.", ` ( ${e} )`, ` (     )`, "  `---'"];

export const CHARS = {
  cat:     (e, m) => [" /\\_/\\",   `( ${e} )`,   ` > ${m} <`,  ` (\")_(\")`],
  dog:     (e, m) => [" /\\__/\\",  `( ${e} )`,   ` ( ${m} )`,  ` U\"---\"U`],
  bunny:   (e, m) => ["  (\\_/)",   ` ( ${e} )`,  `  > ${m} <`, ` (\")_(\")`],
  bear:    (e, m) => [" (o)_(o)",   `( ${e} )`,   ` ( ${m} )`,  `  (___)`],
  fox:     (e, m) => [" |\\__/|",   `( ${e} )`,   ` \\ ${m} /`, `  \"\\_/\"`],
  frog:    (e, m) => ["  _____",    `( ${e} )`,   ` ( ${m} )`,  `  \\___/`],
  robot:   (e, m) => [" ,[___],",   `[ ${e} ]`,   ` |_${m}_|`,  ` /|. .|\\`],
  dragon:  (e, m) => [" <\\_/\\>",  `( ${e} )`,   ` < ${m} >`,  ` /\\^^^/\\`],
  panda:   (e, m) => [" (q)_(p)",   `( ${e} )`,   ` ( ${m} )`,  `  (___)`],
  penguin: (e, m) => ["   __",      `<( ${e} )>`, `  | ${m} |`, `  /_-_\\`],
};

export const CHAR_NAMES = Object.keys(CHARS);
