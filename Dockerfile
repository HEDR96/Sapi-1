# Multi-stage Dockerfile for Cattle Catalog

# =====================
# Stage 1: Dependencies
# =====================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# =====================
# Stage 2: Prisma Generate
# =====================
FROM node:20-alpine AS prisma-builder

WORKDIR /app

# Copy lock file and install deps
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Copy prisma schema
COPY prisma/ ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# =====================
# Stage 3: Build
# =====================
FROM deps AS builder

WORKDIR /app

# Install openssl for Prisma during build
RUN apk add --no-cache openssl

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Copy Prisma generated client
COPY --from=prisma-builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=prisma-builder /app/node_modules/@prisma ./node_modules/@prisma

# Generate Prisma Client (extra safety)
RUN npx prisma generate

# Build Next.js
RUN npm run build

# =====================
# Stage 4: Production Runner
# =====================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install openssl for Prisma and sharp
RUN apk add --no-cache openssl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Create app directories
RUN mkdir -p /app/public /app/.next/static /app/prisma

# Copy built app
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema and generated client
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma/
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma/
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma/

# Copy package.json for scripts
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./

# Install production dependencies (including sharp)
RUN npm ci --legacy-peer-deps --omit=dev

# Re-install sharp for image optimization (standalone build issue)
RUN npm install sharp@latest

# Install Prisma CLI and tsx globally for db commands
RUN npm install -g prisma@5.15.0 tsx@4.10.0

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Default command - starts the app
CMD ["node", "server.js"]
