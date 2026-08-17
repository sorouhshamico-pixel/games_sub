import type { Locale } from "@gcc-store/i18n";
import { Reveal, StaggerContainer, StaggerItem, HoverCard } from "@/components/motion";
import { SectionHeading } from "./SectionHeading";
import { StarIcon } from "./icons";

// Cycled gradient rings so avatars read as distinct, colorful placeholders
// rather than a flat single-letter tile — deliberately not real photos of
// people, since a stock headshot next to a fabricated quote would falsely
// imply a specific real customer said it.
const avatarGradients = [
  "from-brand-primary to-brand-secondary",
  "from-brand-secondary to-brand-accent",
  "from-brand-accent to-brand-primary",
];

const reviews: Array<{ ar: { name: string; quote: string }; en: { name: string; quote: string } }> = [
  {
    ar: { name: "فيصل", quote: "شحن سريع جدًا ووصل الرصيد خلال دقائق من إتمام الدفع." },
    en: { name: "Faisal", quote: "Super fast — my balance arrived within minutes of paying." },
  },
  {
    ar: { name: "نورة", quote: "واجهة بسيطة وواضحة، ولقيت اللعبة اللي أبيها بسهولة." },
    en: { name: "Noura", quote: "Clean, simple interface — found what I needed right away." },
  },
  {
    ar: { name: "عبدالله", quote: "الدعم الفني رد علي بسرعة لما واجهت استفسار بسيط." },
    en: { name: "Abdullah", quote: "Support answered quickly when I had a simple question." },
  },
];

/** Investor-demo illustrative reviews — first names only, no photos or
 * ratings tied to real accounts, clearly labeled as demo data. */
export function Testimonials({ locale }: { locale: Locale }) {
  return (
    <Reveal>
      <section aria-label={locale === "ar" ? "آراء عملائنا" : "What our customers say"}>
        <SectionHeading title={locale === "ar" ? "آراء عملائنا" : "What our customers say"} />
        <StaggerContainer className="grid gap-4 sm:grid-cols-3">
          {reviews.map((review, index) => {
            const { name, quote } = locale === "ar" ? review.ar : review.en;
            return (
              <StaggerItem key={index}>
                <HoverCard className="h-full">
                  <div className="flex h-full flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                    <div className="flex items-center gap-1 text-brand-accent">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <StarIcon key={starIndex} className="h-3.5 w-3.5" />
                      ))}
                    </div>
                    <p className="grow text-sm leading-relaxed text-[var(--color-text-muted)]">“{quote}”</p>
                    <div className="flex items-center gap-2.5 border-t border-[var(--color-border)] pt-3">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${avatarGradients[index % avatarGradients.length]}`}
                      >
                        {name.slice(0, 1)}
                      </span>
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">{name}</span>
                    </div>
                  </div>
                </HoverCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
        <p className="mt-3 text-xs text-[var(--color-text-muted)]">
          {locale === "ar" ? "بيانات تجريبية لأغراض العرض فقط" : "Demo data for display purposes only"}
        </p>
      </section>
    </Reveal>
  );
}
