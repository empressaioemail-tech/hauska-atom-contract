# Approve staged @hauska/atom-contract@1.3.0 (uses Windows Hello / browser auth, not TOTP app).
$ErrorActionPreference = "Stop"
$env:NODE_OPTIONS = "--use-system-ca"

$stageId = "9d74b4a9-db6a-4f87-82a7-81d70b5648d8"
$package = "@hauska/atom-contract"

Write-Host "Staged package waiting for approval:"
npm stage list $package
Write-Host ""
Write-Host "Opening browser auth - use your Windows PIN / passkey when prompted."
Write-Host ""

npm stage approve $stageId

Write-Host ""
Write-Host "Registry version:"
npm view $package version
