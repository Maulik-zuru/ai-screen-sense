import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import type { ProviderId } from "../../api.js";
import { ProviderKeyRow } from "./ProviderKeyRow.js";

const EASE = [0.175, 0.885, 0.32, 1.1] as const;

const PROVIDERS: { id: ProviderId; label: string; placeholder: string; helper?: string }[] = [
  {
    id: "openrouter",
    label: "OpenRouter",
    placeholder: "sk-or-...",
    helper: "Single key, every model. Recommended start.",
  },
  { id: "openai", label: "OpenAI", placeholder: "sk-..." },
  { id: "anthropic", label: "Anthropic", placeholder: "sk-ant-..." },
  { id: "gemini", label: "Gemini", placeholder: "AIza..." },
];

export function SettingsModal({
  open,
  onOpenChange,
  providerStatus,
  onKeySaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerStatus: Record<string, boolean>;
  onKeySaved: () => void;
}) {
  const hasAnyKey = Object.values(providerStatus).some(Boolean);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-modal-backdrop bg-black/50 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="fixed left-1/2 top-1/2 z-modal w-[min(480px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface shadow-modal focus:outline-none"
              >
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <Dialog.Title className="font-mono text-[11px] font-medium tracking-[0.06em] text-text-muted">
                    // PROVIDER KEYS
                  </Dialog.Title>
                  <Dialog.Close className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:bg-bg-hover hover:text-text focus-visible:focus-ring">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </Dialog.Close>
                </div>

                <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
                  <p className="text-[13px] leading-relaxed text-text-secondary">
                    Your keys are encrypted at rest and never sent back to the browser.
                    BYOK — you're billed by the provider, never by us.
                  </p>

                  {!hasAnyKey && (
                    <div className="mt-4 rounded-md border border-warn-surface bg-warn-surface px-3 py-2.5 text-[13px] text-warn-ink">
                      Configure at least one key to start a session.
                    </div>
                  )}

                  <div className="mt-4">
                    {PROVIDERS.map((p) => (
                      <ProviderKeyRow
                        key={p.id}
                        provider={p.id}
                        label={p.label}
                        placeholder={p.placeholder}
                        helper={p.helper}
                        configured={!!providerStatus[p.id]}
                        onKeySaved={onKeySaved}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
