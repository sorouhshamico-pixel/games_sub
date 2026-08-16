import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CheckoutService } from "./checkout.service";

@ApiTags("orders")
@Controller("orders")
export class OrdersController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Get(":orderNumber")
  track(@Param("orderNumber") orderNumber: string, @Query("token") token: string) {
    return this.checkoutService.trackOrder(orderNumber, token);
  }
}
