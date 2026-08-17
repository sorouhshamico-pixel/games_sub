import { SiPlaystation, SiNetflix, SiSteam, SiSpotify, SiDiscord, SiEpicgames } from "react-icons/si";
import type { Locale } from "@gcc-store/i18n";
import { Link } from "@/i18n/navigation";
import { Reveal, StaggerContainer, StaggerItem, HoverCard } from "@/components/motion";
import { SectionHeading } from "./SectionHeading";

const platforms = [
  { Icon: SiPlaystation, name: "PlayStation" },
  { Icon: SiNetflix, name: "Netflix" },
  { Icon: SiSteam, name: "Steam" },
  { Icon: SiSpotify, name: "Spotify" },
  { Icon: SiDiscord, name: "Discord" },
  { Icon: SiEpicgames, name: "Epic Games" },
];

/**
 * Investor-demo "most requested" showcase — real Simple Icons brand marks
 * (not photos/screenshots we don't have rights to), used the same way any
 * top-up marketplace shows the platforms it targets. The current seeded
 * catalog doesn't actually stock these specific platforms yet (it's demo
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
          {platforms.map(({ Icon, name }) => (
            <StaggerItem key={name}>
              <HoverCard className="h-full">
                <Link
                  href="/games"
                  className="flex h-full flex-col items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center transition-colors hover:border-brand-primary/50"
                >
                  <Icon className="h-8 w-8 text-[var(--color-text-primary)]" aria-hidden />
                  <span className="text-xs font-medium text-[var(--color-text-primary)]">{name}</span>
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
