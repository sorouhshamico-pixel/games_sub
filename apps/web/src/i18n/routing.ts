import { defineRouting } from "next-intl/routing";
import { defaultLocale, locales } from "@gcc-store/i18n";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});
