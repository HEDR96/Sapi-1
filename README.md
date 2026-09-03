# Samadya Farm - Monorepo Structure

## Struktur Proyek

```
samadyafarm/
├── apps/
│   ├── web/           # Public Website (samadyafarm.id)
│   │   ├── src/
│   │   │   ├── app/           # Next.js pages
│   │   │   └── components/   # Public components
│   │   └── package.json
│   └── admin/         # Admin Website (admin.samadyafarm.id)
│       ├── src/
│       │   ├── app/           # Next.js pages
│       │   └── components/   # Admin components
│       └── package.json
├── packages/
│   ├── prisma/       # Database Schema
│   │   ├── schema.prisma
│   │   ├── generated/  # Generated Prisma Client
│   │   └── package.json
│   ├── shared/       # Shared Code
│   │   ├── types/
│   │   ├── lib/
│   │   └── package.json
│   └── api/          # Shared API Routes
│       ├── src/
│       │   └── app/api/
│       └── package.json
├── turbo.json
└── package.json      # Root workspace
```

## Setup

### 1. Install Dependencies

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install all dependencies
pnpm install
```

### 2. Generate Prisma Client

```bash
pnpm db:generate
```

### 3. Setup Database

```bash
# Copy .env to prisma package
cp .env packages/prisma/.env

# Push schema to database
pnpm db:push

# Or run migrations
pnpm db:migrate
```

### 4. Run Development

```bash
# Run all apps with turbo
pnpm dev:all

# Or run individually
pnpm dev:web     # Public: http://localhost:3000
pnpm dev:admin   # Admin: http://localhost:3002
pnpm dev:api     # API: http://localhost:3001
```

## Deployment

### Vercel

1. Connect repo to Vercel
2. Set root directory for each project:
   - Web App: `apps/web`
   - Admin App: `apps/admin`
3. Configure environment variables
4. Deploy

### Environment Variables

**Web App (.env.local)**
```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=https://samadyafarm.id
```

**Admin App (.env.local)**
```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=https://admin.samadyafarm.id
```

## Commands

```bash
# Install dependencies
pnpm install

# Build all apps
pnpm build

# Type check
pnpm typecheck

# Lint
pnpm lint

# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Run migrations
pnpm db:migrate

# Open Prisma Studio
pnpm db:studio
```

## Adding Dependencies

```bash
# Add to specific app
pnpm --filter @samadya/web add recharts
pnpm --filter @samadya/admin add recharts

# Add to shared package
pnpm --filter @samadya/shared add lucide-react
```
