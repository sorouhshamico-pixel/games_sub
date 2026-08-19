"use client";

import { motion } from "motion/react";
import { Gamepad2, Gift, LayoutGrid, PlayCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { spring } from "@/lib/motion/tokens";
import type { CategorySummary } from "@/lib/api";
import type { Locale } from "@gcc-store/i18n";

// Same icon-per-category mapping as the homepage's CategoryTiles, so the
// two surfaces read as one system instead of picking icons independently.
const categoryIcons: Record<string, typeof Gamepad2> = {
  "game-topups": Gamepad2,
  subscriptions: PlayCircle,
  "gift-cards": Gift,
};

export function GameCategoryFilter({
  categories,
  activeCategory,
  locale,
}: {
  categories: CategorySummary[];
  activeCategory?: string;
  locale: Locale;
}) {
  return (
    <div className="flex flex-wrap gap-2.5" role="navigation" aria-label={locale === "ar" ? "تصفية حسب الفئة" : "Filter by category"}>
      <FilterPill href="/games" active={!activeCategory} Icon={LayoutGrid} label={locale === "ar" ? "الكل" : "All"} />
      {categories.map((c) => (
        <FilterPill
          key={c.slug}
          href={{ pathname: "/games", query: { category: c.slug } }}
          active={activeCategory === c.slug}
          Icon={categoryIcons[c.slug] ?? Gamepad2}
          label={c.name}
        />
      ))}
    </div>
  );
}

function FilterPill({
  href,
  active,
  Icon,
  label,
}: {
  href: Parameters<typeof Link>[0]["href"];
  active: boolean;
  Icon: typeof Gamepad2;
  label: string;
}) {
  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", ...spring }} className="relative">
      {active ? (
        <motion.span
          aria-hidden
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0.5, 0.85, 0.5], scale: 1 }}
          transition={{ opacity: { duration: 2.4, repeat: Infinity, ease: "easeInOut" }, scale: { type: "spring", ...spring } }}
          className="absolute inset-0 -z-10 rounded-full bg-brand-primary/50 blur-md"
        />
      ) : null}
      <Link
        href={href}
        className={`relative flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
          active
            ? "border-brand-primary bg-brand-primary text-white shadow-lg shadow-brand-primary/30"
            : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-brand-primary/50"
        }`}
      >
        <Icon className="h-4 w-4" aria-hidden />
        {label}
      </Link>
    </motion.div>
  );
}
