# AI Screen Sense — Design System & Theme Plan

_Light-mode-only. Standalone design language. Version 1.1._

> **What this is:** the complete, implementation-ready theme for AI Screen Sense — both the real-time AI UX-audit workspace (screen-share → streamed critiques + voice, at `/app`) and the public marketing landing page (at `/`, see §14). The workspace remains an instrument-panel design system for a live tool; the landing page reuses the same token system and component language (severity dots, critique cards, mono chrome) so the two surfaces read as one product, not a marketing skin bolted onto a different app.
>
> **Aesthetic in one line:** _Vercel/Linear engineering-grade restraint — pure-white canvas, obsidian text, 1px hairline structure — warmed by a calibrated **pastel** semantic layer that keeps a live, data-dense tool feeling human instead of clinical._
>
> **Sourced from** deep research on Vercel Geist, Linear, Raycast, Resend, Radix Colors, and the direct competitor Crumble AI (see §13). Every value below is chosen deliberately; nothing is placed at random.
>
> **v1.1 change:** implemented in Tailwind CSS v4 + Framer Motion (see §10), and extended with a marketing landing page (§14). All v1.0 tokens are unchanged; nothing here is a redesign, only an implementation and a new surface.

---

## 0. Design philosophy — the five commitments

1. **Structure from borders, not shadows.** Depth is a ladder of surface tints + 1px hairlines at ~8% black. Inline cards never carry drop shadows; shadows are reserved for genuinely floating layers (popovers, modals). _(This is the single biggest "premium vs. slop" lever the research identified.)_
2. **Obsidian + hairlines do 90% of the work; pastel does the last 10%.** Neutrals carry all hierarchy. Color appears only where it means something: severity, live state, active control, focus, source attribution. No decorative color, ever.
3. **Pastel, but accessible.** Every semantic hue ships in two tiers — a low-contrast **pastel surface/signal** tier (calm fills, dots, borders) and a **deepened ink** tier that passes WCAG AA on white for any text or number. Meaning is never carried by a pastel alone — always pastel-fill **plus** an ink-tier label.
4. **Data-dense, instrument-grade.** This is a cockpit. Mono tabular numerals, tight metric chips, pulsing live dots, uppercase mono micro-labels used _sparingly as data chrome_. Maximize legible density; minimize chrome.
5. **Fast, tight, honest motion.** 150ms state changes on one signature easing curve. Border-color shifts on hover, not big lifts. Nothing cinematic. The UI must feel instantaneous because the product is real-time.

### The anti-slop contract (things this system will never do)

- ❌ Purple/lavender gradients, gradients on UI chrome, colored glow box-shadows.
- ❌ Colored **left-border** cards (the tell-tale AI-generated pattern).
- ❌ Identical icon-on-top feature cards, naive 01/02/03 numbered steps, emoji nav.
- ❌ Untuned default Inter everywhere; font-weight 700 "loud bold".
- ❌ Glassmorphism/frosted cards as a default surface.
- ❌ Uppercase labels everywhere in medium gray (slop) — only small, spaced, mono, as status/data (premium).
- ❌ Pure `#000` / pure `#FFF` as the _canvas_ (near-white `#FAFAFA` canvas is the premium tell).

---

## 1. Color tokens

### 1.1 Neutral spine (Geist-seeded)

The neutral ramp encodes **intent, not just lightness** — each step has a job.

| Token | Hex | Role |
|---|---|---|
| `--canvas` | `#FAFAFA` | Page background — near-white, **never** pure white (the premium tell) |
| `--surface` | `#FFFFFF` | Card / panel / raised surface |
| `--surface-subtle` | `#F4F4F5` | Recessed surface (input wells, code blocks, inset areas) |
| `--bg-hover` | `#F1F1F3` | Hover background for interactive rows/controls |
| `--bg-active` | `#E9E9EC` | Pressed / selected background |
| `--border` | `#EAEAEA` | Default 1px hairline (solid) |
| `--border-strong` | `#E4E4E7` | Emphasis divider / card ring |
| `--border-hover` | `#C9C9C9` | Border on hover (the primary hover tell) |
| `--border-active` | `#A8A8A8` | Border on press |
| `--text` | `#171717` | Primary text & icons (obsidian, 17.9:1 on white) |
| `--text-secondary` | `#4D4D4D` | Secondary text (8.4:1) |
| `--text-muted` | `#71717A` | Captions, meta, timestamps (~4.6:1 — AA) |
| `--text-faint` | `#8F8F8F` | Disabled / placeholder (3.2:1 — decorative only) |

**Alpha hairlines** (for borders over colored/pastel surfaces — use these so a hairline works on _any_ background):
`--border-a1: rgba(0,0,0,0.05)` · `--border-a2: rgba(0,0,0,0.08)` · `--border-a3: rgba(0,0,0,0.10)`.

> **Card ring technique:** prefer `box-shadow: 0 0 0 1px rgba(0,0,0,0.08)` over a `border` property for cards — it keeps layout math crisp and never shifts content by 1px.

### 1.2 Accent — pastel iris (the single brand hue)

One hue flows through every interactive moment: focus ring, active control, primary CTA, links, selected states. Chosen as a **pastel periwinkle/iris** — soft enough to read premium-calm, saturated enough at the ink tier to carry meaning. This is deliberately _not_ Vercel's hard blue and _not_ AI-slop violet — it's a warmer, softer indigo.

| Tier | Token | Hex | Contrast on white | Use |
|---|---|---|---|---|
| Surface | `--accent-surface` | `#EEEEFB` | — | Tint fills, selected-row bg, CTA soft variant |
| Signal | `--accent` | `#8B8CF0` | 2.95:1 | Dots, active underline, chip border, focus-ring color |
| Ink | `--accent-ink` | `#5B5BD6` | 5.37:1 ✓ AA | Link text, active label, CTA solid bg, any accent text |
| Ink-hover | `--accent-ink-hover` | `#4B4BC4` | — | Hover state of solid accent |

**Focus ring (the premium double-ring):** `box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 4px #8B8CF0;` — a 2px white gap then a 2px accent ring. Never a flat browser outline.

### 1.3 Severity — the pastel semantic trio

Critiques carry `severity: info | warning | critical`. Each maps to a pastel with the two-tier treatment. **Rule: severity is shown as a pastel fill + an ink-tier label/dot together — never color alone** (colorblind-safe).

| Severity | Surface (fill) | Signal (dot/border) | Ink (label/number) | Ink contrast |
|---|---|---|---|---|
| `info` | `--info-surface #E8F6FC` | `--info #38BDF8` | `--info-ink #0E7490` | 5.36:1 ✓ |
| `warning` | `--warn-surface #FEF4E2` | `--warn #FBBF24` | `--warn-ink #B45309` | 5.02:1 ✓ |
| `critical` | `--crit-surface #FDECEF` | `--crit #FB7185` | `--crit-ink #BE123C` | 6.29:1 ✓ |

### 1.4 Live / connection — pastel mint

The "this is live" system state (recording, connected, streaming).

| Token | Hex | Contrast | Use |
|---|---|---|---|
| `--live-surface` | `#E6F7F0` | — | Live-status chip background |
| `--live` | `#34D399` | 1.9:1 | The pulsing live dot |
| `--live-ink` | `#047857` | 5.48:1 ✓ | "LIVE" label, connected text |

Connection state colors: **idle** → `--text-muted` + gray dot · **connecting** → `--warn` pulsing dot · **live** → `--live` pulsing dot · **error** → `--crit` solid dot.

### 1.5 Provider & source identity (subtle, mono-labeled)

The four BYOK providers and three critique sources get **identity by mono label + a tiny signal dot**, not by loud color — keeps the settings panel calm.

- **Providers** (OpenRouter, OpenAI, Anthropic, Gemini): neutral chip + status dot (configured = `--live` solid, unconfigured = `--text-faint` hollow, testing = `--warn` pulse, failed = `--crit`). Provider _name_ in Geist Mono, `--text-secondary`.
- **Sources** (`llm` / `deterministic` / `council`): tiny uppercase mono tag. `deterministic` gets the `--accent-ink` tint (it's the "real math" differentiator worth signaling); `council` gets `--live-ink` (high-confidence consensus); `llm` stays neutral `--text-muted`.

> **Personas (all 8):** intentionally **neutral** — persona attribution is a mono label + neutral avatar-dot, not 8 competing colors. Color budget is spent on severity/live, not persona. (Avoids the rainbow-slop trap.)

---

## 2. Typography

**Fonts:** **Geist Sans** (UI, prose, headings) + **Geist Mono** (numbers, code, micro-labels, status/data chrome). Two fonts, no exceptions. `npm i geist`. Mono fallback `ui-monospace, "SF Mono", Menlo`.

**Weight discipline — cap at 400 / 500 / 600. No 700.** Heavy bold reads generic; the restraint is the premium signal.

### 2.1 Type scale (extreme contrast, negative tracking on display)

| Role | Size / LH | Weight | Tracking | Font |
|---|---|---|---|---|
| Display (rare — empty-state hero) | 48px / 52px | 600 | −0.03em | Sans |
| App title (wordmark region) | 20px / 28px | 600 | −0.02em | Sans |
| Section heading (H2) | 16px / 24px | 600 | −0.01em | Sans |
| Card / panel title (H3) | 14px / 20px | 600 | −0.01em | Sans |
| Body | 14px / 20px | 400 | 0 | Sans |
| Body-small / meta | 13px / 18px | 400 | 0 | Sans |
| **Micro-label (signature)** | 11px / 16px | 500 | **+0.06em**, UPPERCASE | **Mono** |
| Metric / tabular number | 13px / 18px | 500 | 0 (tabular-nums) | **Mono** |
| Code (fix blocks) | 12.5px / 20px | 400/500 | 0 | **Mono** |

**The contrast to internalize:** the biggest type on screen (~48px, only on empty states) against 11px mono labels — a ~4× jump — but in this data-dense tool the _working_ range is tight (14px body, 11–13px labels/numbers). Display sizes appear only in empty/onboarding states.

### 2.2 The mono micro-label (used _sparingly_)

The AI-native tell — but slop when overused. Rules for where it's allowed:
- ✅ Section eyebrows (`// SESSION`, `// PROVIDERS`, `// TRANSCRIPT`).
- ✅ Metric chip labels (`FRAMES SENT`, `LATENCY`, `CONTRAST`).
- ✅ Status/source tags (`LIVE`, `DETERMINISTIC`, `CRITICAL`).
- ❌ Never on body text, critique prose, or button labels.

Color: `--text-muted` by default; `--accent-ink` when it's an active/live eyebrow.

---

## 3. Spacing & radius

### 3.1 Spacing — the three-step rhythm

4px base. **8px inside a group · 16px between groups · 32px between sections.** Memorize this rhythm; it's what makes density read as _designed_.

| Context | Value |
|---|---|
| Icon↔text gap, chip internal | `4–6px` |
| Inside a group (label→control, stacked meta) | `8px` |
| Between grouped controls / form fields | `12px` |
| Between groups within a panel | `16px` |
| Card internal padding | `16px` (compact) / `20px` (standard) / `24px` (spacious) |
| Bento cell gap | `16px` (tight dashboard) / `20px` |
| Between major sections | `32px` |
| Rail ↔ main gap | `24px` |

### 3.2 Radius ladder (dev-tool tight)

| Token | Px | Use |
|---|---|---|
| `--radius-sm` | 6px | Chips, tags, status pills(sq), table cells, keycaps |
| `--radius-md` | 8px | Buttons, inputs, selects, small controls |
| `--radius-lg` | 12px | **Cards, panels, code blocks — dominant surface radius** |
| `--radius-xl` | 16px | Rail container, modal panels, the largest surfaces |
| `--radius-full` | 9999px | Dots, avatars, live pills, toggle knobs — **never** on rectangular buttons/cards |

> Staying at **12px cards / 8px controls** is the deliberate "engineering tool" choice; 20px+ radii drift toward consumer/marketing feel.

---

## 4. Motion

**Signature easing:** `cubic-bezier(0.175, 0.885, 0.32, 1.1)` — a gentle overshoot ("swift"). One curve for the whole system.

| Interaction | Duration | Easing |
|---|---|---|
| Hover / toggle / color & border shift | **150ms** | signature |
| Popover / tooltip / dropdown | 200ms | signature |
| Modal / overlay enter (scale 0.96→1) | 300ms | signature |
| Critique enter (transcript stream-in) | 220ms | signature |
| Live-dot pulse (halo scale+fade loop) | 1600ms | ease-in-out, infinite |

**Hover behavior (universal):** border `--border` → `--border-hover`, optional +2px X-translate on the label. **No** shadow-lift, **no** cinematic fade, **no** bounce beyond the 1.1 overshoot. `prefers-reduced-motion: reduce` disables pulse + translate, keeps instant color changes.

**Live indicator** (the one signature animation): an 8px solid `--live` dot with a second absolutely-positioned ring animating `opacity 0.6→0` + `scale 1→2.4` on the 1600ms loop.

---

## 5. Component recipes

### 5.1 Buttons

| Tier | Recipe |
|---|---|
| **Primary** (one per view — "Start session") | `bg: --accent-ink`, `text: #fff`, `radius-md`, `h: 36px`, `px: 14px`, weight 500. Hover → `--accent-ink-hover`. Focus → double-ring. **No glow.** |
| **Secondary / outline** | transparent bg, `1px --border`, `text: --text`. Hover → `border --border-hover` + `bg --bg-hover`. (e.g. "Stop session", "Test connection".) |
| **Soft / tinted** | `bg: --accent-surface`, `text: --accent-ink`, no border. For low-emphasis affirmative actions. |
| **Ghost** | transparent, `text: --text-secondary`, hover `bg --bg-hover`. Icon buttons, row actions. |
| **Destructive** | soft only: `bg: --crit-surface`, `text: --crit-ink`. Solid `--crit` reserved for genuine data-loss confirms. |

Disabled: `opacity 0.5`, `cursor: not-allowed`, no hover. Loading: inline spinner + disable, never swap layout.

### 5.2 Inputs & selects (provider keys, dropdowns)

- `bg: --surface-subtle`, `1px --border`, `radius-md`, `h: 36px`, `px: 12px`, `text-sm`.
- Label **above** input, never floating: `micro-label` style, `mb: 8px`.
- Focus: border → `--accent`, add double-ring.
- Error: border → `--crit`, inline `--crit-ink` message below (`13px`).
- Password/key fields: mask by default, mono font for the value, trailing show/hide ghost-icon button, and a status dot at the row's right edge.

### 5.3 Segmented control (Mode: Fast / Quality)

Replaces the raw `<select>`. A `--surface-subtle` track, `radius-md`, with a sliding `--surface` thumb (`1px --border`, the sliding highlight animates with the signature curve). Active segment text `--text` weight 500; inactive `--text-muted`. This is a far more instrument-grade control than a dropdown for a 2-value choice.

### 5.4 Cards / panels

```
bg: --surface
ring: 0 0 0 1px rgba(0,0,0,0.08)   /* not a border property */
radius: --radius-lg (12px)
padding: 20px
transition: 150ms signature
hover (only if interactive): ring → rgba(0,0,0,0.14)
```
Card header = mono eyebrow → H3 title → optional meta row. **No colored left-borders. No icon-on-top clones.**

### 5.5 Critique card (the core object)

The most important component — one per streamed critique. Anatomy:

```
┌─────────────────────────────────────────────┐
│ ● CRITICAL   Accessibility Auditor   92% ▓▓▓░ │  ← severity dot + persona (mono) + confidence meter
│                                               │
│ The primary CTA fails WCAG AA — contrast is   │  ← transcriptText, 14px body, --text
│ 2.8:1 against its background (needs 4.5:1).    │
│                                               │
│ ┌─ css ──────────────────────── Copy fix ─┐  │  ← code-fix block: lang badge + copy btn
│ │  color: #6b7280;   /* was #9ca3af */     │  │     mono 12.5px, --surface-subtle, syntax-tinted
│ │  color: #374151;                          │  │
│ └───────────────────────────────────────────┘  │
│ DETERMINISTIC · 14:32:07                       │  ← source tag (mono) + timestamp meta
└─────────────────────────────────────────────┘
```

- **Left edge is NOT a colored border** (anti-slop). Severity is signaled by the **dot + ink-tier label** at top-left.
- Severity tints the card only as an ultra-faint top-row wash (`--{sev}-surface` behind the header strip), not the whole card.
- **Confidence meter:** 4-segment mono bar, filled in `--accent` proportional to `confidence`, with the `%` in mono tabular.
- **Code fix:** `--surface-subtle` well, `radius-lg`, language badge (mono `sm` chip), "Copy fix" ghost button top-right, `before`/`after` differentiated (before → `--text-faint` strikethrough-comment, after → `--text`).
- **Enter animation:** new critiques fade+slide 6px up over 220ms; newest at top; the feed auto-scrolls only if already at top.
- **`critical` behavior:** in voice mode this interrupts playback (already built) — visually it gets a one-shot 400ms `--crit` ring flash on entry.

### 5.6 Status dot + live pill

- Dot: `8px`, `radius-full`. States per §1.4. Live/connecting variants get the pulsing halo.
- Live pill: `--live-surface` bg, `radius-full`, `px 8px py 3px`, pulsing `--live` dot + `LIVE` mono micro-label in `--live-ink`.

### 5.7 Metric chip (frame counters, latency)

`--surface` bg, `1px --border`, `radius-sm`, `px 8px py 4px`. Layout: mono micro-label (`--text-muted`) above, mono tabular number (`--text`, 13px) below. Numbers use `font-variant-numeric: tabular-nums` so they don't jitter as they count up.

### 5.8 Empty state (transcript before session)

Centered, `py: 64px`. A calm line-icon in a `--surface-subtle` `radius-lg` chip (56px), a `16px` weight-600 title ("No critiques yet"), a `13px --text-muted` line ("Start a session and share a window to begin the live audit."), no CTA (the CTA lives in the rail). Icon does a slow 3s float; respects reduced-motion.

### 5.9 Toast / inline feedback

Key-saved / test-passed confirmations: bottom-right toast, `--surface`, `1px --border`, popover shadow, `radius-lg`, live-dot-green check icon, auto-dismiss 3s. Errors stay inline (field-level) + a top-of-panel banner for request failures.

---

## 6. Layout — the bento workspace shell

**Not a scrolling page.** A fixed, full-height, two-zone cockpit:

```
┌──────────────────────────────────────────────────────────────┐
│  ◇ AI Screen Sense              ● LIVE · session a1b2   ⚙︎     │  ← top bar (56px, border-b)
├───────────────────────┬──────────────────────────────────────┤
│  // SESSION           │  // TRANSCRIPT            [ auto ▾ ]   │
│  ┌─ Persona ───────┐  │  ┌────────────────────────────────┐  │
│  │ Accessibility ▾ │  │  │  ● CRITICAL  A11y   92%         │  │
│  └─────────────────┘  │  │  The primary CTA fails WCAG…    │  │
│  [ Fast │ Quality ]   │  │  └────────────────────────────────┘  │
│  ☑ Speak aloud        │  │  ┌────────────────────────────────┐  │
│                       │  │  │  ● INFO  UX Generalist  78%    │  │
│  ┌───────────────┐    │  │  │  Nav hierarchy is unclear…     │  │
│  │  Start session │    │  │  └────────────────────────────────┘  │
│  └───────────────┘    │  │                                    │  │
│                       │  │           (streaming…)             │  │
│  ┌ FRAMES ┐ ┌ SENT ┐  │  │                                    │  │
│  │  142   │ │  38  │  │  │                                    │  │
│  └────────┘ └──────┘  │  │                                    │  │
│  ── // PROVIDERS ──   │  │                                    │  │
│  ● OpenRouter   ok    │  │                                    │  │
│  ● OpenAI       ok    │  │                                    │  │
│  ○ Anthropic    —     │  │                                    │  │
│  ○ Gemini       —     │  │                                    │  │
└───────────────────────┴──────────────────────────────────────┘
     LEFT RAIL (cockpit, ~320px)      MAIN (live output, flex-1)
```

- **Top bar** (56px, `border-b --border`): wordmark left; global session status (live pill + session id in mono) center-right; settings gear right.
- **Left rail** (~320px fixed, `border-r --border`, `--surface`): the control cockpit — session controls up top, primary CTA, live metric chips, provider-status list at the bottom. Scrolls independently if needed.
- **Main** (`flex-1`, `--canvas`): the transcript feed — the product's "output". Scrolls; newest at top; sticky filter/auto-scroll control in its header.
- **Settings** (all 4 provider key fields with save/test) live in a **modal/sheet** off the gear, _not_ inline — keeps the workspace clean; the rail only shows compact provider _status_.
- **Faint background grid** on the main canvas: a `--surface-subtle` dotted/line grid at very low opacity that becomes marginally more visible on scroll (a subtle depth cue, per the brief) — decorative only, never interferes with legibility.

**Responsive:** below `1024px`, rail collapses to a top control strip; transcript takes full width. Below `640px`, controls stack; touch targets ≥44px; segmented control and dropdowns go full-width.

---

## 7. Per-surface application (mapping to the real app)

| App surface (current) | Design treatment |
|---|---|
| `App.tsx` `<main>` | Becomes the **bento shell** (top bar + rail + main) |
| `Settings.tsx` (4 key fields) | Moves into a **settings modal**; rail shows compact provider-status list (§1.5). Each field: masked mono input + Save (soft) + Test (outline) + status dot + inline result |
| Persona `<select>` | Styled select (§5.2) in rail, mono-labeled `// PERSONA` |
| Mode `<select>` | Replaced by **segmented control** (§5.3) |
| Voice checkbox | Styled toggle switch, `--accent` when on |
| Start/Stop button | **Primary CTA** (§5.1); Stop = outline/destructive-soft with a live dot |
| Frame metrics line | Two **metric chips** (§5.7), tabular mono, live-updating |
| Session id / connecting | Mono in the top-bar live pill |
| Error (`role=alert`) | Inline banner, `--crit-surface` / `--crit-ink`, top of rail |
| `TranscriptFeed.tsx` list | **Critique cards** (§5.5), streaming, newest-first |
| Empty transcript | **Empty state** (§5.8) |
| `codeFix` block | Code-fix well inside critique card (§5.5) |
| `confidence` | Confidence meter (§5.5) |
| `severity` | Dot + ink label + faint header wash (§1.3) |
| `source` (llm/det/council) | Mono source tag (§1.5) |

---

## 8. Accessibility

- **Contrast:** all text-bearing colors verified ≥4.5:1 on white/canvas (§1). Muted meta ≥4.5:1; faint/placeholder is decorative only.
- **Never color-only:** severity/status always pair a pastel with an ink-tier **label or dot shape** — safe for colorblind users.
- **Focus:** the double-ring on every interactive element; `focus-visible`, never removed.
- **Motion:** `prefers-reduced-motion: reduce` disables pulse, float, and translate; keeps instant color/opacity changes.
- **Targets:** ≥44px tap targets under 640px.
- **Semantics:** live region for the streaming transcript (`aria-live="polite"`, `assertive` for `critical`), so screen readers announce new critiques.

---

## 9. Token file (drop-in CSS custom properties)

```css
:root {
  /* neutral spine */
  --canvas:#FAFAFA; --surface:#FFFFFF; --surface-subtle:#F4F4F5;
  --bg-hover:#F1F1F3; --bg-active:#E9E9EC;
  --border:#EAEAEA; --border-strong:#E4E4E7; --border-hover:#C9C9C9; --border-active:#A8A8A8;
  --border-a1:rgba(0,0,0,.05); --border-a2:rgba(0,0,0,.08); --border-a3:rgba(0,0,0,.10);
  --text:#171717; --text-secondary:#4D4D4D; --text-muted:#71717A; --text-faint:#8F8F8F;

  /* accent — pastel iris */
  --accent-surface:#EEEEFB; --accent:#8B8CF0; --accent-ink:#5B5BD6; --accent-ink-hover:#4B4BC4;

  /* severity */
  --info-surface:#E8F6FC; --info:#38BDF8; --info-ink:#0E7490;
  --warn-surface:#FEF4E2; --warn:#FBBF24; --warn-ink:#B45309;
  --crit-surface:#FDECEF; --crit:#FB7185; --crit-ink:#BE123C;

  /* live / success */
  --live-surface:#E6F7F0; --live:#34D399; --live-ink:#047857;

  /* radius */
  --radius-sm:6px; --radius-md:8px; --radius-lg:12px; --radius-xl:16px; --radius-full:9999px;

  /* motion */
  --ease:cubic-bezier(.175,.885,.32,1.1);
  --dur-fast:150ms; --dur-pop:200ms; --dur-overlay:300ms;

  /* elevation (floating only) */
  --shadow-card:0 0 0 1px rgba(0,0,0,.08);
  --shadow-pop:0 1px 1px rgba(0,0,0,.02),0 4px 8px -4px rgba(0,0,0,.04),0 16px 24px -8px rgba(0,0,0,.06);
  --shadow-modal:0 1px 1px rgba(0,0,0,.02),0 8px 16px -4px rgba(0,0,0,.04),0 24px 32px -8px rgba(0,0,0,.06);

  /* focus */
  --focus-ring:0 0 0 2px #FFFFFF,0 0 0 4px var(--accent);
}
```

_(Dark mode is out of scope by decision, but the role-based token names above are structured so a `[data-theme="dark"]` block could re-map them later without touching components.)_

---

## 10. Implementation notes (as built)

The system is implemented with **Tailwind CSS v4** (CSS-first `@theme`, no `tailwind.config.js`) and **Framer Motion** for all motion, wired through Vite's `@tailwindcss/vite` plugin. This supersedes the "no framework required" note in v1.0 — the token names below are the actual Tailwind theme keys, not aspirational.

- **Token file:** `apps/web/src/styles/theme.css` — every token in §9 is declared inside `@theme { ... }` using Tailwind v4's namespace convention (`--color-*`, `--radius-*`, `--shadow-*`, `--font-*`, `--ease-*`, `--animate-*`, `--z-index-*`). Tailwind auto-generates matching utilities (`bg-crit-surface`, `text-accent-ink`, `rounded-lg`, `ease-signature`, `animate-live-ping`, `z-sticky`, etc.) — components consume these utility classes directly, never raw hex values or inline styles.
- **Fonts:** self-hosted via `@fontsource-variable/geist` and `@fontsource-variable/geist-mono` (imported once in `theme.css`), not the Next.js-only `geist` npm package (that package requires `next/font` and doesn't work in a plain Vite app). `font-variant-numeric: tabular-nums` is applied globally to `.font-mono`/`.tabular-nums` in the base layer.
- **Motion:** Framer Motion (`framer-motion` package) drives every animation — critique-card enter transitions, the segmented-control sliding thumb (`layoutId`), modal enter/exit, and scroll-reveal (`whileInView`) on the landing page. The signature easing curve is defined once as `--ease-signature` and reused via the `ease-signature` Tailwind utility and inline in Framer Motion `transition` props. `prefers-reduced-motion: reduce` is handled globally in `theme.css` by collapsing all animation/transition durations to near-zero.
- **Grid overlay:** the `dot-grid` Tailwind `@utility` (radial-gradient dot pattern) is applied to the transcript panel's `--canvas` background per §6.
- **Streaming:** critique cards keyed by `critique.id`; `AnimatePresence` + `motion.article` handle the mount transition; arrival timestamps are captured once per critique (in a `Map`, not via `Date.now()` at render time) so the transcript's timestamp doesn't drift on re-render.
- **Dialogs/overlays:** `@radix-ui/react-dialog` provides focus-trap + Esc-close + portal-escape for the Settings modal (per the "dropdowns/modals must escape `overflow:hidden` via portal or `position:fixed`" rule) — Framer Motion animates the Radix-rendered nodes via `asChild` + `forceMount`.
- **Routing:** `react-router-dom` splits the app into `/` (marketing landing page, `src/landing/`) and `/app` (the cockpit workspace described in this document and in `frontend-plan.md`). See §14.
- Build order used: Tailwind theme + fonts → routing shell → primitives (`components/ui/*`) → rail → critique card → transcript panel → settings modal → landing page sections.

---

## 11. What makes this uniquely "AI Screen Sense" (not a Vercel clone)

1. **The pastel semantic layer** — Vercel/Linear are near-monochrome; the calibrated pastel severity+live system is our signature warmth, applied with the same border-driven discipline so it never tips into slop.
2. **The critique card as the hero object** — a bespoke composite (severity dot + persona + confidence meter + syntax-tinted code fix + source tag) that no generic dashboard has, purpose-built for streamed multi-persona audit output.
3. **The cockpit/output split** — rail-as-instrument-panel + main-as-live-feed reads like a real-time engineering tool, distinct from Crumble's centered-marketing-hero consumer look.
4. **`deterministic` / `council` source signaling** — surfacing _how_ a critique was produced (real math vs. LLM vs. consensus) is a product differentiator the design foregrounds with a mono tag.

---

## 12. Open design decisions (for review)

1. **Grid overlay** — dot grid vs. hairline grid vs. none. **Resolved:** faint dot grid (`dot-grid` utility), applied to the transcript canvas. Not yet scroll-reactive (§0 item 4's "bump opacity on scroll" is unimplemented — the grid is a static low-opacity layer).
2. **Persona color** — kept fully neutral, as specified. The landing page's persona showcase cards (§14) use severity color (not persona color) to stay within the same color budget.
3. **Settings placement** — **Resolved:** modal, implemented with Radix Dialog (`components/settings/SettingsModal.tsx`). Keeps the rail to compact provider _status_ only, per §6.
4. **Confidence meter** — **Resolved:** 4-segment bar (`components/ui/ConfidenceMeter.tsx`), used identically in the cockpit critique card and the landing page's demo cards.
5. **Landing nav on mobile** *(new)* — the nav's text links (`#personas`/`#how-it-works`/`#pricing`) are hidden below `md` with no replacement hamburger menu; only "Launch app" stays visible. Acceptable for v1 since the CTA is the primary action, but a mobile menu is open for a follow-up pass.

---

## 13. Sources

Vercel Geist ([design.md](https://vercel.com/design.md), [Geist Colors](https://vercel.com/geist/colors), [Geist Font](https://vercel.com/font)) · Linear ([redesign notes](https://linear.app/now/how-we-redesigned-the-linear-ui)) · Raycast / Resend design specs (VoltAgent awesome-design-md) · [Radix Colors](https://www.radix-ui.com/colors) · [Crumble UX](https://crumbleux.com/) (direct competitor) · AI-slop pattern references ([Developers Digest](https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it), SmoothUI) · [Bento grid 2026 guide](https://www.saasframe.io/blog/designing-bento-grids-that-actually-work-a-2026-practical-guide). Full research findings archived in project research notes.

---

## 14. The marketing landing page (`/`)

A new public-facing route, separate from the cockpit workspace (`/app`), added in v1.1. Lives at `apps/web/src/landing/`, routed via `react-router-dom` in `main.tsx`.

### 14.1 Why a separate surface

The cockpit (§6) is deliberately an instrument panel — dense, neutral, built for a returning user driving a live session. A first-time visitor evaluating the product needs a different job done: explain what it does, prove it works, and get them into `/app`. Rather than force one layout to do both jobs (the failure mode the original design-system explicitly ruled out — "not a marketing-site style guide"), the landing page is its own composed page that **reuses the same token system and hero components** (severity dots, confidence meters, the critique card's visual language) so it reads as the same product, not a different skin.

### 14.2 Structure

`LandingPage.tsx` composes, top to bottom:

1. **Nav** — sticky, translucent-blur on scroll, wordmark + anchor links + "Launch app" CTA (→ `/app`).
2. **Hero** — headline + subhead + two CTAs, paired with a live-animating mock of the transcript feed (real critique-card visual language, not a screenshot) as proof-of-product rather than a decorative illustration.
3. **PersonaTeam** (`#personas`) — a card grid of 6 of the 8 real personas from `packages/shared`/`apps/server/src/personas/registry.ts`, each with its real scope bullets and a representative sample critique. Severity dot per card substitutes for icons (avoids the "identical icon-on-top card" anti-pattern).
4. **CodeFixDemo** — the product's differentiator (deterministic contrast checker → exact code fix) shown as a real critique-card code-fix block, not an abstract feature bullet list.
5. **HowItWorks** (`#how-it-works`) — a genuine 3-step sequence (share → pick persona/mode → get feedback), the one place numbered markers are used, because the order is real information here (see the anti-slop rule on numbered-eyebrow scaffolding).
6. **Pricing** (`#pricing`) — **not** invented SaaS pricing tiers. The product is genuinely BYOK with no subscription, so this section explains the real billing model (bring your own provider key, billed by the provider) rather than fabricating a tiered pricing table that doesn't exist in the product.
7. **ClosingCta** — final conversion moment, same primary CTA as the hero.
8. **Footer** — wordmark + one mono tagline, intentionally minimal (no link farm).

### 14.3 Content honesty constraints

Two content decisions were made specifically to avoid the landing page overclaiming relative to the real product (`apps/server/src/personas/registry.ts`, `packages/shared/src/schema/critique.ts`):

- **Persona count:** the product ships 8 personas; the showcase grid features the 6 most demonstrable ones with a mono footnote naming the remaining 2 (Code Quality Reviewer, Localization/i18n Auditor) rather than silently omitting them.
- **No fake pricing tiers:** critique competitor Crumble AI uses a 4-tier subscription pricing section; AI Screen Sense's actual billing model is BYOK with zero markup, so §5 (Pricing) documents that model honestly instead of inventing tiers to match the competitor's layout.

### 14.4 Motion

Landing sections use Framer Motion `whileInView` (`viewport={{ once: true }}`) for scroll-triggered reveals, and the hero's critique-card mock uses staggered `initial`/`animate` mounts. All easing uses the shared `--ease-signature` curve; all durations fall within the §4 motion scale. `prefers-reduced-motion` is handled globally (§10), so reveals degrade to instant appearance rather than being suppressed entirely.
