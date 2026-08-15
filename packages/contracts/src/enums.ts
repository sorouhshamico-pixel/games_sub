export const ProductType = {
  GAME_TOPUP: "GAME_TOPUP",
  DIGITAL_CODE: "DIGITAL_CODE",
  SUBSCRIPTION: "SUBSCRIPTION",
  GIFT_CARD: "GIFT_CARD",
  MANUAL_DIGITAL_SERVICE: "MANUAL_DIGITAL_SERVICE",
} as const;
export type ProductType = (typeof ProductType)[keyof typeof ProductType];

// Payment and fulfillment are tracked as separate state machines from
// OrderStatus, which is the aggregate view — see docs/ORDER_STATE_MACHINE.md.
export const OrderStatus = {
  DRAFT: "DRAFT",
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PAYMENT_REVIEW: "PAYMENT_REVIEW",
  PAID: "PAID",
  FULFILLMENT_QUEUED: "FULFILLMENT_QUEUED",
  PROCESSING: "PROCESSING",
  PARTIALLY_FULFILLED: "PARTIALLY_FULFILLED",
  COMPLETED: "COMPLETED",
  MANUAL_REVIEW: "MANUAL_REVIEW",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  REFUND_PENDING: "REFUND_PENDING",
  PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED",
  REFUNDED: "REFUNDED",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentStatus = {
  PENDING: "PENDING",
  AUTHORIZED: "AUTHORIZED",
  CAPTURED: "CAPTURED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
  PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const FulfillmentStatus = {
  QUEUED: "QUEUED",
  IN_PROGRESS: "IN_PROGRESS",
  SUCCEEDED: "SUCCEEDED",
  FAILED: "FAILED",
  MANUAL_REVIEW: "MANUAL_REVIEW",
  CANCELLED: "CANCELLED",
} as const;
export type FulfillmentStatus = (typeof FulfillmentStatus)[keyof typeof FulfillmentStatus];

export const UserRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  OPERATIONS: "OPERATIONS",
  FINANCE: "FINANCE",
  SUPPORT: "SUPPORT",
  CATALOG_MANAGER: "CATALOG_MANAGER",
  CONTENT_SEO: "CONTENT_SEO",
  READ_ONLY_ANALYST: "READ_ONLY_ANALYST",
  CUSTOMER: "CUSTOMER",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const SupportedCurrency = {
  SAR: "SAR",
  AED: "AED",
  KWD: "KWD",
  QAR: "QAR",
  BHD: "BHD",
  OMR: "OMR",
} as const;
export type SupportedCurrency = (typeof SupportedCurrency)[keyof typeof SupportedCurrency];
