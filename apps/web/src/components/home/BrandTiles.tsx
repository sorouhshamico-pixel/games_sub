"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Locale } from "@gcc-store/i18n";
import { Link } from "@/i18n/navigation";
import { HoverCard } from "@/components/motion";
import { spring } from "@/lib/motion/tokens";

// Curated per user request, all backed by real supplied artwork (see
// public/images/most-requested/ — four items reused from that section,
// four uploaded separately for this one). Not driven by the real catalog
// (which only has demo brands), so tiles link to the general browse page
// rather than a filtered URL that would come back empty.
const games: Array<{ imgSrc: string; ar: string; en: string }> = [
  { imgSrc: "/images/most-requested/pubg-mobile.png", ar: "ببجي", en: "PUBG" },
  { imgSrc: "/images/most-requested/yalla-ludo.png", ar: "يلا لودو", en: "Yalla Ludo" },
  { imgSrc: "/images/most-requested/rom-maintenance.png", ar: "صيانة الرومات", en: "ROM maintenance" },
  { imgSrc: "/images/most-requested/jawaker.png", ar: "جواكر", en: "Jawaker" },
  { imgSrc: "/images/most-requested/bigo-live.png", ar: "بيقو لايف", en: "Bigo Live" },
  { imgSrc: "/images/most-requested/playstation.png", ar: "بلايستيشن", en: "PlayStation" },
  { imgSrc: "/images/most-requested/marvel-rivals.png", ar: "مارفل رايفلز", en: "Marvel Rivals" },
  { imgSrc: "/images/most-requested/free-fire.png", ar: "فري فاير", en: "Free Fire" },
];

function Tile({ game, locale }: { game: (typeof games)[number]; locale: Locale }) {
  const name = locale === "ar" ? game.ar : game.en;
  return (
    <HoverCard className="shrink-0 snap-start">
      <Link href="/games" className="group flex w-24 flex-col items-center gap-2.5 sm:w-28">
        <span className="relative block aspect-square w-full overflow-hidden rounded-2xl shadow-lg shadow-black/30 ring-1 ring-white/10 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-brand-primary/25 group-hover:ring-2 group-hover:ring-brand-primary/60">
          <img src={game.imgSrc} alt="" aria-hidden className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </span>
        <span className="w-full truncate text-center text-sm font-semibold text-[var(--color-text-primary)]">{name}</span>
      </Link>
    </HoverCard>
  );
}

// Physical (not RTL-logical) — a scrollBy({left}) delta is a physical
// viewport shift in every browser regardless of `dir`, so the button
// sitting physically on the left always nudges the view left and the one
// on the right always nudges it right. Simplest correct behavior for
// both locales, no sign-flipping per direction needed.
const SCROLL_STEP = 220;

/**
 * Real native horizontal scroll (touch-drag, mouse-wheel, keyboard) with
 * snap points and a pair of glass arrow buttons for anyone who'd rather
 * click — replacing the old pure-CSS auto-marquee, which had no way to
 * pause and look at a specific tile without hovering to freeze it.
 */
export function BrandTiles({ locale }: { locale: Locale }) {
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
    <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-brand-primary/5 via-[var(--color-surface)] to-brand-secondary/5 p-4 sm:p-6">
      <motion.div
        aria-hidden
        animate={{ x: [0, 14, -10, 0], y: [0, -8, 6, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-10 start-1/3 -z-0 h-40 w-40 rounded-full bg-brand-primary/10 blur-3xl"
      />

      <div
        ref={scrollerRef}
        className="relative flex snap-x snap-mandatory gap-5 overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [mask-image:linear-gradient(to_right,transparent,black_2%,black_98%,transparent)] [&::-webkit-scrollbar]:hidden"
      >
        {games.map((game) => (
          <Tile key={game.en} game={game} locale={locale} />
        ))}
      </div>

      <motion.button
        type="button"
        onClick={() => scrollByStep(-1)}
        disabled={atStart}
        aria-label={locale === "ar" ? "التمرير لليسار" : "Scroll left"}
        whileHover={atStart ? undefined : { scale: 1.1 }}
        whileTap={atStart ? undefined : { scale: 0.9 }}
        transition={{ type: "spring", ...spring }}
        className="absolute left-1 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[var(--color-surface)]/90 text-[var(--color-text-primary)] shadow-lg shadow-black/20 backdrop-blur-md transition-opacity duration-300 hover:border-brand-primary/50 disabled:pointer-events-none disabled:opacity-0 sm:flex"
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
        className="absolute right-1 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[var(--color-surface)]/90 text-[var(--color-text-primary)] shadow-lg shadow-black/20 backdrop-blur-md transition-opacity duration-300 hover:border-brand-primary/50 disabled:pointer-events-none disabled:opacity-0 sm:flex"
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </motion.button>
    </div>
  );
}
