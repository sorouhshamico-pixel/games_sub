"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "motion/react";
import { formatMoney } from "@gcc-store/ui";
import type { SupportedCurrency } from "@gcc-store/contracts";
import { duration, easing } from "@/lib/motion/tokens";

/** Smoothly counts between old and new price whenever `amountMinorUnits` changes — variant selection, coupon applied, quantity change, etc. */
export function AnimatedPrice({
  amountMinorUnits,
  currency,
  locale,
  className,
}: {
  amountMinorUnits: number;
  currency: SupportedCurrency;
  locale: "ar" | "en";
  className?: string;
}) {
  const [display, setDisplay] = useState(amountMinorUnits);
  const prevRef = useRef(amountMinorUnits);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (prevRef.current === amountMinorUnits) return;
    if (reducedMotion) {
      setDisplay(amountMinorUnits);
      prevRef.current = amountMinorUnits;
      return;
    }
    const from = prevRef.current;
    const controls = animate(from, amountMinorUnits, {
      duration: duration.normal,
      ease: easing,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    prevRef.current = amountMinorUnits;
    return () => controls.stop();
  }, [amountMinorUnits, reducedMotion]);

  return <span className={className}>{formatMoney(display, currency, locale)}</span>;
}
