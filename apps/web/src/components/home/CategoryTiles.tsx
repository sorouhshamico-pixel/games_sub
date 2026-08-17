import type { CategorySummary } from "@/lib/api";
import { Link } from "@/i18n/navigation";
import { StaggerContainer, StaggerItem, HoverCard } from "@/components/motion";
import { categoryIconCycle } from "./icons";

export function CategoryTiles({ categories }: { categories: CategorySummary[] }) {
  return (
    <StaggerContainer className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {categories.map((category, index) => {
        const Icon = categoryIconCycle[index % categoryIconCycle.length]!;
        return (
          <StaggerItem key={category.slug}>
            <HoverCard>
              <Link
                href={{ pathname: "/games", query: { category: category.slug } }}
                className="flex h-full flex-col items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-6 text-center transition-colors hover:border-brand-primary/50"
              >
                <span
                  aria-hidden
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 text-brand-primary"
                >
                  <Icon className="h-6 w-6" />
                </span>
                <span className="text-sm font-medium text-[var(--color-text-primary)]">{category.name}</span>
              </Link>
            </HoverCard>
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
}
