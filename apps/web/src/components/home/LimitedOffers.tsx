"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { formatMoney } from "@gcc-store/ui";
import type { ProductSummary } from "@gcc-store/contracts";
import type { Locale } from "@gcc-store/i18n";
import { Link } from "@/i18n/navigation";
import { Reveal, StaggerContainer, StaggerItem, HoverCard } from "@/components/motion";
import { ProductImagePlaceholder } from "@/components/ProductImagePlaceholder";
import { BoltIcon } from "./icons";

const OFFER_WINDOW_MS = 6 * 60 * 60 * 1000;
const demoDiscountPercents = [15, 20, 10, 25];

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  return {
    h: Math.floor(totalSeconds / 3600),
    m: Math.floor((totalSeconds % 3600) / 60),
    s: totalSeconds % 60,
  };
}

/** Investor-demo illustrative promo strip — not backed by a real campaign/
 * discount model. Prices shown are always the product's real listed price;
 * the "-X%" ribbon is decorative only and never changes what checkout
 * charges. Countdown starts at a fixed window post-mount (server and first
 * client render both show the same static value) so it never causes a
 * hydration mismatch. */
export function LimitedOffers({ products, locale }: { products: ProductSummary[]; locale: Locale }) {
  const t = useTranslations();
  const [msLeft, setMsLeft] = useState(OFFER_WINDOW_MS);

  useEffect(() => {
    const target = Date.now() + OFFER_WINDOW_MS;
    const tick = () => setMsLeft(Math.max(0, target - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (products.length === 0) return null;
  const { h, m, s } = formatDuration(msLeft);

  return (
    <Reveal>
      <section
        id="limited-offers"
        className="scroll-mt-28"
        aria-label={locale === "ar" ? "عروض لفترة محدودة" : "Limited time offers"}
      >
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-bold text-[var(--color-text-primary)] sm:text-2xl">
            <span aria-hidden className="flex h-7 w-7 items-center justify-center rounded-lg bg-danger/15 text-danger">
              <BoltIcon className="h-4 w-4" />
            </span>
            {locale === "ar" ? "عروض لفترة محدودة" : "Limited time offers"}
          </h2>
          <div
            role="timer"
            aria-live="off"
            className="flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 font-mono text-sm tabular-nums text-[var(--color-text-primary)]"
          >
            <span>{String(h).padStart(2, "0")}</span>:<span>{String(m).padStart(2, "0")}</span>:<span>{String(s).padStart(2, "0")}</span>
          </div>
        </div>
        <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {products.map((product, index) => {
            const name = locale === "ar" ? product.nameAr : product.nameEn;
            return (
              <StaggerItem key={product.id}>
                <HoverCard className="h-full">
                  <Link
                    href={`/products/${product.slug}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors hover:border-danger/50"
                  >
                    <span className="absolute top-2 start-2 z-10 rounded-full bg-danger px-2 py-0.5 text-[10px] font-bold text-white">
                      -{demoDiscountPercents[index % demoDiscountPercents.length]}%
                    </span>
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
                    </div>
                    <div className="p-3">
                      <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">{name}</p>
                      <p className="mt-0.5 text-sm font-bold text-brand-accent">
                        {formatMoney(product.fromPriceMinorUnits, product.currency, locale)}
                      </p>
                    </div>
                  </Link>
                </HoverCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
        <p className="mt-3 text-xs text-[var(--color-text-muted)]">{t("common.demoDataNotice")}</p>
      </section>
    </Reveal>
  );
}
