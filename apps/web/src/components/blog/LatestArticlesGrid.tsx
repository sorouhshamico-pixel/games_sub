"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import type { BlogPostSummary } from "@gcc-store/contracts";
import type { Locale } from "@gcc-store/i18n";
import { BlogPostCard } from "./BlogPostCard";
import { StaggerContainer, StaggerItem } from "@/components/motion";

const INITIAL_COUNT = 4;

/**
 * Shows the first 4 "latest" posts with a reveal button for the rest,
 * client-side — real page-based pagination (?page=2) never actually
 * kicks in here since the API returns every post in one page (pageSize
 * 20 vs. 8 seeded posts total), so a Link to "page 2" was permanently
 * dead. This reveals from posts already fetched, which is both simpler
 * and honest about what's actually happening.
 */
export function LatestArticlesGrid({ posts, locale }: { posts: BlogPostSummary[]; locale: Locale }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? posts : posts.slice(0, INITIAL_COUNT);
  const hiddenCount = posts.length - INITIAL_COUNT;

  if (posts.length === 0) return null;

  return (
    <div>
      <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visible.map((post) => (
          <StaggerItem key={post.slug}>
            <BlogPostCard post={post} locale={locale} />
          </StaggerItem>
        ))}
      </StaggerContainer>

      {hiddenCount > 0 && !expanded ? (
        <div className="mt-8 flex justify-center">
          <button type="button" onClick={() => setExpanded(true)} className="group flex flex-col items-center gap-2">
            <span className="relative flex h-14 w-14 items-center justify-center">
              {/* The spinning dotted ring — purely decorative, signals
                  "more to reveal" the same way a loading ring signals
                  "in progress". */}
              <motion.span
                aria-hidden
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-brand-secondary/60"
              />
              <motion.span
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/15 text-brand-primary transition-colors group-hover:bg-brand-primary group-hover:text-white"
              >
                <ChevronDown className="h-5 w-5" aria-hidden />
              </motion.span>
            </span>
            <span className="text-sm font-semibold text-[var(--color-text-primary)] transition-colors group-hover:text-brand-primary">
              {locale === "ar" ? `تصفح المزيد (${hiddenCount})` : `Browse more (${hiddenCount})`}
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
