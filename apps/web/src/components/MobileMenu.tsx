"use client";

import { useId, useState } from "react";
import { useLocale } from "next-intl";
import { motion } from "motion/react";
import { BookOpen, Gamepad2, Gift, HelpCircle, Menu, PlayCircle, X, Zap } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { MotionDrawer, StaggerContainer, StaggerItem } from "@/components/motion";
import { spring } from "@/lib/motion/tokens";
import { BrandLockup } from "./BrandLockup";

const menuLinks = [
  { href: { pathname: "/games", query: { category: "game-topups" } }, Icon: Gamepad2, ar: "شحن الألعاب", en: "Game top-ups", accent: "text-brand-primary", bg: "bg-brand-primary/15" },
  { href: { pathname: "/games", query: { category: "subscriptions" } }, Icon: PlayCircle, ar: "الاشتراكات الرقمية", en: "Subscriptions", accent: "text-brand-secondary", bg: "bg-brand-secondary/15" },
  { href: { pathname: "/games", query: { category: "gift-cards" } }, Icon: Gift, ar: "بطاقات الهدايا", en: "Gift cards", accent: "text-brand-accent", bg: "bg-brand-accent/15" },
  { href: "/offers" as const, Icon: Zap, ar: "عروض لفترة محدودة", en: "Limited-time offers", accent: "text-danger", bg: "bg-danger/15" },
  { href: "/blog" as const, Icon: BookOpen, ar: "المدونة", en: "Blog", accent: "text-brand-primary", bg: "bg-brand-primary/15" },
  { href: "/pages/faq" as const, Icon: HelpCircle, ar: "الأسئلة الشائعة", en: "Help & FAQ", accent: "text-brand-secondary", bg: "bg-brand-secondary/15" },
];

/**
 * Mobile-only nav drawer, reached from a header hamburger button. BottomNav
 * covers home/games/cart/account, but subscriptions, gift cards, offers,
 * blog, and FAQ had no dedicated entry point on mobile at all below the
 * header's own (desktop-only) nav row — this closes that gap rather than
 * duplicating what BottomNav already does.
 */
export function MobileMenu() {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const titleId = useId();

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", ...spring }}
        aria-label={locale === "ar" ? "القائمة" : "Menu"}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-surface-elevated)]/70 text-[var(--color-text-primary)] transition-colors hover:bg-brand-primary/15 hover:text-brand-primary md:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </motion.button>

      {/* The trigger button lives in the header's ms-auto cluster, which
          physically lands on the left in Arabic (RTL) and the right in
          English (LTR) — the drawer opens from that same physical edge so
          it reads as extending from the button, not appearing opposite it. */}
      <MotionDrawer open={open} onClose={() => setOpen(false)} side={locale === "ar" ? "left" : "right"} labelledBy={titleId}>
        <div className="relative overflow-hidden border-b border-[var(--color-border)] p-4">
          <div aria-hidden className="pointer-events-none absolute -top-10 end-0 h-32 w-32 rounded-full bg-brand-primary/15 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <span id={titleId} className="sr-only">
              {locale === "ar" ? "قائمة التصفح" : "Navigation menu"}
            </span>
            {/* Wraps the logo's own <Link> so tapping it also closes the
                drawer instead of navigating home and leaving the drawer
                open on top of the new page — click bubbles up from the
                inner link. */}
            <div onClick={() => setOpen(false)}>
              <BrandLockup variant="footer" />
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={locale === "ar" ? "إغلاق" : "Close"}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)]"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>

        <nav aria-label={locale === "ar" ? "روابط القائمة" : "Menu links"} className="flex flex-1 flex-col overflow-y-auto">
          <StaggerContainer className="flex flex-col gap-1.5 p-3">
            {menuLinks.map((link) => (
              <StaggerItem key={link.en}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-elevated)]"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${link.bg} ${link.accent}`}>
                    <link.Icon className="h-5 w-5" aria-hidden />
                  </span>
                  {locale === "ar" ? link.ar : link.en}
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </nav>
      </MotionDrawer>
    </>
  );
}
