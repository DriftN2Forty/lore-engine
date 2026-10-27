param([switch]$Production)
$ErrorActionPreference = 'Stop'
$next = Join-Path $PSScriptRoot 'node_modules\next\dist\bin\next'
if (-not (Test-Path -LiteralPath $next)) {
    throw 'Dependencies are missing. Run npm --prefix "<full path to testing>" ci from Windows PowerShell first.'
}
# Direct Node invocation avoids npm's cmd.exe script runner losing a WSL UNC cwd.
# Keeping Next on Windows also keeps the model endpoint on Windows loopback.
$mode = if ($Production) { 'start' } else { 'dev' }
& node $next $mode $PSScriptRoot --hostname 127.0.0.1 --port 3000
exit $LASTEXITCODE
