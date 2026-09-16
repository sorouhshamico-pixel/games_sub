import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional } from "class-validator";
import { ProductLifecycleStatus } from "@gcc-store/db";

export class ExportProductsQueryDto {
  @ApiPropertyOptional({ enum: ProductLifecycleStatus })
  @IsOptional()
  @IsIn(Object.values(ProductLifecycleStatus))
  status?: ProductLifecycleStatus;

  @ApiPropertyOptional()
  @IsOptional()
  categoryId?: string;
}
