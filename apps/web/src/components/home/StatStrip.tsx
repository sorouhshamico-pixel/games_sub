import { Reveal, StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/motion";
import { BoltIcon, ShieldIcon, HeadsetIcon } from "./icons";
import type { Locale } from "@gcc-store/i18n";

export function StatStrip({
  locale,
  productCount,
  brandCount,
  categoryCount,
}: {
  locale: Locale;
  productCount: number;
  brandCount: number;
  categoryCount: number;
}) {
  const stats = [
    { value: productCount, ar: "خيار شحن متاح", en: "top-up options" },
    { value: brandCount, ar: "لعبة ومنصة مدعومة", en: "supported games & platforms" },
    { value: categoryCount, ar: "فئة متنوعة", en: "categories" },
  ].filter((stat) => stat.value > 0);

  const badges = [
    { Icon: BoltIcon, ar: "تسليم فوري بعد تأكيد الدفع", en: "Instant delivery after payment" },
    { Icon: ShieldIcon, ar: "دفع آمن ومشفّر بالكامل", en: "Fully secure, encrypted payments" },
    { Icon: HeadsetIcon, ar: "دعم فني على مدار الساعة", en: "24/7 customer support" },
  ];

  return (
    <Reveal>
      <section className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-brand-primary/10 via-[var(--color-surface)] to-brand-secondary/10 p-6 sm:p-8">
        {stats.length > 0 ? (
          <div className="mb-8 grid gap-6 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <AnimatedCounter value={stat.value} className="text-3xl font-extrabold text-brand-primary" />
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">{locale === "ar" ? stat.ar : stat.en}</p>
              </div>
            ))}
          </div>
        ) : null}
        <StaggerContainer className="grid gap-4 sm:grid-cols-3">
          {badges.map((badge, index) => (
            <StaggerItem key={index}>
              <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <badge.Icon className="h-5 w-5" />
                </span>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{locale === "ar" ? badge.ar : badge.en}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>
    </Reveal>
  );
}
