"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { duration, easing } from "@/lib/motion/tokens";

export interface MotionAccordionItem {
  id: string;
  trigger: React.ReactNode;
  content: React.ReactNode;
}

/** Single-open accordion — height animates to a real measured "auto", not a magic-number max-height. */
export function MotionAccordion({ items }: { items: MotionAccordionItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="flex flex-col divide-y divide-[var(--color-border)]">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-4 text-start text-sm font-medium text-[var(--color-text-primary)]"
            >
              {item.trigger}
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: duration.fast, ease: easing }}
                className="shrink-0 text-[var(--color-text-muted)]"
              >
                <ChevronIcon />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: duration.normal, ease: easing }}
                  className="overflow-hidden"
                >
                  <div className="pb-4 text-sm leading-relaxed text-[var(--color-text-muted)]">{item.content}</div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}
