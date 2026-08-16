# Notifications

## What exists

[`recordNotification`](../packages/db/src/notifications.ts) — a single framework-agnostic
function, not a `NotificationProvider` interface like `PaymentGateway`/`FulfillmentProvider`.
There's no real email/SMS/WhatsApp provider to swap in yet, and adding an interface with exactly
one implementation would be abstraction with nothing to abstract over. When a real provider is
wired up, this is the one place that changes.

It's a **mock send**: it writes a `Notification` row with `status: "sent"` immediately. No email,
SMS, or WhatsApp message actually leaves the building — this mirrors the Mock payment/fulfillment
adapters already in the codebase, and is intentionally never claimed as more than that in the UI
(the admin order detail page labels this section "Notifications sent", listing the row, not
"Email sent to customer").

Because it's a plain DB write with no network call, every call site runs it **inside the same
transaction** as the business event it's about — a payment capture, a fulfillment outcome, a
refund — so the notification record and the state change it describes can never disagree.

## Call sites

| Event | Where | Template |
|---|---|---|
| Payment captured, order moves to `FULFILLMENT_QUEUED` | `PaymentsService.processGatewayEvent` (`apps/api/src/payments/payments.service.ts`) | `order_confirmed` |
| Fulfillment finishes successfully, order moves to `COMPLETED` | `finalizeOrderFulfillmentStatus` (`apps/worker/src/fulfillment/process-fulfillment-job.ts`) | `order_completed` |
| Fulfillment fails outright, order moves to `FAILED` | same as above | `order_failed` |
| Refund succeeds at the gateway | `AdminRefundsService.createRefund` (`apps/api/src/admin/refunds/admin-refunds.service.ts`) | `refund_issued` |

`MANUAL_REVIEW` and `PARTIALLY_FULFILLED` don't notify — they're internal ops states with nothing
actionable to tell a customer yet.

## Addressing: a real schema gap

`Notification.userId` is the only recipient field, but checkout is guest-first — `CheckoutService`
never sets `Order.userId` even when a logged-in customer's session is present, so in practice
`userId` is always `null` today. The actual address (`Order.guestEmail`) is carried in
`payloadJson.recipientEmail` instead, which works for a mock "record that we would have sent this"
but isn't a real addressing mechanism. A real provider integration needs either `Order.userId` to
start being set at checkout, or a proper recipient field on `Notification` itself — don't assume
`userId` is populated when building on top of this.

## Visibility

`GET /admin/orders/:id` includes a `notifications` array (matched by a JSON-path filter on
`payloadJson.orderId`, since `Notification` has no `orderId` column — see above), rendered on the
admin order detail page. There's no customer-facing history of notifications; the order tracking
page only shows order status, not what was mock-sent about it.

## Test coverage

No dedicated spec file — coverage is threaded through the integration tests for the events that
trigger a notification: `checkout.integration-spec.ts` (order_confirmed after mock payment),
`refund.integration-spec.ts` (refund_issued after a full refund), and
`process-fulfillment-job.integration.test.ts` (order_completed / order_failed, and confirms
`MANUAL_REVIEW` outcomes send nothing).
