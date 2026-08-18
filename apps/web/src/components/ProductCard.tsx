"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Heart } from "lucide-react";
import { formatMoney, cn } from "@gcc-store/ui";
import type { ProductSummary } from "@gcc-store/contracts";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@gcc-store/i18n";
import { ProductImagePlaceholder } from "./ProductImagePlaceholder";
import { HoverCard } from "./motion";

export function ProductCard({ product }: { product: ProductSummary }) {
  const locale = useLocale() as Locale;
  const name = locale === "ar" ? product.nameAr : product.nameEn;
  // Local-only wishlist toggle — there's no wishlist backend yet, so this
  // doesn't persist across reloads. It's a real, working UI interaction
  // (not a dead button), just not backed by an account-level feature yet.
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <HoverCard className="relative h-full">
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          setWishlisted((prev) => !prev);
        }}
        aria-pressed={wishlisted}
        aria-label={locale === "ar" ? "أضف للمفضلة" : "Add to wishlist"}
        className="absolute top-2 end-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
      >
        <Heart className={cn("h-3.5 w-3.5", wishlisted && "fill-danger text-danger")} aria-hidden />
      </button>
      <Link
        href={`/products/${product.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-black/0 transition-[border-color,box-shadow] duration-300 hover:border-brand-primary/60 hover:shadow-xl hover:shadow-brand-primary/10"
      >
        <div className="relative aspect-square w-full overflow-hidden bg-[var(--color-surface-elevated)]">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <ProductImagePlaceholder label={name.slice(0, 1)} />
          )}

          {/* Diagonal light sweep on hover — pure CSS transform/opacity,
              no JS, one pass per hover-enter. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
          />

          {product.isDemoData ? (
            <span
              data-demo-badge
              className="absolute top-2 start-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm"
            >
              {locale === "ar" ? "تجريبي" : "Demo"}
            </span>
          ) : null}

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent px-3 pb-2.5 pt-8">
            <p className="text-[10px] font-medium text-brand-accent">
              {locale === "ar" ? "شحن رقمي فوري" : "Instant digital delivery"}
            </p>
            <div className="mt-0.5 flex items-center gap-1">
              <StarIcon className="h-3.5 w-3.5 shrink-0 text-brand-accent" />
              <p className="truncate text-sm font-bold text-white">{name}</p>
            </div>
          </div>
        </div>
        <div className="p-3.5">
          <p className="text-xs text-[var(--color-text-muted)]">{locale === "ar" ? "يبدأ من" : "Starting from"}</p>
          <p className="text-base font-bold text-brand-accent">
            {formatMoney(product.fromPriceMinorUnits, product.currency, locale)}
          </p>
        </div>
      </Link>
    </HoverCard>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="m12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8-5.1-4.7 6.9-.8L12 2Z" />
    </svg>
  );
}
