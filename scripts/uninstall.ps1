# claudegochi one-liner uninstall (Windows / PowerShell).
#   irm https://raw.githubusercontent.com/denipesto/claudegochi/main/uninstall.ps1 | iex
# Removes the status line from ~/.claude/settings.json (config is left untouched).

$ErrorActionPreference = 'Stop'
$dir = Join-Path $HOME '.claudegochi'

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "✗ 'node' not found in PATH." -ForegroundColor Red
  return
}
if (-not (Test-Path (Join-Path $dir 'bin/install.mjs'))) {
  Write-Host "claudegochi is not installed (~/.claudegochi missing)." -ForegroundColor DarkGray
  return
}

node (Join-Path $dir 'bin/install.mjs') --uninstall
