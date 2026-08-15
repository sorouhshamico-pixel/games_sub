import type { SupportedCurrency } from "@gcc-store/contracts";

// Every currency we support today uses 2 minor-unit digits (halalas, fils).
// If a zero-decimal currency is ever added, branch here explicitly.
export function formatMoney(amountMinorUnits: number, currency: SupportedCurrency, locale: "ar" | "en"): string {
  const amountMajorUnits = amountMinorUnits / 100;
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
  }).format(amountMajorUnits);
}
