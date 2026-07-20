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

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm --filter server db:migrate
pnpm dev
```

The web client runs on http://localhost:5173, the server on http://localhost:8787.

In the client's Settings screen, paste an OpenRouter API key and click
"Test connection" before starting a session.
