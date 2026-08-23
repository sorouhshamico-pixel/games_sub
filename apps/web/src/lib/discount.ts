// Investor-demo decorative discount, deterministic per product id so the
// same product always shows the same "-X%" everywhere its price appears
// (category grids, related products, brand pages, the product page itself).
// Never affects the real price — every caller derives the crossed-out
// "original" price FROM the real price, never the other way around, so
// what's bold/charged at checkout is always the product's actual listed
// price.
const demoDiscountPercents = [15, 20, 10, 25, 30];

export function demoDiscountFor(id: string): number {
  let sum = 0;
  for (let i = 0; i < id.length; i += 1) sum += id.charCodeAt(i);
  return demoDiscountPercents[sum % demoDiscountPercents.length]!;
}
