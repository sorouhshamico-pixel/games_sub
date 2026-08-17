import { ShahnooIcon } from "@gcc-store/ui";

/**
 * Used whenever a product has no real image — which is most demo products,
 * since the master prompt forbids fabricating photos/logos for licensed
 * games. This is a deliberate branded placeholder (gradient + watermark +
 * initial), not a stand-in for a real product photo.
 */
export function ProductImagePlaceholder({
  label,
  className,
  labelClassName = "text-3xl",
}: {
  label: string;
  className?: string;
  labelClassName?: string;
}) {
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-brand-primary/15 via-[var(--color-surface-elevated)] to-brand-secondary/15 ${className ?? ""}`}
    >
      <ShahnooIcon className="absolute -end-6 -bottom-6 h-28 w-28 rotate-12 opacity-10" />
      <span className={`relative font-bold text-brand-primary ${labelClassName}`}>{label}</span>
    </div>
  );
}
