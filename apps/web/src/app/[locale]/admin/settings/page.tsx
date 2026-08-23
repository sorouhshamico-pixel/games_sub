import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@gcc-store/i18n";
import { redirect } from "@/i18n/navigation";
import { ApiError, getAdminSettings } from "@/lib/api";
import { getServerCookieHeader } from "@/lib/server-cookies";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  setRequestLocale(typedLocale);

  const cookieHeader = await getServerCookieHeader();
  let settings: Awaited<ReturnType<typeof getAdminSettings>> | null = null;
  let forbidden = false;
  try {
    settings = await getAdminSettings({ cookieHeader });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect({ href: "/login", locale: typedLocale });
    if (error instanceof ApiError && error.status === 403) forbidden = true;
    else throw error;
  }

  if (forbidden || !settings) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-[var(--color-text-muted)]">
        {locale === "ar" ? "ليس لديك صلاحية الوصول لهذه الصفحة" : "You don't have permission to view this page"}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{locale === "ar" ? "الإعدادات" : "Settings"}</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
