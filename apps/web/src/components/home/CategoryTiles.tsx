import Image from "next/image";
import { Gift, PlayCircle, Gamepad2 } from "lucide-react";
import type { CategorySummary } from "@/lib/api";
import type { Locale } from "@gcc-store/i18n";
import { Link } from "@/i18n/navigation";
import { StaggerContainer, StaggerItem, HoverCard } from "@/components/motion";

// Keyed by the real seeded category slugs — icon, subtitle, and a real
// cover photo per category, since the API only returns a bare {slug, name}.
const categoryMeta: Record<string, { Icon: typeof Gift; image: string; ar: string; en: string }> = {
  "gift-cards": { Icon: Gift, image: "/images/blog/gift-box-dark.jpg", ar: "الهدية المثالية", en: "The perfect gift" },
  subscriptions: { Icon: PlayCircle, image: "/images/blog/laptop-relaxing.jpg", ar: "منصات وباقات", en: "Platforms & plans" },
  "game-topups": { Icon: Gamepad2, image: "/images/blog/mobile-gaming.jpg", ar: "ألعابك المفضلة", en: "Your favorite games" },
};

export function CategoryTiles({ categories, locale }: { categories: CategorySummary[]; locale: Locale }) {
  return (
    <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {categories.map((category) => {
        const meta = categoryMeta[category.slug];
        const Icon = meta?.Icon ?? Gamepad2;
        return (
          <StaggerItem key={category.slug}>
            <HoverCard className="group h-full">
              <Link
                href={{ pathname: "/games", query: { category: category.slug } }}
                className="relative flex aspect-[4/3] w-full flex-col justify-end overflow-hidden rounded-3xl border border-[var(--color-border)] transition-colors hover:border-brand-primary/50"
              >
                {meta ? (
                  <Image
                    src={meta.image}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : null}
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/5" />

                <span
                  aria-hidden
                  className="absolute top-4 start-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110"
                >
                  <Icon className="h-6 w-6" />
                </span>

                <div className="relative flex flex-col gap-1 p-5">
                  <p className="text-xl font-bold text-white">{category.name}</p>
                  {meta ? <p className="text-sm text-white/75">{locale === "ar" ? meta.ar : meta.en}</p> : null}
                  <span className="mt-1 flex items-center gap-1 text-sm font-semibold text-brand-secondary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {locale === "ar" ? "تصفح الآن" : "Browse now"} →
                  </span>
                </div>
              </Link>
            </HoverCard>
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
}
