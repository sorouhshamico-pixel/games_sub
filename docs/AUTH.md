# Authentication & RBAC

## Sessions

Opaque server-side sessions (`Session` table), not JWTs — a session's `id` (a random
UUID) *is* the bearer token, set as an `httpOnly`, `sameSite=lax` cookie
(`gcc_session`), `secure` in production. No client-side JS can read it. Passwords are
hashed with Argon2id (`@node-rs/argon2`, OWASP baseline params) — see
[`apps/api/src/auth/password.ts`](../apps/api/src/auth/password.ts).

`POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` — see
[`auth.controller.ts`](../apps/api/src/auth/auth.controller.ts). Login is
timing/enumeration-resistant: a nonexistent email still hashes a dummy password before
responding, so the response shape and rough timing don't reveal whether an account
exists (see the `getDummyPasswordHash` comment in `auth.service.ts`). Both
`register`/`login` are rate-limited tighter than the global default (`@Throttle`).

## RBAC

`SessionAuthGuard` reads the cookie, loads and validates the session (revoked? expired?
user deactivated?), and attaches `req.user`. `RolesGuard` + `@Roles(...)` then check
`req.user.role` against an explicit allow-list — **enforced server-side on every admin
route**, never just a hidden button client-side (master prompt section 17). Order:
`@UseGuards(SessionAuthGuard, RolesGuard)`.

`UserRole`: `SUPER_ADMIN`, `OPERATIONS`, `FINANCE`, `SUPPORT`, `CATALOG_MANAGER`,
`CONTENT_SEO`, `READ_ONLY_ANALYST`, `CUSTOMER`. Only `SUPER_ADMIN`/`OPERATIONS`/
`FINANCE`/`READ_ONLY_ANALYST` can currently reach the dashboard; `SUPPORT` is also
allowed on the orders list (read-only — no admin routes support mutation yet, see below).

## Frontend cookie handling

Client components (login/register forms, checkout) call the API directly from the
browser with `credentials: "include"` — the real browser cookie jar carries the
`httpOnly` cookie automatically. Server Components have no browser cookie jar, so
`getServerCookieHeader()` ([`lib/server-cookies.ts`](../apps/web/src/lib/server-cookies.ts))
reads the incoming request's `Cookie` header via `next/headers` and forwards it by hand
on the outgoing fetch to the API (`/account`, `/admin`, `/admin/orders`). Verified live,
through the actual Next.js server (not just the API directly): an unauthenticated
request to `/account` 307-redirects to `/login`; a real session cookie obtained via the
API renders the correct account data through the RSC fetch; a customer session hitting
`/admin` gets the "no permission" state while an admin session sees the real dashboard.

## Seeded admin

`packages/db/prisma/seed.ts` creates one `SUPER_ADMIN` (`ADMIN_SEED_EMAIL`, default
`admin@example.com`) if none exists. **Set `ADMIN_SEED_PASSWORD` explicitly before
seeding any shared environment** — if it's unset, the seed falls back to a dev-only
default and prints a loud warning so that's never mistaken for a real credential.

## What's not built yet

- No MFA/TOTP for admin accounts (master prompt section 11 asks for this on sensitive
  accounts).
- No phone/OTP login — there's no SMS provider configured, so only email+password
  exists today.
- No password reset flow.
- No session/device management UI ("log out other devices").
- Admin routes are all read-only so far (dashboard, order list/detail) — no
  catalog/pricing/provider/refund management endpoints yet, so there was nothing
  destructive to gate behind stricter roles yet either.
