"use client";

import { useTranslations } from "next-intl";
import { CartContents } from "@/components/CartContents";

export default function CartPage() {
  const t = useTranslations();

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col gap-6 px-4 py-10">
      <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">{t("nav.cart")}</h1>
      <CartContents />
    </div>
  );
}
