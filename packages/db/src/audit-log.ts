import type { Prisma, PrismaClient } from "../generated/client";

/**
 * Records one admin action against the AuditLog table that already existed
 * in the schema (User.auditLogs) but was never written to anywhere. Same
 * "runs inside the caller's own transaction" convention as
 * recordNotification — an audit entry for a mutation that then rolls back
 * would be worse than no entry at all.
 */
export async function recordAuditLog(
  tx: Prisma.TransactionClient | PrismaClient,
  input: {
    actorUserId: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Prisma.InputJsonValue;
  },
): Promise<void> {
  await tx.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadataJson: input.metadata,
    },
  });
}
