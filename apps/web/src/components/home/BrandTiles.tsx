import type { GameBrandSummary } from "@gcc-store/contracts";
import type { Locale } from "@gcc-store/i18n";
import { Link } from "@/i18n/navigation";
import { HoverCard } from "@/components/motion";
import { categoryIconCycle } from "./icons";

// Cycled per-tile so a row of brands without a real uploaded logoUrl still
// reads as colorful and distinct, instead of a wall of identical tiles.
const gradientCycle = [
  "from-brand-primary/70 to-brand-secondary/70",
  "from-brand-secondary/70 to-brand-accent/70",
  "from-brand-accent/70 to-brand-primary/70",
  "from-brand-primary/70 to-brand-accent/70",
];

export function BrandTiles({ brands, locale }: { brands: GameBrandSummary[]; locale: Locale }) {
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {brands.map((brand, index) => {
        const name = locale === "ar" ? brand.nameAr : brand.nameEn;
        const Icon = categoryIconCycle[index % categoryIconCycle.length]!;
        return (
          <HoverCard key={brand.slug} className="shrink-0 snap-start">
            <Link
              href={`/games/${brand.slug}`}
              className="flex w-24 flex-col items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center transition-colors hover:border-brand-primary/50"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl text-white ${
                  brand.logoUrl ? "" : `bg-gradient-to-br ${gradientCycle[index % gradientCycle.length]}`
                }`}
              >
                {brand.logoUrl ? (
                  <img src={brand.logoUrl} alt="" aria-hidden className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </span>
              <span className="w-full truncate text-xs font-medium text-[var(--color-text-primary)]">{name}</span>
            </Link>
          </HoverCard>
        );
      })}
    </div>
  );
}
