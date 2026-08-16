import { useTranslations } from "next-intl";
import { LogoMark } from "@gcc-store/ui";
import { Link } from "@/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <LogoMark className="h-6 w-6" />
            <span className="font-semibold text-[var(--color-text-primary)]">{t("brand.name")}</span>
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
      <div className="border-t border-[var(--color-border)] px-4 py-4 text-center text-xs text-[var(--color-text-muted)]">
        {t("brand.name")} © {year} — {t("footer.rightsReserved")}
      </div>
    </footer>
  );
}
