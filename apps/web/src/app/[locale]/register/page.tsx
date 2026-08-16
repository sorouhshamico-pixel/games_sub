"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@gcc-store/i18n";
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError, registerAccount } from "@/lib/api";

export default function RegisterPage() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerAccount({ email, password, displayName: displayName || undefined });
      router.push("/account");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError(locale === "ar" ? "تعذر إنشاء الحساب بهذه البيانات" : "Unable to register with these details");
      } else if (err instanceof ApiError && err.status === 400) {
        setError(locale === "ar" ? "تحقق من البيانات المدخلة (كلمة المرور 10 أحرف على الأقل)" : "Check your details (password needs 10+ characters)");
      } else {
        setError(locale === "ar" ? "حدث خطأ غير متوقع" : "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{locale === "ar" ? "إنشاء حساب" : "Create account"}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">
            {locale === "ar" ? "الاسم (اختياري)" : "Name (optional)"}
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2 text-sm text-[var(--color-text-primary)]"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">
            {locale === "ar" ? "البريد الإلكتروني" : "Email"}
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2 text-sm text-[var(--color-text-primary)]"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">
            {locale === "ar" ? "كلمة المرور" : "Password"}
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={10}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2 text-sm text-[var(--color-text-primary)]"
          />
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {locale === "ar" ? "10 أحرف على الأقل" : "At least 10 characters"}
          </p>
        </div>
        {error ? (
          <p role="alert" className="rounded-xl border border-danger/40 bg-danger/5 p-3 text-sm text-danger">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="flex h-12 items-center justify-center rounded-xl bg-brand-primary text-base font-semibold text-white transition-colors hover:brightness-110 disabled:opacity-60"
        >
          {locale === "ar" ? "إنشاء حساب" : "Create account"}
        </button>
      </form>
      <p className="text-center text-sm text-[var(--color-text-muted)]">
        {locale === "ar" ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
        <Link href="/login" className="text-brand-primary underline">
          {locale === "ar" ? "تسجيل الدخول" : "Log in"}
        </Link>
      </p>
    </div>
  );
}
