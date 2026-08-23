import { setRequestLocale } from "next-intl/server";
import { Gamepad2, Gift, HelpCircle, Mail, PlayCircle, ShieldCheck, Sparkles } from "lucide-react";
import type { Locale } from "@gcc-store/i18n";
import { Link, redirect } from "@/i18n/navigation";
import { ApiError, getMe } from "@/lib/api";
import { getServerCookieHeader } from "@/lib/server-cookies";
import { LogoutButton } from "@/components/LogoutButton";
import { AccountQuickStats } from "@/components/account/AccountQuickStats";
import { AccountProfileForm } from "@/components/account/AccountProfileForm";
import { Reveal } from "@/components/motion";

export const dynamic = "force-dynamic";

const quickLinks: Array<{ href: string; Icon: typeof Gamepad2; labelAr: string; labelEn: string; accent: string }> = [
  { href: "/games?category=game-topups", Icon: Gamepad2, labelAr: "شحن الألعاب", labelEn: "Game top-ups", accent: "text-brand-primary" },
  { href: "/games?category=subscriptions", Icon: PlayCircle, labelAr: "الاشتراكات الرقمية", labelEn: "Subscriptions", accent: "text-brand-secondary" },
  { href: "/games?category=gift-cards", Icon: Gift, labelAr: "بطاقات الهدايا", labelEn: "Gift cards", accent: "text-brand-accent" },
  { href: "/pages/faq", Icon: HelpCircle, labelAr: "الأسئلة الشائعة", labelEn: "Help & FAQ", accent: "text-brand-primary" },
];

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  setRequestLocale(typedLocale);

  const cookieHeader = await getServerCookieHeader();
  let user: Awaited<ReturnType<typeof getMe>>["user"] | null = null;
  try {
    ({ user } = await getMe({ cookieHeader }));
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect({ href: "/login", locale: typedLocale });
    }
    throw error;
  }

  const displayName = user?.displayName ?? (locale === "ar" ? "بدون اسم" : "No name set");
  const email = user?.email ?? "—";
  const initial = (user?.displayName ?? user?.email ?? "?").trim().charAt(0).toUpperCase();
  const isStaff = Boolean(user?.role && user.role !== "CUSTOMER");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10">
      <Reveal>
        <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-brand-primary/10 via-[var(--color-surface)] to-brand-secondary/10 p-6 sm:p-8">
          <div aria-hidden className="pointer-events-none absolute -top-16 end-0 h-56 w-56 rounded-full bg-brand-secondary/15 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-20 start-1/4 h-48 w-48 rounded-full bg-brand-primary/15 blur-3xl" />
          <div className="relative flex flex-wrap items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-2xl font-bold text-white shadow-lg shadow-brand-primary/30">
              {initial}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">{displayName}</h1>
                {isStaff ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-accent/15 px-2.5 py-1 text-xs font-bold text-brand-accent">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                    {locale === "ar" ? "فريق العمل" : "Staff"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary/15 px-2.5 py-1 text-xs font-bold text-brand-primary">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden />
                    {locale === "ar" ? "عميل" : "Customer"}
                  </span>
                )}
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
                <Mail className="h-3.5 w-3.5" aria-hidden />
                {email}
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      <AccountQuickStats locale={typedLocale} />

      <Reveal>
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--color-text-primary)]">
            <Sparkles className="h-4 w-4 text-brand-accent" aria-hidden />
            {locale === "ar" ? "الوصول السريع" : "Quick access"}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center transition-colors hover:border-brand-primary/50 hover:bg-[var(--color-surface-elevated)]"
              >
                <link.Icon className={`h-6 w-6 ${link.accent}`} aria-hidden />
                <span className="text-xs font-medium text-[var(--color-text-primary)]">
                  {locale === "ar" ? link.labelAr : link.labelEn}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </Reveal>

      {isStaff ? (
        <Link
          href="/admin"
          className="flex items-center justify-between rounded-2xl border border-brand-accent/40 bg-brand-accent/5 p-4 text-sm font-medium text-brand-accent transition-colors hover:bg-brand-accent/10"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" aria-hidden />
            {locale === "ar" ? "الانتقال إلى لوحة التحكم" : "Go to admin dashboard"}
          </span>
          <span aria-hidden>{locale === "ar" ? "←" : "→"}</span>
        </Link>
      ) : null}

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-2 text-sm font-bold text-[var(--color-text-primary)]">
          {locale === "ar" ? "تتبع طلبك" : "Track your order"}
        </h2>
        <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
          {locale === "ar"
            ? "بعد إتمام أي عملية شراء، ستصلك رسالة تحتوي رابط تتبع مباشر لحالة طلبك."
            : "After completing any purchase, you'll receive a message with a direct link to track your order's status."}
        </p>
      </section>

      <AccountProfileForm locale={typedLocale} initialName={user?.displayName ?? ""} initialEmail={user?.email ?? ""} />

      <LogoutButton />
    </div>
  );
}
