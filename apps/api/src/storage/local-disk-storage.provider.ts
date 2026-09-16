import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { StorageProvider, UploadableFile } from "./storage-provider.interface";

/**
 * Default storage backend when no S3-compatible credentials are configured
 * (see storage.module.ts) — writes under <cwd>/uploads and main.ts serves
 * that directory back at /uploads. Fine for local dev and this demo's
 * current Docker deployment; the files don't survive a redeploy of that
 * container, which is exactly why S3StorageProvider is the real production
 * path once S3_* env vars are set.
 */
export class LocalDiskStorageProvider implements StorageProvider {
  readonly code = "local-disk";

  constructor(
    private readonly uploadsDir: string,
    private readonly publicBaseUrl: string,
  ) {}

  async upload(file: UploadableFile, key: string): Promise<{ url: string }> {
    await mkdir(this.uploadsDir, { recursive: true });
    await writeFile(join(this.uploadsDir, key), file.buffer);
    return { url: `${this.publicBaseUrl}/uploads/${key}` };
  }
}
