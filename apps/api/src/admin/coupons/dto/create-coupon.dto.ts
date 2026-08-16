import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PartialType } from "@nestjs/mapped-types";
import { IsBoolean, IsDateString, IsIn, IsInt, IsOptional, IsString, Matches, Min, MinLength } from "class-validator";

export class CreateCouponDto {
  @ApiProperty({ description: "Case-insensitive; stored uppercase" })
  @IsString()
  @Matches(/^[A-Za-z0-9-]+$/, { message: "code must be letters, digits, and hyphens only" })
  @MinLength(3)
  code!: string;

  @ApiProperty({ enum: ["percentage", "fixed"] })
  @IsIn(["percentage", "fixed"])
  discountType!: "percentage" | "fixed";

  @ApiProperty({ description: "Basis points if percentage (1500 = 15%), integer minor units if fixed" })
  @IsInt()
  @Min(1)
  discountValue!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  maxRedemptions?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  maxRedemptionsPerCustomer?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  minOrderAmountMinorUnits?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endsAt?: string;
}

export class UpdateCouponDto extends PartialType(CreateCouponDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
