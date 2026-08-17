"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Locale } from "@gcc-store/i18n";
import { Reveal, SuccessCheck } from "@/components/motion";
import { duration, easing } from "@/lib/motion/tokens";

/** Investor-demo signup form — the success state is a local UI transition
 * only, not backed by a real subscription endpoint (none exists yet), so
 * nothing is actually persisted or emailed. */
export function NewsletterSignup({ locale }: { locale: Locale }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  return (
    <Reveal>
      <section className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 p-6 text-center sm:p-8">
        <AnimatePresence mode="wait" initial={false}>
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: duration.normal, ease: easing } }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <SuccessCheck size={48} />
              <p className="font-semibold text-[var(--color-text-primary)]">
                {locale === "ar" ? "تم الاشتراك" : "You're subscribed"}
              </p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                {locale === "ar" ? "اشترك الآن" : "Subscribe now"}
              </h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                {locale === "ar" ? "كن أول من يعرف بالعروض الجديدة والخصومات الحصرية" : "Be the first to hear about new offers and exclusive discounts"}
              </p>
              <form onSubmit={handleSubmit} className="mx-auto mt-4 flex max-w-md flex-col gap-2 sm:flex-row">
                <label htmlFor="newsletter-email" className="sr-only">
                  {locale === "ar" ? "بريدك الإلكتروني" : "Your email"}
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={locale === "ar" ? "بريدك الإلكتروني" : "Your email"}
                  className="w-full flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-xl bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:brightness-110"
                >
                  {locale === "ar" ? "اشترك" : "Subscribe"}
                </button>
              </form>
              <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                {locale === "ar" ? "بيانات تجريبية لأغراض العرض فقط" : "Demo data for display purposes only"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </Reveal>
  );
}
