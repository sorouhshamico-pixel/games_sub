"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowDownAZ, ArrowUpAZ, Check, RotateCcw, Sparkles, SlidersHorizontal } from "lucide-react";
import type { ProductSummary } from "@gcc-store/contracts";
import type { Locale } from "@gcc-store/i18n";
import { ProductCard } from "@/components/ProductCard";
import { useDisplayCurrency } from "@/components/CurrencyProvider";
import { convertMinorUnits, currencyAbbreviation } from "@/lib/currency";
import { StaggerContainer, StaggerItem } from "@/components/motion";
import { duration, easing, spring } from "@/lib/motion/tokens";

type SortOption = "default" | "price-asc" | "price-desc";

const sortOptions: Array<{ value: SortOption; Icon: typeof ArrowDownAZ; ar: string; en: string }> = [
  { value: "default", Icon: Sparkles, ar: "الأحدث", en: "Newest" },
  { value: "price-asc", Icon: ArrowDownAZ, ar: "السعر: من الأقل", en: "Price: low to high" },
  { value: "price-desc", Icon: ArrowUpAZ, ar: "السعر: من الأعلى", en: "Price: high to low" },
];

/**
 * Real client-side filtering/sorting over the products this page already
 * fetched — the catalog API doesn't support a price-range or sort query
 * param today, so rather than fake a server round trip this filters the
 * actual fetched list in the browser. Price bounds are compared in
 * whatever currency the header switcher currently shows, matching what
 * the shopper actually sees on each card.
 */
export function ProductsWithFilters({ products, locale }: { products: ProductSummary[]; locale: Locale }) {
  const { currency: displayCurrency } = useDisplayCurrency();
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const withDisplayAmount = useMemo(
    () => products.map((p) => ({ product: p, amount: convertMinorUnits(p.fromPriceMinorUnits, p.currency, displayCurrency) })),
    [products, displayCurrency],
  );

  const filtered = useMemo(() => {
    const min = minPrice.trim() ? Number(minPrice) * 100 : null;
    const max = maxPrice.trim() ? Number(maxPrice) * 100 : null;
    let list = withDisplayAmount.filter(({ amount }) => (min === null || amount >= min) && (max === null || amount <= max));
    if (sortBy === "price-asc") list = [...list].sort((a, b) => a.amount - b.amount);
    if (sortBy === "price-desc") list = [...list].sort((a, b) => b.amount - a.amount);
    return list.map(({ product }) => product);
  }, [withDisplayAmount, minPrice, maxPrice, sortBy]);

  const hasActiveFilters = sortBy !== "default" || minPrice.trim() !== "" || maxPrice.trim() !== "";

  function reset() {
    setSortBy("default");
    setMinPrice("");
    setMaxPrice("");
  }

  return (
    // First in DOM so it lands on the physical right in RTL (this store's
    // primary locale) — mirrors in LTR, same reasoning already used for
    // the hero image collages elsewhere on the site.
    <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
      <aside className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:sticky lg:top-24">
        <div aria-hidden className="pointer-events-none absolute -top-10 end-0 -z-10 h-32 w-32 rounded-full bg-brand-primary/10 blur-3xl" />

        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--color-text-primary)]">
            <SlidersHorizontal className="h-4 w-4 text-brand-secondary" aria-hidden />
            {locale === "ar" ? "تصفية النتائج" : "Filter results"}
          </h2>
          {hasActiveFilters ? (
            <motion.button
              type="button"
              onClick={reset}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", ...spring }}
              className="flex items-center gap-1 text-xs font-medium text-brand-secondary hover:underline"
            >
              <RotateCcw className="h-3 w-3" aria-hidden />
              {locale === "ar" ? "إعادة تعيين" : "Reset"}
            </motion.button>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            {locale === "ar" ? "ترتيب حسب" : "Sort by"}
          </p>
          {sortOptions.map((option) => {
            const active = sortBy === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSortBy(option.value)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-start text-sm transition-colors ${
                  active ? "bg-brand-primary/15 text-brand-primary" : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)]"
                }`}
              >
                <option.Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="flex-1">{locale === "ar" ? option.ar : option.en}</span>
                {active ? <Check className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
              </button>
            );
          })}
        </div>

        <div className="mt-5 border-t border-[var(--color-border)] pt-5">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            {locale === "ar" ? `النطاق السعري (${currencyAbbreviation[displayCurrency][locale]})` : `Price range (${currencyAbbreviation[displayCurrency][locale]})`}
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              inputMode="decimal"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder={locale === "ar" ? "من" : "Min"}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus-visible:border-brand-primary/60"
            />
            <span className="text-[var(--color-text-muted)]">—</span>
            <input
              type="number"
              min={0}
              inputMode="decimal"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder={locale === "ar" ? "إلى" : "Max"}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus-visible:border-brand-primary/60"
            />
          </div>
        </div>

        <p className="mt-5 border-t border-[var(--color-border)] pt-4 text-xs text-[var(--color-text-muted)]">
          {locale === "ar" ? `عرض ${filtered.length} من ${products.length} منتج` : `Showing ${filtered.length} of ${products.length} products`}
        </p>
      </aside>

      <div>
        {filtered.length > 0 ? (
          <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {filtered.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: duration.normal, ease: easing }}
            className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--color-border)] px-6 py-14 text-center"
          >
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {locale === "ar" ? "لا توجد منتجات تطابق هذا النطاق السعري" : "No products match this price range"}
            </p>
            <button type="button" onClick={reset} className="text-sm font-medium text-brand-secondary hover:underline">
              {locale === "ar" ? "إعادة تعيين الفلاتر" : "Reset filters"}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
