"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { SiTiktok, SiInstagram, SiX, SiYoutube } from "react-icons/si";
import { Link } from "@/i18n/navigation";
import { Reveal, StaggerContainer, StaggerItem, HoverCard } from "@/components/motion";
import { duration, easing } from "@/lib/motion/tokens";
import { BrandLockup } from "./BrandLockup";

// Real supplied artwork for every payment mark now (see
// public/images/payment/NOTICE.md) — no more text-only chips or mixed
// icon-library fallbacks. The source renders each carry a lot of empty
// dark canvas around the actual mark (measured directly: Mastercard's
// real content is only ~57-59% of the frame, Google Play's is a short
// band at ~28% of the height) — `scale` zooms past that margin so the
// mark itself fills the small tile instead of floating in a sea of
// padding, calibrated per image so nothing gets clipped.
const paymentBadges = [
  { name: "mada", imgSrc: "/images/payment/mada.png", scale: 1.15 },
  { name: "Visa", imgSrc: "/images/payment/visa.png", scale: 1.2 },
  { name: "Mastercard", imgSrc: "/images/payment/mastercard.png", scale: 1.55 },
  { name: "Apple Pay", imgSrc: "/images/payment/apple-pay.png", scale: 1.1 },
];

// Same real-artwork treatment for the app store badges.
const appBadges = [
  { name: "App Store", imgSrc: "/images/app/app-store.png", scale: 1 },
  { name: "Google Play", imgSrc: "/images/app/google-play.png", scale: 1.5 },
];

// Decorative only — no real Shahnoo social accounts exist yet, so these are
// non-interactive marks (not <Link>s) rather than links to nowhere.
const socialIcons = [SiTiktok, SiInstagram, SiX, SiYoutube];

// Shared underline-on-hover treatment — a transform-only (scaleX) sweep
// rather than animating width, so it stays compositor-cheap.
const linkUnderline =
  "relative w-fit text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)] after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-brand-secondary after:transition-transform after:duration-300 hover:after:scale-x-100";

// Shared column-header treatment — a small draw-in gradient accent under
// every footer heading, echoing SectionHeading's language used across the
// rest of the site so the footer reads as the same design system.
function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="font-semibold text-[var(--color-text-primary)]">{children}</p>
      <motion.div
        aria-hidden
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 1 }}
        transition={{ duration: duration.slow, ease: easing }}
        className="mt-1.5 h-[2px] w-8 origin-left rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary"
      />
    </div>
  );
}

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
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:py-16 lg:grid-cols-5 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4">
              <BrandLockup variant="footer" />
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-[var(--color-text-muted)]">{t("brand.tagline")}</p>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              {locale === "ar" ? "تابعنا" : "Follow us"}
            </p>
            <div className="mt-2.5 flex items-center gap-3">
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

          <div>
            <FooterHeading>{locale === "ar" ? "روابط سريعة" : "Quick links"}</FooterHeading>
            <StaggerContainer className="flex flex-col gap-2">
              {quickLinks.map((link, index) => (
                <StaggerItem key={index}>
                  <Link href={link.href} className={linkUnderline + " text-sm"}>
                    {locale === "ar" ? link.ar : link.en}
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          <div>
            <FooterHeading>{locale === "ar" ? "دعم العملاء" : "Customer support"}</FooterHeading>
            <StaggerContainer className="flex flex-col gap-2">
              {supportLinks.map((link, index) => (
                <StaggerItem key={index}>
                  <Link href={link.href} className={linkUnderline + " text-sm"}>
                    {locale === "ar" ? link.ar : link.en}
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          <div>
            <FooterHeading>{locale === "ar" ? "طرق الدفع" : "Payment methods"}</FooterHeading>
            {/* Small fixed-size tiles instead of stretching to fill the
                grid — a flex-wrap cluster of compact chips reads as a
                trust strip, not a wall of oversized banners. */}
            <StaggerContainer className="flex flex-wrap gap-2">
              {paymentBadges.map((badge) => (
                <StaggerItem key={badge.name}>
                  <HoverCard>
                    {/* No frame/ring/shadow of ours — the card's own baked-in
                        glowing border is the only boundary. Shown crisp at
                        full opacity, just a gentle brightness lift on hover. */}
                    <span className="block h-9 w-14 overflow-hidden rounded-lg">
                      <img
                        src={badge.imgSrc}
                        alt={badge.name}
                        loading="lazy"
                        style={{ transform: `scale(${badge.scale})` }}
                        className="h-full w-full rounded-lg object-cover brightness-100 transition-[filter] duration-300 hover:brightness-110"
                      />
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
            <FooterHeading>{locale === "ar" ? "حمل التطبيق" : "Get the app"}</FooterHeading>
            <p className="-mt-2 mb-3 text-sm text-[var(--color-text-muted)]">
              {locale === "ar" ? "تجربة أسرع وأكثر سهولة" : "A faster, easier experience"}
            </p>
            <StaggerContainer className="flex flex-wrap gap-2.5">
              {appBadges.map((badge) => (
                <StaggerItem key={badge.name}>
                  <HoverCard>
                    {/* Same treatment as the payment badges — no frame of
                        ours, the card's own glowing border is the only
                        boundary — with a small "Coming soon" ribbon since
                        there's no real app yet to link to. */}
                    <span className="relative block h-10 w-16 overflow-hidden rounded-lg">
                      <img
                        src={badge.imgSrc}
                        alt={badge.name}
                        loading="lazy"
                        style={{ transform: `scale(${badge.scale})` }}
                        className="h-full w-full rounded-lg object-cover transition-[filter] duration-300 hover:brightness-110"
                      />
                      <span className="absolute bottom-0.5 end-0.5 rounded-full bg-black/70 px-1.5 py-0.5 text-[7px] font-semibold text-white backdrop-blur-sm">
                        {locale === "ar" ? "قريبًا" : "Coming soon"}
                      </span>
                    </span>
                  </HoverCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </Reveal>

      <div className="relative px-4 py-5">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-xs text-[var(--color-text-muted)]">
            {t("brand.name")} © {year} — {t("footer.rightsReserved")}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            {locale === "ar" ? "صُنع بشغف لعشّاق الألعاب في الخليج" : "Made with love for gamers across the Gulf"}
            <Heart aria-hidden className="h-3 w-3 fill-brand-secondary text-brand-secondary" />
          </p>
        </div>
      </div>
    </footer>
  );
}
