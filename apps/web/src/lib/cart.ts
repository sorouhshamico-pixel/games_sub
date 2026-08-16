import type { SupportedCurrency } from "@gcc-store/contracts";

export interface CartItem {
  key: string; // `${variantId}:${JSON.stringify(inputValues)}` — distinct fulfillment targets stay separate lines
  productSlug: string;
  variantId: string;
  nameAr: string;
  nameEn: string;
  variantNameAr: string;
  variantNameEn: string;
  unitPriceMinorUnits: number;
  currency: SupportedCurrency;
  quantity: number;
  inputValues: Record<string, string>;
}

export const CART_STORAGE_KEY = "gcc-store.cart.v1";

export function readCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function writeCartToStorage(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function cartItemKey(variantId: string, inputValues: Record<string, string>): string {
  return `${variantId}:${JSON.stringify(inputValues)}`;
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPriceMinorUnits * item.quantity, 0);
}
