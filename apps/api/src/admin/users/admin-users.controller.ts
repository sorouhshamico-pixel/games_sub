import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserRole } from "@gcc-store/db";
import { SessionAuthGuard } from "../../auth/guards/session-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import type { AuthenticatedRequest } from "../../auth/request-user";
import { AdminUsersService } from "./admin-users.service";
import { CreateStaffUserDto } from "./dto/create-staff-user.dto";
import { UpdateStaffUserDto } from "./dto/update-staff-user.dto";

// SUPER_ADMIN only, at every level — granting/editing staff access is the
// single most sensitive action in this admin panel, no partial delegation.
@ApiTags("admin-users")
@Controller("admin/users")
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AdminUsersController {
  constructor(private readonly usersService: AdminUsersService) {}

  @Get()
  list() {
    return this.usersService.list();
  }

  @Post()
  create(@Body() dto: CreateStaffUserDto, @Req() req: AuthenticatedRequest) {
    return this.usersService.create(dto, req.user!.id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateStaffUserDto, @Req() req: AuthenticatedRequest) {
    return this.usersService.update(id, dto, req.user!.id);
  }
}
