"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "motion/react";
import { buttonBaseClasses, buttonSizeClasses, buttonVariantClasses, cn, type ButtonSize, type ButtonVariant } from "@gcc-store/ui";
import { spring } from "@/lib/motion/tokens";

// motion.button's drag/animation gesture props collide by name with React's
// native DOM event handlers of the same name but a different signature
// (onDrag, onDragStart/End, onAnimationStart/End/Iteration) — omit them from
// the HTML attributes side so TS resolves to motion's versions instead.
type NativeEventConflicts = "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration";

export interface MotionButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | NativeEventConflicts> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

/**
 * Same visual language as <Button> (reuses its exact classes — one source
 * of truth), but a real `motion.button` underneath so hover/press feedback
 * animates the actual element rather than a wrapper. Spring-driven per the
 * house physics, not a fixed-duration tween: hover lifts 2px, press settles
 * to 0.985 scale. Disabled buttons get no hover/press motion at all.
 */
export function MotionButton({ variant = "primary", size = "md", className, disabled, children, ...rest }: MotionButtonProps) {
  return (
    <motion.button
      className={cn(buttonBaseClasses, buttonVariantClasses[variant], buttonSizeClasses[size], className)}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.985, y: 0 }}
      transition={{ type: "spring", ...spring }}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
