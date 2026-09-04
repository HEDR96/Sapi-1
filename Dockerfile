# ============================================================
# Multi-stage Dockerfile for Sapi Monorepo
# ============================================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy packages package.json files
COPY packages/prisma/package.json packages/prisma/
COPY packages/shared/package.json packages/shared/

# Copy apps package.json files
COPY apps/web/package.json apps/web/
COPY apps/admin/package.json apps/admin/

# Install pnpm 9 (compatible with Node 20) and dependencies
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate && pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy entire source code
COPY . .

# Set environment for build
ENV NEXT_TELEMETRY_DISABLED=1

# Activate pnpm 9
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Build both apps
RUN pnpm build

# Stage 3: Production - Web App
FROM node:20-alpine AS runner-web
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built artifacts from builder
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/@samadya ./node_modules/@samadya

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
