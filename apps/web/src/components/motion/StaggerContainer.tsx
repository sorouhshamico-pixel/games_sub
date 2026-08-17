"use client";

import { motion } from "motion/react";
import { duration, easing, reveal, staggerGap } from "@/lib/motion/tokens";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: staggerGap },
  },
};

const itemVariants = {
  hidden: reveal.hidden,
  visible: { ...reveal.visible, transition: { duration: duration.medium, ease: easing } },
};

/**
 * Pairs with <StaggerItem>: children reveal one-by-one instead of all at
 * once, the first time the container scrolls into view. Use for product
 * grids, feature lists, anywhere a group of similar items should feel like
 * a sequence rather than a single block.
 */
export function StaggerContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={containerVariants}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
