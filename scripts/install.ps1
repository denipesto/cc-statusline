# claudegochi one-liner bootstrap (Windows / PowerShell).
#   irm https://raw.githubusercontent.com/denipesto/claudegochi/main/install.ps1 | iex
# Clones (or updates) the repo into ~/.claudegochi and runs the installer.

$ErrorActionPreference = 'Stop'
$repo = 'https://github.com/denipesto/claudegochi.git'
$dir  = Join-Path $HOME '.claudegochi'

foreach ($cmd in 'git', 'node') {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
    Write-Host "✗ '$cmd' not found in PATH. Install it first." -ForegroundColor Red
    return
  }
}

if (Test-Path (Join-Path $dir '.git')) {
  Write-Host ("  " + [char]0x2193 + " updating claudegochi…") -ForegroundColor DarkGray
  git -C $dir pull --ff-only --quiet
} else {
  Write-Host ("  " + [char]0x2193 + " downloading claudegochi…") -ForegroundColor DarkGray
  git clone --depth 1 --quiet $repo $dir
}

node (Join-Path $dir 'bin/install.mjs') @args
