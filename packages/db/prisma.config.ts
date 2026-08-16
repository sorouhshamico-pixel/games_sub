import path from "node:path";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// prisma.config.ts replaces the old package.json#prisma auto-loading of
// .env — without this, `DATABASE_URL` silently isn't picked up and every
// prisma command fails with a confusing "no datasource" error. Root .env,
// since this package lives two levels under the repo root.
loadEnv({ path: path.resolve(__dirname, "../../.env") });

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
