import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsInt, IsObject, IsOptional, IsString, Max, Min, MinLength, ValidateNested } from "class-validator";
import { ArrayMaxSize, ArrayMinSize, IsArray } from "class-validator";

export class CheckoutItemDto {
  @ApiProperty()
  @IsString()
  variantId!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(50)
  quantity!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  inputValues?: Record<string, string>;
}

export class CheckoutRequestDto {
  @ApiProperty({ type: [CheckoutItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items!: CheckoutItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  guestEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(6)
  guestPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  couponCode?: string;
}
