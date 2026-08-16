import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@gcc-store/i18n";
import { Link } from "@/i18n/navigation";

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

  const tabs = [
    { href: "/admin", label: locale === "ar" ? "لوحة التحكم" : "Dashboard" },
    { href: "/admin/orders", label: locale === "ar" ? "الطلبات" : "Orders" },
    { href: "/admin/products", label: locale === "ar" ? "المنتجات" : "Products" },
    { href: "/admin/categories", label: locale === "ar" ? "الفئات" : "Categories" },
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
