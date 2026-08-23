"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { SupportedCurrency } from "@gcc-store/contracts";
import { detectCurrencyFromTimezone } from "@/lib/geoCurrency";

const CURRENCY_STORAGE_KEY = "gcc-store.currency.v1";

interface CurrencyContextValue {
  currency: SupportedCurrency;
  setCurrency: (currency: SupportedCurrency) => void;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

/**
 * Site-wide "display currency" — a client-only formatting preference, kept
 * deliberately separate from the real transactional `currency` every price
 * already carries end-to-end (variant/cart/order/payment all store SAR
 * today). This context never touches checkout: it only decides which
 * currency browsing/cart *displays* convert into before formatting.
 */
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>("SAR");

  // Read the saved preference once on mount (not during render) to avoid a
  // server/client markup mismatch — same pattern as CartProvider. A saved
  // preference is an explicit past choice, so it always wins; only a
  // first-ever visit falls through to auto-detecting the currency from the
  // visitor's timezone.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (saved) {
        setCurrencyState(saved as SupportedCurrency);
        return;
      }
    } catch {
      // Storage unavailable (private mode, etc.) — fall through to detection.
    }
    const detected = detectCurrencyFromTimezone();
    if (detected) setCurrencyState(detected);
  }, []);

  function setCurrency(next: SupportedCurrency) {
    setCurrencyState(next);
    try {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, next);
    } catch {
      // Non-fatal — the choice just won't persist across reloads.
    }
  }

  return <CurrencyContext.Provider value={{ currency, setCurrency }}>{children}</CurrencyContext.Provider>;
}

export function useDisplayCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useDisplayCurrency must be used within CurrencyProvider");
  return ctx;
}
