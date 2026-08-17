-- Real invoice numbers must be sequential (unlike ORD-* order numbers, which
-- are deliberately random) — most tax authorities, ZATCA included, expect an
-- auditable, monotonically increasing sequence per invoice type. A Postgres
-- SEQUENCE gives atomic, concurrency-safe nextval() without a locked counter
-- row on the hot checkout path. See docs/ZATCA_INTEGRATION.md.
CREATE SEQUENCE "invoice_number_seq" START 1;
