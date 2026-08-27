import { setRequestLocale } from "next-intl/server";
import { formatMoney } from "@gcc-store/ui";
import type { Locale } from "@gcc-store/i18n";
import { redirect } from "@/i18n/navigation";
import { ApiError, getAdminOrderDetail } from "@/lib/api";
import { getServerCookieHeader } from "@/lib/server-cookies";
import { RefundForm } from "@/components/admin/RefundForm";
import { OrderStatusChangeForm } from "@/components/admin/OrderStatusChangeForm";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const typedLocale = locale as Locale;
  setRequestLocale(typedLocale);

  const cookieHeader = await getServerCookieHeader();
  let order: Awaited<ReturnType<typeof getAdminOrderDetail>> | null = null;
  let forbidden = false;
  let notFound = false;
  try {
    order = await getAdminOrderDetail(id, { cookieHeader });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect({ href: "/login", locale: typedLocale });
    if (error instanceof ApiError && error.status === 403) forbidden = true;
    else if (error instanceof ApiError && error.status === 404) notFound = true;
    else throw error;
  }

  if (forbidden) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-[var(--color-text-muted)]">
        {locale === "ar" ? "ليس لديك صلاحية الوصول لهذه الصفحة" : "You don't have permission to view this page"}
      </div>
    );
  }
  if (notFound || !order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-[var(--color-text-muted)]">
        {locale === "ar" ? "الطلب غير موجود" : "Order not found"}
      </div>
    );
  }

  const canRefund = order.refundableMinorUnits > 0;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <div>
        <p className="font-mono text-sm text-[var(--color-text-muted)]">{order.orderNumber}</p>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          {locale === "ar" ? "الطلب" : "Order"} — {order.status}
        </h1>
      </div>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="mb-3 font-semibold text-[var(--color-text-primary)]">{locale === "ar" ? "العناصر" : "Items"}</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between text-[var(--color-text-muted)]">
              <span>
                {typedLocale === "ar" ? item.variant.nameAr : item.variant.nameEn} × {item.quantity}
                {item.fulfillments[0] ? ` — ${item.fulfillments[0].status}` : ""}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
          <span className="font-medium text-[var(--color-text-primary)]">{locale === "ar" ? "الإجمالي" : "Total"}</span>
          <span className="text-lg font-bold text-brand-accent">{formatMoney(order.totalMinorUnits, order.currency, typedLocale)}</span>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="mb-3 font-semibold text-[var(--color-text-primary)]">{locale === "ar" ? "المدفوعات" : "Payments"}</h2>
        <ul className="flex flex-col gap-1 text-sm text-[var(--color-text-muted)]">
          {order.payments.map((payment) => (
            <li key={payment.id}>
              {payment.gatewayCode} — {payment.status} — {formatMoney(payment.amountMinorUnits, order.currency, typedLocale)}
            </li>
          ))}
        </ul>
        {order.refunds.length > 0 ? (
          <>
            <h3 className="mb-1 mt-3 text-sm font-medium text-[var(--color-text-primary)]">{locale === "ar" ? "الاسترجاعات" : "Refunds"}</h3>
            <ul className="flex flex-col gap-1 text-sm text-[var(--color-text-muted)]">
              {order.refunds.map((refund) => (
                <li key={refund.id}>
                  {formatMoney(refund.amountMinorUnits, order.currency, typedLocale)} — {refund.status} — {refund.reason}
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      <OrderStatusChangeForm orderId={order.id} currentStatus={order.status} />

      {canRefund ? <RefundForm orderId={order.id} refundableMinorUnits={order.refundableMinorUnits} currency={order.currency} /> : null}

      {order.invoice ? (
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h2 className="mb-3 font-semibold text-[var(--color-text-primary)]">{locale === "ar" ? "الفاتورة الضريبية" : "Tax invoice"}</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-[var(--color-text-muted)]">
              <p>
                {locale === "ar" ? "رقم الفاتورة" : "Invoice number"}: <span className="font-mono text-[var(--color-text-primary)]">{order.invoice.invoiceNumber}</span>
              </p>
              <p>{new Date(order.invoice.issuedAt).toLocaleString(locale === "ar" ? "ar-SA" : "en-US")}</p>
              <p className="mt-2 max-w-sm text-xs">
                {locale === "ar"
                  ? "فاتورة ضريبية مبسطة (المرحلة الأولى من زاتكا) — رمز QR فقط، بدون تخليص إلكتروني حقيقي بعد."
                  : "ZATCA Phase 1 simplified tax invoice — QR only, no real electronic clearance yet."}
              </p>
            </div>
            {order.invoiceQrCodeDataUri ? (
              <img src={order.invoiceQrCodeDataUri} alt={locale === "ar" ? "رمز الفاتورة" : "Invoice QR code"} className="h-32 w-32 rounded-lg bg-white p-2" />
            ) : null}
          </div>
        </section>
      ) : null}

      {order.notifications.length > 0 ? (
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h2 className="mb-3 font-semibold text-[var(--color-text-primary)]">
            {locale === "ar" ? "الإشعارات المرسلة" : "Notifications sent"}
          </h2>
          <ul className="flex flex-col gap-1 text-sm text-[var(--color-text-muted)]">
            {order.notifications.map((notification) => (
              <li key={notification.id}>
                {notification.templateKey} — {notification.channel} — {notification.status}
                {notification.sentAt ? ` — ${new Date(notification.sentAt).toLocaleString(locale === "ar" ? "ar-SA" : "en-US")}` : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 font-semibold text-[var(--color-text-primary)]">{locale === "ar" ? "سجل الحالة" : "Status timeline"}</h2>
        <ol className="flex flex-col gap-2 border-s-2 border-[var(--color-border)] ps-4 text-sm">
          {order.statusEvents.map((event, index) => (
            <li key={index}>
              <p className="font-medium text-[var(--color-text-primary)]">
                {event.toStatus} <span className="font-normal text-[var(--color-text-muted)]">({event.actorType})</span>
              </p>
              {event.reason ? <p className="text-xs text-[var(--color-text-muted)]">{event.reason}</p> : null}
              <p className="text-xs text-[var(--color-text-muted)]">{new Date(event.createdAt).toLocaleString(locale === "ar" ? "ar-SA" : "en-US")}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
