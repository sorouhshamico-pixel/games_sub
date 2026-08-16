"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@gcc-store/i18n";

export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const locale = useLocale() as Locale;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="text-lg font-medium text-danger">
        {locale === "ar" ? "حدث خطأ غير متوقع" : "Something went wrong"}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-medium text-white"
      >
        {locale === "ar" ? "حاول مرة أخرى" : "Try again"}
      </button>
    </div>
  );
}
