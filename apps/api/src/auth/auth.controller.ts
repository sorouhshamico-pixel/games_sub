import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { SessionAuthGuard } from "./guards/session-auth.guard";
import { SESSION_COOKIE_NAME, type AuthenticatedRequest } from "./request-user";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env["NODE_ENV"] === "production",
  path: "/",
};

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async register(@Body() dto: RegisterDto, @Req() req: AuthenticatedRequest, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto, { ipAddress: req.ip, userAgent: req.headers["user-agent"] });
    res.cookie(SESSION_COOKIE_NAME, result.sessionId, { ...COOKIE_OPTIONS, expires: result.expiresAt });
    return { user: result.user };
  }

  @Post("login")
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async login(@Body() dto: LoginDto, @Req() req: AuthenticatedRequest, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto, { ipAddress: req.ip, userAgent: req.headers["user-agent"] });
    res.cookie(SESSION_COOKIE_NAME, result.sessionId, { ...COOKIE_OPTIONS, expires: result.expiresAt });
    return { user: result.user };
  }

  @Post("logout")
  @UseGuards(SessionAuthGuard)
  async logout(@Req() req: AuthenticatedRequest, @Res({ passthrough: true }) res: Response) {
    const sessionId = (req.cookies as Record<string, string> | undefined)?.[SESSION_COOKIE_NAME];
    if (sessionId) await this.authService.logout(sessionId);
    res.clearCookie(SESSION_COOKIE_NAME, COOKIE_OPTIONS);
    return { loggedOut: true };
  }

  @Get("me")
  @UseGuards(SessionAuthGuard)
  me(@Req() req: AuthenticatedRequest) {
    return { user: req.user };
  }
}
