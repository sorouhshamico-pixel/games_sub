import { randomUUID } from "node:crypto";
import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { prisma, OrderStatus, PaymentStatus, Prisma } from "@gcc-store/db";
import {
  computePriceBreakdown,
  validateProductInputValues,
  type ProductInputSchema,
  type SupportedCurrency,
} from "@gcc-store/contracts";
import { PAYMENT_GATEWAY, type PaymentGateway } from "../payments/payment-gateway.interface";
import { OrderStateMachine } from "./order-state-machine";
import { generateOrderNumber, generateTrackingToken } from "../common/tokens";
import type { CheckoutRequestDto } from "./dto/checkout-request.dto";

@Injectable()
export class CheckoutService {
  constructor(
    @Inject(PAYMENT_GATEWAY) private readonly gateway: PaymentGateway,
    private readonly orderStateMachine: OrderStateMachine,
  ) {}

  async checkout(request: CheckoutRequestDto, correlationId: string) {
    const variantIds = request.items.map((item) => item.variantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: { include: { inputDefinitions: true } } },
    });
    const variantById = new Map(variants.map((v) => [v.id, v]));

    let currency: SupportedCurrency | null = null;
    let subtotal = 0;
    let tax = 0;
    let discount = 0;
    const orderItemsData: Prisma.OrderItemCreateManyOrderInput[] = [];

    for (const requestedItem of request.items) {
      const variant = variantById.get(requestedItem.variantId);
      if (!variant || !variant.isActive || variant.product.status !== "ACTIVE" || variant.product.deletedAt) {
        throw new BadRequestException(`Product variant ${requestedItem.variantId} is not available`);
      }
      if (currency && currency !== variant.currency) {
        throw new BadRequestException("All items in one order must use the same currency");
      }
      currency = variant.currency;

      if (requestedItem.quantity < variant.minQuantityPerOrder || requestedItem.quantity > variant.maxQuantityPerOrder) {
        throw new BadRequestException(`Quantity for ${variant.sku} must be between ${variant.minQuantityPerOrder} and ${variant.maxQuantityPerOrder}`);
      }

      const inputSchema: ProductInputSchema = variant.product.inputDefinitions.map((field) => ({
        key: field.key,
        labelAr: field.labelAr,
        labelEn: field.labelEn,
        type: field.fieldType as "text" | "number" | "select" | "email",
        required: field.required,
        regex: field.regex ?? undefined,
        minLength: field.minLength ?? undefined,
        maxLength: field.maxLength ?? undefined,
        normalize: field.normalize as "trim" | "trimAndUppercase" | "digitsOnly",
      }));
      const validation = validateProductInputValues(inputSchema, requestedItem.inputValues ?? {});
      if (!validation.valid) {
        throw new BadRequestException({ message: "Invalid product input values", errors: validation.errors, variantId: variant.id });
      }

      // Price is always recomputed from the current DB row — a client-sent
      // price is never trusted, per master prompt section 7.
      const breakdown = computePriceBreakdown({
        baseCostMinorUnits: variant.baseCostMinorUnits,
        currency: variant.currency,
        marginBasisPoints: variant.marginBasisPoints,
        discountMinorUnits: variant.discountMinorUnits,
        taxRateBasisPoints: variant.taxRateBasisPoints,
      });

      subtotal += breakdown.listPrice.amountMinorUnits * requestedItem.quantity;
      tax += breakdown.taxAmount.amountMinorUnits * requestedItem.quantity;
      discount += (breakdown.discount?.amountMinorUnits ?? 0) * requestedItem.quantity;

      orderItemsData.push({
        variantId: variant.id,
        quantity: requestedItem.quantity,
        inputValuesJson: requestedItem.inputValues ?? {},
        priceSnapshotJson: breakdown as unknown as Prisma.InputJsonValue,
        productNameSnapshot: variant.product.slug,
      });
    }

    if (!currency) throw new BadRequestException("No items in checkout request");
    const total = subtotal - discount + tax;

    const orderNumber = generateOrderNumber();
    const trackingToken = generateTrackingToken();

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          trackingToken,
          guestEmail: request.guestEmail,
          guestPhone: request.guestPhone,
          status: OrderStatus.DRAFT,
          currency,
          subtotalMinorUnits: subtotal,
          discountMinorUnits: discount,
          taxMinorUnits: tax,
          totalMinorUnits: total,
          items: { createMany: { data: orderItemsData } },
        },
      });

      await tx.orderStatusEvent.create({
        data: { orderId: createdOrder.id, toStatus: OrderStatus.DRAFT, actorType: "customer", correlationId },
      });
      await this.orderStateMachine.transition(
        tx,
        createdOrder.id,
        OrderStatus.DRAFT,
        OrderStatus.PENDING_PAYMENT,
        { type: "customer" },
        "checkout_submitted",
        correlationId,
      );

      return createdOrder;
    });

    const idempotencyKey = randomUUID();
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        gatewayCode: this.gateway.code,
        status: PaymentStatus.PENDING,
        amountMinorUnits: total,
        currency,
        idempotencyKey,
      },
    });

    const intent = await this.gateway.createPaymentIntent({
      paymentId: payment.id,
      amountMinorUnits: total,
      currency,
      orderNumber: order.orderNumber,
      description: `Order ${order.orderNumber}`,
    });

    await prisma.payment.update({ where: { id: payment.id }, data: { gatewayReference: intent.gatewayReference } });

    return {
      orderNumber: order.orderNumber,
      trackingToken: order.trackingToken,
      totalMinorUnits: total,
      currency,
      payment: { paymentId: payment.id, gatewayCode: this.gateway.code, checkoutUrl: intent.checkoutUrl },
    };
  }

  async trackOrder(orderNumber: string, token: string) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: { include: { variant: { include: { product: { include: { translations: true } } } }, fulfillments: true } },
        statusEvents: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!order || order.trackingToken !== token) {
      throw new NotFoundException("Order not found");
    }

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      currency: order.currency,
      totalMinorUnits: order.totalMinorUnits,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        productName: item.variant.product.translations.find((t) => t.locale === "ar")?.name ?? item.productNameSnapshot,
        quantity: item.quantity,
        totalMinorUnits: (item.priceSnapshotJson as { total?: { amountMinorUnits?: number } })?.total?.amountMinorUnits
          ? ((item.priceSnapshotJson as { total: { amountMinorUnits: number } }).total.amountMinorUnits * item.quantity)
          : 0,
        fulfillmentStatus: item.fulfillments[0]?.status ?? null,
      })),
      timeline: order.statusEvents.map((event) => ({
        toStatus: event.toStatus,
        reason: event.reason,
        createdAt: event.createdAt.toISOString(),
      })),
    };
  }
}
