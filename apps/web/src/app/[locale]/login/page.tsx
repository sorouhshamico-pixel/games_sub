"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@gcc-store/i18n";
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError, login } from "@/lib/api";

export default function LoginPage() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? locale === "ar"
            ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
            : "Invalid email or password"
          : locale === "ar"
            ? "حدث خطأ غير متوقع"
            : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{locale === "ar" ? "تسجيل الدخول" : "Log in"}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2 text-sm text-[var(--color-text-primary)]"
          />
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
          {locale === "ar" ? "تسجيل الدخول" : "Log in"}
        </button>
      </form>
      <p className="text-center text-sm text-[var(--color-text-muted)]">
        {locale === "ar" ? "ليس لديك حساب؟" : "Don't have an account?"}{" "}
        <Link href="/register" className="text-brand-primary underline">
          {locale === "ar" ? "إنشاء حساب" : "Sign up"}
        </Link>
      </p>
    </div>
  );
}
