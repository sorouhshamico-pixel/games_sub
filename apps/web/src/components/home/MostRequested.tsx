import { Dices, Flame, Crosshair, Tv } from "lucide-react";
import { SiPlaystation, SiNetflix } from "react-icons/si";
import type { Locale } from "@gcc-store/i18n";
import { Link } from "@/i18n/navigation";
import { Reveal, StaggerContainer, StaggerItem, HoverCard } from "@/components/motion";
import { SectionHeading } from "./SectionHeading";

// PlayStation and Netflix use their real Simple Icons brand marks. Yalla
// Ludo / Free Fire / PUBG Mobile / Shahid have no entry in any general
// icon library (they're game/regional-service specific, not broad tech
// brands), so — per prior direction to keep original icons rather than
// reproduce trademarked game art we don't have rights to — they get a
// generic, thematically-fitting icon instead.
const platforms = [
  { Icon: Dices, ar: "بلا لودو", en: "Yalla Ludo", brand: false },
  { Icon: Flame, ar: "فري فاير", en: "Free Fire", brand: false },
  { Icon: Crosshair, ar: "ببجي موبايل", en: "PUBG Mobile", brand: false },
  { Icon: SiPlaystation, ar: "بلايستيشن", en: "PlayStation", brand: true },
  { Icon: SiNetflix, ar: "نتفليكس", en: "Netflix", brand: true },
  { Icon: Tv, ar: "شاهد", en: "Shahid", brand: false },
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
          {platforms.map(({ Icon, ar, en, brand }) => (
            <StaggerItem key={en}>
              <HoverCard className="h-full">
                <Link
                  href="/games"
                  className="flex h-full flex-col items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center transition-colors hover:border-brand-primary/50"
                >
                  <span
                    aria-hidden
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      brand ? "bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]" : "bg-brand-primary/15 text-brand-primary"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
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
