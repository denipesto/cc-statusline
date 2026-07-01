// Pet characters. Each is a 4-line sprite renderer (eyes, mouth) => [l0..l3].
// Eyes are 3 chars (e.g. "^_^"), mouth is 1 char (e.g. "w"). Pick with petChar.
// Every character gets its own silhouette — ears/top, face wrapper, muzzle,
// body — so they read differently even with identical mood eyes.
// The egg (Lv.0) is universal — see EGG below.

export const EGG = (e) => ["  .---.", ` ( ${e} )`, ` (     )`, "  `---'"];

export const CHARS = {
  cat:     (e, m) => [" /\\_/\\",   `( ${e} )`,    ` > ${m} <`,   ` (\")_(\")`],
  dog:     (e, m) => ["  n__n",     ` ( ${e} )`,   `  ) ${m} (`,  `  /|_|\\`],
  bunny:   (e, m) => [" (\\_/)",    `( ${e} )`,    ` ( ${m} )`,   `c(\")(\")`],
  bear:    (e, m) => ["  .-\"-.",   ` ʕ ${e} ʔ`,   `  ( ${m} )`,  `  (___)`],
  fox:     (e, m) => [" /\\,,/\\",  `( ${e} )`,    ` \\ ${m} /`,  `  \\_/~`],
  frog:    (e, m) => ["  @...@",    ` ( ${e} )`,   `  ) ${m} (`,  ` /(___)\\`],
  robot:   (e, m) => ["   _n_",     ` [ ${e} ]`,   ` |==${m}==|`, `  d|_|b`],
  dragon:  (e, m) => ["  }\\_/{",   ` ( ${e} )`,   `<(  ${m}  )>`, `  ~^-^~`],
  panda:   (e, m) => ["  ()_()",    ` ((${e}))`,   `  ) ${m} (`,  `  (___)`],
  penguin: (e, m) => ["   .--.",    `  ( ${e} )`,  ` <| ${m} |>`, `   _/\\_`],
};

export const CHAR_NAMES = Object.keys(CHARS);
