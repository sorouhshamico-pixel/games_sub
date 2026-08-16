import { randomUUID } from "node:crypto";
import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { prisma, UserRole } from "@gcc-store/db";
import { hashPassword, verifyPassword } from "./password";
import type { RegisterDto } from "./dto/register.dto";
import type { LoginDto } from "./dto/login.dto";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Computed once and reused for every "user doesn't exist" login attempt so
// the response takes the same shape/time as a real wrong-password attempt —
// avoids a timing/behavioral oracle for account enumeration.
let dummyPasswordHashPromise: Promise<string> | null = null;
function getDummyPasswordHash(): Promise<string> {
  dummyPasswordHashPromise ??= hashPassword(randomUUID());
  return dummyPasswordHashPromise;
}

export interface SessionContext {
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthResult {
  sessionId: string;
  expiresAt: Date;
  user: { id: string; email: string | null; role: UserRole; displayName: string | null };
}

@Injectable()
export class AuthService {
  async register(dto: RegisterDto, ctx: SessionContext): Promise<AuthResult> {
    const existing = await prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      // Same generic message as a failed login would give for this email —
      // avoids confirming account existence to an unauthenticated caller.
      throw new ConflictException("Unable to register with these details");
    }

    const passwordHash = await hashPassword(dto.password);
    const user = await prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: UserRole.CUSTOMER,
        customerProfile: { create: { displayName: dto.displayName } },
      },
      include: { customerProfile: true },
    });

    const session = await this.createSession(user.id, ctx);
    return {
      sessionId: session.id,
      expiresAt: session.expiresAt,
      user: { id: user.id, email: user.email, role: user.role, displayName: user.customerProfile?.displayName ?? null },
    };
  }

  async login(dto: LoginDto, ctx: SessionContext): Promise<AuthResult> {
    const user = await prisma.user.findUnique({ where: { email: dto.email }, include: { customerProfile: true } });
    const passwordHash = user?.passwordHash ?? (await getDummyPasswordHash());
    const passwordValid = await verifyPassword(passwordHash, dto.password);

    if (!user || !user.isActive || !passwordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const session = await this.createSession(user.id, ctx);
    return {
      sessionId: session.id,
      expiresAt: session.expiresAt,
      user: { id: user.id, email: user.email, role: user.role, displayName: user.customerProfile?.displayName ?? null },
    };
  }

  async logout(sessionId: string): Promise<void> {
    await prisma.session.updateMany({ where: { id: sessionId, revokedAt: null }, data: { revokedAt: new Date() } });
  }

  async validateSession(sessionId: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: { include: { customerProfile: true } } },
    });
    if (!session || session.revokedAt || session.expiresAt < new Date() || !session.user.isActive) {
      return null;
    }
    return session;
  }

  private async createSession(userId: string, ctx: SessionContext) {
    return prisma.session.create({
      data: {
        id: randomUUID(),
        userId,
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      },
    });
  }
}
