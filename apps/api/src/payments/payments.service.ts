import { randomUUID } from "node:crypto";
import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";
import { prisma, OrderStatus, PaymentStatus, FulfillmentStatus, Prisma, OrderStateMachine, recordNotification } from "@gcc-store/db";
import { InvoicingService } from "../invoicing/invoicing.service";
import { PAYMENT_GATEWAY, type PaymentGateway, type ParsedWebhookEvent } from "./payment-gateway.interface";

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @Inject(PAYMENT_GATEWAY) private readonly gateway: PaymentGateway,
    private readonly orderStateMachine: OrderStateMachine,
    private readonly invoicingService: InvoicingService,
  ) {}

  async handleWebhook(rawBody: string, headers: Record<string, string | string[] | undefined>): Promise<void> {
    if (!this.gateway.verifyWebhookSignature(rawBody, headers)) {
      throw new BadRequestException("Invalid webhook signature");
    }
    const event = this.gateway.parseWebhookEvent(rawBody);
    await this.processGatewayEvent(event);
  }

  /**
   * Only ever reachable for Payment rows whose gatewayCode is "mock" — see
   * PaymentsController. Simulates the webhook the mock gateway has no real
   * counterparty to send.
   */
  async confirmMockPayment(paymentId: string, correlationId: string): Promise<void> {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment || payment.gatewayCode !== "mock") {
      throw new BadRequestException("Not a mock payment");
    }

    const event: ParsedWebhookEvent = {
      externalEventId: `mock_confirm_${paymentId}_${randomUUID()}`,
      gatewayReference: payment.gatewayReference ?? `mock_${paymentId}`,
      status: "paid",
      amountMinorUnits: payment.amountMinorUnits,
      currency: payment.currency,
    };
    await this.processGatewayEvent(event, correlationId);
  }

  private async processGatewayEvent(event: ParsedWebhookEvent, correlationId: string = randomUUID()): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // Unique(source, externalEventId) makes this idempotent: a retried
        // or duplicate-delivered webhook throws P2002 below and we bail out
        // having done nothing.
        await tx.webhookEvent.create({
          data: {
            source: this.gateway.code,
            externalEventId: event.externalEventId,
            signatureValid: true,
            payloadJson: event as unknown as Prisma.InputJsonValue,
            processedAt: new Date(),
          },
        });

        const payment = await tx.payment.findUnique({ where: { gatewayReference: event.gatewayReference } });
        if (!payment) {
          this.logger.warn(`Webhook for unknown gatewayReference ${event.gatewayReference}`);
          return;
        }

        // Already settled (e.g. gateway resent with a new event id for the
        // same payment) — record the event above for audit, but don't
        // re-run fulfillment enqueueing.
        if (payment.status === PaymentStatus.CAPTURED || payment.status === PaymentStatus.FAILED) {
          return;
        }

        if (payment.amountMinorUnits !== event.amountMinorUnits || payment.currency !== event.currency) {
          this.logger.error(
            `Amount/currency mismatch for payment ${payment.id}: expected ${payment.amountMinorUnits} ${payment.currency}, got ${event.amountMinorUnits} ${event.currency}`,
          );
          return;
        }

        const newPaymentStatus = event.status === "paid" ? PaymentStatus.CAPTURED : PaymentStatus.FAILED;
        await tx.payment.update({ where: { id: payment.id }, data: { status: newPaymentStatus } });
        await tx.paymentAttempt.create({
          data: {
            paymentId: payment.id,
            status: newPaymentStatus,
            failureReason: event.failureReason,
          },
        });

        const order = await tx.order.findUniqueOrThrow({ where: { id: payment.orderId } });

        if (event.status !== "paid") {
          await this.orderStateMachine.transition(
            tx,
            order.id,
            order.status,
            OrderStatus.FAILED,
            { type: "provider" },
            event.failureReason ?? "payment_failed",
            correlationId,
          );
          return;
        }

        await this.orderStateMachine.transition(
          tx,
          order.id,
          order.status,
          OrderStatus.PAID,
          { type: "provider" },
          "payment_captured",
          correlationId,
        );
        await this.orderStateMachine.transition(
          tx,
          order.id,
          OrderStatus.PAID,
          OrderStatus.FULFILLMENT_QUEUED,
          { type: "system" },
          "auto_enqueue_after_payment",
          correlationId,
        );

        const orderItems = await tx.orderItem.findMany({ where: { orderId: order.id } });
        for (const item of orderItems) {
          await tx.fulfillment.create({
            data: { orderItemId: item.id, status: FulfillmentStatus.QUEUED },
          });
        }

        await tx.outboxEvent.create({
          data: {
            eventType: "fulfillment.queued",
            payloadJson: { orderId: order.id, correlationId } as unknown as Prisma.InputJsonValue,
          },
        });

        await recordNotification(tx, {
          userId: order.userId,
          templateKey: "order_confirmed",
          payload: { orderId: order.id, orderNumber: order.orderNumber, recipientEmail: order.guestEmail },
        });

        await this.invoicingService.issueInvoice(tx, order);
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        this.logger.log(`Duplicate webhook event ignored: ${event.externalEventId}`);
        return;
      }
      throw error;
    }
  }
}
