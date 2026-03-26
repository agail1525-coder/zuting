# ---- Stage 1: Dependencies ----
FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy monorepo root files needed for pnpm install
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/admin/package.json ./apps/admin/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/config/package.json ./packages/config/

RUN pnpm install --frozen-lockfile

# ---- Stage 2: Build ----
FROM node:20-alpine AS build

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/admin/node_modules ./apps/admin/node_modules
COPY --from=deps /app/packages ./packages

# Copy source
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY apps/admin ./apps/admin

ARG VITE_API_URL=http://localhost:3002
ENV VITE_API_URL=$VITE_API_URL

RUN cd apps/admin && npx tsc -b && npx vite build

# ---- Stage 3: Serve with Nginx ----
FROM nginx:alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/apps/admin/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
