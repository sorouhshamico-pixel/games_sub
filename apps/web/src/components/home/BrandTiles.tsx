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

// Rendered twice back-to-back so a linear -50% translateX loop is
// seamless — the classic zero-JS marquee technique. Pure CSS animation
// (see .animate-marquee in globals.css), paused on hover/focus and
// disabled entirely under prefers-reduced-motion.
function Tile({ game, locale }: { game: (typeof games)[number]; locale: Locale }) {
  const name = locale === "ar" ? game.ar : game.en;
  return (
    <HoverCard className="shrink-0">
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

export function BrandTiles({ locale }: { locale: Locale }) {
  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-brand-primary/5 via-[var(--color-surface)] to-brand-secondary/5 p-4 sm:p-6">
      <div className="overflow-hidden">
        <div className="animate-marquee flex w-max gap-5 py-1">
          {games.map((game) => (
            <Tile key={game.en} game={game} locale={locale} />
          ))}
          {games.map((game) => (
            <Tile key={`${game.en}-repeat`} game={game} locale={locale} />
          ))}
        </div>
      </div>
    </div>
  );
}
