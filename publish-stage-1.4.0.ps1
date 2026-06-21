# Stage @hauska/atom-contract@1.4.0 for publish (step 1 of 2).
# This account uses Windows Hello / passkey 2FA (auth-type=web), not TOTP tokens.
# 1.3.0 published the same way - see publish-approve-1.4.0.ps1 for step 2.
$ErrorActionPreference = "Stop"
$env:NODE_OPTIONS = "--use-system-ca"

Write-Host "Running prepublishOnly checks via stage publish ..."
Write-Host ""

& "$PSScriptRoot\npm-hauska.ps1" stage publish

Write-Host ""
Write-Host "Staged packages for @hauska/atom-contract:"
& "$PSScriptRoot\npm-hauska.ps1" stage list @hauska/atom-contract

Write-Host ""
Write-Host "Next: copy the stage id from the list above, then run:"
Write-Host "  .\publish-approve-1.4.0.ps1 -StageId <stage-id>"
