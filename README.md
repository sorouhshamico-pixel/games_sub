# GCC Gaming Store

A bilingual (Arabic RTL / English LTR) e-commerce platform for game top-ups, digital
codes, subscriptions, and gift cards, targeting Saudi Arabia and the GCC. Scaffolded
from `claude-gcc-gaming-store-master-prompt-ar.md`.

## Status

This is under active development, not a finished product. What's real and
verified vs. what's stubbed or missing is documented plainly in each `docs/*.md`
file rather than implied — read those before assuming a feature is production-ready.
In short:

- **Built and verified**: catalog browsing, cart, guest checkout, Mock payment gateway,
  order state machine, fulfillment worker (Mock provider), digital-code inventory with
  concurrency-safe reservation, email/password auth with server-side RBAC, a minimal
  admin dashboard + order list.
- **Built but not enabled**: a Moyasar payment adapter and the real-provider shape of
  fulfillment — both exist as code but were written against public API docs, not tested
  against a live sandbox, and are feature-flagged off by default.
- **Not built yet**: most of the admin panel (catalog/pricing/provider/refund
  management, CMS, content moderation), SMS/WhatsApp notifications, ZATCA invoicing,
  MFA, password reset, a second real fulfillment provider.

## Stack

- **`apps/web`** — Next.js 15 (App Router), Tailwind v4, next-intl (ar/en, RTL/LTR)
- **`apps/api`** — NestJS 11, versioned REST API (`/api/v1`), OpenAPI docs at `/api/v1/docs`
- **`apps/worker`** — BullMQ + Redis, consumes a transactional outbox to run fulfillment
- **`packages/db`** — Prisma (PostgreSQL), the shared `OrderStateMachine`
- **`packages/contracts`** — Zod schemas + types shared across web/api/worker
- **`packages/ui`**, **`packages/i18n`**, **`packages/config`** — design tokens/components,
  ar/en message catalogs, shared TS/ESLint config

Monorepo managed with pnpm workspaces + Turborepo.

## Prerequisites

- Node.js 22+
- pnpm (via `corepack enable`)
- PostgreSQL 16 and Redis 7 — either via `docker compose up -d` (see
  `docker-compose.yml`), or any local/remote instance

## Setup

```bash
corepack enable
pnpm install
cp .env.example .env   # fill in DATABASE_URL at minimum; see comments inline
pnpm --filter @gcc-store/db exec prisma migrate deploy
pnpm db:seed
```

Seeding creates demo catalog data (clearly flagged `isDemoData: true`, never wired to a
real provider) and one `SUPER_ADMIN` account. Set `ADMIN_SEED_EMAIL` /
`ADMIN_SEED_PASSWORD` in `.env` before seeding anywhere but a throwaway local database —
otherwise it falls back to a loudly-logged dev-only password.

```bash
pnpm dev     # starts web (:3000), api (:4000), worker — via turbo
```

Web reads `NEXT_PUBLIC_API_URL` from `apps/web/.env.local` (falls back to
`http://localhost:4000/api/v1`).

## Scripts

Run from the repo root (fan out to every package via Turborepo):

| Command | What it does |
|---|---|
| `pnpm dev` | Start all apps in watch mode |
| `pnpm build` | Build all packages/apps |
| `pnpm lint` | ESLint across all packages |
| `pnpm typecheck` | `tsc --noEmit` across all packages |
| `pnpm test` | Unit tests (+ any DB-gated integration tests that find `DATABASE_URL`) |
| `pnpm test:e2e` | End-to-end tests (API; see below for worker's) |
| `pnpm db:migrate` / `db:seed` / `db:generate` | Prisma commands, scoped to `packages/db` |

Per-package equivalents: `pnpm --filter @gcc-store/api <script>`, etc.

## Testing

Three tiers, deliberately kept separate:

1. **Unit** (`pnpm test`) — no external services. Runs everywhere, including this
   project's own dev sandbox (no Docker, no Redis available there).
2. **Integration** (`apps/api`'s `test:integration`, and the same-named test files under
   `apps/worker/src/**/*.integration.test.ts`) — need a live Postgres. Gated on
   `DATABASE_URL` via `describe.skipIf`, so they skip cleanly without one and run for
   real wherever one is available.
3. **E2E** (`test:e2e` in both `apps/api` and `apps/worker`) — full HTTP/queue round
   trips. The worker's e2e test additionally needs `REDIS_URL` (real BullMQ, not a
   mock of it).

```bash
# with a local Postgres/Redis (e.g. from docker compose up -d):
DATABASE_URL=postgresql://gcc_store:gcc_store_dev_password@localhost:5432/gcc_store \
  pnpm --filter @gcc-store/api test:integration

REDIS_URL=redis://localhost:6379 DATABASE_URL=... \
  pnpm --filter @gcc-store/worker test:e2e
```

`.github/workflows/ci.yml` provisions both as service containers and runs everything,
including a Docker build of all three images — see that file for the authoritative list
of what CI checks on every push.

## Docker

`docker-compose.yml` runs Postgres + Redis for local development.
`apps/{api,worker,web}/Dockerfile` build production images (multi-stage, non-root user,
healthchecks) — verified buildable in CI (Linux), not locally: this was developed in a
sandbox without Docker and without Windows symlink permissions for `next build`'s
standalone output tracing, both of which are environment limitations rather than issues
with the Dockerfiles themselves. Build and smoke-test them yourself before relying on
them for a real deployment.

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) *(not yet written)*
- [`docs/ORDER_STATE_MACHINE.md`](docs/ORDER_STATE_MACHINE.md) — the explicit
  transition allow-list, with a diagram
- [`docs/PAYMENT_INTEGRATION.md`](docs/PAYMENT_INTEGRATION.md) — gateway interface,
  Mock vs. Moyasar, idempotency, what's verified vs. not
- [`docs/PROVIDER_INTEGRATION.md`](docs/PROVIDER_INTEGRATION.md) — fulfillment
  provider interface, the Mock provider's test scenarios, queue plumbing
- [`docs/AUTH.md`](docs/AUTH.md) — sessions, RBAC, what's verified, what's missing
  (MFA, OTP, password reset)

Files the master prompt asks for that don't exist yet: `docs/ARCHITECTURE.md`,
`docs/SECURITY.md`, `docs/SEO.md`, `docs/ZATCA_INTEGRATION.md`, `docs/RUNBOOK.md`.

## Project data placeholders

Store name/domain/contact info, real payment gateway credentials, real fulfillment
provider agreements, and legal copy (terms/privacy/refunds — currently seeded as
clearly-marked drafts needing legal review) are not filled in. Search `.env.example`
and `packages/db/prisma/seed.ts` for what needs real values before any real launch.
