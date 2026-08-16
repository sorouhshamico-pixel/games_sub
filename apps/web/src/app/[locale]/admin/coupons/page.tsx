import { setRequestLocale } from "next-intl/server";
import { formatMoney } from "@gcc-store/ui";
import type { Locale } from "@gcc-store/i18n";
import { redirect } from "@/i18n/navigation";
import { ApiError, getAdminCoupons } from "@/lib/api";
import { getServerCookieHeader } from "@/lib/server-cookies";
import { CreateCouponForm } from "@/components/admin/CreateCouponForm";
import { DeactivateCouponButton } from "@/components/admin/DeactivateCouponButton";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  setRequestLocale(typedLocale);

  const cookieHeader = await getServerCookieHeader();
  let coupons: Awaited<ReturnType<typeof getAdminCoupons>> | null = null;
  let forbidden = false;
  try {
    coupons = await getAdminCoupons({ cookieHeader });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect({ href: "/login", locale: typedLocale });
    if (error instanceof ApiError && error.status === 403) forbidden = true;
    else throw error;
  }

  if (forbidden || !coupons) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-[var(--color-text-muted)]">
        {locale === "ar" ? "ليس لديك صلاحية الوصول لهذه الصفحة" : "You don't have permission to view this page"}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{locale === "ar" ? "أكواد الخصم" : "Coupons"}</h1>

      <CreateCouponForm />

      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]">
            <tr>
              <th className="p-3 text-start">{locale === "ar" ? "الكود" : "Code"}</th>
              <th className="p-3 text-start">{locale === "ar" ? "الخصم" : "Discount"}</th>
              <th className="p-3 text-start">{locale === "ar" ? "الاستخدام" : "Redemptions"}</th>
              <th className="p-3 text-start">{locale === "ar" ? "الحد الأدنى" : "Min order"}</th>
              <th className="p-3 text-start">{locale === "ar" ? "الانتهاء" : "Expires"}</th>
              <th className="p-3 text-start">{locale === "ar" ? "الحالة" : "Status"}</th>
              <th className="p-3 text-start" />
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-t border-[var(--color-border)]">
                <td className="p-3 font-mono text-xs text-[var(--color-text-primary)]">{coupon.code}</td>
                <td className="p-3 text-[var(--color-text-primary)]">
                  {coupon.discountType === "percentage"
                    ? `${coupon.discountValue / 100}%`
                    : formatMoney(coupon.discountValue, "SAR", typedLocale)}
                </td>
                <td className="p-3 text-[var(--color-text-muted)]">
                  {coupon.maxRedemptionsPerCustomer ? `${coupon.maxRedemptionsPerCustomer}/${locale === "ar" ? "عميل" : "customer"} · ` : ""}
                  {coupon.maxRedemptions ?? (locale === "ar" ? "غير محدود" : "unlimited")}
                </td>
                <td className="p-3 text-[var(--color-text-muted)]">
                  {coupon.minOrderAmountMinorUnits ? formatMoney(coupon.minOrderAmountMinorUnits, "SAR", typedLocale) : "—"}
                </td>
                <td className="p-3 text-[var(--color-text-muted)]">
                  {coupon.endsAt ? new Date(coupon.endsAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US") : "—"}
                </td>
                <td className="p-3 text-[var(--color-text-muted)]">
                  {coupon.isActive ? (locale === "ar" ? "نشط" : "Active") : locale === "ar" ? "معطّل" : "Inactive"}
                </td>
                <td className="p-3">{coupon.isActive ? <DeactivateCouponButton couponId={coupon.id} /> : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
