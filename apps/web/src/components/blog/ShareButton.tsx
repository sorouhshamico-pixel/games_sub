"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link2, Check } from "lucide-react";
import { SiWhatsapp, SiX, SiFacebook, SiTelegram } from "react-icons/si";
import type { Locale } from "@gcc-store/i18n";
import { duration, easing, spring } from "@/lib/motion/tokens";

// Real, standard share-intent endpoints — no API keys, no app install
// required, exactly what clicking each platform's own "share" button
// would open. window.location.href (read client-side, at click time) so
// this always shares the actual current article, not a guessed URL.
function shareTargets(url: string, title: string) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  return [
    { name: "WhatsApp", Icon: SiWhatsapp, color: "#25D366", href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
    { name: "X", Icon: SiX, color: "#000000", href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}` },
    { name: "Facebook", Icon: SiFacebook, color: "#1877F2", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: "Telegram", Icon: SiTelegram, color: "#26A5E4", href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}` },
  ];
}

export function ShareButton({ locale, title }: { locale: Locale; title: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  // Read on mount rather than at module scope — window doesn't exist
  // during the server render that produces this component's HTML.
  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API can be denied by browser permissions — the button
      // simply stays in its idle state rather than throwing an error.
    }
  }

  const targets = shareTargets(url, title);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-[var(--color-text-muted)]">{locale === "ar" ? "شارك:" : "Share:"}</span>
      <div className="flex items-center gap-2">
        {targets.map((target) => (
          <motion.a
            key={target.name}
            href={target.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={locale === "ar" ? `مشاركة عبر ${target.name}` : `Share on ${target.name}`}
            whileHover={{ y: -3, scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", ...spring }}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md transition-shadow hover:shadow-lg"
            style={{ backgroundColor: target.color, boxShadow: `0 4px 14px -4px ${target.color}80` }}
          >
            <target.Icon className="h-4 w-4" aria-hidden />
          </motion.a>
        ))}

        <motion.button
          type="button"
          onClick={handleCopy}
          aria-label={locale === "ar" ? "نسخ الرابط" : "Copy link"}
          whileHover={{ y: -3, scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", ...spring }}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] transition-colors hover:border-brand-primary/50"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="copied"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: duration.fast, ease: easing } }}
                exit={{ opacity: 0, scale: 0.6 }}
                className="text-success"
              >
                <Check className="h-4 w-4" aria-hidden />
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: duration.fast, ease: easing } }}
                exit={{ opacity: 0, scale: 0.6 }}
              >
                <Link2 className="h-4 w-4" aria-hidden />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
