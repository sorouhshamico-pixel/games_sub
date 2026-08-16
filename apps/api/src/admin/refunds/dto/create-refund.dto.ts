import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Min, MinLength } from "class-validator";

export class CreateRefundDto {
  @ApiPropertyOptional({ description: "Omit for a full refund of whatever hasn't been refunded yet" })
  @IsOptional()
  @IsInt()
  @Min(1)
  amountMinorUnits?: number;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  reason!: string;
}
