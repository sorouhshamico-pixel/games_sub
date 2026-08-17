import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion";
import { GamepadIcon, WalletIcon, ShieldIcon, BoltIcon } from "./icons";
import type { Locale } from "@gcc-store/i18n";

const steps: Array<{ Icon: typeof GamepadIcon; ar: string; en: string }> = [
  { Icon: GamepadIcon, ar: "اختر المنتج أو الفئة", en: "Pick a product or category" },
  { Icon: WalletIcon, ar: "أدخل بيانات حسابك", en: "Enter your account details" },
  { Icon: ShieldIcon, ar: "ادفع بأمان", en: "Pay securely" },
  { Icon: BoltIcon, ar: "استلم رصيدك فورًا", en: "Get your top-up instantly" },
];

export function ProcessSteps({ locale }: { locale: Locale }) {
  return (
    <Reveal>
      <section
        aria-label={locale === "ar" ? "كيف تشحن" : "How it works"}
        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8"
      >
        <h2 className="mb-6 text-xl font-bold text-[var(--color-text-primary)] sm:text-2xl">
          {locale === "ar" ? "كيف تشحن في 4 خطوات بسيطة" : "How to top up in 4 simple steps"}
        </h2>
        <StaggerContainer className="grid gap-6 sm:grid-cols-4">
          {steps.map((step, index) => (
            <StaggerItem key={index}>
              <div className="relative flex flex-col items-center gap-3 text-center">
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-brand-primary px-2 py-0.5 text-[10px] font-bold text-white">
                  {index + 1}
                </span>
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary/15 to-brand-secondary/15 text-brand-primary">
                  <step.Icon className="h-6 w-6" />
                </span>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{locale === "ar" ? step.ar : step.en}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>
    </Reveal>
  );
}
