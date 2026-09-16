import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { StorageProvider, UploadableFile } from "./storage-provider.interface";

export interface S3StorageConfig {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  region?: string;
}

/** Any S3-compatible target (AWS S3, MinIO, DigitalOcean Spaces, Cloudflare R2, ...). */
export class S3StorageProvider implements StorageProvider {
  readonly code = "s3";
  private readonly client: S3Client;

  constructor(private readonly config: S3StorageConfig) {
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: config.region ?? "auto",
      credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
      forcePathStyle: true,
    });
  }

  async upload(file: UploadableFile, key: string): Promise<{ url: string }> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimeType,
        ACL: "public-read",
      }),
    );
    return { url: `${this.config.endpoint}/${this.config.bucket}/${key}` };
  }
}
