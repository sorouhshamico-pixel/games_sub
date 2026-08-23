import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma, UserRole, recordAuditLog } from "@gcc-store/db";
import { hashPassword } from "../../auth/password";
import type { CreateStaffUserDto } from "./dto/create-staff-user.dto";
import type { UpdateStaffUserDto } from "./dto/update-staff-user.dto";

@Injectable()
export class AdminUsersService {
  async list() {
    return prisma.user.findMany({
      where: { role: { not: UserRole.CUSTOMER } },
      select: { id: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(dto: CreateStaffUserDto, adminUserId: string) {
    const existing = await prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException("A user with this email already exists");

    const passwordHash = await hashPassword(dto.password);
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { email: dto.email, passwordHash, role: dto.role },
        select: { id: true, email: true, role: true, isActive: true, createdAt: true },
      });
      await recordAuditLog(tx, {
        actorUserId: adminUserId,
        action: "staff_user.created",
        entityType: "User",
        entityId: created.id,
        metadata: { email: created.email, role: created.role },
      });
      return created;
    });

    return user;
  }

  async update(userId: string, dto: UpdateStaffUserDto, adminUserId: string) {
    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) throw new NotFoundException("User not found");
    if (target.role === UserRole.CUSTOMER) throw new BadRequestException("Not a staff account");

    // A SUPER_ADMIN locking themselves out (self-demote or self-deactivate)
    // is a real, seen-before support disaster with no recovery path short
    // of a direct DB edit — block it rather than trust every admin to
    // remember not to click it on their own row.
    if (userId === adminUserId) {
      if (dto.isActive === false) throw new BadRequestException("You cannot deactivate your own account");
      if (dto.role && dto.role !== UserRole.SUPER_ADMIN) throw new BadRequestException("You cannot remove your own SUPER_ADMIN role");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.user.update({
        where: { id: userId },
        data: { role: dto.role, isActive: dto.isActive },
        select: { id: true, email: true, role: true, isActive: true, createdAt: true },
      });
      await recordAuditLog(tx, {
        actorUserId: adminUserId,
        action: "staff_user.updated",
        entityType: "User",
        entityId: userId,
        metadata: { role: dto.role, isActive: dto.isActive },
      });
      return result;
    });

    return updated;
  }
}
