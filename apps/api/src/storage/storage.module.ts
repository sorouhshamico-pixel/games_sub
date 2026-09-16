import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { STORAGE_PROVIDER } from "./storage-provider.interface";
import { LocalDiskStorageProvider } from "./local-disk-storage.provider";
import { S3StorageProvider } from "./s3-storage.provider";
import { UPLOADS_DIR } from "./uploads-dir";

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: STORAGE_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const endpoint = config.get<string>("S3_ENDPOINT");
        const bucket = config.get<string>("S3_BUCKET");
        const accessKeyId = config.get<string>("S3_ACCESS_KEY_ID");
        const secretAccessKey = config.get<string>("S3_SECRET_ACCESS_KEY");
        if (endpoint && bucket && accessKeyId && secretAccessKey) {
          return new S3StorageProvider({ endpoint, bucket, accessKeyId, secretAccessKey });
        }

        const publicBaseUrl = config.get<string>("API_PUBLIC_URL") ?? "http://localhost:4000/api/v1";
        return new LocalDiskStorageProvider(UPLOADS_DIR, publicBaseUrl);
      },
    },
  ],
  exports: [STORAGE_PROVIDER],
})
export class StorageModule {}
