@echo off
REM Use Windows trust store for TLS (required on this machine for registry.npmjs.org).
set "NODE_OPTIONS=--use-system-ca"
"C:\Program Files\nodejs\npm.cmd" %*
