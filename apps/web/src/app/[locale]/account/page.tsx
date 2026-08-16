import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@gcc-store/i18n";
import { redirect } from "@/i18n/navigation";
import { ApiError, getMe } from "@/lib/api";
import { getServerCookieHeader } from "@/lib/server-cookies";
import { LogoutButton } from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  setRequestLocale(typedLocale);
  const t = await getTranslations();

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

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{t("nav.account")}</h1>
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-[var(--color-text-muted)]">{locale === "ar" ? "الاسم" : "Name"}</dt>
            <dd className="text-[var(--color-text-primary)]">{user?.displayName ?? "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--color-text-muted)]">{locale === "ar" ? "البريد الإلكتروني" : "Email"}</dt>
            <dd className="text-[var(--color-text-primary)]">{user?.email}</dd>
          </div>
        </dl>
      </section>
      <LogoutButton />
    </div>
  );
}
