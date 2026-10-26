# syntax=docker/dockerfile:1.7
# Echo Trace — image de production (Coolify). Voir docs/DEPLOYMENT.md.

# ---- build ------------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable

# Manifests first for a cacheable dependency layer.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY packages/engine/package.json packages/engine/
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm content:check && pnpm --filter @echotrace/engine test && pnpm build

# ---- runtime ----------------------------------------------------------------
FROM caddy:2.10-alpine AS runtime
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/apps/web/dist /srv
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
