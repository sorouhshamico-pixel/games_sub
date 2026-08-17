import { Link } from "@/i18n/navigation";
import { BoltIcon } from "./icons";

export function SectionHeading({
  title,
  viewAllHref,
  viewAllLabel,
}: {
  title: string;
  viewAllHref?: Parameters<typeof Link>[0]["href"];
  viewAllLabel?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <h2 className="flex items-center gap-2 text-xl font-bold text-[var(--color-text-primary)] sm:text-2xl">
        <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-accent/15 text-brand-accent">
          <BoltIcon className="h-4 w-4" />
        </span>
        {title}
      </h2>
      {viewAllHref ? (
        <Link href={viewAllHref} className="shrink-0 text-sm font-medium text-brand-secondary hover:underline">
          {viewAllLabel} →
        </Link>
      ) : null}
    </div>
  );
}
