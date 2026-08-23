import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import { setRequestLocale } from "next-intl/server";
import { Clock3, HelpCircle, MessageCircle, ShieldCheck } from "lucide-react";
import { ApiError, getPage, getPublicStoreSettings } from "@/lib/api";
import { FaqAccordion } from "@/components/FaqAccordion";
import { FaqContactForm } from "@/components/FaqContactForm";
import { Reveal } from "@/components/motion";
import type { Locale } from "@gcc-store/i18n";

export const dynamic = "force-dynamic";

async function loadPage(slug: string, locale: Locale) {
  try {
    return await getPage(slug, locale);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await loadPage(slug, locale as Locale);
  if (!page) return {};
  return { title: page.title };
}

export default async function CmsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const typedLocale = locale as Locale;
  setRequestLocale(typedLocale);

  const page = await loadPage(slug, typedLocale);
  if (!page) notFound();

  if (slug !== "faq") {
    return (
      <article className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-6 text-2xl font-bold text-[var(--color-text-primary)]">{page.title}</h1>
        <div className="prose-content flex flex-col gap-4 text-sm leading-relaxed text-[var(--color-text-muted)] [&_a]:text-brand-primary [&_a]:underline [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-[var(--color-text-primary)] [&_strong]:text-[var(--color-text-primary)]">
          <ReactMarkdown>{page.bodyMarkdown}</ReactMarkdown>
        </div>
      </article>
    );
  }

  let supportEmail: string | null = null;
  try {
    ({ supportEmail } = await getPublicStoreSettings());
  } catch {
    supportEmail = null;
  }

  const infoTiles = [
    {
      Icon: MessageCircle,
      titleAr: "تواصل عبر واتساب",
      titleEn: "WhatsApp support",
      subAr: "أسرع طريقة للتواصل معنا",
      subEn: "The fastest way to reach us",
    },
    {
      Icon: Clock3,
      titleAr: "الرد خلال دقائق",
      titleEn: "Reply within minutes",
      subAr: "دعم فني متواصل على مدار الساعة",
      subEn: "Round-the-clock support",
    },
    {
      Icon: ShieldCheck,
      titleAr: "بياناتك بأمان",
      titleEn: "Your data is safe",
      subAr: "لا نشارك معلوماتك مع أي جهة",
      subEn: "We never share your information",
    },
  ];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-10">
      <Reveal>
        <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-brand-primary/10 via-[var(--color-surface)] to-brand-secondary/10 p-8 text-center sm:p-12">
          <div aria-hidden className="pointer-events-none absolute -top-16 start-1/4 -z-10 h-56 w-56 rounded-full bg-brand-primary/15 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-20 end-1/4 -z-10 h-56 w-56 rounded-full bg-brand-secondary/15 blur-3xl" />

          <span aria-hidden className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/15 text-brand-primary">
            <HelpCircle className="h-7 w-7" />
          </span>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">{page.title}</h1>
          <p className="mx-auto mt-3 max-w-lg text-[var(--color-text-muted)]">
            {locale === "ar"
              ? "كل ما تحتاج معرفته عن الشحن والدفع والاسترجاع — ولو ما لقيت إجابتك، فريقنا جاهز يساعدك"
              : "Everything you need to know about top-ups, payments, and refunds — and if you can't find your answer, our team is ready to help"}
          </p>
        </section>
      </Reveal>

      <Reveal>
        <div className="grid gap-4 sm:grid-cols-3">
          {infoTiles.map((tile, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/15 text-brand-primary">
                <tile.Icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{locale === "ar" ? tile.titleAr : tile.titleEn}</p>
                <p className="truncate text-xs text-[var(--color-text-muted)]">{locale === "ar" ? tile.subAr : tile.subEn}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <FaqAccordion markdown={page.bodyMarkdown} />
      </Reveal>

      <FaqContactForm locale={typedLocale} supportEmail={supportEmail} />
    </div>
  );
}
