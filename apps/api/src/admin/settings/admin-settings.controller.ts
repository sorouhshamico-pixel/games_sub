import { Body, Controller, Get, Patch, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserRole } from "@gcc-store/db";
import { SessionAuthGuard } from "../../auth/guards/session-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import type { AuthenticatedRequest } from "../../auth/request-user";
import { AdminSettingsService } from "./admin-settings.service";
import { UpdateSettingsDto } from "./dto/update-settings.dto";

@ApiTags("admin-settings")
@Controller("admin/settings")
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AdminSettingsController {
  constructor(private readonly settingsService: AdminSettingsService) {}

  @Get()
  get() {
    return this.settingsService.get();
  }

  @Patch()
  update(@Body() dto: UpdateSettingsDto, @Req() req: AuthenticatedRequest) {
    return this.settingsService.update(dto, req.user!.id);
  }
}
