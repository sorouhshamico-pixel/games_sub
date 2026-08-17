import { useLocale, useTranslations } from "next-intl";
import { SiVisa, SiMastercard, SiApplepay } from "react-icons/si";
import { ShahnooIcon } from "@gcc-store/ui";
import { Link } from "@/i18n/navigation";
import { AppleIcon, PlayStoreIcon } from "./home/icons";

// mada has no Simple Icons entry (Saudi-specific network) — kept as a
// text-only chip alongside the icon-bearing brands.
const paymentBadges: Array<{ name: string; Icon?: typeof SiVisa }> = [
  { name: "Visa", Icon: SiVisa },
  { name: "Mastercard", Icon: SiMastercard },
  { name: "mada" },
  { name: "Apple Pay", Icon: SiApplepay },
];

export function SiteFooter() {
  const t = useTranslations();
  const locale = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <ShahnooIcon className="h-6 w-6" />
            <span className="font-semibold text-[var(--color-text-primary)]">{t("brand.name")}</span>
            {locale === "ar" ? (
              <span className="text-[9px] font-semibold tracking-[0.2em] text-brand-secondary">SHAHNOO</span>
            ) : null}
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">{t("brand.tagline")}</p>
        </div>
        <div>
          <p className="mb-3 font-semibold text-[var(--color-text-primary)]">{t("footer.legalTitle")}</p>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link href="/pages/terms" className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                {t("footer.terms")}
              </Link>
            </li>
            <li>
              <Link href="/pages/privacy" className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                {t("footer.privacy")}
              </Link>
            </li>
            <li>
              <Link href="/pages/refunds" className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                {t("footer.refunds")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-semibold text-[var(--color-text-primary)]">{t("footer.contactTitle")}</p>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link href="/pages/faq" className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                {t("nav.help")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] px-4 py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="me-1 text-xs font-medium text-[var(--color-text-muted)]">
              {locale === "ar" ? "طرق الدفع" : "Payment methods"}
            </span>
            {paymentBadges.map(({ name, Icon }) => (
              <span
                key={name}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-text-primary)]"
              >
                {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden /> : null}
                {name}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="me-1 text-xs font-medium text-[var(--color-text-muted)]">
              {locale === "ar" ? "قريبًا" : "Coming soon"}
            </span>
            <span className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--color-text-muted)]">
              <AppleIcon className="h-3.5 w-3.5" />
              App Store
            </span>
            <span className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--color-text-muted)]">
              <PlayStoreIcon className="h-3.5 w-3.5" />
              Google Play
            </span>
          </div>
        </div>
        <p className="mx-auto mt-4 max-w-7xl text-center text-[11px] text-[var(--color-text-muted)]">
          {locale === "ar"
            ? "بوابة الدفع النشطة حاليًا للتجربة فقط — طرق الدفع أعلاه توضيحية للعرض"
            : "The live payment gateway is for testing only — payment methods above are illustrative"}
        </p>
      </div>

      <div className="border-t border-[var(--color-border)] px-4 py-4 text-center text-xs text-[var(--color-text-muted)]">
        {t("brand.name")} © {year} — {t("footer.rightsReserved")}
      </div>
    </footer>
  );
}
