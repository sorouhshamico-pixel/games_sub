import Image from "next/image";
import type { Locale } from "@gcc-store/i18n";
import { Link } from "@/i18n/navigation";
import { Reveal, StaggerContainer, StaggerItem, HoverCard } from "@/components/motion";
import { SectionHeading } from "./SectionHeading";

const platforms = [
  { imgSrc: "/images/most-requested/yalla-ludo.png", ar: "بلا لودو", en: "Yalla Ludo" },
  { imgSrc: "/images/most-requested/free-fire.png", ar: "فري فاير", en: "Free Fire" },
  { imgSrc: "/images/most-requested/pubg-mobile.png", ar: "ببجي موبايل", en: "PUBG Mobile" },
  { imgSrc: "/images/most-requested/playstation.png", ar: "بلايستيشن", en: "PlayStation" },
  { imgSrc: "/images/most-requested/netflix.png", ar: "نتفليكس", en: "Netflix" },
  { imgSrc: "/images/most-requested/shahid.png", ar: "شاهد", en: "Shahid" },
];

/**
 * Investor-demo "most requested" showcase. The current seeded catalog
 * doesn't actually stock these specific games/platforms yet (it's demo
 * game/subscription/gift-card data), so each tile links to the general
 * browse page rather than a filtered URL that would come back empty, and
 * the section carries a demo-data disclaimer like the rest of the
 * illustrative homepage content.
 */
export function MostRequested({ locale }: { locale: Locale }) {
  return (
    <Reveal>
      <section aria-label={locale === "ar" ? "الأكثر طلبًا" : "Most requested"}>
        <SectionHeading title={locale === "ar" ? "الأكثر طلبًا" : "Most requested"} />
        <StaggerContainer className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {platforms.map(({ imgSrc, ar, en }) => (
            <StaggerItem key={en}>
              <HoverCard className="h-full">
                <Link
                  href="/games"
                  className="flex h-full flex-col items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center transition-colors hover:border-brand-primary/50"
                >
                  <span className="relative aspect-square w-full overflow-hidden rounded-xl bg-[var(--color-surface-elevated)]">
                    <Image src={imgSrc} alt="" fill sizes="120px" className="object-cover" />
                  </span>
                  <span className="text-xs font-medium text-[var(--color-text-primary)]">{locale === "ar" ? ar : en}</span>
                </Link>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
        <p className="mt-3 text-xs text-[var(--color-text-muted)]">
          {locale === "ar" ? "بيانات تجريبية لأغراض العرض فقط وليست أسعارًا فعلية" : "Demo data for display purposes only, not real prices"}
        </p>
      </section>
    </Reveal>
  );
}
