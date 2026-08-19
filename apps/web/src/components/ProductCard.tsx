"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Heart, Plus, Check, Loader2 } from "lucide-react";
import { formatMoney, cn } from "@gcc-store/ui";
import type { ProductSummary } from "@gcc-store/contracts";
import { Link, useRouter } from "@/i18n/navigation";
import type { Locale } from "@gcc-store/i18n";
import { getProductBySlug } from "@/lib/api";
import { cartItemKey } from "@/lib/cart";
import { ProductImagePlaceholder } from "./ProductImagePlaceholder";
import { HoverCard } from "./motion";
import { useDisplayCurrency } from "./CurrencyProvider";
import { useCart } from "./CartProvider";
import { convertMinorUnits } from "@/lib/currency";
import { duration, easing, spring } from "@/lib/motion/tokens";

type QuickAddState = "idle" | "loading" | "added";

export function ProductCard({ product }: { product: ProductSummary }) {
  const locale = useLocale() as Locale;
  const name = locale === "ar" ? product.nameAr : product.nameEn;
  const { currency: displayCurrency } = useDisplayCurrency();
  const displayAmount = convertMinorUnits(product.fromPriceMinorUnits, product.currency, displayCurrency);
  const { addItem } = useCart();
  const router = useRouter();
  // Local-only wishlist toggle — there's no wishlist backend yet, so this
  // doesn't persist across reloads. It's a real, working UI interaction
  // (not a dead button), just not backed by an account-level feature yet.
  const [wishlisted, setWishlisted] = useState(false);
  const [quickAdd, setQuickAdd] = useState<QuickAddState>("idle");

  // A summary card only has "starting from" pricing — no variant list, no
  // custom-input schema. So a real quick-add fetches the full product on
  // click: if it has an active variant AND needs no required fields (a
  // player ID, an email, etc.), it adds that cheapest variant directly;
  // otherwise there's no honest way to skip the required inputs, so it
  // falls through to the real product page instead of pretending to add
  // something incomplete.
  async function handleQuickAdd(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (quickAdd === "loading") return;
    setQuickAdd("loading");
    try {
      const detail = await getProductBySlug(product.slug);
      const cheapestActive = [...detail.variants].filter((v) => v.isActive).sort((a, b) => a.listPriceMinorUnits - b.listPriceMinorUnits)[0];
      if (!cheapestActive || detail.inputSchema.length > 0) {
        setQuickAdd("idle");
        router.push(`/products/${product.slug}`);
        return;
      }
      addItem({
        key: cartItemKey(cheapestActive.id, {}),
        productSlug: product.slug,
        variantId: cheapestActive.id,
        nameAr: product.nameAr,
        nameEn: product.nameEn,
        variantNameAr: cheapestActive.nameAr,
        variantNameEn: cheapestActive.nameEn,
        unitPriceMinorUnits: cheapestActive.listPriceMinorUnits,
        currency: cheapestActive.currency,
        quantity: 1,
        inputValues: {},
      });
      setQuickAdd("added");
      window.setTimeout(() => setQuickAdd("idle"), 1600);
    } catch {
      setQuickAdd("idle");
      router.push(`/products/${product.slug}`);
    }
  }

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
        <div className="flex items-center justify-between gap-2 p-3.5">
          <div className="min-w-0">
            <p className="text-xs text-[var(--color-text-muted)]">{locale === "ar" ? "يبدأ من" : "Starting from"}</p>
            <p className="truncate text-base font-bold text-brand-accent">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={displayCurrency}
                  initial={{ opacity: 0, y: -3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 3 }}
                  transition={{ duration: duration.fast, ease: easing }}
                  className="inline-block"
                >
                  {formatMoney(displayAmount, displayCurrency, locale)}
                </motion.span>
              </AnimatePresence>
            </p>
          </div>

          {/* Quick-add — a glowing circular FAB that morphs plus -> spinner
              -> check, so the whole round trip (fetch variant, add to
              cart) reads as one continuous gesture instead of a dead
              click-and-wait. */}
          <motion.button
            type="button"
            onClick={handleQuickAdd}
            disabled={quickAdd === "loading"}
            aria-label={locale === "ar" ? "أضف للسلة بسرعة" : "Quick add to cart"}
            whileHover={quickAdd === "idle" ? { scale: 1.1, rotate: 90 } : undefined}
            whileTap={quickAdd === "idle" ? { scale: 0.9 } : undefined}
            transition={{ type: "spring", ...spring }}
            className={cn(
              "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-lg transition-colors",
              quickAdd === "added" ? "bg-success shadow-success/40" : "bg-gradient-to-br from-brand-primary to-brand-secondary shadow-brand-primary/40",
            )}
          >
            {quickAdd === "idle" ? (
              <motion.span
                aria-hidden
                className="absolute inset-0 -z-10 rounded-full bg-brand-primary/50 blur-md"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
            ) : null}
            <AnimatePresence mode="wait" initial={false}>
              {quickAdd === "loading" ? (
                <motion.span key="loading" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden />
                </motion.span>
              ) : quickAdd === "added" ? (
                <motion.span
                  key="added"
                  initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ type: "spring", ...spring }}
                >
                  <Check className="h-4.5 w-4.5" aria-hidden />
                </motion.span>
              ) : (
                <motion.span key="idle" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}>
                  <Plus className="h-4.5 w-4.5" aria-hidden />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
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
