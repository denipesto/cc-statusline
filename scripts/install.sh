#!/bin/sh
# claudegochi one-liner bootstrap (macOS / Linux / Git Bash).
#   curl -fsSL https://raw.githubusercontent.com/denipesto/claudegochi/main/install.sh | sh
# Clones (or updates) the repo into ~/.claudegochi and runs the installer.

set -e
REPO="https://github.com/denipesto/claudegochi.git"
DIR="$HOME/.claudegochi"

for cmd in git node; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "✗ '$cmd' not found in PATH. Install it first." >&2
    exit 1
  fi
done

if [ -d "$DIR/.git" ]; then
  printf '  \033[2m↓ updating claudegochi…\033[0m\n'
  git -C "$DIR" pull --ff-only --quiet
else
  printf '  \033[2m↓ downloading claudegochi…\033[0m\n'
  git clone --depth 1 --quiet "$REPO" "$DIR"
fi

node "$DIR/bin/install.mjs" "$@"
