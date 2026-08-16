# Pricing, Discounts & Coupons

## Item-level pricing

Source of truth: [`computePriceBreakdown`](../packages/contracts/src/pricing.ts). Applied in
order: margin on top of `baseCostMinorUnits` → variant-level `discountMinorUnits` → VAT on the
post-discount amount. Every amount is an integer minor unit; nothing here is a float. See
`CheckoutService.checkout` (`apps/api/src/orders/checkout.service.ts`), which always recomputes
this from the current `ProductVariant` row — a client-sent price is never trusted.

## Order-level coupons

Source of truth: [`CouponService.applyCoupon`](../apps/api/src/orders/coupon.service.ts), called
from inside the same transaction as order creation, before `Order.create`.

- **Lookup & lock**: the `Coupon` row is fetched with `SELECT ... FOR UPDATE` (raw SQL, same
  pattern as digital code reservation in the worker) so two concurrent checkouts using the same
  code serialize around the redemption-count checks below instead of both slipping past
  `maxRedemptions`.
- **Validity checks, in order**: exists & `isActive` → `startsAt`/`endsAt` window → the order's
  net-of-item-discount subtotal meets `minOrderAmountMinorUnits` → `maxRedemptions` not exhausted
  (global `CouponRedemption` count) → `maxRedemptionsPerCustomer` not exhausted (`CouponRedemption`
  count joined to orders with the same `guestEmail`).
- **Per-customer limits require an email.** Checkout is guest-first and `guestEmail` is optional
  on every other path, but a coupon with `maxRedemptionsPerCustomer` set rejects the checkout with
  400 if no email is supplied — silently allowing the limit to be bypassed by omitting the email
  would defeat the point of having it.
- **Discount amount**: [`computeCouponDiscountMinorUnits`](../packages/contracts/src/pricing.ts) —
  percentage (basis points) or fixed minor units, capped so it can never exceed the eligible
  subtotal or go negative.
- On success, a `CouponRedemption` row is created and `Order.couponId` is set in the same
  transaction as the order itself — if the transaction rolls back for any reason, no partial
  redemption is left behind.

### Known simplification: coupons don't affect the tax base

Item-level VAT is computed per line item *before* any order-level coupon is known (it depends only
on the variant's own margin/discount/tax rate). The coupon discount is subtracted from the total
afterward, alongside tax, rather than being folded back into a re-computed tax base. In a
tax-inclusive-discount model (closer to what ZATCA invoicing will eventually require — see the
"not built yet" list in the README), VAT should be computed on the post-coupon amount. This is an
intentional scope simplification for the current phase, not an oversight — revisit when building
real ZATCA invoice generation.

## Admin coupon management

`AdminCouponsController` (`/admin/coupons`, `SUPER_ADMIN`/`FINANCE` to create/edit/deactivate;
`CATALOG_MANAGER`/`READ_ONLY_ANALYST` can view). Coupons are deactivated, never deleted — they're
referenced by historical `Order`/`CouponRedemption` rows, same soft-delete policy as
Product/Category/ProductVariant.

## Test coverage

`apps/api/test/coupon.integration-spec.ts` (`DATABASE_URL`-gated, runs for real in CI): percentage
and fixed discounts, unknown code, expired/not-yet-started windows, minimum order amount,
`maxRedemptions` exhaustion across separate checkouts, `maxRedemptionsPerCustomer` enforcement and
its email requirement, and admin CRUD + RBAC (including a 409 on duplicate codes and a 403 for a
customer session). Verified live against a real Postgres instance: created a coupon through the
admin UI, applied it (lowercase input) through a real checkout call, confirmed the exact discount
and total, and confirmed a second checkout with the same email was rejected once the per-customer
limit was reached.
