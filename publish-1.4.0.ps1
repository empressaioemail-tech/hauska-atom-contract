# Publish @hauska/atom-contract@1.4.0 via npm staged publishing + Windows Hello.
#
# This account does NOT publish with granular tokens. 1.3.0 used the same path:
#   npm stage publish  ->  npm stage approve (browser + Windows PIN)
#
# Your ~/.npmrc has auth-type=web and an expired _authToken that breaks whoami.
# Step 1 clears the stale token so web auth can work again.
$ErrorActionPreference = "Stop"
$env:NODE_OPTIONS = "--use-system-ca"

$userNpmrc = Join-Path $env:USERPROFILE ".npmrc"
if (Test-Path $userNpmrc) {
  $lines = Get-Content $userNpmrc
  $filtered = $lines | Where-Object { $_ -notmatch '^//registry\.npmjs\.org/:_authToken=' }
  if ($filtered.Count -lt $lines.Count) {
    $backup = "$userNpmrc.bak-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $userNpmrc $backup
    $filtered | Set-Content $userNpmrc -Encoding ascii
    Write-Host "Backed up and removed expired _authToken from ~/.npmrc"
    Write-Host "Backup: $backup"
    Write-Host ""
  }
}

Write-Host "Step A: npm web login (browser). Sign in as hauska-sdk if prompted."
Write-Host ""
& "$PSScriptRoot\npm-hauska.ps1" login --auth-type=web --registry=https://registry.npmjs.org/
if ($LASTEXITCODE -ne 0) {
  throw "npm login failed - complete browser sign-in as hauska-sdk, then rerun this script."
}

Write-Host ""
Write-Host "Step B: stage @hauska/atom-contract@1.4.0 (runs tests + build via prepublishOnly) ..."
& "$PSScriptRoot\npm-hauska.ps1" stage publish
if ($LASTEXITCODE -ne 0) {
  throw "stage publish failed."
}

Write-Host ""
Write-Host "Staged packages:"
& "$PSScriptRoot\npm-hauska.ps1" stage list @hauska/atom-contract

Write-Host ""
Write-Host "Step C: approve with Windows PIN / passkey when the browser opens."
Write-Host "Copy the stage id from the list above, then run:"
Write-Host "  .\publish-approve-1.4.0.ps1 -StageId <stage-id>"
