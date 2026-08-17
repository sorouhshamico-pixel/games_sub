"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { duration, spring } from "@/lib/motion/tokens";
import { useDialogA11y } from "./useDialogA11y";

/**
 * `side` is physical ("left"/"right"), not logical — the caller decides
 * which physical edge makes sense for its own RTL-aware layout, since that
 * varies by use case (e.g. the cart drawer's requested side isn't
 * necessarily the same side a different drawer would want).
 */
export function MotionDrawer({
  open,
  onClose,
  side,
  children,
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  side: "left" | "right";
  children: React.ReactNode;
  labelledBy?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useDialogA11y(open, onClose, panelRef);

  const offscreenX = side === "left" ? "-100%" : "100%";

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.normal }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            className={`absolute inset-y-0 ${side === "left" ? "left-0" : "right-0"} flex w-full max-w-sm flex-col bg-[var(--color-surface)] shadow-2xl`}
            initial={{ x: offscreenX }}
            animate={{ x: 0 }}
            exit={{ x: offscreenX }}
            transition={{ type: "spring", ...spring }}
          >
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
