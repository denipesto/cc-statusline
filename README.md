# cc-statusline

A useful status line for Claude Code: context remaining, plus 🐱 **claudegochi** —
a tamagotchi whose mood reflects your session.

<p align="center">
  <img src="docs/demo.gif" alt="claudegochi — a tamagotchi cat that gets hungry as your Claude Code context fills up, then you feed it with /compact" width="640">
</p>

## Install in one line

Requires Node.js, git and the Claude Code CLI. Paste the command — it clones and installs.

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/denipesto/cc-statusline/main/install.ps1 | iex
```

**macOS / Linux / Git Bash:**
```sh
curl -fsSL https://raw.githubusercontent.com/denipesto/cc-statusline/main/install.sh | sh
```

The bootstrap clones the repo into `~/.cc-statusline` and runs the installer.
Then **restart Claude Code**.

### Uninstall in one line

```powershell
irm https://raw.githubusercontent.com/denipesto/cc-statusline/main/uninstall.ps1 | iex
```
```sh
curl -fsSL https://raw.githubusercontent.com/denipesto/cc-statusline/main/uninstall.sh | sh
```

Removes the status line from `settings.json` (your config and the backup are left in place).

### Manual (clone + installer)

```sh
git clone https://github.com/denipesto/cc-statusline.git
cd cc-statusline
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

## Configure interactively

**Instant menu, no tokens** — run the editor directly in your terminal (in Claude
Code, prefix with `!`). Arrow keys + Enter, drills into each setting:

```
!node ~/.cc-statusline/bin/cc-config.mjs
```

It's a local TUI — no LLM, no latency, no token cost.

**From chat** — the installer also registers a thin `/claudegochi` slash command
for quick one-off changes (this one does use the model):

```
/claudegochi theme cool   # palette: warm | cool | mono
/claudegochi mode normal  # plain context bar (no pet)
/claudegochi show         # print current settings
```

(The slash command appears after you restart Claude Code.)

## Configure — `config.json`

Re-read on every render, no restart needed.

| Field | Values | What it does |
|---|---|---|
| `mode` | `"normal"` \| `"tamagotchi"` | which mode to render |
| `widgets` | `["context", ...]` | which widgets and order (normal mode) |
| `petStyle` | `"sprite"` \| `"compact"` | cat as 3 lines / 1 line |
| `petName` | string | pet name |
| `petTheme` | `"warm"` \| `"cool"` \| `"mono"` | color palette (bar + mood) |
| `petNameProject` | `true` \| `false` | show the current project's folder name instead of `petName` |
| `petReactGit` | `true` \| `false` | react to new commits (cheap, throttled git call) |
| `petAnimate` | `true` \| `false` | ~1fps blink / sleepy animation |
| `refreshInterval` | integer ≥ 1 | seconds between timer refreshes (the installer writes this into `settings.json` so the animation keeps ticking while idle) |
| `contextWindow` | `null` \| number | context window (`null` = auto: 200k / 1M for `[1m]`) |
| `separator` | string | separator between widgets |

## How claudegochi grows

claudegochi is a persistent pet (saved in `~/.cc-statusline-pet.json`, shared across
all projects):

- **Needs** — hunger tracks your context fill; energy drops over a long session.
- **Evolution** — earns XP and levels up: 🥚 egg → kitten → cat → elder.
- **Reactions** — feeding it with `/compact` (a context drop), landing commits, and
  daily streaks all grant XP and a short happy reaction.
- **Animation** — blinks and dozes at ~1fps (kept ticking by `refreshInterval`).

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

Ideas and backlog live in [IDEAS.md](./IDEAS.md).

## License

MIT
