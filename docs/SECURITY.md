# Security

Baseline target: OWASP ASVS Level 2 (master prompt section 17). This document tracks
what's actually implemented against that list — not what's planned — so it stays
trustworthy as the codebase grows.

## Threat model, briefly

The two things worth protecting most: **payment integrity** (nobody gets a fulfilled
order without a genuinely captured payment) and **fulfillment integrity** (nobody gets
the same digital code twice, nobody triggers a top-up without paying). Everything below
is organized around those two, plus the standard web-app surface (auth, input, admin).

## Implemented

- **Input validation, server-side.** Every checkout item's dynamic fields
  (`inputValuesJson`) are re-validated against the product's `ProductInputDefinition`
  rows server-side (`validateProductInputValues` in `packages/contracts`) — the client's
  validation is UX, not the security boundary. Same for prices: a client-sent price is
  never read; `CheckoutService` recomputes every amount from the current DB row.
- **Payment trust boundary.** Fulfillment is only ever triggered by
  `PaymentsService.processGatewayEvent`, reached via a verified webhook or the
  RBAC-and-gateway-code-gated mock-confirm endpoint — never by a client redirect/return
  URL. Amount and currency are compared for exact equality against the `Payment` row
  before anything is trusted. See `docs/PAYMENT_INTEGRATION.md`.
- **Idempotency.** `WebhookEvent` has a unique `(source, externalEventId)` constraint;
  a replayed webhook hits a constraint violation and is dropped, verified under a real
  double-confirm in both manual testing and the committed integration tests.
- **Concurrency-safe inventory.** Digital code reservation uses
  `SELECT ... FOR UPDATE SKIP LOCKED`, not an application-level lock — verified under
  real concurrent load (3 simultaneous claims against 2 codes → exactly 2 succeed, 0
  double-sells). See `docs/PROVIDER_INTEGRATION.md`.
- **Password storage.** Argon2id (`@node-rs/argon2`), OWASP baseline parameters
  (`apps/api/src/auth/password.ts`).
- **Login enumeration resistance.** A login attempt for a nonexistent email still hashes
  a dummy password before responding, so response shape/timing doesn't reveal whether an
  account exists (`AuthService.getDummyPasswordHash`).
- **Sessions.** Opaque, `httpOnly`, `sameSite=lax`, `secure` in production — not a JWT,
  so there's no token to steal from `localStorage` via XSS. See `docs/AUTH.md`.
- **RBAC, server-side.** `SessionAuthGuard` + `RolesGuard` on every admin route,
  verified live: a customer session gets 403, no session gets 401, an admin session gets
  real data — not a client-side hidden button anywhere.
- **Standard error envelope.** `AllExceptionsFilter` never leaks a stack trace or raw
  vendor error message to the client; every response carries a `correlationId` for
  server-side log correlation.
- **Rate limiting.** Global `ThrottlerModule` (120 req/min), tighter limits on
  `/auth/register` and `/auth/login` specifically (`@Throttle`).
- **Correlation IDs.** Every request gets one (`CorrelationIdMiddleware`), threaded
  through order status events, webhook processing, and error responses — a single
  order/payment/webhook flow is traceable end-to-end in logs.
- **Secrets.** `.env` is gitignored; `.env.example` documents every variable without
  real values; `AppSetting` (the one non-secret admin-configurable settings table) is
  explicitly documented as non-secret-storage in `schema.prisma`'s comments.

## Explicitly not done yet

Naming these plainly rather than letting the "implemented" list above imply more than
it does:

- **No MFA/TOTP** for admin accounts, despite the master prompt asking for it on
  sensitive accounts. `packages/db`'s `User` model has `mfaEnabled`/`mfaSecretEncrypted`
  columns reserved for this, unused so far.
- **No CSRF protection** beyond `sameSite=lax` cookies. `sameSite=lax` blocks
  cross-site *form POSTs* but not cross-site fetches with credentials in some edge
  cases — a proper CSRF token or `sameSite=strict` (with the UX tradeoffs that implies)
  hasn't been evaluated yet.
- **No CSP or other secure-headers middleware** (Helmet or equivalent) wired into
  `apps/api` yet.
- **No dependency/SAST scanning in CI** — `.github/workflows/ci.yml` runs lint/type/test/
  build, not `npm audit`, Snyk, or similar.
- **No encryption at rest for `DigitalCode.codeCiphertext`** — see
  `docs/PROVIDER_INTEGRATION.md`; the column name is aspirational until a real key
  management story exists.
- **No anti-fraud rules** (velocity limits, multi-account detection, high-risk-country
  flagging) — `OrderStatus.PAYMENT_REVIEW`/`MANUAL_REVIEW` exist in the state machine as
  the landing states for this, but nothing populates them automatically yet.
- **No account lockout / OTP abuse protection** — there's no OTP flow at all yet (email/
  password only), so this doesn't apply until phone/OTP login is built.
- **No security review of the Dockerfiles** (non-root user and healthchecks are in
  place, but things like read-only root filesystem, dropped capabilities, or a
  distroless base haven't been evaluated).

## Reporting

No live deployment exists yet, so there's no disclosure process to publish. Add one
before any real launch.
