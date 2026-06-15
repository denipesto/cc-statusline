// Inspiring status line: rotates between your goal of the day, a daily quote,
// session progress, and a warm nudge from the cat. Shown only when the pet is in
// a good mood (otherwise the real need wins). Kept short so it fits one line.

const QUOTES = [
  '"Make it work, make it right." — Beck',
  '"Simplicity is the soul of efficiency."',
  '"Done is better than perfect."',
  '"Less, but better." — Rams',
  '"Talk is cheap. Show me the code." — Linus',
  '"Real artists ship." — Jobs',
  '"The only way to go fast is to go well."',
  '"First solve the problem, then code."',
  '"Code is read more than it is written."',
  '"Slow is smooth, smooth is fast."',
  '"Make the change easy, then change."',
  '"Perfection: nothing left to remove."',
];

const CHEERS = [
  "deep in flow — ship it",
  "you've got this",
  "one commit at a time",
  "small steps, real progress",
  "keep going, you're close",
  "trust the process",
  "breathe, then ship",
  "future-you says thanks",
  "good code, good vibes",
  "make it real",
];

const DAY = 86400000, SLOT = 30000; // quote rotates daily; line rotates ~30s

// Returns one short inspiring string, or null if nothing applies.
export function inspireLine(cfg, data, pet, now) {
  const sources = [];
  if (cfg?.goal) sources.push("🎯 " + cfg.goal);

  const lines = data.cost?.total_lines_added || 0;
  if (lines >= 25) sources.push(`🔥 ${lines} lines this session`);
  if (pet?.streak > 2) sources.push(`🔥 ${pet.streak}-day streak`);

  sources.push("✦ " + QUOTES[Math.floor(now / DAY) % QUOTES.length]);
  sources.push(CHEERS[Math.floor(now / SLOT) % CHEERS.length]);

  return sources.length ? sources[Math.floor(now / SLOT) % sources.length] : null;
}
