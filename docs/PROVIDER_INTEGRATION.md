# Fulfillment Provider Integration

## Interface

Every provider implements
[`FulfillmentProvider`](../apps/worker/src/providers/fulfillment-provider.interface.ts):
`healthCheck`, `getBalance`, `syncCatalog`, `getQuote`, `validateAccount`,
`createFulfillment`, `getFulfillmentStatus`, `cancelFulfillment`, `parseWebhook`.
`ProviderRouter` (not yet built — see "What's not built yet" below) is meant to be the
only place that ever branches on provider identity; everything else in the worker talks
to `FulfillmentProvider`, never a concrete class.

## Mock provider (active by default)

[`MockFulfillmentProvider`](../apps/worker/src/providers/mock-fulfillment.provider.ts)
makes no network calls. Every scenario the master prompt asks for is reachable on demand
via "magic" input values — the same pattern real payment sandboxes use (e.g. Stripe's
test card numbers) — rather than left to chance:

| Any input field equals | Result |
|---|---|
| `"000000"` | throws `InsufficientProviderBalanceError` |
| `"111111"` | throws `ProviderTimeoutError` |
| `"222222"` | returns `{ outcome: "failed" }` |
| `"999999"` | returns `{ outcome: "unknown" }` |
| anything else | returns `{ outcome: "succeeded" }` after a small simulated delay |

## Fulfillment pipeline

`processFulfillmentJob(orderId, correlationId, { provider, breaker })` in
[`process-fulfillment-job.ts`](../apps/worker/src/fulfillment/process-fulfillment-job.ts)
is the actual business logic — deliberately a plain function, not a BullMQ callback, so
it's testable against a real database without needing Redis running at all:

1. Moves the order `FULFILLMENT_QUEUED → PROCESSING` (once).
2. For each order item still `QUEUED`/`IN_PROGRESS`:
   - Checks the circuit breaker; if open, routes straight to `MANUAL_REVIEW`.
   - For `DIGITAL_CODE`/`GIFT_CARD` products, atomically claims one `AVAILABLE` code via
     `FOR UPDATE SKIP LOCKED` (see [digital-code-reservation.ts](../apps/worker/src/fulfillment/digital-code-reservation.ts))
     — verified under real concurrent load (see below).
   - Calls `provider.createFulfillment` wrapped in `retryWithBackoff` (exponential
     backoff with full jitter, 3 attempts by default).
   - Maps the outcome: `succeeded` → code marked `SOLD`, fulfillment `SUCCEEDED`;
     `unknown` → `MANUAL_REVIEW`; `failed` → code released back to `AVAILABLE`,
     fulfillment `FAILED`. A thrown `InsufficientProviderBalanceError` or
     `ProviderTimeoutError` also routes to `MANUAL_REVIEW` (an ops problem, not
     grounds to fail the customer's order outright) instead of `FAILED`.
3. Once every item has a terminal status, transitions the order via
   `OrderStateMachine`: all succeeded → `COMPLETED`; any `MANUAL_REVIEW` → order
   `MANUAL_REVIEW`; some succeeded → `PARTIALLY_FULFILLED`; none succeeded → `FAILED`.

A `CircuitBreaker` per provider (5 consecutive failures opens it for 30s) stops a
struggling provider from being hammered by every queued item at once.

## Queue plumbing

- `OutboxEvent` rows (written inside the same transaction as the payment webhook's
  `PAID → FULFILLMENT_QUEUED` move — see [PAYMENT_INTEGRATION.md](./PAYMENT_INTEGRATION.md))
  are relayed onto a BullMQ queue by
  [`outbox-dispatcher.ts`](../apps/worker/src/outbox/outbox-dispatcher.ts), polling every
  2s. Claims rows with `FOR UPDATE SKIP LOCKED` + stamps `publishedAt` atomically so
  multiple worker replicas can't double-enqueue the same event; `jobId: outboxEvent.id`
  makes a second enqueue attempt a safe no-op on top of that.
- [`fulfillment-worker.ts`](../apps/worker/src/fulfillment/fulfillment-worker.ts) wraps
  `processFulfillmentJob` in a BullMQ `Worker` (concurrency 5). BullMQ-level job retries
  are intentionally left at 1 attempt — retrying already happens *inside*
  `processFulfillmentJob` via `retryWithBackoff`; a job reaching BullMQ's failure handler
  means individual items already landed in `MANUAL_REVIEW`/`FAILED`, not "try the whole
  job again later."
- [`reconciliation-job.ts`](../apps/worker/src/reconciliation/reconciliation-job.ts) runs
  every 5 minutes: flags any `Fulfillment` stuck `IN_PROGRESS` for >15 minutes (worker
  crash mid-job) to `MANUAL_REVIEW`, and snapshots each provider's balance.

## What was verified, and how

No Redis is available in this environment (no Docker, and there's no official Redis
build for Windows — `redis-memory-server` was tried and doesn't support it either), so
the BullMQ queue/worker wiring itself is built correctly against BullMQ's documented
API and typechecked, but **not exercised live**.

What *was* verified against a real (locally-run, non-Docker) Postgres instance, by
calling `processFulfillmentJob` directly — bypassing the queue entirely, since the queue
is just "what calls this function and when," not the business logic itself:

| Scenario | Result |
|---|---|
| Successful fulfillment | order → `COMPLETED`, fulfillment → `SUCCEEDED` |
| Insufficient provider balance | order → `MANUAL_REVIEW`, fulfillment → `MANUAL_REVIEW` |
| Provider timeout | order → `MANUAL_REVIEW`, fulfillment → `MANUAL_REVIEW` |
| Rejected by provider | order → `FAILED`, fulfillment → `FAILED` |
| Unknown/ambiguous result | order → `MANUAL_REVIEW`, fulfillment → `MANUAL_REVIEW` |
| 3 concurrent claims against 2 available digital codes | exactly 2 succeeded, 1 got `null`, 0 codes left `AVAILABLE` — no double-sell |

Pure logic (`retryWithBackoff`, `CircuitBreaker`, `MockFulfillmentProvider`'s scenario
selection) has real unit tests in the committed suite. The DB-touching scenarios above
were run manually and are not currently part of the automated suite, since they need a
live Postgres the CI/dev setup doesn't provision yet (see `docker-compose.yml` — this is
what it's for once Docker is available).

## What's not built yet

- No second real provider, no `ProviderRouter` (priority/fallback across providers,
  `ProviderProductMapping`-driven routing) — only Mock exists today.
- Digital code storage is **not encrypted at rest** yet — `DigitalCode.codeCiphertext`
  is a plain string column with no encryption applied before writing. This needs a real
  encryption module (key from a secrets manager, not `AppSetting`) before any real
  inventory is imported. Don't treat the column name as a promise it isn't keeping yet.
- No admin UI for manual review, retry, or CSV code import.
- No CI wiring to actually spin up Postgres/Redis and run the scenarios above
  automatically — see the CI section of the main README once written.
