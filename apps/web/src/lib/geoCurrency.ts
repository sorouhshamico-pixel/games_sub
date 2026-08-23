import type { SupportedCurrency } from "@gcc-store/contracts";

// A real, though approximate, location signal read entirely client-side —
// no IP address or location data is ever sent to a third party. The
// browser/OS timezone is a strong signal for which GCC country a visitor
// is actually in; anything outside the six GCC timezones falls back to
// the site's SAR default, same as it already does today for a visitor we
// can't place.
const timezoneToCurrency: Record<string, SupportedCurrency> = {
  "Asia/Riyadh": "SAR",
  "Asia/Dubai": "AED",
  "Asia/Kuwait": "KWD",
  "Asia/Qatar": "QAR",
  "Asia/Bahrain": "BHD",
  "Asia/Muscat": "OMR",
};

export function detectCurrencyFromTimezone(): SupportedCurrency | null {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezoneToCurrency[timezone] ?? null;
  } catch {
    return null;
  }
}
