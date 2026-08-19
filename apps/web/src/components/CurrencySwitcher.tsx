"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import * as Flags from "country-flag-icons/react/3x2";
import type { SupportedCurrency } from "@gcc-store/contracts";
import { currencyLabels, currencyAbbreviation, currencyCountry, currencyOrder } from "@/lib/currency";
import { useDisplayCurrency } from "./CurrencyProvider";
import { duration, easing } from "@/lib/motion/tokens";

const flagClassName = "h-3.5 w-5 shrink-0 rounded-[3px] object-cover shadow-[0_0_0_1px_rgba(255,255,255,0.12)]";

/**
 * Header currency switcher — same glass trigger + animated listbox
 * language as the (now-simplified) locale switcher used to be, kept as a
 * real dropdown here since six currencies can't collapse into a single
 * toggle. Reuses country-flag-icons per currency's peg country so the
 * header's two switchers share one visual language instead of inventing a
 * second icon system.
 */
export function CurrencySwitcher() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const locale = useLocale() as "ar" | "en";
  const { currency, setCurrency } = useDisplayCurrency();

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
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

  function selectCurrency(next: SupportedCurrency) {
    setOpen(false);
    setCurrency(next);
  }

  const ActiveFlag = Flags[currencyCountry[currency] as keyof typeof Flags];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-surface-elevated)]/70 px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-brand-primary/15"
      >
        <ActiveFlag aria-hidden className={flagClassName} />
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={currency}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: duration.fast, ease: easing }}
          >
            {currencyAbbreviation[currency][locale]}
          </motion.span>
        </AnimatePresence>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ type: "spring", stiffness: 320, damping: 26 }} className="flex">
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
            className="absolute end-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-1.5 shadow-2xl shadow-black/30 backdrop-blur-lg"
          >
            {currencyOrder.map((c) => {
              const isActive = c === currency;
              const OptionFlag = Flags[currencyCountry[c] as keyof typeof Flags];
              return (
                <button
                  key={c}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => selectCurrency(c)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-sm transition-colors ${
                    isActive ? "bg-brand-primary/15 text-brand-primary" : "text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]"
                  }`}
                >
                  <OptionFlag aria-hidden className={flagClassName} />
                  <span className="flex-1">{currencyLabels[c][locale]}</span>
                  <span className="text-xs text-[var(--color-text-muted)]">{c}</span>
                  {isActive ? <Check aria-hidden className="h-3.5 w-3.5 shrink-0" /> : null}
                </button>
              );
            })}
            <p className="mt-1 border-t border-[var(--color-border)] px-2.5 pt-2 text-[11px] leading-relaxed text-[var(--color-text-muted)]">
              {locale === "ar"
                ? "الأسعار المحوّلة تقريبية — الدفع الفعلي يتم بالريال السعودي"
                : "Converted prices are approximate — you're charged in Saudi Riyals"}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
