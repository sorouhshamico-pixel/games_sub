"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Save } from "lucide-react";
import type { Locale } from "@gcc-store/i18n";
import { SuccessCheck } from "@/components/motion";
import { spring } from "@/lib/motion/tokens";

type SubmitState = "idle" | "saving" | "saved";

/** Investor-demo profile editor — same local-only pattern as the FAQ
 * contact form: there's no profile-update endpoint yet, so "saving" is a
 * UI transition only and nothing is actually persisted. */
export function AccountProfileForm({
  locale,
  initialName,
  initialEmail,
}: {
  locale: Locale;
  initialName: string;
  initialEmail: string;
}) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [state, setState] = useState<SubmitState>("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "saving") return;
    setState("saving");
    window.setTimeout(() => {
      setState("saved");
      window.setTimeout(() => setState("idle"), 1800);
    }, 600);
  }

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
        {locale === "ar" ? "تعديل الملف الشخصي" : "Edit profile"}
      </h2>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        {locale === "ar" ? "حدّث اسمك أو بريدك الإلكتروني" : "Update your name or email address"}
      </p>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-name" className="sr-only">
            {locale === "ar" ? "الاسم" : "Name"}
          </label>
          <input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={locale === "ar" ? "الاسم" : "Name"}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
          />
        </div>
        <div>
          <label htmlFor="profile-email" className="sr-only">
            {locale === "ar" ? "البريد الإلكتروني" : "Email"}
          </label>
          <input
            id="profile-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={locale === "ar" ? "البريد الإلكتروني" : "Email"}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
          />
        </div>

        <motion.button
          type="submit"
          disabled={state === "saving"}
          whileHover={state === "idle" ? { y: -2 } : undefined}
          whileTap={state === "idle" ? { scale: 0.985, y: 0 } : undefined}
          transition={{ type: "spring", ...spring }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-80 sm:col-span-2 sm:w-fit"
        >
          <AnimatePresence mode="wait" initial={false}>
            {state === "saving" ? (
              <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                {locale === "ar" ? "جارٍ الحفظ..." : "Saving..."}
              </motion.span>
            ) : state === "saved" ? (
              <motion.span key="saved" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <SuccessCheck size={18} />
                {locale === "ar" ? "تم الحفظ" : "Saved"}
              </motion.span>
            ) : (
              <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <Save className="h-4 w-4" aria-hidden />
                {locale === "ar" ? "حفظ التغييرات" : "Save changes"}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </form>

      <p className="mt-4 text-xs text-[var(--color-text-muted)]">
        {locale === "ar" ? "بيانات تجريبية لأغراض العرض فقط" : "Demo data for display purposes only"}
      </p>
    </section>
  );
}
