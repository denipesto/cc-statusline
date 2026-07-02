# claudegochi

A useful status line for Claude Code: context remaining, plus 🐱 **claudegochi** —
a tamagotchi whose mood reflects your session.

<p align="center">
  <img src="docs/demo.gif" alt="claudegochi — a tamagotchi cat that gets hungry as your Claude Code context fills up, then you feed it with /compact" width="640">
</p>

## Install in one line

Requires Node.js, git and the Claude Code CLI. Paste the command — it clones and installs.

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/denipesto/claudegochi/main/scripts/install.ps1 | iex
```

**macOS / Linux / Git Bash:**
```sh
curl -fsSL https://raw.githubusercontent.com/denipesto/claudegochi/main/scripts/install.sh | sh
```

The bootstrap clones the repo into `~/.claudegochi` and runs the installer.
Then **restart Claude Code**.

### Uninstall in one line

```powershell
irm https://raw.githubusercontent.com/denipesto/claudegochi/main/scripts/uninstall.ps1 | iex
```
```sh
curl -fsSL https://raw.githubusercontent.com/denipesto/claudegochi/main/scripts/uninstall.sh | sh
```

Removes the status line from `settings.json` (your config and the backup are left in place).

### Manual (clone + installer)

```sh
git clone https://github.com/denipesto/claudegochi.git
cd claudegochi
node bin/install.mjs
```

The installer writes `statusLine` into `~/.claude/settings.json` using **absolute paths
to node and the script** (computed from the clone location — PATH doesn't matter, the
folder can live anywhere), backs up `settings.json.bak`, and leaves the rest of the config
untouched. From the project folder: `npm run setup`.

### Options

```sh
node bin/install.mjs --mode tamagotchi   # install and switch the cat on
node bin/install.mjs --mode normal       # install in context-bar mode
node bin/install.mjs --uninstall         # remove statusLine from settings.json
```

(`npm run remove` = `--uninstall`.)

## Configure

**`ccg` — instant, zero tokens.** The installer adds a `UserPromptSubmit` hook, so
typing a line that starts with `ccg` runs locally and never reaches the model:

```
ccg                    # show current settings
ccg theme cool         # palette: warm | cool | mono
ccg mode normal        # plain context bar (no pet)
ccg name Murka         # rename the pet
```

No latency, no token cost — it's intercepted and run on your machine.

**Interactive arrow-key menu** — a local TUI (no LLM). Run it in a **real terminal**
(not inside Claude Code's chat, where `!` has no interactive TTY):

```
node bin/cc-config.mjs
```

**`/claudegochi`** — a slash command for the same `show`/set, if you prefer it.
Note: slash commands always invoke the model (a small token cost); `ccg` does not.

> Why not an arrow-key menu *inside* Claude Code? Custom slash commands always call
> the model, the `!` prefix runs non-interactively (no PTY), and hooks/keybindings
> can't draw a UI. So: `ccg` for instant no-token edits in chat, or the TUI in a
> real terminal for arrow-key navigation.

## Configure — `config.json`

Re-read on every render, no restart needed. `config.json` is per-user (gitignored);
without one, the built-in defaults apply — see [`config.example.json`](./config.example.json).
Any keys you set are merged over the defaults, so a partial file is fine.

| Field | Values | What it does |
|---|---|---|
| `mode` | `"normal"` \| `"tamagotchi"` | which mode to render |
| `widgets` | `["context", ...]` | which widgets and order (normal mode) — see below |
| `petStyle` | `"sprite"` \| `"compact"` | cat as 3 lines / 1 line |
| `petName` | string | pet name |
| `petChar` | `cat` \| `dog` \| `bunny` \| `bear` \| `fox` \| `frog` \| `robot` \| `dragon` \| `panda` \| `penguin` | which creature your pet is |
| `petTheme` | `"warm"` \| `"cool"` \| `"mono"` | color palette (bar + mood) |
| `petNameProject` | `true` \| `false` | show the current project's folder name instead of `petName` |
| `petReactGit` | `true` \| `false` | react to new commits (cheap, throttled git call) |
| `petAnimate` | `true` \| `false` | ~1fps blink / sleepy animation |
| `petInspire` | `true` \| `false` | rotate an inspiring line (goal / quote / progress / cheer) when in a good mood |
| `goal` | string \| `null` | your goal of the day, shown as a north-star (`ccg goal finish the auth flow`, clear with `ccg goal none`) |
| `vocabEvery` | integer ≥ 1 | seconds between `vocab` phrases (default 60) |
| `limitsStyle` | `"meter"` \| `"compact"` | `limits` widget: two dot-meter lines, or a compact `c8/100(2h58m) a27/100 f43/100` appended inline to the previous line |
| `refreshInterval` | integer ≥ 1 | seconds between timer refreshes (the installer writes this into `settings.json` so the animation keeps ticking while idle) |
| `contextWindow` | `null` \| number | context window (`null` = auto: 200k / 1M for `[1m]`) |
| `separator` | string | separator between widgets |

## How claudegochi grows

claudegochi is a persistent pet (saved in `~/.claudegochi-pet.json`, shared across
all projects):

- **Needs** — hunger tracks your context fill; energy drops over a long session.
- **Characters** — pick your creature with `petChar` (cat, dog, fox, dragon, robot…); the 🥚 egg (Lv.0) hatches into it.
- **Evolution** — earns XP and levels up; high levels become an *elder*.
- **Reactions** — feeding it with `/compact` (a context drop), landing commits, and
  daily streaks all grant XP and a short happy reaction.
- **Animation** — blinks and dozes at ~1fps (kept ticking by `refreshInterval`).

### Widgets (normal mode)

In `"mode": "normal"` the `widgets` list is rendered in order, joined by `separator`:

| widget | shows |
|---|---|
| `context` | context bar + `%` + tokens left |
| `quote` | a short craft/building quote of the day |
| `vocab` | meeting/standup English — word + IPA + RU (~1200 phrases in `src/data/vocab.json`); rotation set by `vocabEvery` |
| `jp` | Japanese learning — 日本語 + romaji + RU (`src/data/jp.json`); rotation set by `vocabEvery` |
| `limits` | Claude.ai (Pro/Max) usage limits (auto-hidden on API-key usage). `limitsStyle: "meter"` = 5-hour + weekly dot-meter lines from the statusline feed; `"compact"` = inline `c50/100(3h08m) a7/100 f7/100` (current session / weekly all models / weekly top-model), sourced from the claude.ai usage API via a 60s background-refreshed cache (`bin/cc-usage-refresh.mjs`, uses your local Claude Code OAuth token) — the same numbers as `/usage` and claude.ai settings |
| `tamagotchi` | the pet (also the whole of `tamagotchi` mode) |

```json
{ "mode": "normal", "widgets": ["context", "quote"] }
```
→ `ctx ▓▓▓░░ 57% · 426k left │ ✦ "Slow is smooth, smooth is fast."`

Each widget is a small module in `src/widgets/` returning a string (or `null` to
hide) — easy to add your own.

## Languages

English is the default; **Russian** ships in the box. Pick a language in `config.json`:

```json
{ "lang": "ru" }
```

…or at install time: `node bin/install.mjs --lang ru`.

### Add your language (PRs welcome)

1. Copy `locales/en.json` to `locales/<code>.json` (e.g. `de.json`, `fr.json`, `ja.json`).
2. Translate the **values** only — keep the keys and any `/commands` intact.
3. Set `"lang": "<code>"` in `config.json` and run `npm run demo` to check it.
4. Open a pull request.

Missing keys fall back to English, so partial translations work fine. See
[`locales/README.md`](./locales/README.md) for the full guide.

## Development

```sh
npm run demo    # render the cat in every mood (synthetic fixtures)
```

Ideas and backlog live in [IDEAS.md](./docs/IDEAS.md).

## License

MIT
