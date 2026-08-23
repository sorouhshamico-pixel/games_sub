import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class ListAuditLogQueryDto {
  @ApiPropertyOptional({ description: "Filter to one entity type, e.g. \"Order\", \"User\", \"AppSetting\"" })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number = 30;
}
