#!/bin/bash
# Double-click entry point for macOS. Opens in Terminal automatically.
cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. Install it from https://nodejs.org/ then double-click this file again."
  read -r -p "Press Enter to close..."
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is not installed yet - installing it now..."
  npm install -g pnpm
fi

node scripts/dev-up.mjs

echo ""
read -r -p "The app has stopped. Press Enter to close..."
