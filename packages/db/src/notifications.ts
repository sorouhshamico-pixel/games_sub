import type { Prisma } from "../generated/client";

export type NotificationTemplateKey = "order_confirmed" | "order_completed" | "order_failed" | "refund_issued";

/**
 * Mock notification "send": no real email/SMS provider is wired up yet (see
 * docs/NOTIFICATIONS.md), so this just writes an already-`sent` record. It's
 * a plain DB write — no network call — so callers run it inside the same
 * transaction as the business event it's about, the same way an
 * OrderStateMachine transition is never left dangling outside a commit.
 */
export async function recordNotification(
  tx: Prisma.TransactionClient,
  input: {
    userId?: string | null;
    channel?: "email" | "sms" | "whatsapp" | "in_app";
    templateKey: NotificationTemplateKey;
    payload?: Prisma.InputJsonValue;
  },
): Promise<void> {
  await tx.notification.create({
    data: {
      userId: input.userId ?? null,
      channel: input.channel ?? "email",
      templateKey: input.templateKey,
      status: "sent",
      payloadJson: input.payload,
      sentAt: new Date(),
    },
  });
}
