import { motion } from "framer-motion";
import { PERSONA_SHOWCASE } from "../personas.js";
import { SeverityDot } from "../../components/ui/SeverityDot.js";

const EASE = [0.175, 0.885, 0.32, 1.1] as const;

export function PersonaTeam() {
  return (
    <section id="personas" className="border-b border-border bg-canvas py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-xl">
          <h2 className="text-balance text-3xl font-semibold tracking-[-0.02em] text-text md:text-4xl">
            Eight personas. Zero overlap. No flattery.
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-text-secondary">
            Each lens is scoped to a narrow slice of UX — it only speaks on what it's
            built to judge, so critiques stay sharp instead of generic.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PERSONA_SHOWCASE.map((p, i) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, ease: EASE, delay: (i % 3) * 0.08 }}
              className="flex flex-col rounded-lg border border-border bg-surface p-5 shadow-card transition-shadow duration-150 hover:shadow-card-hover"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-[-0.01em] text-text">{p.name}</h3>
                <SeverityDot severity={p.severity} />
              </div>

              <ul className="mt-3 flex flex-wrap gap-1.5">
                {p.scope.map((s) => (
                  <li
                    key={s}
                    className="rounded-sm bg-surface-subtle px-2 py-1 font-mono text-[11px] tracking-[0.02em] text-text-muted"
                  >
                    {s}
                  </li>
                ))}
              </ul>

              <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-text-secondary">
                "{p.sampleCritique}"
              </p>
            </motion.article>
          ))}
        </div>

        <p className="mt-8 font-mono text-[11px] tracking-[0.04em] text-text-faint">
          + CODE QUALITY REVIEWER · LOCALIZATION/I18N AUDITOR — RUN BOTH MODES ON REQUEST
        </p>
      </div>
    </section>
  );
}
