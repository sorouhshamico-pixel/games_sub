import { join } from "node:path";

/**
 * Shared between storage.module.ts (where LocalDiskStorageProvider writes)
 * and main.ts (where that same directory is served back at /uploads) — one
 * definition so the two can never drift apart.
 */
export const UPLOADS_DIR = join(process.cwd(), "uploads");
