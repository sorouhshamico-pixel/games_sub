"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { spring } from "@/lib/motion/tokens";

/**
 * Spring-driven lift + press feedback for card-shaped things. Deliberately
 * leaves *internal* hover effects (image zoom, border color) to plain CSS
 * `group-hover:` — those are compositor-only and don't need JS, so mixing
 * them with this wrapper's JS-driven lift costs nothing extra.
 */
export function HoverCard({ children, className, ...rest }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", ...spring }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
