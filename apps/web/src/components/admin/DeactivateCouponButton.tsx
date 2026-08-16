"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@gcc-store/i18n";
import { useRouter } from "@/i18n/navigation";
import { deactivateAdminCoupon } from "@/lib/api";

export function DeactivateCouponButton({ couponId }: { couponId: string }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await deactivateAdminCoupon(couponId);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="rounded-lg border border-danger/40 px-3 py-1 text-xs font-medium text-danger hover:bg-danger/5 disabled:opacity-60"
    >
      {locale === "ar" ? "تعطيل" : "Deactivate"}
    </button>
  );
}
