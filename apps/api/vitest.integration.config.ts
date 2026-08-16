import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.integration-spec.ts"],
    testTimeout: 20_000,
  },
  // See vitest.e2e.config.ts for why this is required for NestJS DI to work.
  plugins: [swc.vite()],
});
