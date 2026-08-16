"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useCart } from "./CartProvider";
import { cn } from "@gcc-store/ui";

export function BottomNav() {
  const t = useTranslations();
  const pathname = usePathname();
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const tabs = [
    { href: "/", label: t("nav.home"), icon: HomeIcon },
    { href: "/games", label: t("nav.games"), icon: GamesIcon },
    { href: "/cart", label: t("nav.cart"), icon: CartTabIcon, badge: cartCount },
    { href: "/account", label: t("nav.account"), icon: AccountIcon },
  ] as const;

  return (
    <nav
      aria-label="primary mobile"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur md:hidden"
    >
      {tabs.map((tab) => {
        const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-1 py-2 text-xs",
              isActive ? "text-brand-primary" : "text-[var(--color-text-muted)]",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon />
            <span>{tab.label}</span>
            {"badge" in tab && tab.badge > 0 ? (
              <span className="absolute end-6 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-accent px-1 text-[10px] font-bold text-[#070B14]">
                {tab.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 11.5 12 4l8 7.5M6 10v9h12v-9" />
    </svg>
  );
}

function GamesIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="7" width="18" height="12" rx="3" />
      <path strokeLinecap="round" d="M8 11v4M6 13h4M15 12h.01M18 14h.01" />
    </svg>
  );
}

function CartTabIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l2.4 12.4a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 7H6" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="17" cy="20" r="1.5" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.2" />
      <path strokeLinecap="round" d="M5 20c1.2-3.5 4-5.2 7-5.2s5.8 1.7 7 5.2" />
    </svg>
  );
}
