import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@gcc-store/i18n";
import { Link } from "@/i18n/navigation";
import { getAdminUser } from "@/lib/admin-auth";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  setRequestLocale(typedLocale);

  // Coarse gate: keeps customer/anonymous visitors from ever seeing the
  // admin nav at all. Each page still does its own per-resource check —
  // this only blocks non-staff accounts, not staff accounts hitting a
  // resource their specific role isn't allowed to touch.
  const user = await getAdminUser(typedLocale);
  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-[var(--color-text-muted)]">
        {locale === "ar" ? "ليس لديك صلاحية الوصول للوحة التحكم" : "You don't have permission to access the admin dashboard"}
      </div>
    );
  }

  const tabs = [
    { href: "/admin", label: locale === "ar" ? "لوحة التحكم" : "Dashboard" },
    { href: "/admin/orders", label: locale === "ar" ? "الطلبات" : "Orders" },
    { href: "/admin/products", label: locale === "ar" ? "المنتجات" : "Products" },
    { href: "/admin/categories", label: locale === "ar" ? "الفئات" : "Categories" },
    { href: "/admin/coupons", label: locale === "ar" ? "أكواد الخصم" : "Coupons" },
  ];

  return (
    <div>
      <nav className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-5xl gap-4 overflow-x-auto px-4 py-3 text-sm">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="whitespace-nowrap text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </nav>
      {children}
    </div>
  );
}
