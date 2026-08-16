import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { SESSION_COOKIE_NAME, type AuthenticatedRequest } from "../request-user";

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const sessionId = (request.cookies as Record<string, string> | undefined)?.[SESSION_COOKIE_NAME];

    if (!sessionId) throw new UnauthorizedException("Not authenticated");

    const session = await this.authService.validateSession(sessionId);
    if (!session) throw new UnauthorizedException("Session expired or invalid");

    request.user = {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      displayName: session.user.customerProfile?.displayName ?? null,
    };
    return true;
  }
}
