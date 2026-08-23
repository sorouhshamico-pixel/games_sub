"use client";

import { useMemo } from "react";
import type { ProductSummary } from "@gcc-store/contracts";
import { ProductCard } from "@/components/ProductCard";
import { StaggerContainer, StaggerItem } from "@/components/motion";
import { demoDiscountFor } from "@/lib/discount";

/** Real catalog products, sorted biggest-discount-first using the same
 * shared, per-product discount every ProductCard already shows — so
 * "offers" isn't a separately curated/fabricated list, just the live
 * catalog viewed through its existing discount lens. */
export function OffersGrid({ products }: { products: ProductSummary[] }) {
  const sorted = useMemo(() => [...products].sort((a, b) => demoDiscountFor(b.id) - demoDiscountFor(a.id)), [products]);

  if (sorted.length === 0) return null;

  return (
    <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {sorted.map((product) => (
        <StaggerItem key={product.id}>
          <ProductCard product={product} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
