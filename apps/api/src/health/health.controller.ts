import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { prisma } from "@gcc-store/db";

@ApiTags("health")
@Controller("health")
export class HealthController {
  @Get()
  async check() {
    let databaseOk = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      databaseOk = true;
    } catch {
      databaseOk = false;
    }

    return {
      status: databaseOk ? "ok" : "degraded",
      database: databaseOk ? "up" : "down",
      timestamp: new Date().toISOString(),
    };
  }
}
