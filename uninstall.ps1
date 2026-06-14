# cc-statusline one-liner uninstall (Windows / PowerShell).
#   irm https://raw.githubusercontent.com/denipesto/cc-statusline/main/uninstall.ps1 | iex
# Removes the status line from ~/.claude/settings.json (config is left untouched).

$ErrorActionPreference = 'Stop'
$dir = Join-Path $HOME '.cc-statusline'

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "✗ 'node' not found in PATH." -ForegroundColor Red
  return
}
if (-not (Test-Path (Join-Path $dir 'bin/install.mjs'))) {
  Write-Host "cc-statusline is not installed (~/.cc-statusline missing)." -ForegroundColor DarkGray
  return
}

node (Join-Path $dir 'bin/install.mjs') --uninstall
