import { useLocale } from "next-intl";
import { formatMoney } from "@gcc-store/ui";
import type { ProductSummary } from "@gcc-store/contracts";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@gcc-store/i18n";
import { ProductImagePlaceholder } from "./ProductImagePlaceholder";

export function ProductCard({ product }: { product: ProductSummary }) {
  const locale = useLocale() as Locale;
  const name = locale === "ar" ? product.nameAr : product.nameEn;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-all hover:-translate-y-1 hover:border-brand-primary/60 hover:shadow-xl hover:shadow-brand-primary/10"
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
        {product.isDemoData ? (
          <span
            data-demo-badge
            className="absolute top-2 start-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm"
          >
            {locale === "ar" ? "تجريبي" : "Demo"}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <p className="line-clamp-2 text-sm font-medium leading-snug text-[var(--color-text-primary)]">{name}</p>
        <div className="mt-auto">
          <p className="text-xs text-[var(--color-text-muted)]">{locale === "ar" ? "يبدأ من" : "Starting from"}</p>
          <p className="text-base font-bold text-brand-accent">
            {formatMoney(product.fromPriceMinorUnits, product.currency, locale)}
          </p>
        </div>
      </div>
    </Link>
  );
}
