import { prisma, FulfillmentStatus, SupportedCurrency } from "@gcc-store/db";
import type { FulfillmentProvider } from "../providers/fulfillment-provider.interface";

function isSupportedCurrency(value: string): value is SupportedCurrency {
  return (Object.values(SupportedCurrency) as string[]).includes(value);
}

const STUCK_IN_PROGRESS_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes with no resolution is abnormal for our providers

/**
 * Periodic safety net independent of the queue: catches fulfillments that
 * got stuck IN_PROGRESS (worker crashed mid-job, a provider call hung past
 * any timeout we set) and routes them to manual review instead of leaving
 * them silently invisible forever. Also snapshots each active provider's
 * balance so admins can see it trending down without polling manually.
 */
export async function runReconciliation(providers: FulfillmentProvider[]): Promise<{ flaggedStuck: number; balanceSnapshots: number }> {
  const cutoff = new Date(Date.now() - STUCK_IN_PROGRESS_THRESHOLD_MS);

  const stuck = await prisma.fulfillment.updateMany({
    where: { status: FulfillmentStatus.IN_PROGRESS, updatedAt: { lt: cutoff } },
    data: { status: FulfillmentStatus.MANUAL_REVIEW, lastError: "stuck_in_progress_reconciled" },
  });

  let balanceSnapshots = 0;
  for (const provider of providers) {
    try {
      const { balanceMinorUnits, currency } = await provider.getBalance();
      if (!isSupportedCurrency(currency)) {
         
        console.error(`[reconciliation] provider ${provider.code} returned unsupported currency ${currency}`);
        continue;
      }
      const providerRow = await prisma.provider.findUnique({ where: { code: provider.code } });
      if (!providerRow) continue;
      await prisma.providerBalanceSnapshot.create({
        data: { providerId: providerRow.id, balanceMinorUnits, currency },
      });
      balanceSnapshots += 1;
    } catch (error) {
       
      console.error(`[reconciliation] failed to snapshot balance for provider ${provider.code}`, error);
    }
  }

  return { flaggedStuck: stuck.count, balanceSnapshots };
}

export function startReconciliationLoop(providers: FulfillmentProvider[], intervalMs = 5 * 60 * 1000): NodeJS.Timeout {
  return setInterval(() => {
    runReconciliation(providers).catch((error: unknown) => {
       
      console.error("[reconciliation] run failed", error);
    });
  }, intervalMs);
}
