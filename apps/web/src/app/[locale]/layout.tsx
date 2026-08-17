import type { Metadata } from "next";
import { Alexandria, Inter } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, localeDirection, type Locale } from "@gcc-store/i18n";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BottomNav } from "@/components/BottomNav";
import { CartProvider } from "@/components/CartProvider";
import { CartDrawer } from "@/components/CartDrawer";
import { MotionProvider, PageTransition } from "@/components/motion";
import "../globals.css";

const arabicFont = Alexandria({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

const latinFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-latin",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "brand" });

  return {
    title: { default: t("name"), template: `%s | ${t("name")}` },
    description: t("tagline"),
    icons: { icon: "/favicon.svg" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: requested } = await params;
  if (!hasLocale(routing.locales, requested)) {
    notFound();
  }
  const locale = requested as Locale;
  setRequestLocale(locale);

  return (
    <html lang={locale} dir={localeDirection[locale]} className={`${arabicFont.variable} ${latinFont.variable}`}>
      <body className="flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-text-primary)] antialiased">
        <NextIntlClientProvider>
          <MotionProvider>
            <CartProvider>
              <SiteHeader />
              <main className="flex-1 pb-20 md:pb-0">
                <PageTransition>{children}</PageTransition>
              </main>
              <SiteFooter />
              <BottomNav />
              <CartDrawer />
            </CartProvider>
          </MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
