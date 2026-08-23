import type { Locale } from "@gcc-store/i18n";
import { redirect } from "@/i18n/navigation";
import { ApiError, getMe, type AuthUser } from "./api";
import { getServerCookieHeader } from "./server-cookies";

/**
 * Coarse gate for the whole /admin shell: unauthenticated visitors get
 * redirected to login, customer accounts get null (caller renders a
 * "forbidden" state instead of the admin nav). This does NOT replace each
 * page's own per-resource check — a staff role can pass this gate and still
 * get a real 403 from a specific endpoint it isn't allowed to call (e.g.
 * CONTENT_SEO hitting an orders endpoint). This only keeps non-staff
 * visitors from ever reaching the admin nav/layout at all.
 */
export async function getAdminUser(locale: Locale): Promise<AuthUser | null> {
  const cookieHeader = await getServerCookieHeader();
  try {
    const { user } = await getMe({ cookieHeader });
    if (user.role === "CUSTOMER") return null;
    return user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect({ href: "/login", locale });
    }
    throw error;
  }
}
