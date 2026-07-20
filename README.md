# AI Screen Sense

Provider-agnostic, real-time AI UX audit tool. BYOK (bring your own API key) —
users supply their own OpenAI / Anthropic / Gemini / OpenRouter key; the app
never bills usage, it only orchestrates calls against the user's own credentials.

## Phase 1 scope (this codebase)

- Monorepo: `apps/web` (React + Vite client), `apps/server` (Node + TS backend),
  `packages/shared` (Zod schemas + provider/persona types shared by both apps).
- Single provider adapter: **OpenRouter** (OpenAI-compatible API surface).
- Vision-only screen capture with client-side frame diffing.
- Two personas: **UX Generalist** and **Accessibility Auditor** (WCAG contrast
  ratio computed deterministically server-side, injected into the LLM prompt
  as ground truth rather than asked of the model).
- Text/transcript critique delivery over a WebSocket session. Voice (TTS/STT)
  is deferred to Phase 2.
- Local dev only: Postgres via `docker-compose`, secrets via `.env`.

Later phases (direct provider SDKs, Council mode, native realtime voice,
deterministic tap-target/spacing checkers, DOM-aware browser extension,
desktop app) are intentionally out of scope for this pass — see the project
plan for the full roadmap.

## Getting started

Requires Docker (running) and pnpm installed. Everything else is automatic:

```bash
pnpm setup
```

This one command creates `.env` with a fresh encryption secret (first run only,
never overwrites an existing `.env`), starts Postgres in Docker, waits for it to
be ready, installs dependencies, runs database migrations, and starts both dev
servers. It's safe to re-run any time — each step is idempotent. Ctrl+C stops
the dev servers; the Postgres container keeps running in the background for
next time (`docker compose down` if you want to stop it too).

The web client runs on http://localhost:5173, the server on http://localhost:8787.

The one manual step left: open the client's Settings screen, paste an
OpenRouter API key, and click "Test connection" before starting a session.
This can't be automated away — it's your own key (BYOK), not a shared one.
