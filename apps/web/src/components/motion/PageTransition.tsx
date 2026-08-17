"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "@/i18n/navigation";
import { pageTransition } from "@/lib/motion/tokens";

/**
 * Wraps `{children}` in the locale layout so every route change gets the
 * same fade + rise + blur transition instead of an abrupt swap. Keyed on the
 * locale-agnostic pathname (from next-intl's navigation, not next/navigation)
 * so switching ar/en on the same route doesn't replay the transition —
 * that's a language change, not a page change.
 *
 * `mode="wait"` finishes the exit before the next page mounts, which avoids
 * two pages' content overlapping mid-transition (a real layout-shift risk)
 * at the cost of a brief gap — kept short on purpose (180ms exit) so it
 * reads as snappy, not laggy. Next.js's own scroll-restoration-on-navigate
 * still runs independently of this; nothing here overrides it.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: pageTransition.enter }}
        exit={{ opacity: 0, y: -6, transition: pageTransition.exit }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
