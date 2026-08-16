import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import { setRequestLocale } from "next-intl/server";
import { ApiError, getPage } from "@/lib/api";
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

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-[var(--color-text-primary)]">{page.title}</h1>
      <div className="prose-content flex flex-col gap-4 text-sm leading-relaxed text-[var(--color-text-muted)] [&_a]:text-brand-primary [&_a]:underline [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-[var(--color-text-primary)] [&_strong]:text-[var(--color-text-primary)]">
        <ReactMarkdown>{page.bodyMarkdown}</ReactMarkdown>
      </div>
    </article>
  );
}
