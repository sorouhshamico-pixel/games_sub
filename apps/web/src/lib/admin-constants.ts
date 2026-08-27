// Mirrors packages/db/prisma/schema.prisma's ProductLifecycleStatus enum —
// shared so the product-detail status dropdown and the products-list
// filter dropdown can't silently drift apart (they were two copy-pasted
// copies of the same list before this).
export const PRODUCT_LIFECYCLE_STATUSES = ["DRAFT", "ACTIVE", "PAUSED", "OUT_OF_STOCK", "RETIRED"] as const;
