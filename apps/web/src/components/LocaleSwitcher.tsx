"use client";

import { useLocale } from "next-intl";
import { locales, localeLabels, type Locale } from "@gcc-store/i18n";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  return (
    <label className="inline-flex items-center gap-1 text-sm">
      <span className="sr-only">Language</span>
      <select
        value={locale}
        onChange={(event) => {
          const nextLocale = event.target.value as Locale;
          router.replace(pathname, { locale: nextLocale });
        }}
        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-[var(--color-text-primary)]"
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {localeLabels[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
