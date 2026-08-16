import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.e2e-spec.ts"],
    testTimeout: 15_000,
  },
  // esbuild's default TS transform (vitest's usual transformer) doesn't
  // reliably emit `design:paramtypes` decorator metadata, so Nest's
  // constructor-injection silently resolves to `undefined` for any
  // controller/service with real dependencies — swc's transform matches
  // what tsc/nest build produce. See git history for the failure this
  // caused (every DI'd endpoint 500ing with "Cannot read properties of
  // undefined") before this was added.
  plugins: [swc.vite()],
});
