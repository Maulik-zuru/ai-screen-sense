import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LivePill } from "../../components/ui/LivePill.js";
import { SeverityDot } from "../../components/ui/SeverityDot.js";
import { ConfidenceMeter } from "../../components/ui/ConfidenceMeter.js";

const EASE = [0.175, 0.885, 0.32, 1.1] as const;

const DEMO_CRITIQUES = [
  {
    severity: "critical" as const,
    persona: "Accessibility Auditor",
    confidence: 92,
    text: "Primary CTA fails WCAG AA — 2.8:1 against its background. Needs 4.5:1.",
    source: "DETERMINISTIC",
    time: "14:32:07",
  },
  {
    severity: "warning" as const,
    persona: "Mobile Critic",
    confidence: 74,
    text: "Tap targets are 32×32px — below the 44px minimum on iOS.",
    source: "COUNCIL · 2 MODELS",
    time: "14:32:11",
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-[0.5]" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl gap-16 px-6 pb-24 pt-28 md:grid-cols-2 md:items-center md:pb-32 md:pt-36">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="mb-6 inline-flex"
          >
            <LivePill label="LIVE ON YOUR SCREEN, NOW" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
            className="text-balance font-sans text-5xl font-semibold tracking-[-0.03em] text-text md:text-6xl"
          >
            Eight expert eyes on your screen, judging in real time.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.12 }}
            className="mt-6 max-w-md text-pretty text-lg leading-relaxed text-text-secondary"
          >
            Share a window. AI Screen Sense streams live UX critiques as you work —
            contrast failures, layout drift, tap-target math — with the exact code fix,
            not vague advice.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.18 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/app"
              className="rounded-md bg-accent-ink px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-ink-hover focus-visible:focus-ring"
            >
              Start a free audit
            </Link>
            <a
              href="#how-it-works"
              className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-text transition-colors duration-150 hover:border-border-hover hover:bg-bg-hover focus-visible:focus-ring"
            >
              See how it works
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-5 font-mono text-[11px] font-medium tracking-[0.06em] text-text-faint"
          >
            BRING YOUR OWN KEY · OPENROUTER, OPENAI, ANTHROPIC, GEMINI
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
          className="relative"
        >
          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-mono text-[11px] font-medium tracking-[0.06em] text-text-muted">
                // TRANSCRIPT
              </span>
              <LivePill />
            </div>
            <div className="flex flex-col gap-3 p-4">
              {DEMO_CRITIQUES.map((c, i) => (
                <motion.div
                  key={c.text}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE, delay: 0.5 + i * 0.35 }}
                  className="rounded-lg border border-border bg-surface p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <SeverityDot severity={c.severity} />
                    <span className="font-mono text-[11px] text-text-muted">{c.persona}</span>
                    <ConfidenceMeter value={c.confidence} />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-text">{c.text}</p>
                  <div className="mt-3 flex items-center justify-between font-mono text-[11px] tracking-[0.04em] text-text-faint">
                    <span>{c.source}</span>
                    <span>{c.time}</span>
                  </div>
                </motion.div>
              ))}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.4 }}
                className="flex items-center gap-2 py-1 font-mono text-[11px] tracking-[0.04em] text-text-faint"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-live-ping rounded-full bg-text-faint opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-text-faint" />
                </span>
                listening…
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
