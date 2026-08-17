import type { Locale } from "@gcc-store/i18n";
import { Link } from "@/i18n/navigation";
import { HoverCard } from "@/components/motion";

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

export function BrandTiles({ locale }: { locale: Locale }) {
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {games.map((game) => {
        const name = locale === "ar" ? game.ar : game.en;
        return (
          <HoverCard key={name} className="shrink-0 snap-start">
            <Link
              href="/games"
              className="flex w-24 flex-col items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center transition-colors hover:border-brand-primary/50"
            >
              <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-[var(--color-surface-elevated)]">
                <img src={game.imgSrc} alt="" aria-hidden className="h-full w-full object-cover" loading="lazy" />
              </span>
              <span className="w-full truncate text-xs font-medium text-[var(--color-text-primary)]">{name}</span>
            </Link>
          </HoverCard>
        );
      })}
    </div>
  );
}
