import { Body, Controller, Headers, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { randomUUID } from "node:crypto";
import { CheckoutService } from "./checkout.service";
import { CheckoutRequestDto } from "./dto/checkout-request.dto";

@ApiTags("checkout")
@Controller("checkout")
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  checkout(@Body() body: CheckoutRequestDto, @Headers("x-correlation-id") correlationId?: string) {
    return this.checkoutService.checkout(body, correlationId ?? randomUUID());
  }
}
