# AI Screen Sense — Frontend Blueprint (Phase 1–2)

_Companion to [design-system.md](design-system.md). Version 1.1 · scope: what is built today (screen capture + frame diff, BYOK multi-provider, 8 personas, fast/quality modes, streaming critiques, browser TTS, and the public landing page)._

> **What this is:** the screen-by-screen build plan for the frontend — every view, every state, every flow, the component tree, and responsive behavior — drawn directly onto the real app surface. The design-system doc says *what things look like*; this says *what screens exist, how they behave, and how they're built*.
>
> **What this is NOT:** it does not invent Phase 3–4 surfaces (Council UI, session reports, saved history, onboarding tours). Those get their own plan when built. Everything here maps to code that exists in `apps/web/src`.
>
> **v1.1 change:** the app is no longer a single route. `react-router-dom` now splits it into `/` (the public marketing landing page — design-system.md §14) and `/app` (this blueprint's cockpit workspace, unchanged in behavior). The cockpit is implemented in Tailwind CSS v4 + Framer Motion per design-system.md §10; every component reference below (`<Rail>`, `<CritiqueCard>`, etc.) is now real code, not a plan.

---

## 0. The product in one screen

AI Screen Sense is a **single-view real-time workspace**, not a multi-page app. There is exactly one route. Everything happens inside one persistent shell:

- a **cockpit rail** (left) where you configure and drive a session,
- a **live transcript feed** (right/main) where AI critiques stream in as you share your screen,
- a **settings modal** (overlay) for BYOK provider keys.

The entire UX is the transition of this one screen through a **session lifecycle**. So this blueprint is organized as: the shell → each zone → the state machine that moves between them → components → responsive.

The mental model to hold: **the rail is an instrument panel; the feed is an oscilloscope.** You set dials on the left, you watch output on the right. This is why it reads as an engineering tool, not a chat app.

---

## 1. Screen & state inventory

There is one screen. Its *states* are the real inventory. Every state below is a distinct thing the user can see and must be designed:

| # | State | Trigger | What's on screen |
|---|---|---|---|
| **S0** | First run — no keys | No provider key configured | Rail controls disabled; feed shows onboarding empty-state pointing to Settings; Settings modal auto-openable |
| **S1** | Ready — idle | ≥1 key saved, not capturing | Rail fully enabled; Start CTA armed; feed shows "ready" empty-state |
| **S2** | Requesting capture | Start clicked; browser `getDisplayMedia` prompt open | Start button → loading; brief "waiting for you to pick a window" hint |
| **S3** | Live — capturing, no critiques yet | Stream granted, socket connecting/open, 0 critiques | Top-bar live pill active; rail metrics counting; feed shows "listening…" state |
| **S4** | Live — streaming critiques | Critiques arriving | Feed fills with critique cards newest-first; metrics update; voice speaks if enabled |
| **S5** | Live — idle screen (diff-skipped) | Screen static, frames sampled but not sent | Metrics show sampled ≫ sent; subtle "watching, screen unchanged" affordance |
| **S6** | Error — recoverable | WS error / provider failure / key invalid mid-session | Inline error banner in rail + error toast; session stays live; feed unaffected |
| **S7** | Error — capture ended | User stopped share, or track ended | Auto-stop; return to S1 with a "session ended" summary line |
| **S8** | Settings open | Gear clicked (any time) | Modal over dimmed shell; 4 provider key rows with save/test/status |

**Design rule:** every one of S0–S8 must be a deliberately designed state — no "it just shows nothing" gaps. The three empty-states (S0, S1, S3) are distinct and must *read* differently (see §5).

---

## 2. The shell

```
┌────────────────────────────────────────────────────────────────────────┐
│  ◇ AI Screen Sense          ● LIVE · 00:04:12 · a1b2c3        ⚙ Settings │  TOP BAR · 56px · border-b
├──────────────────────────┬─────────────────────────────────────────────┤
│                          │                                             │
│   RAIL · 320px           │   FEED · flex-1                             │
│   border-r · --surface   │   --canvas · dot-grid overlay              │
│   (the cockpit)          │   (the live output)                        │
│                          │                                             │
└──────────────────────────┴─────────────────────────────────────────────┘
                         full viewport height, no page scroll
```

- **Grid:** CSS grid, `grid-template-columns: 320px 1fr`, `height: 100dvh`, `overflow: hidden` on the shell. Only the rail and feed scroll internally.
- **Top bar** (56px, `border-b --border`, `--surface`):
  - **Left:** iris diamond mark + "AI Screen Sense" wordmark (20px/600/−0.02em).
  - **Center-right:** the **session status cluster** — a live pill (§ design-system 5.6) + a mono elapsed-time counter (`00:04:12`, tabular-nums) + mono session id. This whole cluster is *absent* in S0/S1, appears in S2+ .
  - **Right:** a ghost icon button `⚙ Settings` that opens the modal.
- **No secondary nav, no tabs, no sidebar icons.** One screen means the top bar stays almost empty — that emptiness is the premium signal.

---

## 3. The rail (cockpit) — zone-by-zone

The rail is a vertical stack of labeled groups, each separated by 16px, each introduced by a `// MONO EYEBROW`. Top-to-bottom priority = most-used-first.

```
┌──────────────────────────┐
│ // SESSION               │  ← group 1: what am I auditing?
│ ┌──────────────────────┐ │
│ │ Accessibility Auditor▾│ │    Persona picker (§3.1)
│ └──────────────────────┘ │
│ persona scope preview     │    2-line muted description of selected persona
│                          │
│ [ Fast  │  Quality ]     │    Mode segmented control (§3.2)
│ ◉ Speak critiques aloud  │    Voice toggle (§3.3)
│                          │
│ ┌──────────────────────┐ │  ← group 2: the one primary action
│ │    Start session     │ │    Primary CTA (S1) / Stop (S3+) (§3.4)
│ └──────────────────────┘ │
│                          │
│ // TELEMETRY             │  ← group 3: live proof it's working
│ ┌ FRAMES ┐┌ SENT ┐┌ ⌀ ┐  │    Metric chips (§3.5) — only meaningful S3+
│ │  142   ││  38  ││1.2s│  │
│ └────────┘└──────┘└────┘  │
│                          │
│ // PROVIDERS      3 / 4  │  ← group 4: BYOK status at a glance
│ ● OpenRouter        ok   │    Provider status list (§3.6)
│ ● OpenAI            ok   │
│ ● Gemini            ok   │
│ ○ Anthropic          —   │
│ ────────────────────────  │
│ Manage keys →            │    ghost link → opens Settings modal
└──────────────────────────┘
```

### 3.1 Persona picker
- Styled `<select>` (design-system §5.2), mono eyebrow `// SESSION` above.
- On selection, a **2-line muted scope preview** appears below (pulled from the persona's `scope[]` via `/api/personas`) — e.g. _"WCAG contrast · readable font sizes · visible a11y barriers."_ This teaches the user what each lens does without leaving the rail.
- 8 personas, neutral styling (no per-persona color, per design-system §1.5). A tiny neutral avatar-dot precedes each option label.
- **Disabled** in S3+ (can't change persona mid-session — it's tied to the socket's session); shows a muted lock hint on hover.

### 3.2 Mode segmented control
- Two segments: **Fast** / **Quality** (design-system §5.3). Sliding thumb, signature easing.
- A tiny `?`-affordance reveals a tooltip: _"Fast = cheaper model, ~1s. Quality = best model, higher spend on your key."_ — honest about *their* BYOK cost.
- **Disabled** in S3+ for the same reason as persona.

### 3.3 Voice toggle
- Toggle switch, `--accent` when on (design-system §7 mapping). Only rendered if `speech.supported`.
- Label "Speak critiques aloud"; sub-label in `--text-faint` mono when active: `BROWSER TTS`.
- Live-editable during a session (unlike persona/mode) — turning it off calls `speech.clear()`.

### 3.4 Primary action button
- **S1 (idle):** solid iris **"Start session"** — the single loudest element on screen. Disabled (opacity .5) until `hasKey && personaId`. Disabled-reason hint sits directly below: _"Add a provider key to begin"_ (S0) — the hint text is itself the fix instruction.
- **S2 (requesting):** button → inline spinner + "Waiting for window…", disabled.
- **S3+ (live):** becomes **"Stop session"** — outline/destructive-soft tier with a leading `--live` pulsing dot, so "live" and "how to stop" are the same control.

### 3.5 Telemetry metric chips
- Row of 3 chips: **FRAMES** (sampled), **SENT** (passed the diff), **⌀ LATENCY** (rolling avg of `rawProviderMeta.latencyMs`).
- Mono tabular numerals; they tick up live without layout jitter.
- **The SENT ≪ FRAMES gap is a feature, not a bug** — it visually proves the frame-diff is saving the user's API spend. Add a one-line caption on hover: _"104 static frames skipped — saving your API budget."_
- Greyed to `--text-faint` "—" in S1 (no session yet).

### 3.6 Provider status list
- One row per provider (OpenRouter, OpenAI, Anthropic, Gemini), each: status dot + mono name + mono status word.
- Dot states (design-system §1.5): configured=`--live` solid · unconfigured=hollow ring `--text-faint` · testing=`--warn` pulse · failed=`--crit`.
- Header shows a count: `// PROVIDERS   3 / 4`.
- **"Manage keys →"** ghost link at the bottom opens the Settings modal. The rail never contains the key *inputs* — only the *status* (design-system §6). This is the key architectural move that keeps the cockpit calm.

---

## 4. The feed (live output)

```
┌──────────────────────────────────────────────────────┐
│ // TRANSCRIPT              12 critiques   [ Auto-scroll ◉ ] │  sticky header
├──────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────┐  │
│  │ ● CRITICAL   Accessibility Auditor   92% ▓▓▓▓   │  │  newest at top
│  │ The primary CTA fails WCAG AA — 2.8:1…          │  │  (critique card,
│  │ ┌ css ─────────────────────────── Copy fix ┐   │  │   design-system §5.5)
│  │ │ color: #9CA3AF;  /* was — 2.8:1 */        │   │  │
│  │ │ color: #374151;  /* now — 8.9:1 ✓ */      │   │  │
│  │ └───────────────────────────────────────────┘   │  │
│  │ DETERMINISTIC · 14:32:07                         │  │
│  └────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────┐  │
│  │ ● WARNING   Mobile Critic   74% ▓▓▓░            │  │
│  │ Tap targets are 32×32px — below the 44px min.   │  │
│  │ COUNCIL · 2 models · 14:32:01                    │  │
│  └────────────────────────────────────────────────┘  │
│                        ⋮                              │
│                 ● listening…                          │  live tail indicator
└──────────────────────────────────────────────────────┘
```

- **Header (sticky):** mono `// TRANSCRIPT` + a live **critique count** + an **Auto-scroll toggle**. Auto-scroll on = feed pins to newest; turning it off (or scrolling up manually) lets the user read history while new cards still arrive above. A "↑ 3 new" pill appears when scrolled away from top.
- **Order:** newest-first (top). Each new critique animates in (fade + 6px slide, 220ms). `critical` cards get a one-shot `--crit` ring flash on entry.
- **The critique card** is the product's hero object — full anatomy in design-system §5.5. Key points restated: severity = dot + ink label + faint header wash (never a colored left-border); confidence = 4-seg meter; code-fix = syntax-tinted well with Copy; source tag distinguishes `deterministic` / `council` / `llm`.
- **Live tail:** while capturing, a small pulsing `● listening…` sits at the bottom (or top, below header) so the feed never looks "dead" between critiques — this is what sells S3/S5 as *live*.
- **Grouping (optional polish):** consecutive critiques within the same ~2s frame can be visually clustered under a faint mono timestamp divider, so a burst reads as one "moment" rather than scattered cards.

---

## 5. The three empty-states (they must differ)

A single generic "nothing here" would be the amateur tell. Each conveys a *different* situation:

| State | Icon | Title | Body | Action |
|---|---|---|---|---|
| **S0 — no keys** | key-line icon | "Add a provider key to begin" | "AI Screen Sense uses your own API key. OpenRouter alone runs everything." | Primary **"Open Settings"** (the one time the feed shows a CTA) |
| **S1 — ready** | play/monitor-line icon | "Ready when you are" | "Pick a persona and press Start to share a window and begin the live audit." | none (CTA lives in the rail) |
| **S3 — listening** | pulsing waveform/eye | "Watching your screen…" | "Critiques will appear here as issues are detected. Nothing yet — that's a good sign." | none |

All three: centered, `py-64`, calm line-icon in a `--surface-subtle` chip, slow 3s float (reduced-motion safe).

---

## 6. Settings modal (BYOK)

```
        ┌───────────────────────────────────────────┐
        │ // PROVIDER KEYS                        ✕  │
        │ Your keys are encrypted at rest and never  │
        │ sent back to the browser. BYOK — you're    │
        │ billed by the provider, never by us.       │
        │ ───────────────────────────────────────── │
        │ OpenRouter                          ● ok   │
        │ ┌─────────────────────────┐ [Save] [Test]  │
        │ │ sk-or-•••••••••••••••••• │               │
        │ └─────────────────────────┘                │
        │ Single key, every model. Recommended start.│
        │ ───────────────────────────────────────── │
        │ OpenAI                              ○  —    │
        │ ┌─────────────────────────┐ [Save] [Test]  │
        │ │ sk-••••••••••••••••••••• │               │
        │ └─────────────────────────┘                │
        │ ⋮  (Anthropic, Gemini same pattern)        │
        └───────────────────────────────────────────┘
                backdrop: rgba(0,0,0,.5) + blur(4px)
```

- **Overlay:** dimmed shell, panel `--surface`, `radius-xl`, `--shadow-modal`, scale 0.96→1 enter (design-system §4). Radix Dialog for focus-trap + Esc-close.
- **Per provider row:** name + status dot on the header line; masked mono input (show/hide ghost eye); **Save** (soft tier) + **Test** (outline tier); a one-line muted helper under each (OpenRouter's says "recommended start").
- **Field state machine:** `idle → saving → (saved ✓ toast) → testing → (ok ● / error inline)`. On save success the rail's provider list updates live. On test failure, inline `--crit-ink` message with the provider's actual error text.
- **Empty-config nudge:** if zero keys, a top banner: _"Configure at least one key to start a session."_
- Closing the modal returns focus to the gear button.

---

## 7. Session lifecycle — the state machine

This is the spine of the whole UX. Every transition below is a designed moment:

```
        ┌────────────────────────── open Settings (any state) ──────────────────────────┐
        ▼                                                                                 │
   [S0 no keys] ──save key──▶ [S1 ready] ──Start──▶ [S2 requesting] ──granted──▶ [S3 live/listening]
        ▲                        ▲   ▲                    │ cancelled                    │
        │                        │   │                    ▼                              │ critique arrives
        │                        │   └────────────────[S1 ready]                         ▼
        │                        │                                             [S4 streaming] ⇄ [S5 idle-screen]
        │                        │                                                        │
        │              Stop / track-ended                                                 │
        │                        └──────────────────[S7 ended]◀───────────────────────────┘
        │                                                │
        └───── delete all keys ──────────────────────────┘
                                       (S6 error overlays S3/S4/S5 without leaving live)
```

- **Start (S1→S2→S3):** `connect()` opens the WS, `start()` calls `getDisplayMedia`. If the user cancels the browser picker, fall back cleanly to S1 (no error state). First frame always sends (diff seeds on first frame).
- **Streaming (S3→S4):** first `critiques` message flips the empty-state to cards. Voice enqueues per design-system.
- **Idle screen (S4⇄S5):** when the shared screen is static, frames are sampled but diff-skipped; the SENT chip stops climbing while FRAMES keeps going. The live tail stays pulsing — the UI must not look frozen.
- **Error (S6):** WS `error` message or provider failure → error banner in rail + toast; **session stays live**. Distinguish *transient* (retryable, `--warn`) from *fatal* (session must end, `--crit`).
- **Stop / ended (→S7):** user clicks Stop, or the browser's own "Stop sharing" ends the track. Either way: close socket, stop capture, clear voice queue. Show a brief **session summary line** in the feed header — `Session ended · 12 critiques · 4:12` — then the feed's history remains readable until a new session starts.

---

## 8. Component tree (mapped to real files)

This is the tree as built, in `apps/web/src`:

```
main.tsx ................................. <BrowserRouter> — routes "/" → LandingPage, "/app" → App
App.tsx ................................. shell: state orchestration, lifecycle, layout composition
├─ <TopBar>                              components/layout/TopBar.tsx — wordmark · live pill + elapsed timer + session id · settings gear
├─ <Rail>                                components/rail/Rail.tsx — the cockpit column
│  ├─ <PersonaSelect>                    components/rail/PersonaSelect.tsx — <Select> + 2-line scope preview
│  ├─ <Segmented>                        components/ui/Segmented.tsx — Fast/Quality, Framer Motion sliding thumb
│  ├─ <Toggle>                           components/ui/Toggle.tsx — voice on/off
│  ├─ <Button>                           components/ui/Button.tsx — Start/Stop primary CTA
│  ├─ <MetricChip> ×2                    components/ui/MetricChip.tsx — FRAMES, SENT (no LATENCY chip — the Critique schema has no latency field to show)
│  └─ <ProviderStatusList>               components/rail/ProviderStatusList.tsx — reads fetchKeyStatus(); "Manage keys →" opens modal
├─ <TranscriptPanel>                     components/transcript/TranscriptPanel.tsx
│  ├─ header: "// TRANSCRIPT" + live critique count
│  ├─ <AnimatePresence><CritiqueCard></AnimatePresence>   newest-first list
│  │  └─ <CritiqueCard>                  components/critique/CritiqueCard.tsx — HERO component
│  │     ├─ <SeverityDot>                components/ui/SeverityDot.tsx
│  │     ├─ <ConfidenceMeter>            components/ui/ConfidenceMeter.tsx — 4-seg bar + %
│  │     └─ CodeFixBlock (inline)        lang badge + Copy + before/after, strikethrough "before"
│  ├─ <LiveTail>                         components/transcript/LiveTail.tsx — pulsing "listening…"
│  └─ <EmptyState variant=...>           components/transcript/EmptyState.tsx — "no-keys" | "ready" | "listening"
├─ <SettingsModal>                       components/settings/SettingsModal.tsx — Radix Dialog + Framer Motion
│  └─ <ProviderKeyRow> ×4                components/settings/ProviderKeyRow.tsx — masked input + Save + Test + status + helper
└─ hooks (unchanged logic, consumed by above)
   ├─ useScreenCapture   → isCapturing, framesSampled, framesSent, start, stop
   ├─ useSessionSocket   → connect, disconnect, sendFrame, critiques, error, sessionId
   └─ useSpeechPlayback  → supported, enabled, setEnabled, enqueue, clear

landing/LandingPage.tsx ................. the "/" route — see design-system.md §14 for section-by-section detail
├─ sections/Nav.tsx, Hero.tsx, PersonaTeam.tsx, CodeFixDemo.tsx,
│  HowItWorks.tsx, Pricing.tsx, ClosingCta.tsx, Footer.tsx
└─ reuses components/ui/{SeverityDot,ConfidenceMeter,LivePill}.tsx — shared with the cockpit, not duplicated
```

**Not built (deliberately deferred, not forgotten):** a `<Toast>`/`<ToastHost>` for key-saved/test-ok confirmations, an "Auto-scroll" toggle + "↑ N new" pill in the transcript header, and critique burst-grouping by timestamp (frontend-plan §12 item 2). None of these block the S0–S8 state machine; they're polish passes queued for a follow-up.

**Principle held:** the three hooks hold all the *logic and state*; the build was almost entirely *presentational* — App.tsx composes styled components around the exact same hook outputs the original unstyled version used. No hook signatures changed.

**Styling approach (as built):** Tailwind CSS v4 (`@theme` in `src/styles/theme.css`, `@tailwindcss/vite` plugin) — not "CSS Modules, framework optional" as originally planned. See design-system.md §10 for the full rationale and token-to-utility mapping.

---

## 9. Responsive behavior (as built)

Three tiers, implemented via Tailwind breakpoints (`lg:`/no-prefix) directly on `App.tsx`'s layout container and `Rail.tsx`.

| Breakpoint | Layout |
|---|---|
| **≥1024px (`lg`, desktop — primary)** | Full cockpit: `320px` rail + fluid feed, side by side (`flex-row`). |
| **<1024px (tablet + mobile)** | The shell switches to `flex-col`: the rail becomes a **full-width column stacked above** the transcript panel, capped at `max-h-[60vh]` with internal scroll so it can't push the feed off-screen. This is a simpler collapse than the original plan's "horizontal control strip with inline chips" — the rail's existing vertical layout (persona → mode → voice → CTA → telemetry → providers) is kept as-is and just reflows full-width, rather than being rebuilt as a second, tablet-specific horizontal layout. |
| **<640px (mobile)** | Same stacked layout as tablet; Segmented control, Select, and buttons are already full-width at all sizes so no extra mobile-specific rules were needed. Touch targets are ≥36px (button height) — not yet audited against the ≥44px target from design-system §8; flagged as a follow-up. |

- **Not yet implemented:** the top-bar session-status cluster does not yet collapse to dot+timer-only under 640px (the session id is hidden via `hidden sm:inline`, which triggers at 640px, matching the plan). The Settings modal does not yet become a full-height bottom sheet under 640px — it stays a centered dialog at all widths (still fully usable, just not the originally planned mobile treatment).
- **Not yet implemented:** the "screen sharing works best on desktop" mobile banner for `getDisplayMedia` reliability.
- Confidence meter does not yet drop below the persona line on narrow critique cards — it currently wraps via `flex-wrap` on the card header, which reads fine down to ~360px but hasn't been audited below that.

---

## 10. Motion & polish inventory

Every animation in the app, so nothing is ad-hoc (all use the signature easing, design-system §4):

| Moment | Motion |
|---|---|
| Critique enters feed | fade + 6px slide-up, 220ms |
| Critical critique enters | + one-shot `--crit` ring flash, 400ms |
| Live dot | pulsing halo loop, 1600ms |
| Live tail "listening…" | dot pulse + subtle 3-dot ellipsis cycle |
| Mode segmented switch | thumb slides, 150ms |
| Metric numbers tick | no animation on the digit (tabular-nums prevents jitter); optional 150ms color-flash on change |
| Settings modal | backdrop fade + panel scale 0.96→1, 300ms |
| Toast | slide-up-in from bottom-right, auto-dismiss 3s |
| Empty-state icon | slow 3s float |
| Button/row hover | border/bg color shift, 150ms (no lift) |

All gated behind `prefers-reduced-motion: reduce` → instant color/opacity only.

---

## 11. Build order (recommended)

1. **`theme.css`** — drop in the design-system token file; set Geist fonts + base body styles + dot-grid.
2. **Shell** — `<AppShell>` grid + `<TopBar>`; get the two-zone layout standing (static).
3. **Primitives** — Button tiers, styled Select, Segmented, Toggle, MetricChip, StatusDot, LivePill. Build these once; reuse everywhere.
4. **Rail** — `<SessionControls>` + `<SessionActionButton>` + `<TelemetryChips>` + `<ProviderStatusList>`, wired to existing hooks.
5. **Critique card** — the hero object + its sub-components; test with mock critiques.
6. **Feed** — `<TranscriptPanel>` header, auto-scroll, live tail, the 3 empty-states.
7. **Settings modal** — Radix Dialog refactor of Settings.tsx + toast host.
8. **States pass** — walk S0→S8 explicitly, design each transition; wire error banners.
9. **Responsive pass** — the three breakpoints.
10. **Motion + a11y pass** — animations, `aria-live`, focus rings, reduced-motion, 44px targets.

Nothing above changes backend contracts or the three hooks' interfaces — it's a presentational rebuild of `App.tsx`, `Settings.tsx`, and `TranscriptFeed.tsx` on top of the existing logic.

---

## 12. Open decisions (carry-over + new)

Inherited from design-system §12 (grid style, per-persona color, settings placement, confidence-meter style) — plus:

1. **Session history within a run** — after Stop (S7), keep the feed readable until next Start (recommended) vs. clear it. _(Recommend: keep + summary line.)_
2. **Critique burst grouping** — cluster same-frame critiques under a timestamp divider vs. flat list. _(Recommend: cluster — reads calmer.)_
3. **Idle-screen affordance (S5)** — explicit "screen unchanged" note vs. just letting the SENT chip plateau. _(Recommend: subtle, on hover only.)_
4. **Persona scope preview** — always visible vs. reveal-on-focus. _(Recommend: always visible 2-line — it's genuinely useful.)_
```
