"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { SA, GB } from "country-flag-icons/react/3x2";
import { locales, localeLabels, type Locale } from "@gcc-store/i18n";
import { usePathname, useRouter } from "@/i18n/navigation";
import { duration, easing, springTransition } from "@/lib/motion/tokens";

// Real vector flags (country-flag-icons) rather than Unicode flag emoji —
// Windows has no built-in flag-emoji glyphs and silently falls back to
// showing the bare two-letter region code (e.g. "SA"), so emoji flags
// render as broken-looking text for a large share of desktop users.
const flags: Record<Locale, typeof SA> = {
  ar: SA,
  en: GB,
};

const flagClassName = "h-3.5 w-5 shrink-0 rounded-[3px] object-cover shadow-[0_0_0_1px_rgba(255,255,255,0.12)]";

/**
 * Custom flag + label dropdown replacing the plain native <select> — a real
 * <select> can't render a flag next to the closed-state label consistently
 * across browsers, so this is a small self-built listbox instead (glass
 * trigger button + animated popover), matching the rest of the header's
 * borderless, motion-driven language. Mirrors CurrencySwitcher's shape so
 * the two feel like one family.
 */
export function LocaleSwitcher() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function selectLocale(next: Locale) {
    setOpen(false);
    if (next !== locale) router.replace(pathname, { locale: next });
  }

  const ActiveFlag = flags[locale];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-surface-elevated)]/70 px-2 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-brand-primary/15 sm:px-3"
      >
        <ActiveFlag aria-hidden className={flagClassName} />
        <span className="hidden sm:inline">{localeLabels[locale]}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={springTransition} className="flex">
          <ChevronDown aria-hidden className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: duration.fast, ease: easing }}
            className="absolute end-0 top-full z-50 mt-2 min-w-[9.5rem] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-1.5 shadow-2xl shadow-black/30 backdrop-blur-lg"
          >
            {locales.map((l) => {
              const isActive = l === locale;
              const OptionFlag = flags[l];
              return (
                <button
                  key={l}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => selectLocale(l)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-start text-sm transition-colors ${
                    isActive ? "bg-brand-primary/15 text-brand-primary" : "text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]"
                  }`}
                >
                  <OptionFlag aria-hidden className={flagClassName} />
                  <span className="flex-1">{localeLabels[l]}</span>
                  {isActive ? <Check aria-hidden className="h-3.5 w-3.5" /> : null}
                </button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
