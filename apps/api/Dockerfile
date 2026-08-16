# syntax=docker/dockerfile:1
#
# NOT YET VERIFIED — Docker isn't available in the sandbox this was written
# in, so this has never actually been built. It follows pnpm's documented
# multi-stage monorepo pattern (https://pnpm.io/docker) and pnpm deploy's
# "prod-only, workspace deps resolved to real files" model, plus an explicit
# safety-net copy of the Prisma generated client (see the comment below for
# why). Build and run it before trusting it in any real environment.

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

# ---------------------------------------------------------------------------
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/i18n/package.json packages/i18n/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN pnpm install --frozen-lockfile

# ---------------------------------------------------------------------------
FROM base AS build
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /repo/packages ./packages
COPY . .
RUN pnpm --filter @gcc-store/contracts build \
  && pnpm --filter @gcc-store/db build \
  && pnpm --filter @gcc-store/api build \
  && pnpm deploy --filter @gcc-store/api --prod --legacy /repo/deploy/api

# ---------------------------------------------------------------------------
FROM node:22-alpine AS runtime
RUN apk add --no-cache dumb-init && addgroup -S app && adduser -S app -G app
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build --chown=app:app /repo/deploy/api/node_modules ./node_modules
COPY --from=build --chown=app:app /repo/deploy/api/package.json ./package.json
COPY --from=build --chown=app:app /repo/apps/api/dist ./dist
# packages/db/generated is gitignored (it's `prisma generate` output, not
# source), so `pnpm deploy`'s file-inclusion rules likely drop it even
# though @gcc-store/db's compiled dist/index.js imports it via a relative
# path at runtime — copy it in explicitly rather than assume deploy caught it.
COPY --from=build --chown=app:app /repo/packages/db/generated ./node_modules/@gcc-store/db/generated
COPY --from=build --chown=app:app /repo/packages/db/prisma ./node_modules/@gcc-store/db/prisma
USER app
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:4000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
