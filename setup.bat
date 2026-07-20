@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Install it from https://nodejs.org/ then double-click this file again.
  pause
  exit /b 1
)

where pnpm >nul 2>nul
if errorlevel 1 (
  echo pnpm is not installed yet - installing it now...
  call npm install -g pnpm
)

node scripts\dev-up.mjs

echo.
echo The app has stopped. Press any key to close this window.
pause >nul
