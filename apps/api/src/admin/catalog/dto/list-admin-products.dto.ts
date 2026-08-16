import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, Min } from "class-validator";
import { ProductLifecycleStatus } from "@gcc-store/db";

export class ListAdminProductsQueryDto {
  @ApiPropertyOptional({ enum: ProductLifecycleStatus })
  @IsOptional()
  @IsIn(Object.values(ProductLifecycleStatus))
  status?: ProductLifecycleStatus;

  @ApiPropertyOptional()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number = 20;
}
