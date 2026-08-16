import { z } from "zod";
import { OrderStatus, SupportedCurrency } from "./enums";

export const checkoutItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().positive().max(50),
  inputValues: z.record(z.string(), z.string()).default({}),
});
export type CheckoutItem = z.infer<typeof checkoutItemSchema>;

export const checkoutRequestSchema = z.object({
  items: z.array(checkoutItemSchema).min(1).max(20),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().min(6).max(20).optional(),
  couponCode: z.string().optional(),
});
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

export const orderStatusEventSchema = z.object({
  toStatus: z.nativeEnum(OrderStatus),
  reason: z.string().nullable(),
  createdAt: z.string(),
});
export type OrderStatusEventView = z.infer<typeof orderStatusEventSchema>;

export const orderTrackingViewSchema = z.object({
  orderNumber: z.string(),
  status: z.nativeEnum(OrderStatus),
  currency: z.nativeEnum(SupportedCurrency),
  totalMinorUnits: z.number().int(),
  createdAt: z.string(),
  items: z.array(
    z.object({
      productName: z.string(),
      quantity: z.number().int(),
      totalMinorUnits: z.number().int(),
      fulfillmentStatus: z.string().nullable(),
    }),
  ),
  timeline: z.array(orderStatusEventSchema),
});
export type OrderTrackingView = z.infer<typeof orderTrackingViewSchema>;

export const checkoutResponseSchema = z.object({
  orderNumber: z.string(),
  trackingToken: z.string(),
  subtotalMinorUnits: z.number().int(),
  discountMinorUnits: z.number().int(),
  totalMinorUnits: z.number().int(),
  currency: z.nativeEnum(SupportedCurrency),
  couponCode: z.string().nullable(),
  payment: z.object({
    paymentId: z.string(),
    gatewayCode: z.string(),
    // Mock gateway: confirm client-side via /payments/mock/:id/confirm.
    // Real gateways: redirect the customer to checkoutUrl.
    checkoutUrl: z.string().nullable(),
  }),
});
export type CheckoutResponse = z.infer<typeof checkoutResponseSchema>;
