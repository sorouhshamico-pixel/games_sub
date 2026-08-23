import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsString, MinLength } from "class-validator";
import { OrderStatus } from "@gcc-store/db";

// Only the manual-resolution targets the state machine's own docs flag as
// admin-relevant (see docs/ORDER_STATE_MACHINE.md's "what's not built yet"
// note on MANUAL_REVIEW) plus killing a stuck/abandoned order — never a
// status the payment/fulfillment/refund flows are supposed to set
// themselves (PAID, COMPLETED from PROCESSING, REFUNDED, ...). The service
// re-validates this same allow-list server-side; this is just for Swagger.
const ADMIN_SETTABLE_STATUSES = [
  OrderStatus.CANCELLED,
  OrderStatus.COMPLETED,
  OrderStatus.PARTIALLY_FULFILLED,
  OrderStatus.FAILED,
] as const;

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ADMIN_SETTABLE_STATUSES })
  @IsIn(ADMIN_SETTABLE_STATUSES)
  toStatus!: OrderStatus;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  reason!: string;
}
