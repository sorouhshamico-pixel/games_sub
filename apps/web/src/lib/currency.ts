import type { SupportedCurrency } from "@gcc-store/contracts";

/**
 * Approximate conversion rates, expressed as "units of this currency per
 * 1 SAR". Every Gulf currency here (bar KWD) is a hard, decades-old
 * official peg to the US dollar, so these aren't guessed figures — they're
 * derived from each central bank's published peg rate against SAR's own
 * 3.75-per-USD peg: AED 3.6725, QAR 3.64, BHD 0.376, OMR 0.3845 per USD.
 * KWD floats against an undisclosed basket rather than a hard peg, so its
 * entry is a commonly-cited approximate (~0.307/USD) rather than an
 * official constant — which is exactly why the switcher labels every
 * converted price as approximate rather than a live, to-the-fils rate.
 */
const RATE_PER_SAR: Record<SupportedCurrency, number> = {
  SAR: 1,
  AED: 0.979333,
  QAR: 0.970667,
  BHD: 0.100267,
  OMR: 0.102533,
  KWD: 0.081867,
};

/** Converts a minor-units amount from one supported currency to another. */
export function convertMinorUnits(amountMinorUnits: number, from: SupportedCurrency, to: SupportedCurrency): number {
  if (from === to) return amountMinorUnits;
  const amountInSar = amountMinorUnits / RATE_PER_SAR[from];
  return Math.round(amountInSar * RATE_PER_SAR[to]);
}

/** Short native abbreviation shown in the collapsed switcher trigger — reads
 * immediately as "this is a currency" (ر.س) rather than an opaque ISO code. */
export const currencyAbbreviation: Record<SupportedCurrency, { ar: string; en: string }> = {
  SAR: { ar: "ر.س", en: "SAR" },
  AED: { ar: "د.إ", en: "AED" },
  KWD: { ar: "د.ك", en: "KWD" },
  QAR: { ar: "ر.ق", en: "QAR" },
  BHD: { ar: "د.ب", en: "BHD" },
  OMR: { ar: "ر.ع", en: "OMR" },
};

export const currencyLabels: Record<SupportedCurrency, { ar: string; en: string }> = {
  SAR: { ar: "ريال سعودي", en: "Saudi Riyal" },
  AED: { ar: "درهم إماراتي", en: "UAE Dirham" },
  KWD: { ar: "دينار كويتي", en: "Kuwaiti Dinar" },
  QAR: { ar: "ريال قطري", en: "Qatari Riyal" },
  BHD: { ar: "دينار بحريني", en: "Bahraini Dinar" },
  OMR: { ar: "ريال عماني", en: "Omani Rial" },
};

/** ISO country code behind each currency, for reusing country-flag-icons as currency icons. */
export const currencyCountry: Record<SupportedCurrency, string> = {
  SAR: "SA",
  AED: "AE",
  KWD: "KW",
  QAR: "QA",
  BHD: "BH",
  OMR: "OM",
};

export const currencyOrder: SupportedCurrency[] = ["SAR", "AED", "KWD", "QAR", "BHD", "OMR"];
