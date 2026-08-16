import type { Prisma } from "@gcc-store/db";

interface DigitalCodeRow {
  id: string;
}

/**
 * Atomically claims one AVAILABLE code for a variant using row-level
 * locking (`FOR UPDATE SKIP LOCKED`) so two concurrent workers racing on the
 * same order-item type can never both claim the same code — one gets it,
 * the other's query simply skips the locked row and sees nothing available.
 * Prisma's query builder can't express `SKIP LOCKED`, hence raw SQL here.
 */
export async function reserveDigitalCode(
  tx: Prisma.TransactionClient,
  variantId: string,
  orderItemId: string,
): Promise<{ id: string } | null> {
  const rows = await tx.$queryRaw<DigitalCodeRow[]>`
    SELECT id FROM digital_codes
    WHERE "variantId" = ${variantId} AND status = 'AVAILABLE'
    ORDER BY "createdAt" ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  `;
  const claimed = rows[0];
  if (!claimed) return null;

  await tx.digitalCode.update({
    where: { id: claimed.id },
    data: { status: "RESERVED", reservedForOrderItemId: orderItemId },
  });

  return claimed;
}

export async function markDigitalCodeSold(tx: Prisma.TransactionClient, orderItemId: string): Promise<void> {
  await tx.digitalCode.updateMany({
    where: { reservedForOrderItemId: orderItemId, status: "RESERVED" },
    data: { status: "SOLD", soldAt: new Date() },
  });
}

/** Releases a reservation back to the pool when fulfillment fails after the code was claimed. */
export async function releaseDigitalCode(tx: Prisma.TransactionClient, orderItemId: string): Promise<void> {
  await tx.digitalCode.updateMany({
    where: { reservedForOrderItemId: orderItemId, status: "RESERVED" },
    data: { status: "AVAILABLE", reservedForOrderItemId: null },
  });
}
