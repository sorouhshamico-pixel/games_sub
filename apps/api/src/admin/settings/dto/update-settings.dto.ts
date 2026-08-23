import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

// A fixed, typed set of known keys rather than an arbitrary key/value
// editor — AppSetting's schema is flexible (key + JSON value) but the admin
// UI only ever offers these, so a typo can't silently create a dead
// setting nothing reads. Every field maps 1:1 to one AppSetting row.
export class UpdateSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  supportEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supportPhone?: string;

  @ApiPropertyOptional({ description: "Days after an order is placed that it stays refund-eligible — enforced by AdminRefundsService" })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(365)
  refundWindowDays?: number;

  @ApiPropertyOptional({ description: "Shows a real storefront-wide banner when true — see MaintenanceBanner in the web app" })
  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;
}
