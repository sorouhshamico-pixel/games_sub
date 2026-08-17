import type { GameBrandSummary } from "@gcc-store/contracts";
import type { Locale } from "@gcc-store/i18n";
import { Link } from "@/i18n/navigation";
import { HoverCard } from "@/components/motion";

export function BrandTiles({ brands, locale }: { brands: GameBrandSummary[]; locale: Locale }) {
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {brands.map((brand) => {
        const name = locale === "ar" ? brand.nameAr : brand.nameEn;
        return (
          <HoverCard key={brand.slug} className="shrink-0 snap-start">
            <Link
              href={`/games/${brand.slug}`}
              className="flex w-24 flex-col items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center transition-colors hover:border-brand-primary/50"
            >
              <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-[var(--color-surface-elevated)] text-sm font-bold text-brand-primary">
                {brand.logoUrl ? (
                  <img src={brand.logoUrl} alt="" aria-hidden className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  name.slice(0, 1)
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
