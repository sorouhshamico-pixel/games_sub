# ZATCA (Saudi E-Invoicing) Integration

## What's implemented: Phase 1 simplified tax invoices

ZATCA's Fatoora e-invoicing program has two phases. **Phase 1 (Generation)** just requires a
correctly-shaped invoice with a QR code — no API, no credentials, no cryptographic stamp. That's
implementable and fully verifiable without any real ZATCA account, so it's what's built here.
**Phase 2 (Integration)** requires onboarding with ZATCA to get a Compliance/Production CSID,
cryptographically signs and hashes every invoice, and reports or clears each one through ZATCA's
API in real time. **None of Phase 2 exists in this codebase.**

`Invoice.zatcaStatus` stays `null` for every invoice this system issues — that field exists in the
schema specifically to represent "not yet cleared/reported," and nothing sets it to anything else.

## The QR code

[`apps/api/src/invoicing/zatca-qr.ts`](../apps/api/src/invoicing/zatca-qr.ts) implements the
Phase 1 simplified-invoice QR: five fields, each encoded as `[tag: 1 byte][length: 1
byte][UTF-8 value]`, concatenated and base64-encoded:

| Tag | Field |
|---|---|
| 1 | Seller name |
| 2 | VAT registration number |
| 3 | Invoice timestamp (ISO 8601) |
| 4 | Invoice total, VAT-inclusive |
| 5 | VAT total |

This is a byte format, not a network call — unlike Moyasar, there's no "unverified against a live
sandbox" caveat here. It's tested directly: `apps/api/src/invoicing/zatca-qr.spec.ts` verifies the
exact TLV byte layout, a round trip through `decodeZatcaQrPayloadBase64`, multi-byte UTF-8 (Arabic
seller names), and that a truncated payload throws instead of returning garbage.

`InvoicingService.buildQrImageDataUri` renders that payload as a scannable PNG (via the `qrcode`
package) for display in the admin order detail page and the customer order tracking page.

## Seller identity

`ZATCA_SELLER_NAME` / `ZATCA_SELLER_VAT_NUMBER` env vars — see
[`apps/api/src/invoicing/zatca-seller-config.ts`](../apps/api/src/invoicing/zatca-seller-config.ts).
Unset, they fall back to an obviously-fake demo identity (`"Demo Store (DEV ONLY)"`, a VAT number
in the correct 15-digit format but **not** a real registration) and log a loud warning. Set both
before issuing anything that isn't a demo.

The seller name/VAT number are **snapshotted onto the `Invoice` row at issuance time**
(`sellerNameSnapshot`/`sellerVatNumberSnapshot`), not re-read from current config when the QR is
later displayed — the same historical-snapshot principle as `OrderItem.priceSnapshotJson`. If the
seller's registered VAT number changes later, already-issued invoices must keep encoding the value
that was true when they were issued.

## Invoice numbering

Real invoice numbers are sequential and gapless-by-convention (most tax authorities, ZATCA
included, expect an auditable monotonic sequence) — unlike `Order.orderNumber`, which is
deliberately random so order volume can't be inferred externally. A Postgres `SEQUENCE`
(`invoice_number_seq`, created in its own migration) gives atomic `nextval()` without a locked
counter row on the checkout hot path. Format: `INV-000123`.

## When an invoice is issued

Inside the same transaction as payment capture (`PaymentsService.processGatewayEvent`, the same
transaction that moves the order to `FULFILLMENT_QUEUED` and records the `order_confirmed`
notification) — see [`InvoicingService.issueInvoice`](../apps/api/src/invoicing/invoicing.service.ts).
It's a plain DB write with no network call, so — like `recordNotification` — it belongs inside the
transaction rather than as a fire-and-forget side effect after commit.

`type` is always `"b2c_simplified"`: checkout never collects a buyer VAT number today, so the
`"b2b_tax"` invoice type is schema-supported but unreachable in this codebase. Building a real B2B
flow would mean adding a buyer-VAT-number field to checkout first.

## Visibility

- **Admin**: `GET /admin/orders/:id` includes `invoice` and a rendered `invoiceQrCodeDataUri`;
  shown on the admin order detail page.
- **Customer**: the order tracking response (`GET /orders/:orderNumber`) includes the same,
  rendered on the customer-facing tracking page.

## Known gaps

- **No PDF/A-3 rendering.** `Invoice.pdfUrl` exists in the schema but nothing generates a PDF —
  customers only see the QR + invoice number on the tracking page, not a downloadable invoice
  document.
- **No Phase 2 clearance/reporting API integration**, cryptographic stamp, or CSID onboarding —
  see above.
- **Currency**: the QR's total/VAT fields are computed the same way `formatMoney` does elsewhere
  in this codebase (divide minor units by 100), which is only correct for 2-decimal currencies.
  ZATCA only applies to Saudi transactions (SAR) in practice, so this hasn't mattered yet, but it's
  the same pre-existing simplification noted in `docs/PRICING.md`, not something new here.

## Test coverage

`apps/api/src/invoicing/zatca-qr.spec.ts` — pure TLV encode/decode, no DB needed. Extended
`apps/api/test/checkout.integration-spec.ts` (`DATABASE_URL`-gated) to assert an `Invoice` row is
created with a sequential `INV-` number when a mock payment is confirmed, and that its QR payload
decodes back to the order's actual totals.
