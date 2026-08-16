# Architecture

## System overview

```mermaid
flowchart LR
    Browser -->|"fetch, credentials: include"| Web["apps/web<br/>Next.js App Router"]
    Web -->|"REST, /api/v1/*<br/>cookie forwarded manually<br/>from Server Components"| Api["apps/api<br/>NestJS"]
    Api --> DB[("PostgreSQL<br/>via packages/db (Prisma)")]
    Api -->|"writes OutboxEvent<br/>in the same tx as PAID"| DB
    Worker["apps/worker<br/>BullMQ"] -->|"polls OutboxEvent<br/>every 2s"| DB
    Worker -->|"enqueues job"| Redis[("Redis")]
    Redis -->|"BullMQ Worker<br/>consumes job"| Worker
    Worker -->|"updates Fulfillment,<br/>Order status"| DB
    Api -.->|"MOYASAR_ENABLED=true"| Moyasar["Moyasar<br/>(not yet verified)"]
    Worker -.->|"real provider,<br/>not built yet"| Provider["Fulfillment provider"]
```

Three deployables (`apps/web`, `apps/api`, `apps/worker`) share code through workspace
packages (`packages/{db,contracts,ui,i18n,config}`), never by importing across `apps/*`
directly. `packages/db` is the only thing that talks to Postgres; `apps/web` never
touches the database — it only calls `apps/api` over HTTP.

## Why an outbox instead of calling the worker directly

`PaymentsService.processGatewayEvent` (in `apps/api`) writes an `OutboxEvent` row inside
the *same* Prisma transaction that moves the order `PAID → FULFILLMENT_QUEUED` and
creates the `Fulfillment` rows. If the API called the worker directly (an HTTP call, a
direct queue push outside the transaction), a crash between "order marked PAID" and
"fulfillment triggered" would silently lose the fulfillment step — the payment would be
captured but nothing would ever ship. Writing the event in the same transaction makes it
atomic with the state change it announces: either both happen, or neither does, and the
worker's outbox dispatcher (`apps/worker/src/outbox/outbox-dispatcher.ts`) will always
eventually find and relay any event that was committed, even after a crash.

## Why money is always an integer

Every amount in the schema and every contract (`packages/contracts/src/pricing.ts`) is
an integer in minor units (halalas, not riyals) — never a float, never a `Decimal`
carried through arithmetic. `computePriceBreakdown` does base cost → margin → discount →
tax entirely in integers, rounding at each step. This is what
`docs/PAYMENT_INTEGRATION.md` and `docs/ORDER_STATE_MACHINE.md` build on: a payment's
`amountMinorUnits` is compared for exact equality against what the order expects before
a webhook is trusted (see `PaymentsService.processGatewayEvent`).

## Why the order state machine lives in `packages/db`, not `apps/api`

`OrderStateMachine` (`packages/db/src/order-state-machine.ts`) started in `apps/api` and
was moved once `apps/worker` needed the exact same transition rules — see git history on
the Phase 4 commit. It's framework-agnostic (no NestJS import) specifically so both the
API and the worker depend on one definition of "which transitions are legal," rather than
two copies that could drift apart.

## Request flow: checkout → payment → fulfillment

```mermaid
sequenceDiagram
    participant C as Customer (browser)
    participant W as apps/web
    participant A as apps/api
    participant Wk as apps/worker
    participant DB as Postgres
    participant R as Redis

    C->>W: Add to cart, go to checkout
    W->>A: POST /checkout (items, guest email/phone)
    A->>DB: Re-validate variants + input fields,<br/>recompute price server-side
    A->>DB: Create Order (DRAFT→PENDING_PAYMENT), Payment (PENDING)
    A->>W: { orderNumber, trackingToken, payment }
    Note over C,A: Mock gateway: browser confirms directly.<br/>Moyasar: browser would redirect to checkoutUrl.
    C->>A: POST /payments/mock/:id/confirm
    A->>DB: tx: WebhookEvent (idempotency),<br/>Payment→CAPTURED,<br/>Order PAID→FULFILLMENT_QUEUED,<br/>Fulfillment rows QUEUED,<br/>OutboxEvent "fulfillment.queued"
    Wk->>DB: Poll OutboxEvent (FOR UPDATE SKIP LOCKED)
    Wk->>R: Enqueue job (jobId = outboxEvent.id)
    R->>Wk: Deliver job to BullMQ Worker
    Wk->>DB: processFulfillmentJob: order→PROCESSING,<br/>call provider per item, retry w/ backoff
    Wk->>DB: Order→COMPLETED / PARTIALLY_FULFILLED / MANUAL_REVIEW / FAILED
    C->>A: GET /orders/:orderNumber?token=...
    A->>C: Status + timeline
```

## Monorepo layout

See the README for the full stack list. Build dependency order (enforced by
`turbo.json`'s `dependsOn: ["^build"]`): `contracts` → `db` → `{api, worker}`; `web`
depends on `contracts`/`ui`/`i18n` but consumes them as TypeScript source directly via
Next.js's `transpilePackages`, not a compiled `dist/`.

One thing worth knowing if you touch `packages/contracts` or `packages/db`: both compile
to a real CommonJS `dist/` (`tsconfig.build.json` in each) because `apps/api`'s
`nest build` doesn't bundle dependencies — `node dist/main.js` would otherwise try to
`require()` raw `.ts` source and fail. This was a real bug caught during development, not
a theoretical concern; see the Phase 3 commit message for the story.
