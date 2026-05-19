# Use Windows trust store for TLS (required on this machine for registry.npmjs.org).
$env:NODE_OPTIONS = "--use-system-ca"
& "C:\Program Files\nodejs\npm.cmd" @args
exit $LASTEXITCODE
