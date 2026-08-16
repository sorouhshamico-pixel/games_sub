"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { CartIcon } from "./CartIcon";

export function SiteHeader() {
  const t = useTranslations();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchValue.trim();
    router.push(query ? `/games?search=${encodeURIComponent(query)}` : "/games");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
        <Link href="/" className="shrink-0 text-lg font-bold text-[var(--color-text-primary)]">
          {t("brand.name")}
        </Link>

        <nav className="hidden items-center gap-4 text-sm font-medium md:flex" aria-label="primary">
          <Link href="/games" className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
            {t("nav.games")}
          </Link>
          <Link href="/pages/faq" className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
            {t("nav.help")}
          </Link>
        </nav>

        <form onSubmit={handleSearch} className="order-last w-full grow md:order-none md:w-auto">
          <label className="sr-only" htmlFor="site-search">
            {t("nav.search")}
          </label>
          <input
            id="site-search"
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={t("nav.search")}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
          />
        </form>

        <div className="ms-auto flex items-center gap-3">
          <LocaleSwitcher />
          <CartIcon />
        </div>
      </div>
    </header>
  );
}
