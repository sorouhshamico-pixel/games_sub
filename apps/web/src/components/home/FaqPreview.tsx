import ReactMarkdown from "react-markdown";
import { ApiError, getPage } from "@/lib/api";
import { parseFaqMarkdown } from "@/lib/faq";
import { Link } from "@/i18n/navigation";
import { Reveal, MotionAccordion, type MotionAccordionItem } from "@/components/motion";
import { WhatsAppIcon } from "./icons";
import type { Locale } from "@gcc-store/i18n";

export async function FaqPreview({ locale }: { locale: Locale }) {
  let sections: ReturnType<typeof parseFaqMarkdown> = [];
  try {
    const page = await getPage("faq", locale);
    sections = parseFaqMarkdown(page.bodyMarkdown).slice(0, 4);
  } catch (error) {
    // The FAQ CMS page is optional content — a missing/unseeded page
    // shouldn't take down the homepage, it just skips this section.
    if (!(error instanceof ApiError)) throw error;
    return null;
  }
  if (sections.length === 0) return null;

  const items: MotionAccordionItem[] = sections.map((section) => ({
    id: section.id,
    trigger: section.question,
    content: (
      <div className="[&_a]:text-brand-primary [&_a]:underline">
        <ReactMarkdown>{section.answer}</ReactMarkdown>
      </div>
    ),
  }));

  return (
    <Reveal>
      <section className="grid gap-4 sm:grid-cols-5">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:col-span-3 sm:p-8">
          <h2 className="mb-2 text-xl font-bold text-[var(--color-text-primary)] sm:text-2xl">
            {locale === "ar" ? "الأسئلة الشائعة" : "Frequently asked questions"}
          </h2>
          <MotionAccordion items={items} />
          <Link href="/pages/faq" className="mt-4 inline-block text-sm font-medium text-brand-secondary hover:underline">
            {locale === "ar" ? "عرض كل الأسئلة" : "View all questions"} →
          </Link>
        </div>
        <div className="flex flex-col justify-center gap-3 rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 p-6 text-center sm:col-span-2 sm:p-8">
          <span aria-hidden className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#25D366]/15 text-[#25D366]">
            <WhatsAppIcon className="h-7 w-7" />
          </span>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {locale === "ar" ? "تحتاج مساعدة؟" : "Need help?"}
          </h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            {locale === "ar" ? "فريقنا جاهز للإجابة على استفساراتك" : "Our team is ready to answer your questions"}
          </p>
          {/* Styled as a WhatsApp-style contact CTA — routed to the real help
              center rather than a fabricated phone number, since a wrong or
              placeholder wa.me number would message a real, unrelated person. */}
          <Link
            href="/pages/faq"
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:brightness-110"
          >
            <WhatsAppIcon className="h-4 w-4" />
            {locale === "ar" ? "تواصل معنا" : "Contact us"}
          </Link>
        </div>
      </section>
    </Reveal>
  );
}
