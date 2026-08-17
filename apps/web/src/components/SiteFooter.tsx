import { useLocale, useTranslations } from "next-intl";
import { SiApplepay, SiTiktok, SiInstagram, SiX, SiYoutube } from "react-icons/si";
import { ShahnooIcon } from "@gcc-store/ui";
import { Link } from "@/i18n/navigation";
import { AppleIcon, PlayStoreIcon } from "./home/icons";

// Visa/Mastercard use real full-color logo artwork (see
// public/images/payment/NOTICE.md for licensing) — their brand marks
// genuinely need multiple colors (Mastercard's two overlapping circles
// especially), which a single-color icon component can't represent well.
// mada has no available logo asset (Saudi-specific network), kept as a
// text-only chip. Apple Pay's mark is inherently monochrome, so the icon
// library version already looks correct.
const paymentBadges: Array<{ name: string; imgSrc?: string; Icon?: typeof SiApplepay }> = [
  { name: "mada" },
  { name: "Visa", imgSrc: "/images/payment/visa.svg" },
  { name: "Mastercard", imgSrc: "/images/payment/mastercard.svg" },
  { name: "Apple Pay", Icon: SiApplepay },
];

// Decorative only — no real Shahnoo social accounts exist yet, so these are
// non-interactive marks (not <Link>s) rather than links to nowhere.
const socialIcons = [SiTiktok, SiInstagram, SiX, SiYoutube];

export function SiteFooter() {
  const t = useTranslations();
  const locale = useLocale();
  const year = new Date().getFullYear();

  const quickLinks = [
    { href: "/" as const, ar: "الرئيسية", en: "Home" },
    { href: { pathname: "/games", query: { category: "game-topups" } }, ar: "شحن الألعاب", en: "Game top-ups" },
    { href: { pathname: "/games", query: { category: "subscriptions" } }, ar: "الاشتراكات الرقمية", en: "Digital subscriptions" },
    { href: { pathname: "/games", query: { category: "gift-cards" } }, ar: "بطاقات الهدايا", en: "Gift cards" },
    { href: "/#limited-offers" as const, ar: "العروض", en: "Offers" },
    { href: "/blog" as const, ar: "المدونة", en: "Blog" },
  ];

  const supportLinks = [
    { href: "/pages/faq" as const, ar: "تواصل معنا", en: "Contact us" },
    { href: "/pages/faq" as const, ar: "الأسئلة الشائعة", en: "FAQ" },
    { href: "/pages/refunds" as const, ar: "سياسة الاسترجاع", en: "Refund policy" },
    { href: "/pages/privacy" as const, ar: "سياسة الخصوصية", en: "Privacy policy" },
    { href: "/pages/terms" as const, ar: "الشروط والأحكام", en: "Terms & conditions" },
  ];

  return (
    <footer className="mt-16 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <div className="mb-3 flex items-center gap-2">
            <ShahnooIcon className="h-6 w-6" />
            <span className="font-semibold text-[var(--color-text-primary)]">{t("brand.name")}</span>
            {locale === "ar" ? (
              <span className="text-[9px] font-semibold tracking-[0.2em] text-brand-secondary">SHAHNOO</span>
            ) : null}
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">{t("brand.tagline")}</p>
          <div className="mt-4 flex items-center gap-3 text-[var(--color-text-muted)]">
            {socialIcons.map((Icon, index) => (
              <span key={index} aria-hidden className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-surface-elevated)]">
                <Icon className="h-3.5 w-3.5" />
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 font-semibold text-[var(--color-text-primary)]">{locale === "ar" ? "روابط سريعة" : "Quick links"}</p>
          <ul className="flex flex-col gap-2 text-sm">
            {quickLinks.map((link, index) => (
              <li key={index}>
                <Link href={link.href} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                  {locale === "ar" ? link.ar : link.en}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 font-semibold text-[var(--color-text-primary)]">{locale === "ar" ? "دعم العملاء" : "Customer support"}</p>
          <ul className="flex flex-col gap-2 text-sm">
            {supportLinks.map((link, index) => (
              <li key={index}>
                <Link href={link.href} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                  {locale === "ar" ? link.ar : link.en}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 font-semibold text-[var(--color-text-primary)]">{locale === "ar" ? "طرق الدفع" : "Payment methods"}</p>
          <div className="flex flex-wrap gap-2">
            {paymentBadges.map(({ name, imgSrc, Icon }) => (
              <span
                key={name}
                className="flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-[11px] font-semibold text-slate-900"
              >
                {imgSrc ? (
                  <img src={imgSrc} alt="" aria-hidden className="h-4 w-auto" />
                ) : Icon ? (
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                ) : null}
                {imgSrc ? null : name}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-[var(--color-text-muted)]">
            {locale === "ar"
              ? "بوابة الدفع النشطة حاليًا للتجربة فقط"
              : "The live payment gateway is for testing only"}
          </p>
        </div>

        <div>
          <p className="mb-3 font-semibold text-[var(--color-text-primary)]">{locale === "ar" ? "حمل التطبيق" : "Get the app"}</p>
          <p className="mb-3 text-sm text-[var(--color-text-muted)]">
            {locale === "ar" ? "تجربة أسرع وأكثر سهولة" : "A faster, easier experience"}
          </p>
          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--color-text-muted)]">
              <AppleIcon className="h-3.5 w-3.5" aria-hidden />
              App Store — {locale === "ar" ? "قريبًا" : "Coming soon"}
            </span>
            <span className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--color-text-muted)]">
              <PlayStoreIcon className="h-3.5 w-3.5" aria-hidden />
              Google Play — {locale === "ar" ? "قريبًا" : "Coming soon"}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] px-4 py-4 text-center text-xs text-[var(--color-text-muted)]">
        {t("brand.name")} © {year} — {t("footer.rightsReserved")}
      </div>
    </footer>
  );
}
