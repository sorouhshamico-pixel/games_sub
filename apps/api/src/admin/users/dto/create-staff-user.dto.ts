import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsIn, IsString, MinLength } from "class-validator";
import { UserRole } from "@gcc-store/db";

// Never CUSTOMER — that's the storefront's own /auth/register, not this
// admin-only endpoint. Staff accounts are created here on purpose so a
// customer signup can never accidentally (or maliciously) land on a
// privileged role.
//
// CONTENT_SEO is deliberately excluded even though it's a real value in the
// UserRole enum: no controller anywhere grants it a single @Roles(...) entry
// (there's no blog/pages CMS admin surface for it to manage yet), so an
// account created with it would get 403 on every admin endpoint including
// the dashboard — a dead end, not a real role, until that surface exists.
const STAFF_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.OPERATIONS,
  UserRole.FINANCE,
  UserRole.SUPPORT,
  UserRole.CATALOG_MANAGER,
  UserRole.READ_ONLY_ANALYST,
] as const;

export class CreateStaffUserDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 10 })
  @IsString()
  @MinLength(10, { message: "password must be at least 10 characters" })
  password!: string;

  @ApiProperty({ enum: STAFF_ROLES })
  @IsIn(STAFF_ROLES)
  role!: UserRole;
}

export { STAFF_ROLES };
