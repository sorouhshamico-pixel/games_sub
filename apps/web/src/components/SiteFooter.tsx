"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { ArrowUp } from "lucide-react";
import { SiTiktok, SiInstagram, SiX, SiYoutube } from "react-icons/si";
import { ShahnooIcon } from "@gcc-store/ui";
import { Link } from "@/i18n/navigation";
import { Reveal, StaggerContainer, StaggerItem, HoverCard } from "@/components/motion";
import { duration, easing } from "@/lib/motion/tokens";
import { AppleIcon, PlayStoreIcon } from "./home/icons";

// Real supplied artwork for every payment mark now (see
// public/images/payment/NOTICE.md) — no more text-only chips or mixed
// icon-library fallbacks.
const paymentBadges = [
  { name: "mada", imgSrc: "/images/payment/mada.png" },
  { name: "Visa", imgSrc: "/images/payment/visa.png" },
  { name: "Mastercard", imgSrc: "/images/payment/mastercard.png" },
  { name: "Apple Pay", imgSrc: "/images/payment/apple-pay.png" },
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
            <div className="mb-3 flex items-center gap-2">
              <ShahnooIcon className="h-6 w-6" />
              <span className="font-semibold text-[var(--color-text-primary)]">{t("brand.name")}</span>
              {locale === "ar" ? (
                <span className="text-[9px] font-semibold tracking-[0.2em] text-brand-secondary">SHAHNOO</span>
              ) : null}
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
                    <span className="block overflow-hidden rounded-xl shadow-lg shadow-black/20 ring-1 ring-white/10 transition-shadow duration-300 hover:shadow-brand-primary/20 hover:ring-brand-primary/40">
                      <img src={badge.imgSrc} alt={badge.name} className="aspect-[3/2] w-full object-cover" loading="lazy" />
                    </span>
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
            <div className="flex flex-col gap-2">
              {[
                { Icon: AppleIcon, label: "App Store" },
                { Icon: PlayStoreIcon, label: "Google Play" },
              ].map(({ Icon, label }) => (
                <HoverCard key={label}>
                  <span className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--color-text-muted)] transition-colors hover:border-brand-primary/40">
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {label} — {locale === "ar" ? "قريبًا" : "Coming soon"}
                  </span>
                </HoverCard>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      <div className="relative border-t border-[var(--color-border)] px-4 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <p className="text-xs text-[var(--color-text-muted)]">
            {t("brand.name")} © {year} — {t("footer.rightsReserved")}
          </p>
          <motion.button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: duration.fast, ease: easing }}
            aria-label={locale === "ar" ? "العودة للأعلى" : "Back to top"}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors hover:border-brand-primary/50 hover:text-brand-primary"
          >
            <ArrowUp className="h-4 w-4" aria-hidden />
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
