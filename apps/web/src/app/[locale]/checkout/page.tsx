"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { formatMoney } from "@gcc-store/ui";
import type { Locale } from "@gcc-store/i18n";
import { Link, useRouter } from "@/i18n/navigation";
import { useCart } from "@/components/CartProvider";
import { SuccessCheck } from "@/components/motion";
import { duration, easing } from "@/lib/motion/tokens";
import { cartTotal } from "@/lib/cart";
import { ApiError, checkout, confirmMockPayment } from "@/lib/api";

type Step = "form" | "confirming" | "confirm-mock" | "success";

const stepMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: duration.medium, ease: easing } },
  exit: { opacity: 0, y: -6, transition: { duration: duration.fast, ease: easing } },
};

export default function CheckoutPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const router = useRouter();
  const { items, clear } = useCart();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState<string | null>(null);
  const [pendingPayment, setPendingPayment] = useState<{ paymentId: string; orderNumber: string; trackingToken: string } | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountMinorUnits: number; totalMinorUnits: number } | null>(null);

  if (items.length === 0 && step === "form") {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-20 text-center">
        <p className="text-lg font-semibold text-[var(--color-text-primary)]">
          {locale === "ar" ? "سلتك فارغة" : "Your cart is empty"}
        </p>
        <Link
          href="/games"
          className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-brand-primary px-6 text-sm font-semibold text-white shadow-lg shadow-brand-primary/30 transition-all hover:-translate-y-0.5 hover:brightness-110"
        >
          {t("home.heroCta")}
        </Link>
      </div>
    );
  }

  const total = cartTotal(items);
  const currency = items[0]?.currency ?? "SAR";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setStep("confirming");

    try {
      const response = await checkout({
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          inputValues: item.inputValues,
        })),
        guestEmail: email || undefined,
        guestPhone: phone || undefined,
        couponCode: couponCode.trim() || undefined,
      });

      if (response.couponCode) {
        setAppliedCoupon({
          code: response.couponCode,
          discountMinorUnits: response.discountMinorUnits,
          totalMinorUnits: response.totalMinorUnits,
        });
      }

      if (response.payment.gatewayCode === "mock") {
        setPendingPayment({ paymentId: response.payment.paymentId, orderNumber: response.orderNumber, trackingToken: response.trackingToken });
        setStep("confirm-mock");
      } else if (response.payment.checkoutUrl) {
        window.location.href = response.payment.checkoutUrl;
      } else {
        setError(locale === "ar" ? "تعذر بدء الدفع" : "Could not start payment");
        setStep("form");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : locale === "ar" ? "حدث خطأ غير متوقع" : "Something went wrong");
      setStep("form");
    }
  }

  async function handleConfirmMockPayment() {
    if (!pendingPayment) return;
    setError(null);
    try {
      await confirmMockPayment(pendingPayment.paymentId);
      clear();
      setStep("success");
      // Let the success state actually be seen before leaving the page —
      // otherwise the checkmark animation would never finish rendering.
      window.setTimeout(() => {
        router.push(`/orders/${pendingPayment.orderNumber}?token=${pendingPayment.trackingToken}`);
      }, 1400);
    } catch {
      setError(locale === "ar" ? "تعذر تأكيد الدفع" : "Could not confirm payment");
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">{locale === "ar" ? "الدفع" : "Checkout"}</h1>

      {step !== "success" ? (
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="mb-3 font-bold text-[var(--color-text-primary)]">{locale === "ar" ? "ملخص الطلب" : "Order summary"}</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {items.map((item) => (
              <li key={item.key} className="flex items-center justify-between text-[var(--color-text-muted)]">
                <span>
                  {locale === "ar" ? item.nameAr : item.nameEn} × {item.quantity}
                </span>
                <span>{formatMoney(item.unitPriceMinorUnits * item.quantity, item.currency, locale)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
            <span className="font-medium text-[var(--color-text-primary)]">{locale === "ar" ? "الإجمالي" : "Total"}</span>
            <span className="text-lg font-bold text-brand-accent">{formatMoney(total, currency, locale)}</span>
          </div>
        </section>
      ) : null}

      <AnimatePresence mode="wait" initial={false}>
      {step === "success" ? (
        <motion.section key="success" {...stepMotion} className="flex flex-col items-center gap-4 py-10 text-center">
          <SuccessCheck size={72} />
          <motion.p
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: duration.normal, ease: easing, delay: 0.3 } }}
            className="text-xl font-bold text-[var(--color-text-primary)]"
          >
            {locale === "ar" ? "تم استلام طلبك" : "Your order was received"}
          </motion.p>
          <p className="text-sm text-[var(--color-text-muted)]">
            {locale === "ar" ? "جارٍ تحويلك لصفحة الطلب..." : "Redirecting you to your order..."}
          </p>
        </motion.section>
      ) : step !== "confirm-mock" ? (
        <motion.form key="form" {...stepMotion} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">
              {locale === "ar" ? "رقم الجوال" : "Phone number"}
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={locale === "ar" ? "05xxxxxxxx" : "05xxxxxxxx"}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">
              {locale === "ar" ? "البريد الإلكتروني (اختياري)" : "Email (optional)"}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
            />
          </div>
          <div>
            <label htmlFor="couponCode" className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">
              {locale === "ar" ? "كود الخصم (اختياري)" : "Coupon code (optional)"}
            </label>
            <input
              id="couponCode"
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder={locale === "ar" ? "أدخل الكود" : "Enter code"}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2.5 text-sm uppercase text-[var(--color-text-primary)] transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
            />
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              {locale === "ar"
                ? "سيتم التحقق من الكود وتطبيق الخصم عند إتمام الدفع"
                : "The code is validated and applied when you continue to payment"}
            </p>
          </div>

          {error ? (
            <p role="alert" className="rounded-xl border border-danger/40 bg-danger/5 p-3 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={step === "confirming"}
            className="flex h-12 items-center justify-center rounded-xl bg-brand-primary text-base font-semibold text-white shadow-lg shadow-brand-primary/30 transition-all hover:-translate-y-0.5 hover:brightness-110 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none"
          >
            {step === "confirming" ? t("common.loading") : locale === "ar" ? "متابعة الدفع" : "Continue to payment"}
          </button>
        </motion.form>
      ) : (
        <motion.section key="confirm-mock" {...stepMotion} className="flex flex-col gap-4">
          {appliedCoupon ? (
            <div className="rounded-2xl border border-success/40 bg-success/5 p-4 text-sm text-[var(--color-text-primary)]">
              <p className="font-medium">
                {locale === "ar" ? `تم تطبيق كود الخصم ${appliedCoupon.code}` : `Coupon ${appliedCoupon.code} applied`}
              </p>
              <p className="mt-1 text-[var(--color-text-muted)]">
                {locale === "ar" ? "الخصم" : "Discount"}: -{formatMoney(appliedCoupon.discountMinorUnits, currency, locale)} ·{" "}
                {locale === "ar" ? "الإجمالي بعد الخصم" : "New total"}: {formatMoney(appliedCoupon.totalMinorUnits, currency, locale)}
              </p>
            </div>
          ) : null}
          <div role="status" className="rounded-2xl border border-brand-secondary/40 bg-brand-secondary/5 p-5 text-sm text-[var(--color-text-primary)]">
            <p className="font-medium">{locale === "ar" ? "وضع الدفع التجريبي" : "Test payment mode"}</p>
            <p className="mt-2 text-[var(--color-text-muted)]">
              {locale === "ar"
                ? "لا توجد بوابة دفع حقيقية مفعّلة بعد. اضغط الزر أدناه لمحاكاة نجاح الدفع وإتمام الطلب."
                : "No real payment gateway is enabled yet. Press the button below to simulate a successful payment and complete the order."}
            </p>
          </div>
          {error ? (
            <p role="alert" className="rounded-xl border border-danger/40 bg-danger/5 p-3 text-sm text-danger">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            onClick={handleConfirmMockPayment}
            className="flex h-12 items-center justify-center rounded-xl bg-success text-base font-semibold text-white shadow-lg shadow-success/30 transition-all hover:-translate-y-0.5 hover:brightness-110"
          >
            {locale === "ar" ? "محاكاة نجاح الدفع" : "Simulate successful payment"}
          </button>
        </motion.section>
      )}
      </AnimatePresence>
    </div>
  );
}
