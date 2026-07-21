# Deep Implementation Plan — Multi-Provider AI UX Audit Tool

_(Crumble-style, provider-agnostic, more advanced than the original)_

_No billing/subscription logic in scope. Users bring their own API key (BYOK) for OpenAI, Anthropic (Claude), Google (Gemini), or OpenRouter. This document is the technical build plan only._

---

## 0. What "more advanced than Crumble" means here

Crumble is hard-locked to one vendor (Gemini 2.5 Flash) and one delivery mode (TTS bolted onto a vision loop). We will beat that on four axes:

1. **Provider-agnostic core** — any of the 4 key types works interchangeably, per-persona or per-task, not just one model for everything.
2. **Native realtime voice where available, pipeline fallback where not** — use OpenAI/Gemini native speech-to-speech when the user's key supports it, and a clean STT→LLM→TTS pipeline otherwise, instead of always doing text-critique-then-TTS.
3. **Deterministic + LLM hybrid analysis** — contrast ratios, tap-target sizes, and spacing grids are computed with real math (not "asked" of the model), and the LLM is used for judgment calls (copy tone, hierarchy, trust signals) where it's actually good. Crumble appears to be vision-only end-to-end.
4. **Multi-model cross-check mode** — an optional "Council" mode where 2+ providers independently review the same frame and only surfaced critiques that multiple models agree on are shown as "high confidence," reducing hallucinated issues.

---

## 1. High-Level Architecture

```
┌─────────────────────────────┐        ┌──────────────────────────────┐
│  Client (Web SPA / Desktop) │        │        Backend (API)          │
│                              │        │                                │
│  - getDisplayMedia capture  │  WS/   │  - Session orchestrator       │
│  - Frame sampler + diffing  │  HTTP  │  - Provider Router (abstraction)│
│  - Local BYOK key vault     │◄──────►│  - Persona/Prompt engine      │
│  - Audio playback (TTS)     │        │  - Deterministic analyzers    │
│  - Transcript/code UI       │        │    (contrast, tap-target,     │
│  - Mic input (optional)     │        │     spacing grid, DOM diff)   │
└─────────────────────────────┘        │  - Session store (Postgres)   │
                                        │  - Object store (frames/audio)│
                                        │  - Realtime gateway (WS)      │
                                        └──────────────┬─────────────────┘
                                                        │
                          ┌─────────────────────────────┼─────────────────────────────┐
                          ▼                             ▼                             ▼
                 ┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
                 │  OpenAI API     │          │  Anthropic API   │          │  Gemini API      │
                 │  (BYOK)         │          │  (BYOK)          │          │  (BYOK)          │
                 └─────────────────┘          └─────────────────┘          └─────────────────┘
                                    ▲
                                    │ OR route all of the above through:
                          ┌─────────────────┐
                          │  OpenRouter (BYOK)│  — single key, many models, fallback
                          └─────────────────┘
```

**Key architectural decision: BYOK, not managed inference.** The user supplies their own key(s) in Settings; the backend never bills usage — it just proxies/orchestrates calls using the user's own credentials. This removes all payment infrastructure from scope, and it also means **your** cost exposure is close to zero — the trade-off is you must build solid key management, per-provider rate-limit handling, and clear usage/cost visibility so the user understands what they're spending against their own provider account.

---

## 2. Provider Abstraction Layer (the core engineering problem)

This is the single most important subsystem. Everything else — personas, realtime voice, council mode — depends on getting this right.

### 2.1 Unified internal message schema

Define one internal request/response shape that every provider adapter must translate to/from. Loosely modeled on the OpenAI Chat Completions shape (since OpenRouter, and most tooling, already speaks that dialect), but provider-neutral in naming:

```ts
interface UxAnalysisRequest {
  personaId: string; // e.g. "accessibility-auditor"
  systemPrompt: string; // resolved persona prompt
  frame: {
    imageBase64: string;
    mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
    width: number;
    height: number;
  };
  domSnapshot?: DomSnapshot; // optional, see §5
  priorCritiques: CritiqueSummary[]; // for de-dup / context continuity
  responseSchema: JsonSchema; // structured output contract (see §3)
  modelPreference: ModelPreference; // which provider/model to use for this call
}

interface UxAnalysisResponse {
  critiques: Critique[];
  rawProviderMeta: {
    provider: string;
    model: string;
    latencyMs: number;
    tokensIn: number;
    tokensOut: number;
  };
}

interface Critique {
  id: string;
  personaId: string;
  severity: 'info' | 'warning' | 'critical';
  spokenText: string; // short, TTS-friendly
  transcriptText: string; // fuller written version
  codeFix?: { language: string; before?: string; after: string };
  region?: BoundingBox; // where on screen this applies (for on-screen highlight overlay)
  confidence: number; // 0–1, from the model or from Council consensus
  source: 'llm' | 'deterministic' | 'council';
}
```

### 2.2 Provider adapters

One adapter per provider, each implementing a common interface:

```ts
interface ProviderAdapter {
  id: 'openai' | 'anthropic' | 'gemini' | 'openrouter';
  supportsVision(): boolean;
  supportsNativeRealtimeAudio(): boolean;
  supportsStructuredOutput(): boolean;
  analyzeFrame(
    req: UxAnalysisRequest,
    credentials: ProviderCredentials,
  ): Promise<UxAnalysisResponse>;
  streamRealtime?(
    session: RealtimeSessionConfig,
    credentials: ProviderCredentials,
  ): RealtimeHandle;
}
```

**Per-provider specifics to implement:**

| Provider               | Vision input                                                                                                    | Structured output                                                                    | Native realtime voice                                                                                                                                                                     | Notes                                                                                                                                                                                                                           |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **OpenAI**             | Chat Completions / Responses API, image content parts                                                           | JSON mode / structured outputs with schema                                           | Yes — Realtime API (`gpt-realtime-2` family) now supports image content parts alongside audio in the same session, so vision + voice can run natively without a separate STT/TTS pipeline | Best choice for the "single native multimodal session" path when the user has an OpenAI key                                                                                                                                     |
| **Anthropic (Claude)** | Vision via Messages API (image blocks), strong at structured reasoning and tool use                             | Tool-use / forced-JSON via tool schema is the reliable path for structured critiques | No native speech-to-speech as of this writing — must pipeline (external STT/TTS around Claude)                                                                                            | Use Claude where careful, nuanced judgment matters (e.g. "Founder's Eye," conversion copy critique, Council arbitration)                                                                                                        |
| **Gemini**             | Native multimodal, image input, this is what original Crumble uses                                              | Native JSON schema constraint                                                        | Yes — Gemini **Live API** supports native audio in/out                                                                                                                                    | Good default for cost/latency-sensitive high-frequency frame sampling                                                                                                                                                           |
| **OpenRouter**         | Proxies whichever underlying model's vision capability (routes to OpenAI/Gemini/Anthropic/others under one key) | Inherits underlying model's structured-output support                                | Inherits from underlying model — no realtime voice pass-through as of now, treat as vision/text only                                                                                      | Use as the **default fallback + model-comparison layer**: single key, hundreds of models, automatic provider-level failover on rate-limit/outage, and cost-based routing suffixes (`:floor` for cheapest, `:nitro` for fastest) |

### 2.3 Model Router / selection logic

For every analysis call, the router decides _which_ provider+model to actually hit, based on:

1. **Explicit user setting** (user pins "Accessibility Auditor → Claude Sonnet" in settings) — highest priority
2. **Persona default mapping** (see §4 — sensible defaults per persona)
3. **Key availability** — skip providers the user hasn't configured a key for
4. **Fallback chain** — if the primary call fails (rate limit, timeout, moderation block), fall back to the next configured provider automatically; if the user only configured OpenRouter, use its built-in `models: [...]` priority-array fallback instead of building your own retry logic from scratch
5. **Cost/latency mode toggle** — a user-facing "Fast & cheap" vs "Best quality" vs "Council (multi-model)" setting that changes which models are eligible

### 2.4 Credential management

- Per-provider API key stored **encrypted at rest** (e.g., libsodium/KMS-wrapped), never logged, never sent to the frontend after initial entry (write-once, mask on read)
- Settings UI: one field per provider (OpenAI key, Anthropic key, Gemini key, OpenRouter key) + a "Test connection" button per key that does a trivial, cheap call to validate it
- Support **partial configuration** — a user might only have a Gemini key and an OpenRouter key; the router must degrade gracefully and clearly show which personas/features are available given the configured keys
- No key is ever required to be "the one" — OpenRouter alone is sufficient to run the whole product, direct provider keys are optional power-user/cost-optimization paths

---

## 3. Structured Output Contract

Every provider must be coerced into the same `Critique[]` JSON shape (§2.1). Implementation per provider:

- **OpenAI**: use `response_format: { type: "json_schema", json_schema: {...}, strict: true }` on Chat Completions/Responses API.
- **Anthropic**: define a single forced tool (`emit_critiques`) with an input schema matching `Critique[]`, and force `tool_choice: {type: "tool", name: "emit_critiques"}`.
- **Gemini**: use `responseSchema` + `responseMimeType: "application/json"` in generation config.
- **OpenRouter**: pass through whichever of the above the underlying routed model supports; if the selected model has no native structured-output mode, fall back to a strict "return ONLY valid JSON matching this schema, no prose" system-prompt instruction plus a server-side JSON-repair/validate step (e.g., a schema validator that retries once on failure before surfacing an error).

**Validation layer:** every response passes through a shared Zod/JSON-Schema validator before it reaches the client. Malformed responses trigger one automatic retry (possibly against a different model in the fallback chain) before being logged as a failed analysis frame — never surface broken JSON or partial output to the user.

---

## 4. Persona System (prompt engineering layer)

Each persona = a stored, versioned system prompt + a default model preference + a response schema variant. Recommend at least the original six, plus 2 new ones to exceed parity:

| Persona                            | Default model (quality mode)                                 | Default model (fast/cheap mode) | Why this default                                                                                                                         |
| ---------------------------------- | ------------------------------------------------------------ | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| UX Generalist                      | GPT (via OpenAI or OpenRouter)                               | Gemini Flash                    | Balanced, broad judgment                                                                                                                 |
| Design Purist                      | Claude                                                       | Gemini Flash                    | Claude tends to be meticulous on precise numeric consistency reasoning                                                                   |
| Conversion Optimiser               | Claude                                                       | GPT-mini via OpenRouter         | Nuanced persuasion/copy judgment                                                                                                         |
| Accessibility Auditor              | **Deterministic engine primary**, LLM secondary (see §5)     | same                            | Contrast/tap-target math should never be "vibes"                                                                                         |
| Mobile Critic                      | Deterministic (tap-target math) + Gemini for layout judgment | same                            | Hybrid                                                                                                                                   |
| Founder's Eye                      | Claude or GPT (whichever the user prefers for "taste")       | Gemini Flash                    | Subjective clarity/positioning judgment                                                                                                  |
| **NEW: Code Quality Reviewer**     | Claude (strong at code)                                      | GPT-mini                        | Reviews any visible source/dev-tools panel for anti-patterns, not just visual UI — a genuine differentiator vs. Crumble                  |
| **NEW: Localization/i18n Auditor** | GPT or Gemini                                                | Gemini Flash                    | Flags hardcoded strings, text overflow risk in longer languages, RTL layout issues — visible in screen share, not something Crumble does |

**Prompt structure per persona (template):**

```
[ROLE] You are the {persona_name}, one lens of a multi-expert real-time UX audit team.
[SCOPE] You ONLY comment on: {persona_scope_bullets}
[STYLE] Spoken critique: max 20 words, direct, no fluff, one issue at a time.
        Transcript: 1–3 sentences, cite the specific rule/standard.
        Code fix: only include if you are certain of the exact before/after value.
[ANTI-REPEAT] Do not repeat any issue already listed in priorCritiques.
[OUTPUT] Respond ONLY via the emit_critiques function/schema. No prose outside it.
[CONTEXT] {optional: brand guideline text, if Enterprise persona-builder is used}
```

**Persona Builder (Enterprise-equivalent, but no billing tier — just a feature flag):** a UI for building custom personas by combining scope bullets + an optional uploaded style guide / design-token file that gets injected into `[CONTEXT]`.

---

## 5. Deterministic Analysis Layer (the "more advanced" differentiator)

Don't trust the vision model alone for anything that has a real formula. Build a small, fast, non-LLM analysis module that runs **before** the LLM call and feeds its findings into the prompt as ground truth, so the LLM narrates rather than invents:

1. **Contrast ratio checker** — sample dominant foreground/background colors from a screen region (via canvas pixel sampling or, if the optional browser extension/DOM-access mode is enabled, real computed CSS `color`/`background-color`) → compute WCAG relative luminance + contrast ratio formula directly → pass exact numbers into the prompt.
2. **Tap-target size checker** — if DOM access is available (extension mode), read actual element bounding boxes; if vision-only, use edge-detection heuristics on the frame to estimate clickable-element sizes; flag anything under 44×44 (iOS HIG) / 48×48 (Material) directly.
3. **Spacing/grid consistency checker** — cluster measured gaps between elements (DOM mode: real `getBoundingClientRect()` diffs; vision-only mode: edge/whitespace detection) and flag deviations from the dominant grid unit (e.g., 8px).
4. **Text overflow / truncation detector** — useful for the new Localization persona.

**Two operating modes:**

- **Vision-only mode** (default, zero install): works against any shared screen/window, including non-web apps. Lower precision on the above checks, must lean more on LLM estimation.
- **DOM-aware mode** (optional companion browser extension, for auditing your own web app): injects a content script that reads real computed styles and posts them alongside the frame, making the deterministic checks exact rather than estimated. This is a genuine step up from Crumble, which is described as vision-only.

---

## 6. Screen Capture & Frame Pipeline (client)

1. `navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 5 }, audio: false })` on user-initiated click (transient activation required by spec).
2. Attach stream to a hidden `<video>`; on a `setInterval` (not `requestAnimationFrame`, since rAF throttles in background tabs), draw the current frame to an offscreen `<canvas>` and extract via `canvas.toDataURL('image/jpeg', 0.7)` or `OffscreenCanvas` + `convertToBlob` for lower main-thread cost.
3. **Frame diffing before sending anywhere:** downscale to a small thumbnail (e.g. 64×64), compute a perceptual hash or simple pixel-diff against the previous sent frame; only forward to the backend if the diff exceeds a threshold. This is the single biggest lever for controlling both latency and the user's own API spend, since BYOK means _they_ pay per call.
4. Configurable sample interval: default 1–2s (matches Crumble's stated cadence), adjustable in settings, with a hard minimum floor to avoid rate-limit storms on the user's own key.
5. Optional companion **browser extension** for DOM-aware mode (see §5), communicating via `postMessage`/content-script bridge into the same session.
6. **Desktop app (Electron/Tauri)** as a later phase: needed for true always-on background capture, since browser tabs can't reliably capture when unfocused — this is the same technical reason Crumble's own roadmap lists a desktop app as "coming soon."

---

## 7. Realtime Voice Delivery

Two paths, chosen automatically based on configured keys and the "quality vs speed" setting:

**Path A — Native speech-to-speech (preferred when available):**

- OpenAI: open a Realtime API session (WebSocket/WebRTC) and pass image content parts alongside the running audio conversation, so the same model reasons over both modalities in one pass — lower latency, no separate TTS step.
- Gemini: equivalent via the Gemini Live API's native audio support.
- Only usable when the user has configured that specific provider's key, and only for personas whose default model matches; not available through OpenRouter or Anthropic today.

**Path B — Pipeline fallback (always available):**

1. LLM (any provider) returns `spokenText` in the structured critique.
2. Send `spokenText` to a TTS step — start with the **browser-native `SpeechSynthesis` API** (zero cost, zero extra key, decent quality) as the default, and offer a pluggable "premium voice" slot for a neural TTS provider if/when the user wants to configure one (kept optional so it doesn't reintroduce a hidden billing dependency).
3. Stream/queue playback in the client; a simple interruption policy: if a new critique arrives while one is still speaking, queue it (don't cut off mid-sentence) unless marked `severity: "critical"`, in which case interrupt.

---

## 8. Council Mode (new — cross-provider verification)

A distinguishing feature vs. Crumble: run the _same frame_ through 2+ configured providers in parallel for a given persona, then reconcile:

- If two+ models flag the **same issue** (matched by rough semantic similarity / same region+category), mark it `confidence: high`, `source: "council"`, and only speak/show the union'd, best-worded version once.
- If models disagree, either suppress the low-confidence one or show it as `info` severity with a "unconfirmed" badge.
- User-facing toggle: Off (single model, fastest/cheapest) / On (2 models) / Strict (all configured providers must agree).
- This directly costs more API calls (on the user's own key), so make the tradeoff explicit in the UI rather than hidden.

---

## 9. Session, Data & Storage Model

Entities (Postgres, no billing tables):

- `User` (auth identity, settings, encrypted provider keys, default persona/model prefs)
- `Session` (start/end, capture mode [vision-only/DOM-aware], persona(s) active, council mode flag)
- `Frame` (session_id, timestamp, storage ref — only retained if user opts into history; otherwise processed transient and discarded)
- `Critique` (session_id, frame_id, persona_id, severity, spokenText, transcriptText, codeFix, region, confidence, source, providerMeta)
- `CustomPersona` (user-defined scope/prompt/context, for the Persona Builder)
- `Report` (exported summary of a session — markdown/PDF, generated on demand, not tied to any paid tier)

**Data retention policy (define explicitly, since screen contents are sensitive):**

- Default: frames processed in-memory/transiently, never persisted; only the resulting `Critique` text + optional low-res thumbnail is stored for history.
- Opt-in "Save full frames" toggle for users who want a visual audit trail, clearly flagged as increasing storage of potentially sensitive screen content.
- Provide a one-click "delete all my session data" action.

---

## 10. API Surface (illustrative)

```
POST   /api/keys/:provider              — save/update a BYOK credential
POST   /api/keys/:provider/test         — validate a key with a trivial call
GET    /api/keys                        — list configured providers (masked)

POST   /api/sessions                    — start a session (mode, persona list, council flag)
WS     /api/sessions/:id/stream         — bi-directional: client sends frames/audio,
                                           server streams back critiques + audio
POST   /api/sessions/:id/end            — close out a session
GET    /api/sessions/:id/report         — generate/download a session report

GET    /api/personas                    — list built-in + custom personas
POST   /api/personas                    — create a custom persona (Persona Builder)
PUT    /api/personas/:id                — edit
DELETE /api/personas/:id

GET    /api/analytics/team              — aggregate issue trends (if team feature is in scope)
```

Prefer a **single WebSocket per session** carrying both frame-analysis requests and streamed critique/audio responses, rather than one HTTP call per frame — this matches the "real-time" experience and lets you multiplex Council mode's parallel provider calls behind one client connection.

---

## 11. Tech Stack Recommendation

| Layer                              | Choice                                                                                                                                                | Why                                                                                                                                 |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Frontend                           | React + TypeScript (Vite or Next.js)                                                                                                                  | Matches your existing CCT stack experience                                                                                          |
| Realtime transport                 | WebSocket (native or via a small library like `ws`/Socket.IO)                                                                                         | Simplicity over gRPC for this scope                                                                                                 |
| Backend                            | Node.js + TypeScript (or keep it aligned with your existing stack)                                                                                    | One language across client/server; easiest to share the `Critique`/schema types                                                     |
| Provider SDKs                      | Official OpenAI SDK, official Anthropic SDK, official Google GenAI SDK, OpenRouter via OpenAI-compatible client (just swap `baseURL`)                 | OpenRouter's OpenAI-compatible shape means the OpenAI SDK can often be reused directly against it                                   |
| Validation                         | Zod (schema definitions double as both TS types and runtime validators for the structured-output contract)                                            | Single source of truth for `Critique` shape                                                                                         |
| DB                                 | PostgreSQL                                                                                                                                            | Relational session/critique data fits well; add `pgvector` later if you want semantic de-dup of repeated critiques across a session |
| Object storage                     | S3-compatible bucket (only used if "save full frames" opt-in is on)                                                                                   | Cheap, standard                                                                                                                     |
| Desktop app (later phase)          | Tauri (smaller footprint) or Electron (broader ecosystem/native module support)                                                                       | Needed for true background capture                                                                                                  |
| Browser extension (DOM-aware mode) | Manifest V3, `chrome.scripting.executeScript` to bridge into the page — directly reusable know-how from your existing Markdown Checker extension work | You've already solved CORS/timing issues here before                                                                                |

---

## 12. Security & Privacy (no billing, but this still matters a lot)

- Encrypt provider API keys at rest (KMS or libsodium sealed boxes); never expose them to the client after write; never log them.
- TLS everywhere; WebSocket over WSS only.
- Rate-limit _your own backend_ endpoints per user regardless of BYOK, to prevent one compromised account from hammering another user's stored key indirectly (defense in depth).
- Screen-share data: transient-by-default processing, explicit opt-in for persistence, one-click full deletion.
- If DOM-aware browser-extension mode is built, scope its permissions tightly (active-tab only, not all-sites) and document exactly what it reads.

---

## 13. Phased Build Plan

**Phase 1 — Core loop, single provider path, vision-only**

- Screen capture + frame diffing client
- Provider abstraction layer with **one** adapter working end-to-end (recommend starting with OpenRouter, since it gives you multi-model access immediately without juggling 3 separate SDKs on day one)
- 2 personas (UX Generalist, Accessibility Auditor incl. deterministic contrast checker)
- Text-only critique + transcript UI (defer TTS)
- BYOK settings screen for OpenRouter key only

**Phase 2 — Full provider matrix + voice**

- Add OpenAI, Anthropic, Gemini adapters directly (not just via OpenRouter)
- Model router with fallback chains and quality/speed/council modes
- Browser-native TTS playback
- Remaining original personas + the 2 new differentiator personas

**Phase 3 — Advanced differentiators**

- Council mode (multi-provider consensus)
- Native realtime speech-to-speech path for OpenAI/Gemini keys
- Deterministic tap-target/spacing checkers
- Persona Builder (custom personas + brand-guideline context injection)

**Phase 4 — DOM-aware mode + desktop**

- Browser extension for real computed-style analysis
- Electron/Tauri desktop app for always-on background watching
- Session reports (markdown/PDF export)
- Team-style shared session library (if multi-user use case is needed — no seats/billing, just shared org access)

---

## 14. Open Technical Decisions to Nail Down Early

1. **Default sample rate vs. diff threshold** — tune this first; it drives both perceived responsiveness and the user's own API cost, and is the main lever you control.
2. **JSON-repair strategy** for models/providers without native structured output (important for the OpenRouter long-tail of models).
3. **Council mode's semantic-match algorithm** for deciding two critiques are "the same issue" (start simple: same persona + overlapping region + keyword overlap; upgrade to embedding similarity later if needed).
4. **DOM-aware extension scope** — how much of your existing Markdown Checker extension architecture (CORS bypass via `chrome.scripting.executeScript`, polling-based render timing for SPAs) can be reused directly here, since the target problem (reading live-rendered DOM state) is structurally similar.
5. **Desktop app framework choice** (Electron vs Tauri) — worth a short spike given it affects background-capture reliability.

---

_This plan intentionally excludes payment/subscription infrastructure per your instruction — the BYOK model removes the need for tiering logic entirely; all "tiers" from the original become feature flags/settings rather than paid gates._
