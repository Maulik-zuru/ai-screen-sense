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

You need [Node.js](https://nodejs.org/) and [Docker Desktop](https://www.docker.com/products/docker-desktop/)
installed once. Everything else — starting Docker, the database, migrations,
and both dev servers — happens automatically.

**Windows:** double-click `setup.bat`.
**macOS:** double-click `setup.command` (right-click → Open the first time, since it's unsigned).
**Everyone else / prefer a terminal:**

```bash
pnpm setup
```

This one command starts Docker Desktop for you if it isn't already running
(and waits for it to finish starting up), creates `.env` with a fresh
encryption secret on first run only, starts Postgres in Docker, waits for it
to be ready, installs dependencies, runs database migrations, and starts both
dev servers. It's safe to run again any time — every step is idempotent, and
it will skip work that's already done. Closing the window (or Ctrl+C in a
terminal) stops the dev servers; the Postgres container keeps running in the
background so the next run is faster.

Once it says the app is running, open **http://localhost:5173** in your browser.

The one manual step left: open the Settings section on that page, paste an
OpenRouter API key, and click "Test connection" before starting a session.
This can't be automated away — it's your own key (BYOK), not a shared one.

If Docker isn't installed at all, the script tells you exactly where to
download it and stops there — install it once, then run `pnpm setup` (or
double-click the launcher) again.

If a previous setup attempt left behind a Postgres container with different
credentials (e.g. from an interrupted run), the script detects that specific
failure automatically, resets the local database container (safe — it's
disposable dev data for this project only), and retries once before giving up.
