# Approve staged @hauska/atom-contract@1.4.0 (step 2 of 2).
# Uses Windows Hello / browser auth - same path that published 1.3.0.
param(
  [Parameter(Mandatory = $true)]
  [string] $StageId
)

$ErrorActionPreference = "Stop"
$env:NODE_OPTIONS = "--use-system-ca"

Write-Host "Staged package waiting for approval:"
& "$PSScriptRoot\npm-hauska.ps1" stage list @hauska/atom-contract
Write-Host ""
Write-Host "Opening browser auth - use your Windows PIN / passkey when prompted."
Write-Host ""

& "$PSScriptRoot\npm-hauska.ps1" stage approve $StageId

Write-Host ""
Write-Host "Registry version:"
& "$PSScriptRoot\npm-hauska.ps1" view @hauska/atom-contract version
