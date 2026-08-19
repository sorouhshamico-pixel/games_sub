"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Gamepad2 } from "lucide-react";
import type { Locale } from "@gcc-store/i18n";
import { Link } from "@/i18n/navigation";
import { HoverCard } from "@/components/motion";
import { spring } from "@/lib/motion/tokens";
import type { GameBrandSummary } from "@gcc-store/contracts";

// Physical (not RTL-logical) — a scrollBy({left}) delta is a physical
// viewport shift in every browser regardless of `dir`, so the button
// sitting physically on the left always nudges the view left and the one
// on the right always nudges it right — same reasoning as the homepage's
// BrandTiles slider, reused here for consistency.
const SCROLL_STEP = 240;

/**
 * Real native horizontal scroll (touch-drag, wheel, keyboard) with snap
 * points and a pair of glass arrow buttons, replacing the old flex-wrap
 * chip row. A generic gamepad icon stands in for brands without a real
 * logoUrl instead of a single-letter avatar.
 */
export function BrandSlider({ brands, locale }: { brands: GameBrandSummary[]; locale: Locale }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    updateEdges();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, [updateEdges]);

  function scrollByStep(direction: -1 | 1) {
    scrollerRef.current?.scrollBy({ left: direction * SCROLL_STEP, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [mask-image:linear-gradient(to_right,transparent,black_2%,black_98%,transparent)] [&::-webkit-scrollbar]:hidden"
      >
        {brands.map((brand) => {
          const name = locale === "ar" ? brand.nameAr : brand.nameEn;
          return (
            <HoverCard key={brand.slug} className="shrink-0 snap-start">
              <Link
                href={`/games/${brand.slug}`}
                className="group flex items-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:border-brand-primary/60 hover:bg-brand-primary/5"
              >
                {brand.logoUrl ? (
                  <img src={brand.logoUrl} alt="" className="h-6 w-6 shrink-0 rounded-md object-cover" loading="lazy" />
                ) : (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-primary/15 text-brand-primary">
                    <Gamepad2 className="h-3.5 w-3.5" aria-hidden />
                  </span>
                )}
                <span className="whitespace-nowrap">{name}</span>
                <span aria-hidden className="text-brand-secondary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  {locale === "ar" ? "←" : "→"}
                </span>
              </Link>
            </HoverCard>
          );
        })}
      </div>

      <motion.button
        type="button"
        onClick={() => scrollByStep(-1)}
        disabled={atStart}
        aria-label={locale === "ar" ? "التمرير لليسار" : "Scroll left"}
        whileHover={atStart ? undefined : { scale: 1.1 }}
        whileTap={atStart ? undefined : { scale: 0.9 }}
        transition={{ type: "spring", ...spring }}
        className="absolute left-0 top-1/2 z-10 hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[var(--color-surface)]/95 text-[var(--color-text-primary)] shadow-lg shadow-black/20 backdrop-blur-md transition-opacity duration-300 hover:border-brand-primary/50 disabled:pointer-events-none disabled:opacity-0 sm:flex"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </motion.button>
      <motion.button
        type="button"
        onClick={() => scrollByStep(1)}
        disabled={atEnd}
        aria-label={locale === "ar" ? "التمرير لليمين" : "Scroll right"}
        whileHover={atEnd ? undefined : { scale: 1.1 }}
        whileTap={atEnd ? undefined : { scale: 0.9 }}
        transition={{ type: "spring", ...spring }}
        className="absolute right-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-white/10 bg-[var(--color-surface)]/95 text-[var(--color-text-primary)] shadow-lg shadow-black/20 backdrop-blur-md transition-opacity duration-300 hover:border-brand-primary/50 disabled:pointer-events-none disabled:opacity-0 sm:flex"
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </motion.button>
    </div>
  );
}
