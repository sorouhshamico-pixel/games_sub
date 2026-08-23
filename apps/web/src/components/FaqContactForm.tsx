"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Send } from "lucide-react";
import type { Locale } from "@gcc-store/i18n";
import { Reveal, SuccessCheck } from "@/components/motion";
import { duration, easing, spring } from "@/lib/motion/tokens";

type SubmitState = "idle" | "sending" | "sent";

/** Investor-demo contact form — same pattern as the homepage's newsletter
 * signup: the success state is a local UI transition only, since there's
 * no real support-ticket endpoint yet. Nothing is actually sent anywhere. */
export function FaqContactForm({ locale }: { locale: Locale }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<SubmitState>("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim() || state === "sending") return;
    setState("sending");
    window.setTimeout(() => setState("sent"), 700);
  }

  return (
    <Reveal>
      <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-brand-primary/10 via-[var(--color-surface)] to-brand-secondary/10 p-6 sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -top-16 end-0 -z-10 h-48 w-48 rounded-full bg-brand-secondary/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-16 start-1/4 -z-10 h-40 w-40 rounded-full bg-brand-primary/15 blur-3xl" />

        <AnimatePresence mode="wait" initial={false}>
          {state === "sent" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: duration.normal, ease: easing } }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-6 text-center"
            >
              <SuccessCheck size={48} />
              <p className="font-semibold text-[var(--color-text-primary)]">
                {locale === "ar" ? "تم إرسال رسالتك" : "Your message was sent"}
              </p>
              <p className="max-w-sm text-sm text-[var(--color-text-muted)]">
                {locale === "ar" ? "سيتواصل معك فريق الدعم في أقرب وقت ممكن" : "Our support team will get back to you as soon as possible"}
              </p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)] sm:text-xl">
                {locale === "ar" ? "لم تجد إجابتك؟ راسلنا" : "Didn't find your answer? Message us"}
              </h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                {locale === "ar" ? "عبّئ النموذج وسنرد عليك في أسرع وقت" : "Fill out the form and we'll reply as fast as we can"}
              </p>

              <form onSubmit={handleSubmit} className="mt-5 grid gap-3 sm:grid-cols-3">
                <div>
                  <label htmlFor="contact-name" className="sr-only">
                    {locale === "ar" ? "الاسم" : "Name"}
                  </label>
                  <input
                    id="contact-name"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={locale === "ar" ? "الاسم" : "Name"}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="sr-only">
                    {locale === "ar" ? "البريد الإلكتروني" : "Email"}
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={locale === "ar" ? "البريد الإلكتروني" : "Email"}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
                  />
                </div>
                <div>
                  <label htmlFor="contact-phone" className="sr-only">
                    {locale === "ar" ? "رقم الجوال" : "Phone number"}
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder={locale === "ar" ? "رقم الجوال" : "Phone number"}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="contact-message" className="sr-only">
                    {locale === "ar" ? "رسالتك" : "Your message"}
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder={locale === "ar" ? "كيف يمكننا مساعدتك؟" : "How can we help?"}
                    className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={state === "sending"}
                  whileHover={state === "idle" ? { y: -2 } : undefined}
                  whileTap={state === "idle" ? { scale: 0.985, y: 0 } : undefined}
                  transition={{ type: "spring", ...spring }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-80 sm:col-span-3 sm:w-fit"
                >
                  {state === "sending" ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    <Send className="h-4 w-4" aria-hidden />
                  )}
                  {state === "sending" ? (locale === "ar" ? "جارٍ الإرسال..." : "Sending...") : locale === "ar" ? "إرسال الرسالة" : "Send message"}
                </motion.button>
              </form>

              <p className="mt-4 text-xs text-[var(--color-text-muted)]">
                {locale === "ar" ? "بيانات تجريبية لأغراض العرض فقط" : "Demo data for display purposes only"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </Reveal>
  );
}
