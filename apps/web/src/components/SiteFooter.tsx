"use client";

import { useLocale, useTranslations } from "next-intl";
import { SiTiktok, SiInstagram, SiX, SiYoutube } from "react-icons/si";
import { Link } from "@/i18n/navigation";
import { Reveal, StaggerContainer, StaggerItem, HoverCard } from "@/components/motion";
import { BrandLockup } from "./BrandLockup";

// Real supplied artwork for every payment mark now (see
// public/images/payment/NOTICE.md) — no more text-only chips or mixed
// icon-library fallbacks.
const paymentBadges = [
  { name: "mada", imgSrc: "/images/payment/mada.png" },
  { name: "Visa", imgSrc: "/images/payment/visa.png" },
  { name: "Mastercard", imgSrc: "/images/payment/mastercard.png" },
  { name: "Apple Pay", imgSrc: "/images/payment/apple-pay.png" },
];

// Same real-artwork treatment for the app store badges.
const appBadges = [
  { name: "App Store", imgSrc: "/images/app/app-store.png" },
  { name: "Google Play", imgSrc: "/images/app/google-play.png" },
];

// Decorative only — no real Shahnoo social accounts exist yet, so these are
// non-interactive marks (not <Link>s) rather than links to nowhere.
const socialIcons = [SiTiktok, SiInstagram, SiX, SiYoutube];

// Shared underline-on-hover treatment — a transform-only (scaleX) sweep
// rather than animating width, so it stays compositor-cheap.
const linkUnderline =
  "relative w-fit text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)] after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-brand-secondary after:transition-transform after:duration-300 hover:after:scale-x-100";

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
    <footer className="relative mt-16 overflow-hidden border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Glowing hairline instead of a flat border, plus soft aurora blobs
          continuing the same background motif used across the homepage —
          so the footer reads as one continuous surface, not a bolted-on
          bottom bar. */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 start-1/4 h-72 w-72 rounded-full bg-brand-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 end-1/4 h-72 w-72 rounded-full bg-brand-secondary/10 blur-3xl" />
      </div>

      <Reveal>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <div className="mb-3">
              <BrandLockup variant="footer" />
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">{t("brand.tagline")}</p>
            <div className="mt-4 flex items-center gap-3">
              {socialIcons.map((Icon, index) => (
                <HoverCard key={index}>
                  <span
                    aria-hidden
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] transition-colors hover:bg-brand-primary/15 hover:text-brand-primary"
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                </HoverCard>
              ))}
            </div>
          </div>

          <StaggerContainer className="flex flex-col gap-2">
            <p className="mb-1 font-semibold text-[var(--color-text-primary)]">{locale === "ar" ? "روابط سريعة" : "Quick links"}</p>
            {quickLinks.map((link, index) => (
              <StaggerItem key={index}>
                <Link href={link.href} className={linkUnderline + " text-sm"}>
                  {locale === "ar" ? link.ar : link.en}
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <StaggerContainer className="flex flex-col gap-2">
            <p className="mb-1 font-semibold text-[var(--color-text-primary)]">{locale === "ar" ? "دعم العملاء" : "Customer support"}</p>
            {supportLinks.map((link, index) => (
              <StaggerItem key={index}>
                <Link href={link.href} className={linkUnderline + " text-sm"}>
                  {locale === "ar" ? link.ar : link.en}
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <div>
            <p className="mb-3 font-semibold text-[var(--color-text-primary)]">{locale === "ar" ? "طرق الدفع" : "Payment methods"}</p>
            <StaggerContainer className="grid grid-cols-2 gap-2.5">
              {paymentBadges.map((badge) => (
                <StaggerItem key={badge.name}>
                  <HoverCard>
                    {/* No frame/ring/shadow of ours — the card's own baked-in
                        glowing border is the only boundary. Shown crisp at
                        full opacity, just a gentle brightness lift on hover. */}
                    <img
                      src={badge.imgSrc}
                      alt={badge.name}
                      loading="lazy"
                      className="aspect-[3/2] w-full rounded-lg object-cover brightness-100 transition-[filter] duration-300 hover:brightness-110"
                    />
                  </HoverCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
            <p className="mt-3 text-[11px] text-[var(--color-text-muted)]">
              {locale === "ar" ? "بوابة الدفع النشطة حاليًا للتجربة فقط" : "The live payment gateway is for testing only"}
            </p>
          </div>

          <div>
            <p className="mb-3 font-semibold text-[var(--color-text-primary)]">{locale === "ar" ? "حمل التطبيق" : "Get the app"}</p>
            <p className="mb-3 text-sm text-[var(--color-text-muted)]">
              {locale === "ar" ? "تجربة أسرع وأكثر سهولة" : "A faster, easier experience"}
            </p>
            <div className="flex flex-col gap-2.5">
              {appBadges.map((badge) => (
                <HoverCard key={badge.name}>
                  {/* Same treatment as the payment badges — no frame of
                      ours, the card's own glowing border is the only
                      boundary — with a small "Coming soon" ribbon since
                      there's no real app yet to link to. */}
                  <span className="relative block overflow-hidden rounded-lg">
                    <img
                      src={badge.imgSrc}
                      alt={badge.name}
                      loading="lazy"
                      className="aspect-[3/2] w-full rounded-lg object-cover transition-[filter] duration-300 hover:brightness-110"
                    />
                    <span className="absolute bottom-1.5 end-1.5 rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm">
                      {locale === "ar" ? "قريبًا" : "Coming soon"}
                    </span>
                  </span>
                </HoverCard>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      <div className="relative border-t border-[var(--color-border)] px-4 py-4">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-xs text-[var(--color-text-muted)]">
            {t("brand.name")} © {year} — {t("footer.rightsReserved")}
          </p>
        </div>
      </div>
    </footer>
  );
}
