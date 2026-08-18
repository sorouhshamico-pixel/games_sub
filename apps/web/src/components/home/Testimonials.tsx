"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { Quote } from "lucide-react";
import type { Locale } from "@gcc-store/i18n";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion";
import { duration, easing, spring } from "@/lib/motion/tokens";
import { SectionHeading } from "./SectionHeading";
import { StarIcon } from "./icons";

// Cycled gradient rings so avatars read as distinct, colorful placeholders
// rather than a flat single-letter tile — deliberately not real photos of
// people, since a stock headshot next to a fabricated quote would falsely
// imply a specific real customer said it.
const avatarGradients = [
  "from-brand-primary to-brand-secondary",
  "from-brand-secondary to-brand-accent",
  "from-brand-accent to-brand-primary",
  "from-brand-primary to-brand-accent",
  "from-brand-secondary to-brand-primary",
  "from-brand-accent to-brand-secondary",
];

const reviews: Array<{ ar: { name: string; quote: string }; en: { name: string; quote: string } }> = [
  {
    ar: { name: "فيصل", quote: "شحن سريع جدًا ووصل الرصيد خلال دقائق من إتمام الدفع." },
    en: { name: "Faisal", quote: "Super fast — my balance arrived within minutes of paying." },
  },
  {
    ar: { name: "نورة", quote: "واجهة بسيطة وواضحة، ولقيت اللعبة اللي أبيها بسهولة." },
    en: { name: "Noura", quote: "Clean, simple interface — found what I needed right away." },
  },
  {
    ar: { name: "عبدالله", quote: "الدعم الفني رد علي بسرعة لما واجهت استفسار بسيط." },
    en: { name: "Abdullah", quote: "Support answered quickly when I had a simple question." },
  },
  {
    ar: { name: "سارة", quote: "أفضل مكان أشتري منه بطاقات الهدايا، الأسعار ممتازة والتسليم فوري." },
    en: { name: "Sarah", quote: "Best place I've found for gift cards — great prices and instant delivery." },
  },
  {
    ar: { name: "خالد", quote: "عملية الدفع سهلة وسريعة، ما احتجت أكثر من دقيقتين لإتمام الطلب." },
    en: { name: "Khalid", quote: "Checkout was quick and easy — took less than two minutes to complete my order." },
  },
  {
    ar: { name: "منى", quote: "أثق بالمتجر تمامًا، تعاملت معهم أكثر من مرة وكل شيء كان ممتاز." },
    en: { name: "Mona", quote: "I trust this store completely — I've ordered multiple times and it's always been great." },
  },
];

const ADVANCE_MS = 5500;

const starContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};
const starItem = {
  hidden: { opacity: 0, scale: 0, rotate: -30 },
  visible: { opacity: 1, scale: 1, rotate: 0, transition: { type: "spring" as const, ...spring } },
};

/** Investor-demo illustrative reviews — first names only, no photos or
 * ratings tied to real accounts, clearly labeled as demo data. */
export function Testimonials({ locale }: { locale: Locale }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || paused) return;
    const id = window.setInterval(() => setActive((prev) => (prev + 1) % reviews.length), ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion, paused]);

  // Subtle 3D tilt following the cursor within the spotlight card — springs
  // back to flat on mouse leave. Desktop pointer-only; inert (not broken)
  // on touch since it never fires without a mousemove.
  const cardRef = useRef<HTMLDivElement>(null);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(useTransform(tiltY, [-0.5, 0.5], [5, -5]), spring);
  const rotateY = useSpring(useTransform(tiltX, [-0.5, 0.5], [-5, 5]), spring);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    tiltX.set((event.clientX - rect.left) / rect.width - 0.5);
    tiltY.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function resetTilt() {
    tiltX.set(0);
    tiltY.set(0);
    setPaused(false);
  }

  const current = locale === "ar" ? reviews[active]!.ar : reviews[active]!.en;

  return (
    <Reveal>
      <section aria-label={locale === "ar" ? "آراء عملائنا" : "What our customers say"}>
        <SectionHeading title={locale === "ar" ? "آراء عملائنا" : "What our customers say"} />

        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={resetTilt}
          style={{ rotateX, rotateY, transformPerspective: 800 }}
          className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-brand-primary/10 via-[var(--color-surface)] to-brand-secondary/10 p-8 sm:p-10"
        >
          <Quote aria-hidden className="absolute top-6 start-6 h-16 w-16 text-brand-primary/10" />

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 24, filter: "blur(6px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -24, filter: "blur(6px)" }}
              transition={{ duration: duration.medium, ease: easing }}
              className="relative flex flex-col items-center gap-4 text-center"
            >
              <motion.div key={`stars-${active}`} initial="hidden" animate="visible" variants={starContainer} className="flex items-center gap-1 text-brand-accent">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <motion.span key={starIndex} variants={starItem}>
                    <StarIcon className="h-5 w-5" />
                  </motion.span>
                ))}
              </motion.div>

              <p className="max-w-lg text-lg leading-relaxed text-[var(--color-text-primary)]">“{current.quote}”</p>

              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br text-base font-bold text-white ${avatarGradients[active % avatarGradients.length]}`}
                >
                  {current.name.slice(0, 1)}
                </span>
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">{current.name}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div className="mt-6 flex items-center justify-center gap-2.5" role="tablist">
          {reviews.map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={locale === "ar" ? `الرأي ${index + 1}` : `Testimonial ${index + 1}`}
              onClick={() => setActive(index)}
              className="relative h-1.5 w-8 overflow-hidden rounded-full bg-[var(--color-border)]"
            >
              {index === active ? (
                <motion.span
                  key={active}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={reducedMotion ? { duration: 0 } : { duration: ADVANCE_MS / 1000, ease: "linear" }}
                  className="absolute inset-0 origin-left bg-brand-primary"
                />
              ) : null}
            </button>
          ))}
        </div>

        <StaggerContainer className="mt-8 hidden gap-3 sm:grid sm:grid-cols-6">
          {reviews.map((review, index) => {
            const name = locale === "ar" ? review.ar.name : review.en.name;
            const isActive = index === active;
            return (
              <StaggerItem key={index}>
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  className={`flex w-full flex-col items-center gap-1.5 rounded-xl p-2 transition-colors ${isActive ? "bg-brand-primary/10" : "hover:bg-[var(--color-surface-elevated)]"}`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white transition-transform ${avatarGradients[index % avatarGradients.length]} ${isActive ? "scale-110 ring-2 ring-brand-primary ring-offset-2 ring-offset-[var(--color-surface)]" : ""}`}
                  >
                    {name.slice(0, 1)}
                  </span>
                  <span className="max-w-full truncate text-[11px] font-medium text-[var(--color-text-muted)]">{name}</span>
                </button>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        <p className="mt-4 text-center text-xs text-[var(--color-text-muted)]">
          {locale === "ar" ? "بيانات تجريبية لأغراض العرض فقط" : "Demo data for display purposes only"}
        </p>
      </section>
    </Reveal>
  );
}
