"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Copy, Check } from "lucide-react";
import type { Locale } from "@gcc-store/i18n";
import { duration, easing } from "@/lib/motion/tokens";

export function ShareButton({ locale }: { locale: Locale }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API can be denied by browser permissions — the button
      // simply stays in its idle state rather than throwing an error.
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:border-brand-primary/50"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="copied"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: duration.fast, ease: easing } }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-success"
          >
            <Check className="h-4 w-4" aria-hidden />
            {locale === "ar" ? "تم النسخ" : "Copied"}
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: duration.fast, ease: easing } }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" aria-hidden />
            {locale === "ar" ? "نسخ الرابط" : "Copy link"}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
