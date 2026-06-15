#!/bin/sh
# claudegochi one-liner uninstall (macOS / Linux / Git Bash).
#   curl -fsSL https://raw.githubusercontent.com/denipesto/claudegochi/main/uninstall.sh | sh
# Removes the status line from ~/.claude/settings.json (config is left untouched).

set -e
DIR="$HOME/.claudegochi"

if ! command -v node >/dev/null 2>&1; then
  echo "✗ 'node' not found in PATH." >&2
  exit 1
fi
if [ ! -f "$DIR/bin/install.mjs" ]; then
  echo "claudegochi is not installed (~/.claudegochi missing)."
  exit 0
fi

node "$DIR/bin/install.mjs" --uninstall
