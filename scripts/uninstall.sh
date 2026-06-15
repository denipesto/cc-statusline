#!/bin/sh
# cc-statusline one-liner uninstall (macOS / Linux / Git Bash).
#   curl -fsSL https://raw.githubusercontent.com/denipesto/cc-statusline/main/uninstall.sh | sh
# Removes the status line from ~/.claude/settings.json (config is left untouched).

set -e
DIR="$HOME/.cc-statusline"

if ! command -v node >/dev/null 2>&1; then
  echo "✗ 'node' not found in PATH." >&2
  exit 1
fi
if [ ! -f "$DIR/bin/install.mjs" ]; then
  echo "cc-statusline is not installed (~/.cc-statusline missing)."
  exit 0
fi

node "$DIR/bin/install.mjs" --uninstall
