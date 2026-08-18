import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.integration-spec.ts"],
    testTimeout: 20_000,
    // These specs share one live Postgres database (no per-file schema/
    // transaction isolation). Running files in parallel lets one file's
    // checkout calls create real orders while another file's test is
    // mid-assertion on a global `prisma.order.count()`, producing
    // intermittent off-by-one failures (seen twice in CI) that have
    // nothing to do with the code under test. Serializing files removes
    // the whole class of cross-file races; the suite is small enough
    // (~1s) that this costs nothing meaningful.
    fileParallelism: false,
  },
  // See vitest.e2e.config.ts for why this is required for NestJS DI to work.
  plugins: [swc.vite()],
});
