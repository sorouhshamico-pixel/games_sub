import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function LocaleNotFound() {
  const t = await getTranslations();

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="text-5xl font-bold text-brand-primary">404</p>
      <p className="text-lg font-medium text-[var(--color-text-primary)]">{t("common.empty")}</p>
      <Link href="/" className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-medium text-white">
        {t("nav.home")}
      </Link>
    </div>
  );
}
