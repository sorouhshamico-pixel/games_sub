export interface UploadableFile {
  buffer: Buffer;
  mimeType: string;
}

/**
 * One implementation per storage backend. Swapping local disk for S3 (or a
 * different S3-compatible target) means writing a new class here — no other
 * module should branch on which backend is active. See docs/ARCHITECTURE.md.
 */
export interface StorageProvider {
  readonly code: string;
  upload(file: UploadableFile, key: string): Promise<{ url: string }>;
}

export const STORAGE_PROVIDER = Symbol("STORAGE_PROVIDER");
