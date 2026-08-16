import { useLocale } from "next-intl";
import { formatMoney } from "@gcc-store/ui";
import type { ProductSummary } from "@gcc-store/contracts";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@gcc-store/i18n";

export function ProductCard({ product }: { product: ProductSummary }) {
  const locale = useLocale() as Locale;
  const name = locale === "ar" ? product.nameAr : product.nameEn;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-transform hover:-translate-y-0.5 hover:border-brand-primary/60"
    >
      <div className="aspect-square w-full bg-[var(--color-surface-elevated)]">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-[var(--color-text-muted)]">
            {name.slice(0, 1)}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 text-sm font-medium text-[var(--color-text-primary)]">{name}</p>
        <p className="mt-auto text-sm font-semibold text-brand-accent">
          {formatMoney(product.fromPriceMinorUnits, product.currency, locale)}
        </p>
        {product.isDemoData ? (
          <p className="text-xs text-[var(--color-text-muted)]" data-demo-badge>
            {locale === "ar" ? "بيانات تجريبية" : "Demo data"}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
