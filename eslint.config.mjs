// @ts-check
import { baseConfig } from "./packages/config/eslint.base.mjs";

export default [
  ...baseConfig,
  {
    // NestJS relies on emitDecoratorMetadata for dependency injection and
    // ValidationPipe's metatype checks. `import type` erases the import at
    // compile time, so TypeScript substitutes `Object` in the emitted
    // design:paramtypes metadata — breaking DI resolution and silently
    // skipping DTO validation. Regular value imports are required here.
    files: ["apps/api/**/*.ts"],
    rules: {
      "@typescript-eslint/consistent-type-imports": "off",
    },
  },
];
