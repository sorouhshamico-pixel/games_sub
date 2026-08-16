# Payment Integration

## Interface

Every gateway implements [`PaymentGateway`](../apps/api/src/payments/payment-gateway.interface.ts):

```ts
interface PaymentGateway {
  readonly code: string;
  createPaymentIntent(input): Promise<{ gatewayReference: string; checkoutUrl: string | null }>;
  verifyWebhookSignature(rawBody, headers): boolean;
  parseWebhookEvent(rawBody): ParsedWebhookEvent;
  refund(gatewayReference, amountMinorUnits): Promise<RefundResult>;
}
```

`PaymentsModule` picks the implementation at boot via a factory keyed on
`MOYASAR_ENABLED`:

- **Unset / `false` (default):** `MockPaymentGateway` — no network calls, deterministic,
  safe for demo/dev/test.
- **`true`:** `MoyasarPaymentGateway` — requires `MOYASAR_SECRET_KEY` and
  `MOYASAR_WEBHOOK_SECRET`; throws at boot if either is missing.

Nothing else in the codebase branches on gateway code — adding Tap or HyperPay means
writing one new class against this interface.

## Mock gateway (active by default)

`createPaymentIntent` returns `checkoutUrl: null` because there's no hosted page to
redirect to. Instead, `PaymentsController` exposes:

```
POST /api/v1/payments/mock/:paymentId/confirm
```

which synthesizes a `paid` webhook event for that payment and runs it through the exact
same `PaymentsService.processGatewayEvent` code path a real webhook would. This endpoint
refuses to act on any payment whose `gatewayCode` isn't `"mock"` — it cannot be used to
fake-confirm a real Moyasar payment.

This is what the storefront's checkout page will call once wired up, clearly labeled as
a test/demo confirmation, not a real payment.

## Moyasar gateway (feature-flagged off, not yet verified against sandbox)

Built from Moyasar's public API shape — **not tested against a live sandbox**:

- `createPaymentIntent` → `POST https://api.moyasar.com/v1/invoices` (hosted checkout
  page, returns a `url` to redirect the customer to).
- Webhook verification compares a `secret_token` field embedded in the JSON body against
  `MOYASAR_WEBHOOK_SECRET` (`timingSafeEqual`) — this is a plaintext-field comparison,
  not an HMAC-over-raw-bytes signature, so re-serializing Nest's already-parsed JSON body
  is sufficient (see the comment in `PaymentsController`). A future gateway using a true
  byte-exact HMAC would need Nest's `rawBody: true` app option instead.
- `refund` → `POST https://api.moyasar.com/v1/payments/:id/refund`.

**Before enabling in any real environment:** get Moyasar sandbox credentials, set
`MOYASAR_ENABLED=true` + the two secret env vars, and manually run every scenario below
against the sandbox. Treat this file as a verified starting point once you have, not
before.

## Idempotency & the webhook → order pipeline

`PaymentsService.processGatewayEvent` (shared by both the real webhook endpoint and the
mock confirm endpoint) runs entirely inside one Prisma transaction:

1. `INSERT` into `WebhookEvent` with a unique `(source, externalEventId)` constraint —
   a replayed/duplicate delivery hits a `P2002` conflict and the whole transaction is a
   no-op. This was verified manually: confirming the same mock payment twice produced
   two `WebhookEvent` audit rows but only one `Fulfillment` row and one `OutboxEvent`.
2. Look up `Payment` by `gatewayReference`. If it's already `CAPTURED`/`FAILED`, stop —
   already settled.
3. Verify `amountMinorUnits`/`currency` match what we charged — mismatches are logged
   and dropped rather than trusted.
4. On `paid`: transition `Payment` → `CAPTURED`, transition the order
   `<current> → PAID → FULFILLMENT_QUEUED`, create one `Fulfillment` row per
   `OrderItem` (status `QUEUED`), and write an `OutboxEvent` (`fulfillment.queued`) for
   the Phase 4 worker to pick up.
5. On anything else: transition `Payment` → `FAILED`, order → `FAILED`.

Fulfillment is never triggered from the client redirect/return URL — only from a
verified server-side webhook (or the guarded mock-confirm equivalent).

## Refunds

`AdminRefundsService.createRefund` (`POST /admin/orders/:id/refund`, `SUPER_ADMIN`/
`FINANCE` only): finds the order's captured `Payment`, computes what's still refundable
(`payment.amountMinorUnits` minus the sum of prior `succeeded` `Refund` rows), validates
the requested amount against that, then:

1. **In one transaction**: create a `Refund` row (`status: "pending"`), transition the
   order to `REFUND_PENDING`.
2. Call `gateway.refund(...)` — a real network call, deliberately outside that
   transaction, same reasoning as `CheckoutService.checkout`'s `createPaymentIntent`
   call.
3. **On success**: `Refund` → `succeeded`, `Payment` → `REFUNDED`/`PARTIALLY_REFUNDED`,
   order → `REFUNDED`/`PARTIALLY_REFUNDED` depending on whether anything's left
   refundable.
4. **On gateway failure**: `Refund` → `failed`, order stays `REFUND_PENDING` — a
   legitimate resting state for an admin to investigate or retry, not silently reverted.

Refunding an order that's still `FULFILLMENT_QUEUED`/`PROCESSING` (money captured,
fulfillment not finished) is allowed — see `docs/ORDER_STATE_MACHINE.md` for the gap
this closed in the state machine itself, found while building this.

## Test scenarios

| Scenario | Status |
|---|---|
| Successful checkout → mock confirm → order reaches `FULFILLMENT_QUEUED` | ✅ verified manually against a real Postgres instance |
| Duplicate webhook delivery (same payment confirmed twice) | ✅ verified — idempotent, no duplicate side effects |
| Invalid/guessed order tracking token | ✅ verified — 404 |
| Invalid product input values (e.g. malformed Player ID) rejected at checkout | ✅ verified — 400 with field-level errors |
| Card decline / 3-D Secure / timeout / webhook-before-callback / mismatched amount | ⬜ not yet testable — needs live Moyasar sandbox |
| Refund, full and partial, via `POST /admin/orders/:id/refund` | ✅ verified — permanent integration tests plus a live admin-UI round trip (order → refund → order tracking page all reflect `REFUNDED`) |
| Over-refund request (amount exceeds what's left refundable) | ✅ verified — 400 |
| Refund attempt on an order that was never paid | ✅ verified — 400 |
| Refund attempt by a non-`SUPER_ADMIN`/`FINANCE` session | ✅ verified — 403 |
