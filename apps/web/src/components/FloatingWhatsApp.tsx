"use client";

import { useLocale } from "next-intl";
import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { spring } from "@/lib/motion/tokens";
import { WhatsAppIcon } from "./home/icons";

/**
 * Site-wide floating WhatsApp-style contact bubble — fixed bottom-right
 * (physical, per direction). Routed to the real FAQ/help page rather than
 * a fabricated wa.me phone number: a wrong or placeholder number would
 * message a real, unrelated person, which stays true regardless of how
 * polished the button looks. Sits above BottomNav on mobile.
 */
export function FloatingWhatsApp() {
  const locale = useLocale();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", ...spring, delay: 0.6 }}
      className="group fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6"
    >
      <div className="relative h-14 w-14">
        {/* Twin "blinking" pulse rings — opacity/scale only, staggered so
            a new one starts before the previous fully fades. */}
        <motion.span
          aria-hidden
          animate={{ scale: [1, 1.7, 1.7], opacity: [0.55, 0, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 rounded-full bg-[#25D366]"
        />
        <motion.span
          aria-hidden
          animate={{ scale: [1, 1.7, 1.7], opacity: [0.4, 0, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 1.1 }}
          className="absolute inset-0 rounded-full bg-[#25D366]"
        />

        {/* Hover tooltip — physically to the left of the button (toward
            screen center), independent of locale direction. */}
        <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
          {locale === "ar" ? "تواصل معنا" : "Chat with us"}
        </span>

        <motion.div whileHover={{ scale: 1.1, y: -3 }} whileTap={{ scale: 0.92 }} transition={{ type: "spring", ...spring }} className="relative h-full w-full">
          <Link
            href="/pages/faq"
            aria-label={locale === "ar" ? "تواصل معنا على واتساب" : "Contact us on WhatsApp"}
            className="flex h-full w-full items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/40"
          >
            <WhatsAppIcon className="h-7 w-7" aria-hidden />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
