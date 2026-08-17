import type { Locale } from "@gcc-store/i18n";
import { Link } from "@/i18n/navigation";
import { StaggerContainer, StaggerItem, HoverCard } from "@/components/motion";
import { blogCategories } from "@/lib/blogCategories";

export function CategoryFilter({ activeCategory, locale }: { activeCategory?: string; locale: Locale }) {
  return (
    <StaggerContainer className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {blogCategories.map((category) => {
        const isActive = category.slug === activeCategory;
        return (
          <StaggerItem key={category.slug}>
            <HoverCard>
              <Link
                href={{ pathname: "/blog", query: { category: category.slug } }}
                className={`flex h-full flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-colors ${
                  isActive
                    ? "border-brand-primary bg-brand-primary/10"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-brand-primary/50"
                }`}
              >
                <span
                  aria-hidden
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    isActive ? "bg-brand-primary text-white" : "bg-brand-primary/15 text-brand-primary"
                  }`}
                >
                  <category.Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-medium text-[var(--color-text-primary)]">
                  {locale === "ar" ? category.ar : category.en}
                </span>
              </Link>
            </HoverCard>
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
}
