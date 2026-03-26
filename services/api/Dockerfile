# ---- Stage 1: Dependencies ----
FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy monorepo root files needed for pnpm install
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY services/api/package.json ./services/api/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/config/package.json ./packages/config/

RUN pnpm install --frozen-lockfile

# ---- Stage 2: Build ----
FROM node:20-alpine AS build

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/services/api/node_modules ./services/api/node_modules
COPY --from=deps /app/packages ./packages

# Copy source
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY services/api ./services/api

# Generate Prisma client
RUN cd services/api && npx prisma generate

# Build with NestJS (SWC)
RUN cd services/api && npx nest build

# ---- Stage 3: Production ----
FROM node:20-alpine AS production

RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
WORKDIR /app

# Copy built output
COPY --from=build /app/services/api/dist ./dist
COPY --from=build /app/services/api/prisma ./prisma
COPY --from=build /app/services/api/node_modules ./node_modules
COPY --from=build /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=build /app/services/api/package.json ./

EXPOSE 3002

USER node

CMD ["dumb-init", "node", "dist/main.js"]
