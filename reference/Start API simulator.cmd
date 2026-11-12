@echo off
setlocal
cd /d "%~dp0"
where node.exe >nul 2>nul || (echo Install Node.js 20 or later to start the simulator. & pause & exit /b 1)
powershell -NoProfile -Command "if (-not $env:ANTHROPIC_API_KEY) { $secret = Read-Host 'Anthropic API key (hidden)' -AsSecureString; $env:ANTHROPIC_API_KEY = [System.Net.NetworkCredential]::new('', $secret).Password }; node.exe ./serve.mjs --open; exit $LASTEXITCODE"
if errorlevel 1 pause
