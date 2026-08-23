import { AlertTriangle } from "lucide-react";
import type { Locale } from "@gcc-store/i18n";

/** Real, admin-controlled (Settings -> maintenanceMode) — not decorative.
 * Server-rendered from a fresh fetch on every request (force-dynamic
 * layout), so toggling it in the admin panel takes effect on the very next
 * page load, no redeploy or cache invalidation involved. */
export function MaintenanceBanner({ locale }: { locale: Locale }) {
  return (
    <div className="relative z-50 flex items-center justify-center gap-2 bg-danger px-4 py-2 text-center text-sm font-medium text-white">
      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
      {locale === "ar"
        ? "المتجر قيد الصيانة حاليًا — قد تواجه بعض الأعطال المؤقتة"
        : "The store is currently under maintenance — you may run into temporary issues"}
    </div>
  );
}
