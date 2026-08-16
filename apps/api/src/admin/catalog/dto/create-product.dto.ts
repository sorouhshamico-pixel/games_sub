import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { ProductType } from "@gcc-store/db";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class ProductTranslationDto {
  @ApiProperty({ enum: ["ar", "en"] })
  @IsIn(["ar", "en"])
  locale!: "ar" | "en";

  @ApiProperty()
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty()
  @IsString()
  description!: string;
}

export class CreateVariantDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  sku!: string;

  @ApiProperty()
  @IsString()
  nameAr!: string;

  @ApiProperty()
  @IsString()
  nameEn!: string;

  @ApiProperty({ enum: ["SAR", "AED", "KWD", "QAR", "BHD", "OMR"] })
  @IsIn(["SAR", "AED", "KWD", "QAR", "BHD", "OMR"])
  currency!: "SAR" | "AED" | "KWD" | "QAR" | "BHD" | "OMR";

  @ApiProperty({ description: "Cost from the provider (or internal cost basis), integer minor units" })
  @IsInt()
  @Min(0)
  baseCostMinorUnits!: number;

  @ApiPropertyOptional({ description: "Margin applied on top of baseCostMinorUnits, in basis points (1500 = 15%)" })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100_00)
  marginBasisPoints?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  discountMinorUnits?: number;

  @ApiPropertyOptional({ description: "Basis points (1500 = 15%)" })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100_00)
  taxRateBasisPoints?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  minQuantityPerOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  maxQuantityPerOrder?: number;
}

export class CreateInputDefinitionDto {
  @ApiProperty()
  @IsString()
  @Matches(/^[a-zA-Z][a-zA-Z0-9_]*$/, { message: "key must be a valid identifier (letters, digits, underscore)" })
  key!: string;

  @ApiProperty()
  @IsString()
  labelAr!: string;

  @ApiProperty()
  @IsString()
  labelEn!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  helpTextAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  helpTextEn?: string;

  @ApiProperty({ enum: ["text", "number", "select", "email"] })
  @IsIn(["text", "number", "select", "email"])
  fieldType!: "text" | "number" | "select" | "email";

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  regex?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  minLength?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  maxLength?: number;

  @ApiPropertyOptional({ enum: ["trim", "trimAndUppercase", "digitsOnly"], default: "trim" })
  @IsOptional()
  @IsIn(["trim", "trimAndUppercase", "digitsOnly"])
  normalize?: "trim" | "trimAndUppercase" | "digitsOnly";
}

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @Matches(SLUG_PATTERN, { message: "slug must be lowercase letters, digits, and hyphens only" })
  slug!: string;

  @ApiProperty({ enum: ProductType })
  @IsEnum(ProductType)
  type!: ProductType;

  @ApiProperty()
  @IsString()
  categoryId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gameBrandId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  refundEligible?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  refundPolicyAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  refundPolicyEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  fulfillmentEtaMinutes?: number;

  @ApiProperty({ type: [ProductTranslationDto] })
  @IsArray()
  @ArrayMinSize(2, { message: "both ar and en translations are required" })
  @ValidateNested({ each: true })
  @Type(() => ProductTranslationDto)
  translations!: ProductTranslationDto[];

  @ApiProperty({ type: [CreateVariantDto] })
  @IsArray()
  @ArrayMinSize(1, { message: "at least one variant is required" })
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants!: CreateVariantDto[];

  @ApiPropertyOptional({ type: [CreateInputDefinitionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInputDefinitionDto)
  inputDefinitions?: CreateInputDefinitionDto[];
}
