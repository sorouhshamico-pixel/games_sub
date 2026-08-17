"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useMotionValueEvent, useScroll } from "motion/react";
import { ShahnooIcon, cn } from "@gcc-store/ui";
import { Link, useRouter } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { CartIcon } from "./CartIcon";

const SCROLL_THRESHOLD = 24;

export function SiteHeader() {
  const t = useTranslations();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  // useMotionValueEvent only re-renders React when the boolean actually
  // flips (not on every scroll pixel) — scrollY itself updates via
  // requestAnimationFrame outside React's render cycle.
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > SCROLL_THRESHOLD);
  });

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchValue.trim();
    router.push(query ? `/games?search=${encodeURIComponent(query)}` : "/games");
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b backdrop-blur-lg transition-[background-color,box-shadow,border-color] duration-300",
        isScrolled
          ? "border-[var(--color-border)] bg-[var(--color-surface)]/90 shadow-[0_1px_0_0_rgba(5,199,242,0.18),0_12px_24px_-16px_rgba(5,199,242,0.25)]"
          : "border-transparent bg-[var(--color-surface)]/50 shadow-none",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 transition-[padding] duration-300",
          isScrolled ? "py-2" : "py-3",
        )}
      >
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <ShahnooIcon className="h-8 w-8" />
          <span className="text-lg font-bold tracking-tight text-[var(--color-text-primary)]">{t("brand.name")}</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium md:flex" aria-label="primary">
          <Link href="/games" className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]">
            {t("nav.games")}
          </Link>
          <Link href="/pages/faq" className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]">
            {t("nav.help")}
          </Link>
        </nav>

        <form onSubmit={handleSearch} className="order-last w-full grow md:order-none md:w-auto">
          <label className="sr-only" htmlFor="site-search">
            {t("nav.search")}
          </label>
          <div className="relative">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m20 20-3.2-3.2" />
            </svg>
            <input
              id="site-search"
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder={t("nav.search")}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] py-2 ps-10 pe-4 text-sm text-[var(--color-text-primary)] transition-[color,background-color,border-color,box-shadow] duration-200 placeholder:text-[var(--color-text-muted)] focus:outline-none focus-visible:border-brand-primary/60 focus-visible:shadow-[0_0_0_3px_rgba(124,58,237,0.2)]"
            />
          </div>
        </form>

        <div className="ms-auto flex items-center gap-3">
          <LocaleSwitcher />
          <Link
            href="/account"
            aria-label={t("nav.account")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] text-[var(--color-text-primary)] transition-colors hover:border-brand-primary/50 hover:bg-[var(--color-surface-elevated)]"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="3.2" />
              <path strokeLinecap="round" d="M5 20c1.2-3.5 4-5.2 7-5.2s5.8 1.7 7 5.2" />
            </svg>
          </Link>
          <CartIcon />
        </div>
      </div>
    </header>
  );
}
