# Runbook

Operational responses for the failure modes this system is actually designed to
surface. Written against what's built today — update it as new failure modes get
handled (or discovered).

## Health checks

- API: `GET /health` (unprefixed — not under `/api/v1`). Returns `{status: "ok"}` when
  the database is reachable, `{status: "degraded", database: "down"}` when it isn't —
  it never throws, so an orchestrator can always get a response.
- Worker: `GET /health` on `WORKER_HEALTH_PORT` (default 4100) — process liveness only,
  not a check of its Redis/Postgres connections.

## "Orders are stuck in FULFILLMENT_QUEUED and never move"

Most likely cause: the worker process isn't running, or its outbox dispatcher isn't
finding events.

1. Confirm the worker process is up (`GET :4100/health`).
2. Check for pending outbox events directly:
   ```sql
   SELECT * FROM outbox_events WHERE "publishedAt" IS NULL ORDER BY "createdAt" ASC;
   ```
   Rows here with old `createdAt` mean the dispatcher isn't running or can't reach
   Redis — check `REDIS_URL` and the worker's logs for `[outbox-dispatcher]` errors.
3. If outbox rows *have* `publishedAt` set but no `Fulfillment` progress happened,
   the job reached BullMQ but the worker never processed it — check Redis connectivity
   from the worker and BullMQ's queue directly (`redis-cli LLEN bull:fulfillment:wait`,
   or inspect via a BullMQ dashboard if one is deployed — none is wired up yet).

## Fulfillments stuck in `IN_PROGRESS`

The reconciliation job (`apps/worker/src/reconciliation/reconciliation-job.ts`, runs
every 5 minutes) automatically flags any `Fulfillment` `IN_PROGRESS` for more than 15
minutes to `MANUAL_REVIEW`. If you're seeing stuck rows younger than that, they're not
stuck yet — wait, or check the worker's logs for the specific `orderItemId`. If the
reconciliation job itself isn't running, restart the worker process (it's an
`setInterval` inside the same process, not a separate cron).

## Provider (fulfillment) balance dropping / going negative

`runReconciliation` snapshots each active provider's balance into
`ProviderBalanceSnapshot` every 5 minutes. Query recent snapshots:

```sql
SELECT p.code, s."balanceMinorUnits", s.currency, s."capturedAt"
FROM provider_balance_snapshots s
JOIN providers p ON p.id = s."providerId"
ORDER BY s."capturedAt" DESC LIMIT 20;
```

No alerting is wired up on this yet (no Sentry/PagerDuty integration) — this is a
manual query today. There's also no admin UI for it; see `docs/PROVIDER_INTEGRATION.md`
for what's missing.

## Webhook signature failures / unexpected 400s on `/payments/webhook/moyasar`

Moyasar isn't enabled or verified against a live sandbox yet (`MOYASAR_ENABLED=false`
by default) — if you're seeing this, someone turned it on. Check
`MOYASAR_WEBHOOK_SECRET` matches what's configured in the Moyasar dashboard, and see
`docs/PAYMENT_INTEGRATION.md`'s warning about this integration being unverified.

## Duplicate payment/fulfillment concerns

Don't manually re-trigger a webhook or fulfillment job to "fix" a stuck order without
checking `WebhookEvent`/`ProviderTransaction` first — both have unique constraints
specifically so replays are safe, but a manual `curl` retry of the mock-confirm endpoint
against a *different* payment than intended is a real way to cause confusion. Prefer
inspecting `OrderStatusEvent` (the full timeline, `correlationId` included) before
taking any manual action.

## Rolling back a bad deploy

No deployment pipeline exists yet (only CI: lint/typecheck/test/build/Docker-build — no
CD). When one exists, document the actual rollback command here. Until then: redeploy
the previous known-good Docker image tag.

## Database migration went wrong

`pnpm --filter @gcc-store/db exec prisma migrate deploy` applies migrations
non-interactively and doesn't support automatic rollback — Prisma migrations are
forward-only by design. If a migration breaks something:

1. Do not run `prisma migrate reset` against a database with real data — it drops
   everything.
2. Write a new forward migration that corrects the issue, rather than trying to
   uninstall the bad one.
3. No backup/restore process has been tested yet — see the open item below.

## What's not built yet

- No alerting (Sentry, PagerDuty, or equivalent) — every check above is manual.
- No tested backup/restore procedure for Postgres.
- No staging environment.
- No CD pipeline, so no documented rollback beyond "redeploy the previous image."
- No BullMQ dashboard/UI for inspecting queue state beyond raw `redis-cli` commands.
