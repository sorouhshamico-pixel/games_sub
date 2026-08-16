import { describe, expect, it } from "vitest";
import { OrderStatus } from "@gcc-store/db";
import { OrderStateMachine } from "./order-state-machine";

describe("OrderStateMachine.canTransition", () => {
  const machine = new OrderStateMachine();

  it("allows the happy path from draft through to completed", () => {
    expect(machine.canTransition(OrderStatus.DRAFT, OrderStatus.PENDING_PAYMENT)).toBe(true);
    expect(machine.canTransition(OrderStatus.PENDING_PAYMENT, OrderStatus.PAID)).toBe(true);
    expect(machine.canTransition(OrderStatus.PAID, OrderStatus.FULFILLMENT_QUEUED)).toBe(true);
    expect(machine.canTransition(OrderStatus.FULFILLMENT_QUEUED, OrderStatus.PROCESSING)).toBe(true);
    expect(machine.canTransition(OrderStatus.PROCESSING, OrderStatus.COMPLETED)).toBe(true);
  });

  it("rejects skipping straight from pending payment to fulfillment", () => {
    expect(machine.canTransition(OrderStatus.PENDING_PAYMENT, OrderStatus.FULFILLMENT_QUEUED)).toBe(false);
  });

  it("rejects moving out of terminal states", () => {
    expect(machine.canTransition(OrderStatus.REFUNDED, OrderStatus.PAID)).toBe(false);
    expect(machine.canTransition(OrderStatus.CANCELLED, OrderStatus.PENDING_PAYMENT)).toBe(false);
  });

  it("allows refunding from completed but not from draft", () => {
    expect(machine.canTransition(OrderStatus.COMPLETED, OrderStatus.REFUND_PENDING)).toBe(true);
    expect(machine.canTransition(OrderStatus.DRAFT, OrderStatus.REFUND_PENDING)).toBe(false);
  });
});
