import type { Request } from "express";
import type { UserRole } from "@gcc-store/db";

export interface RequestUser {
  id: string;
  email: string | null;
  role: UserRole;
  displayName: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: RequestUser;
}

export const SESSION_COOKIE_NAME = "gcc_session";
