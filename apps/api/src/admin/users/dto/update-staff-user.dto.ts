import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsIn, IsOptional } from "class-validator";
import { UserRole } from "@gcc-store/db";
import { STAFF_ROLES } from "./create-staff-user.dto";

export class UpdateStaffUserDto {
  @ApiPropertyOptional({ enum: STAFF_ROLES })
  @IsOptional()
  @IsIn(STAFF_ROLES)
  role?: UserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
