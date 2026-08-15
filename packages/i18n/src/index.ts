export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ar";

export const localeDirection: Record<Locale, "rtl" | "ltr"> = {
  ar: "rtl",
  en: "ltr",
};

export const localeLabels: Record<Locale, string> = {
  ar: "العربية",
  en: "English",
};

// hreflang tags served in <head> and sitemap alternates.
// ar-SA / en-SA today; extend per docs/SEO.md as GCC countries launch.
export const hreflangByLocale: Record<Locale, string> = {
  ar: "ar-SA",
  en: "en-SA",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
