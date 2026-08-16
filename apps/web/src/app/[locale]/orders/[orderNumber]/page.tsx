import { getTranslations, setRequestLocale } from "next-intl/server";
import { formatMoney } from "@gcc-store/ui";
import type { Locale } from "@gcc-store/i18n";
import { Link } from "@/i18n/navigation";
import { ApiError, trackOrder } from "@/lib/api";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { ar: string; en: string }> = {
  DRAFT: { ar: "مسودة", en: "Draft" },
  PENDING_PAYMENT: { ar: "بانتظار الدفع", en: "Pending payment" },
  PAYMENT_REVIEW: { ar: "مراجعة الدفع", en: "Payment review" },
  PAID: { ar: "تم الدفع", en: "Paid" },
  FULFILLMENT_QUEUED: { ar: "في قائمة التنفيذ", en: "Queued for fulfillment" },
  PROCESSING: { ar: "قيد التنفيذ", en: "Processing" },
  PARTIALLY_FULFILLED: { ar: "تم التنفيذ جزئيًا", en: "Partially fulfilled" },
  COMPLETED: { ar: "تم التنفيذ بنجاح", en: "Completed" },
  MANUAL_REVIEW: { ar: "قيد المراجعة اليدوية", en: "In manual review" },
  FAILED: { ar: "فشل الطلب", en: "Failed" },
  CANCELLED: { ar: "ملغى", en: "Cancelled" },
  REFUND_PENDING: { ar: "الاسترجاع قيد التنفيذ", en: "Refund pending" },
  PARTIALLY_REFUNDED: { ar: "تم استرجاع جزء من المبلغ", en: "Partially refunded" },
  REFUNDED: { ar: "تم الاسترجاع", en: "Refunded" },
};

function statusLabel(status: string, locale: Locale): string {
  return STATUS_LABELS[status]?.[locale] ?? status;
}

export default async function OrderTrackingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; orderNumber: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale, orderNumber } = await params;
  const typedLocale = locale as Locale;
  setRequestLocale(typedLocale);
  const t = await getTranslations();
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-[var(--color-text-muted)]">
        {locale === "ar" ? "رابط تتبع غير صالح" : "Invalid tracking link"}
      </div>
    );
  }

  let order: Awaited<ReturnType<typeof trackOrder>> | null = null;
  let notFound = false;
  try {
    order = await trackOrder(orderNumber, token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound = true;
    else throw error;
  }

  if (notFound || !order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-lg font-medium text-[var(--color-text-primary)]">
          {locale === "ar" ? "لم يتم العثور على الطلب" : "Order not found"}
        </p>
        <Link href="/" className="mt-4 inline-block text-brand-primary underline">
          {t("nav.home")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <div>
        <p className="text-sm text-[var(--color-text-muted)]">{locale === "ar" ? "رقم الطلب" : "Order number"}</p>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{order.orderNumber}</h1>
      </div>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-medium text-[var(--color-text-primary)]">{locale === "ar" ? "الحالة" : "Status"}</span>
          <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-sm font-medium text-brand-primary">
            {statusLabel(order.status, typedLocale)}
          </span>
        </div>
        <ul className="flex flex-col gap-2 text-sm">
          {order.items.map((item, index) => (
            <li key={index} className="flex items-center justify-between text-[var(--color-text-muted)]">
              <span>
                {item.productName} × {item.quantity}
                {item.fulfillmentStatus ? ` — ${item.fulfillmentStatus}` : ""}
              </span>
              <span>{formatMoney(item.totalMinorUnits, order.currency, typedLocale)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
          <span className="font-medium text-[var(--color-text-primary)]">{locale === "ar" ? "الإجمالي" : "Total"}</span>
          <span className="text-lg font-bold text-brand-accent">{formatMoney(order.totalMinorUnits, order.currency, typedLocale)}</span>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-[var(--color-text-primary)]">{locale === "ar" ? "سجل الطلب" : "Order timeline"}</h2>
        <ol className="flex flex-col gap-3 border-s-2 border-[var(--color-border)] ps-4">
          {order.timeline.map((event, index) => (
            <li key={index}>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{statusLabel(event.toStatus, typedLocale)}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{new Date(event.createdAt).toLocaleString(locale === "ar" ? "ar-SA" : "en-US")}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
