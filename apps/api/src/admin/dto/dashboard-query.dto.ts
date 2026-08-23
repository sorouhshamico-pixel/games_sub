import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsOptional } from "class-validator";

const ALLOWED_WINDOWS = [7, 30, 90] as const;

export class DashboardQueryDto {
  @ApiPropertyOptional({ enum: ALLOWED_WINDOWS, default: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsIn(ALLOWED_WINDOWS)
  days: number = 30;
}
