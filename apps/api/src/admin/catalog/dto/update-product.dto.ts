import { ApiPropertyOptional } from "@nestjs/swagger";
import { OmitType, PartialType } from "@nestjs/mapped-types";
import { IsIn, IsOptional } from "class-validator";
import { ProductLifecycleStatus } from "@gcc-store/db";
import { CreateProductDto } from "./create-product.dto";

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ["translations", "variants", "inputDefinitions"] as const),
) {
  @ApiPropertyOptional({ enum: ProductLifecycleStatus })
  @IsOptional()
  @IsIn(Object.values(ProductLifecycleStatus))
  status?: ProductLifecycleStatus;
}
