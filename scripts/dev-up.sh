#!/usr/bin/env bash
# One-command local bootstrap: Docker Postgres -> migrations -> dev servers.
# Safe to re-run any time (idempotent). Run via `pnpm setup` from the repo root.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

log() { echo "==> $*"; }
die() {
  echo "ERROR: $*" >&2
  exit 1
}

log "Checking prerequisites..."
command -v docker >/dev/null 2>&1 || die "Docker is not installed or not on PATH. Install Docker first: https://docs.docker.com/get-docker/"
command -v pnpm >/dev/null 2>&1 || die "pnpm is not installed or not on PATH. Install it first: https://pnpm.io/installation"

if ! docker info >/dev/null 2>&1; then
  die "Docker is installed but the daemon isn't running. Start Docker Desktop (or the docker service) and re-run this script."
fi

if [ ! -f .env ]; then
  log "No .env found — creating one from .env.example with a fresh encryption secret..."
  cp .env.example .env

  if command -v openssl >/dev/null 2>&1; then
    SECRET="$(openssl rand -base64 32)"
  else
    SECRET="$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")"
  fi

  # Escape characters that would otherwise break the sed replacement.
  ESCAPED_SECRET=$(printf '%s' "$SECRET" | sed -e 's/[\/&]/\\&/g')
  sed -i.bak "s/^KEY_ENCRYPTION_SECRET=.*/KEY_ENCRYPTION_SECRET=${ESCAPED_SECRET}/" .env
  rm -f .env.bak
else
  log ".env already exists — leaving it untouched."
fi

log "Starting Postgres via docker compose..."
docker compose up -d postgres

log "Waiting for Postgres to accept connections..."
READY=false
for _ in $(seq 1 30); do
  if docker compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
    READY=true
    break
  fi
  sleep 1
done
[ "$READY" = true ] || die "Postgres did not become ready in time. Check 'docker compose logs postgres'."
log "Postgres is ready."

if [ ! -d node_modules ]; then
  log "Installing workspace dependencies (pnpm install)..."
  pnpm install
else
  log "Dependencies already installed — skipping pnpm install (delete node_modules to force a reinstall)."
fi

log "Running database migrations..."
pnpm --filter @ai-screen-sense/server db:migrate

log "Starting dev servers (web + server). Press Ctrl+C to stop — Postgres keeps running in the background."
exec pnpm dev
