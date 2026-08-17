import { Gift, PlayCircle, Gamepad2 } from "lucide-react";
import type { CategorySummary } from "@/lib/api";
import type { Locale } from "@gcc-store/i18n";
import { Link } from "@/i18n/navigation";
import { StaggerContainer, StaggerItem, HoverCard } from "@/components/motion";

// Keyed by the real seeded category slugs — icon + subtitle pairing per
// category, since the API only returns a bare {slug, name}.
const categoryMeta: Record<string, { Icon: typeof Gift; ar: string; en: string }> = {
  "gift-cards": { Icon: Gift, ar: "الهدية المثالية", en: "The perfect gift" },
  subscriptions: { Icon: PlayCircle, ar: "منصات وباقات", en: "Platforms & plans" },
  "game-topups": { Icon: Gamepad2, ar: "ألعابك المفضلة", en: "Your favorite games" },
};

export function CategoryTiles({ categories, locale }: { categories: CategorySummary[]; locale: Locale }) {
  return (
    <StaggerContainer className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {categories.map((category) => {
        const meta = categoryMeta[category.slug];
        const Icon = meta?.Icon ?? Gamepad2;
        return (
          <StaggerItem key={category.slug}>
            <HoverCard>
              <Link
                href={{ pathname: "/games", query: { category: category.slug } }}
                className="flex h-full items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5 transition-colors hover:border-brand-primary/50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">{category.name}</p>
                  {meta ? (
                    <p className="truncate text-xs text-[var(--color-text-muted)]">{locale === "ar" ? meta.ar : meta.en}</p>
                  ) : null}
                </div>
                <span
                  aria-hidden
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/15 text-brand-primary"
                >
                  <Icon className="h-5 w-5" />
                </span>
              </Link>
            </HoverCard>
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
}
