import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@gcc-store/i18n";
import { redirect } from "@/i18n/navigation";
import { ApiError, getAdminUsers, getMe } from "@/lib/api";
import { getServerCookieHeader } from "@/lib/server-cookies";
import { CreateStaffUserForm } from "@/components/admin/CreateStaffUserForm";
import { EditStaffUserRow } from "@/components/admin/EditStaffUserRow";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  setRequestLocale(typedLocale);

  const cookieHeader = await getServerCookieHeader();
  let users: Awaited<ReturnType<typeof getAdminUsers>> | null = null;
  let forbidden = false;
  try {
    users = await getAdminUsers({ cookieHeader });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect({ href: "/login", locale: typedLocale });
    if (error instanceof ApiError && error.status === 403) forbidden = true;
    else throw error;
  }

  if (forbidden || !users) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-[var(--color-text-muted)]">
        {locale === "ar" ? "ليس لديك صلاحية الوصول لهذه الصفحة" : "You don't have permission to view this page"}
      </div>
    );
  }

  const { user: currentUser } = await getMe({ cookieHeader });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{locale === "ar" ? "فريق العمل" : "Staff"}</h1>

      <CreateStaffUserForm />

      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]">
            <tr>
              <th className="p-3 text-start">{locale === "ar" ? "البريد الإلكتروني" : "Email"}</th>
              <th className="p-3 text-start">{locale === "ar" ? "الدور" : "Role"}</th>
              <th className="p-3 text-start">{locale === "ar" ? "الحالة" : "Status"}</th>
              <th className="p-3 text-start">{locale === "ar" ? "تاريخ الإضافة" : "Added"}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <EditStaffUserRow key={user.id} user={user} isSelf={user.id === currentUser.id} />
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[var(--color-text-muted)]">
        {locale === "ar" ? "لا يمكنك تعديل دورك أو تعطيل حسابك من هنا." : "You can't change your own role or deactivate your own account from here."}
      </p>
    </div>
  );
}
