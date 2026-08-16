# syntax=docker/dockerfile:1
#
# NOT YET VERIFIED — see apps/api/Dockerfile's header comment; same caveats
# apply here (untested, no Docker in the dev sandbox this was written in).

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
COPY --from=deps /repo/apps/worker/node_modules ./apps/worker/node_modules
COPY --from=deps /repo/packages ./packages
COPY . .
RUN pnpm --filter @gcc-store/contracts build \
  && pnpm --filter @gcc-store/db build \
  && pnpm --filter @gcc-store/worker build \
  && pnpm deploy --filter @gcc-store/worker --prod --legacy /repo/deploy/worker

# ---------------------------------------------------------------------------
FROM node:22-alpine AS runtime
RUN apk add --no-cache dumb-init && addgroup -S app && adduser -S app -G app
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build --chown=app:app /repo/deploy/worker/node_modules ./node_modules
COPY --from=build --chown=app:app /repo/deploy/worker/package.json ./package.json
COPY --from=build --chown=app:app /repo/apps/worker/dist ./dist
# See apps/api/Dockerfile for why this explicit copy is needed.
COPY --from=build --chown=app:app /repo/packages/db/generated ./node_modules/@gcc-store/db/generated
USER app
EXPOSE 4100
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:4100/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
