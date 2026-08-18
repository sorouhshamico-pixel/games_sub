"use client";

import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { duration, easing } from "@/lib/motion/tokens";
import { BoltIcon } from "./icons";

export function SectionHeading({
  title,
  viewAllHref,
  viewAllLabel,
}: {
  title: string;
  viewAllHref?: Parameters<typeof Link>[0]["href"];
  viewAllLabel?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold text-[var(--color-text-primary)] sm:text-2xl">
          <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-accent/15 text-brand-accent">
            <BoltIcon className="h-4 w-4" />
          </span>
          {title}
        </h2>
        <motion.div
          aria-hidden
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 1 }}
          transition={{ duration: duration.slow, ease: easing }}
          className="mt-2 h-[3px] w-12 origin-left rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary"
        />
      </div>
      {viewAllHref ? (
        <Link href={viewAllHref} className="shrink-0 text-sm font-medium text-brand-secondary hover:underline">
          {viewAllLabel} →
        </Link>
      ) : null}
    </div>
  );
}
