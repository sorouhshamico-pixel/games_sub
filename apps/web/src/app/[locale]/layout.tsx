import type { Metadata } from "next";
import { Alexandria, Inter, Orbitron, Rajdhani } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, localeDirection, type Locale } from "@gcc-store/i18n";
import { routing } from "@/i18n/routing";
import { PromoBar } from "@/components/PromoBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BottomNav } from "@/components/BottomNav";
import { CartProvider } from "@/components/CartProvider";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { CartDrawer } from "@/components/CartDrawer";
import { FloatingBackToTop } from "@/components/FloatingBackToTop";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { SiteAtmosphere } from "@/components/SiteAtmosphere";
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

// Gaming-flavored display faces for English headings only — Arabic keeps
// Alexandria throughout, and English body copy keeps Inter for readability.
// Orbitron's geometric, uppercase-first letterforms carry the biggest H1s;
// Rajdhani (still unmistakably "esports HUD", but far more legible at
// smaller sizes) carries H2/H3. Both are scoped to `[dir="ltr"]` in
// globals.css, same pattern already used for the Latin/Arabic font stack.
const headingDisplayFont = Orbitron({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-heading-display",
  display: "swap",
});

const headingFont = Rajdhani({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-heading",
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
    <html
      lang={locale}
      dir={localeDirection[locale]}
      className={`${arabicFont.variable} ${latinFont.variable} ${headingDisplayFont.variable} ${headingFont.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-text-primary)] antialiased">
        <NextIntlClientProvider>
          <MotionProvider>
            <CurrencyProvider>
              <CartProvider>
                <SiteAtmosphere />
                <PromoBar />
                <SiteHeader />
                {/* The clearance for the fixed BottomNav has to wrap the
                    footer too, not just <main> — the footer renders below
                    it in normal flow on mobile, so without this its last
                    ~60px (copyright line, etc.) scrolled in behind the nav
                    bar instead of stopping above it. calc() adds the real
                    iOS home-indicator inset on top of the nav's own height
                    instead of guessing a fixed number that's wrong on
                    notched phones. */}
                <div className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
                  <main>
                    <PageTransition>{children}</PageTransition>
                  </main>
                  <SiteFooter />
                </div>
                <BottomNav />
                <CartDrawer />
                <FloatingBackToTop />
                <FloatingWhatsApp />
              </CartProvider>
            </CurrencyProvider>
          </MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
