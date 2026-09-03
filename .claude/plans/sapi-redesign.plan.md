# Plan: Sapi Website Redesign - Split into 2 Separate Websites

**Source**: Free-form requirements
**Complexity**: Very Large

## Summary

Split the application into **TWO SEPARATE Next.js websites** that share the same PostgreSQL database and API:

1. **Public Website** (`samadyafarm.id`) - Landing page, catalog, cattle details
2. **Admin Website** (`admin.samadyafarm.id`) - Dashboard, cattle management, sales, customers

This is the **MOST CRITICAL architectural change**.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MONOREPO STRUCTURE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐         ┌─────────────────────────────────┐  │
│  │   Shared API    │◄────────│  Database (PostgreSQL + Prisma) │  │
│  │  /api/admin/*   │         └─────────────────────────────────┘  │
│  │  /api/cattle/*  │                      │                        │
│  │  /api/comments  │                      │                        │
│  └────────┬────────┘                      │                        │
│           │                               │                        │
│           ▼                               ▼                        │
│  ┌─────────────────┐              ┌─────────────────┐             │
│  │  Public App     │              │   Admin App     │             │
│  │  (Next.js)      │              │   (Next.js)     │             │
│  │                 │              │                 │             │
│  │  - Landing Page │              │  - Dashboard    │             │
│  │  - Katalog      │              │  - Cattle Mgmt  │             │
│  │  - Cattle Detail│              │  - Sales        │             │
│  │  - Pantau       │              │  - Customers     │             │
│  │                 │              │  - Master Data   │             │
│  └────────┬────────┘              └────────┬────────┘             │
│           │                               │                        │
│           ▼                               ▼                        │
│  samadyafarm.id                   admin.samadyafarm.id            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase 0: Project Structure Setup

### 0.1 Create Monorepo Structure

| File | Action | Why |
|------|--------|-----|
| Create `apps/web/` | CREATE | Public website (Next.js) |
| Create `apps/admin/` | CREATE | Admin website (Next.js) |
| Move `src/app/api/` to `packages/api/` | MOVE | Shared API package |
| Move `src/lib/` to `packages/shared/lib/` | MOVE | Shared utilities |
| Move `src/types/` to `packages/shared/types/` | MOVE | Shared TypeScript types |
| Move `src/components/` to `packages/shared/components/` | MOVE | Shared UI components |
| Move `prisma/` to `packages/shared/prisma/` | MOVE | Shared Prisma schema |

### 0.2 Configuration Files

| File | Action | Why |
|------|--------|-----|
| `package.json` (root) | UPDATE | Add workspaces for apps and packages |
| `apps/web/package.json` | CREATE | Public website dependencies |
| `apps/admin/package.json` | CREATE | Admin website dependencies |
| `apps/web/next.config.js` | CREATE | Public website config |
| `apps/admin/next.config.js` | CREATE | Admin website config |
| `turbo.json` | CREATE | Turborepo config for build pipeline |

### 0.3 Shared Packages

| Package | Contents |
|---------|----------|
| `@sapi/shared` | `lib/`, `types/`, `components/ui/` |
| `@sapi/api` | API routes |
| `@sapi/prisma` | Prisma schema + generated client |

### 0.4 App-Specific Structure

**Public Website (`apps/web/`):**
```
apps/web/
├── src/
│   ├── app/
│   │   ├── (public)/          # Pages route group
│   │   │   ├── page.tsx      # Landing page
│   │   │   ├── katalog/
│   │   │   └── sapi/[code]/
│   │   └── layout.tsx
│   └── components/           # Public-specific components
└── package.json
```

**Admin Website (`apps/admin/`):**
```
apps/admin/
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # Pages route group
│   │   │   ├── page.tsx      # Dashboard
│   │   │   ├── cattle/
│   │   │   ├── sales/
│   │   │   ├── customers/
│   │   │   └── master-data/
│   │   ├── login/
│   │   └── layout.tsx
│   └── components/           # Admin-specific components
└── package.json
```

---

## Phase 1: Database Schema & Master Data

### 1.1 Prisma Schema Updates

| File | Action | Why |
|------|--------|-----|
| `packages/shared/prisma/schema.prisma` | UPDATE | Add Customer, Sale, Testimonial, MasterData, cattle price fields |

**New Models:**
```prisma
model Customer {
  id          String   @id @default(cuid())
  name        String
  email       String?
  phone       String?
  address     String?
  purchasePercentage Float?
  sales       Sale[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Sale {
  id           String   @id @default(cuid())
  cattleId    String
  cattle      Cattle   @relation(fields: [cattleId], references: [id])
  customerId  String
  customer    Customer @relation(fields: [customerId], references: [id])
  quantity    Int      @default(1)
  price       Decimal
  margin      Decimal?
  status      SaleStatus @default(PENDING)
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum SaleStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
}

model Testimonial {
  id        String   @id @default(cuid())
  customerName String
  content   String
  isActive  Boolean  @default(true)
  order     Int      @default(0)
  createdAt DateTime @default(now())
}

model MasterData {
  id        String   @id @default(cuid())
  category  String   // JENIS_SAPI, STATUS_SAPI, JENIS_PAKAN
  key       String
  value     String
  isActive  Boolean  @default(true)
  order     Int      @default(0)
  @@unique([category, key])
}

// Cattle model additions:
buyPrice     Decimal?
sellPrice    Decimal?
healthCost   Decimal?
feedCost     Decimal?
```

### 1.2 API Routes (Shared)

| File | Action | Why |
|------|--------|-----|
| `packages/api/admin/customers/route.ts` | CREATE | CRUD for Customer |
| `packages/api/admin/sales/route.ts` | CREATE | CRUD for Sales |
| `packages/api/admin/testimonials/route.ts` | CREATE | CRUD for Testimonials |
| `packages/api/admin/master-data/route.ts` | CREATE | CRUD for Master Data |
| `packages/api/admin/cattle/[id]/route.ts` | UPDATE | Include new price fields |
| `packages/api/cattle/route.ts` | UPDATE | Public cattle listing |
| `packages/api/cattle/[code]/route.ts` | UPDATE | Public cattle detail |
| `packages/api/testimonials/route.ts` | CREATE | Public testimonials listing |

---

## Phase 2: Public Website - Landing Page

### 2.1 Hero Section (80% height)

| File | Action | Why |
|------|--------|-----|
| `apps/web/src/components/catalog/HeroSection.tsx` | UPDATE | Redesign to 80% viewport height |

**Changes:**
- Hero photo/content: 80vh minimum
- Journey section: 20vh with transparent background
- Font sizes increased: h1 from 31px → 38px, body text 11px → 13px
- QR tag: Animated like book page flip from top

### 2.2 Catalog Enhancement

| File | Action | Why |
|------|--------|-----|
| `apps/web/src/components/catalog/CatalogSwiper.tsx` | UPDATE | Pagination dots matching catalog |
| `apps/web/src/components/catalog/CatalogSwiperCard.tsx` | UPDATE | Show code and name clearly |

### 2.3 Pantau Perkembangan

| File | Action | Why |
|------|--------|-----|
| `apps/web/src/components/home/TrackingTabs.tsx` | UPDATE | Fix container sizing, consistent heights |
| `apps/web/src/components/home/PantauPerkembanganSection.tsx` | UPDATE | Section improvements |

---

## Phase 3: Admin Website - Dashboard

### 3.1 Dashboard with Charts

| File | Action | Why |
|------|--------|-----|
| `apps/admin/src/app/(dashboard)/page.tsx` | UPDATE | Add charts, remove refresh button |

**Add:**
- Chart.js or Recharts visualizations
- Status breakdown (pie/donut)
- Financial metrics: avg buy/sell, margin, costs
- Recent activity feed

### 3.2 Sidebar Navigation

| File | Action | Why |
|------|--------|-----|
| `apps/admin/src/components/AdminSidebar.tsx` | CREATE | Admin navigation |

**Menu Structure:**
```
- Dashboard
- Manajemen Sapi
- Penjualan
- Pelanggan
- Master Data
- Settings
```

---

## Phase 4: Admin - Cattle Management

### 4.1 Unified Cattle Page

| File | Action | Why |
|------|--------|-----|
| `apps/admin/src/app/(dashboard)/cattle/page.tsx` | CREATE | Unified cattle management |
| `apps/admin/src/app/(dashboard)/cattle/new/page.tsx` | CREATE | Add new cattle form |
| `apps/admin/src/app/(dashboard)/cattle/[id]/page.tsx` | CREATE | Edit cattle page |

**Table Columns:**
- Thumbnail (40x40)
- Kode
- Nama
- Jenis
- Status
- Harga Beli
- Harga Jual
- Margin (calculated)
- Actions

**Tabs per Cattle:**
- Riwayat Timbang (add/edit/delete)
- Riwayat Kesehatan (add/edit/delete)
- Pakan (add/edit/delete)
- Dokumentasi (upload photos/videos)

### 4.2 Delete Old Admin Pages

| File | Action | Why |
|------|--------|-----|
| `src/app/admin/weight/page.tsx` | DELETE | Merged into cattle |
| `src/app/admin/health/page.tsx` | DELETE | Merged into cattle |
| `src/app/admin/feed/page.tsx` | DELETE | Merged into cattle |
| `src/app/admin/media/page.tsx` | DELETE | Merged into cattle |

---

## Phase 5: Admin - Sales & Customers

### 5.1 Sales Page

| File | Action | Why |
|------|--------|-----|
| `apps/admin/src/app/(dashboard)/sales/page.tsx` | CREATE | Sales management |

**Features:**
- Customer dropdown
- Multiple buyers per cattle
- Individual pricing per buyer
- Margin calculation
- Status tracking

### 5.2 Customers Page

| File | Action | Why |
|------|--------|-----|
| `apps/admin/src/app/(dashboard)/customers/page.tsx` | CREATE | Customer management |

**Features:**
- Add/Edit/Delete customers
- View purchase history
- Purchase percentage tracking

---

## Phase 6: Admin - Master Data

### 6.1 Master Data Page

| File | Action | Why |
|------|--------|-----|
| `apps/admin/src/app/(dashboard)/master-data/page.tsx` | CREATE | Master data management |

**Categories:**
- Jenis Sapi: Limousin, Simental, Brahman, PO, dll.
- Status Sapi: AVAILABLE, SOLD, BOOKED, ARCHIVED
- Jenis Pakan: Rumput Gajah, Konsentrat, Vitamin, Mineral, Air
- Testimonials: Curated customer testimonials

---

## Phase 7: Public - Testimonials & Documentation

### 7.1 Testimonials Section

| File | Action | Why |
|------|--------|-----|
| `apps/web/src/components/cattle/TestimonialSection.tsx` | CREATE | From Master Data |
| `apps/web/src/components/home/TestimonialsSection.tsx` | CREATE | Landing page testimonials |

### 7.2 Documentation Design

| File | Action | Why |
|------|--------|-----|
| `apps/web/src/components/cattle/MediaTab.tsx` | UPDATE | Bento grid for photos, playable videos |
| `apps/web/src/components/media/VideoPlayer.tsx` | CREATE | 16:9 video player |

---

## Phase 8: QR Code Card

### 8.1 Clean QR Design

| File | Action | Why |
|------|--------|-----|
| `apps/web/src/components/cattle/QRCodeCard.tsx` | UPDATE | Remove unnecessary text, add compare button |

---

## Deployment Configuration

### Vercel / Hosting Setup

| Domain | App | Route |
|--------|-----|-------|
| `samadyafarm.id` | `apps/web` | All public pages |
| `admin.samadyafarm.id` | `apps/admin` | All admin pages |
| `api.samadyafarm.id` | `apps/web` + `apps/admin` | Shared API |

### Environment Variables

```env
# Shared
DATABASE_URL=postgresql://...

# Web App
NEXT_PUBLIC_API_URL=https://api.samadyafarm.id

# Admin App
NEXT_PUBLIC_API_URL=https://api.samadyafarm.id
ADMIN_SECRET=...
```

---

## Files to Change Summary

### Create (New Structure)
| Path | Why |
|------|-----|
| `apps/web/` | Public website |
| `apps/admin/` | Admin website |
| `packages/shared/` | Shared code |
| `packages/api/` | API routes |
| `turbo.json` | Build orchestration |

### Delete (Old Structure)
| Path | Why |
|------|-----|
| `src/app/admin/` | Moved to apps/admin |
| `src/app/(public)/` | Moved to apps/web |
| `src/components/admin/` | Split appropriately |
| `src/components/catalog/` | Public only |
| `src/components/home/` | Public only |

---

## 📚 Complete Setup Guide

### Prerequisites

1. **Node.js 18+** installed
2. **pnpm** installed (`npm install -g pnpm`)
3. **Git** configured
4. **PostgreSQL database** (Neon, Supabase, or local)

---

### Step 1: Initial Setup (Current Repo → Monorepo)

```bash
# 1. Navigate to current project
cd d:\Sapi

# 2. Backup current files (optional but recommended)
git add -A
git commit -m "backup before monorepo split"

# 3. Create new folder structure
mkdir -p apps/web/src
mkdir -p apps/admin/src
mkdir -p packages/shared
mkdir -p packages/api
```

---

### Step 2: Root Configuration

**File: `package.json` (root)**

```json
{
  "name": "samadyafarm",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev:web": "pnpm --filter @samadya/web dev",
    "dev:admin": "pnpm --filter @samadya/admin dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "db:generate": "pnpm --filter @samadya/prisma prisma generate",
    "db:migrate": "pnpm --filter @samadya/prisma prisma migrate dev",
    "db:push": "pnpm --filter @samadya/prisma prisma db push"
  },
  "devDependencies": {
    "turbo": "^1.13.0",
    "typescript": "^5.4.0"
  }
}
```

**File: `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {}
  }
}
```

---

### Step 3: Prisma Package Setup

**File: `packages/prisma/package.json`**

```json
{
  "name": "@samadya/prisma",
  "version": "1.0.0",
  "main": "./generated/index.js",
  "types": "./generated/index.d.ts",
  "scripts": {
    "prisma": "prisma",
    "generate": "prisma generate",
    "migrate": "prisma migrate dev",
    "push": "prisma db push"
  },
  "dependencies": {
    "@prisma/client": "^5.14.0"
  },
  "devDependencies": {
    "prisma": "^5.14.0"
  }
}
```

**File: `packages/prisma/schema.prisma`** (move from root)

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "./generated"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ... all models ...
```

---

### Step 4: Shared Package Setup

**File: `packages/shared/package.json`**

```json
{
  "name": "@samadya/shared",
  "version": "1.0.0",
  "main": "./index.ts",
  "types": "./index.ts",
  "dependencies": {
    "@samadya/prisma": "workspace:*",
    "lucide-react": "^0.378.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0"
  }
}
```

**File: `packages/shared/tsconfig.json`**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

### Step 5: API Package Setup

**File: `packages/api/package.json`**

```json
{
  "name": "@samadya/api",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev"
  },
  "dependencies": {
    "@samadya/prisma": "workspace:*",
    "@samadya/shared": "workspace:*",
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  }
}
```

**Structure: `packages/api/src/app/api/`**

```
packages/api/src/app/api/
├── admin/
│   ├── auth/
│   │   ├── login/route.ts
│   │   └── logout/route.ts
│   ├── cattle/
│   │   ├── route.ts
│   │   └── [id]/
│   │       ├── route.ts
│   │       ├── weights/route.ts
│   │       ├── health/route.ts
│   │       ├── feed/route.ts
│   │       └── media/route.ts
│   ├── customers/route.ts
│   ├── sales/route.ts
│   ├── testimonials/route.ts
│   └── master-data/route.ts
├── cattle/
│   ├── route.ts
│   └── [code]/route.ts
├── testimonials/route.ts
└── upload/route.ts
```

---

### Step 6: Web App (Public Website)

**File: `apps/web/package.json`**

```json
{
  "name": "@samadya/web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@samadya/shared": "workspace:*",
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.12.0",
    "@types/react": "^18.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3"
  }
}
```

**File: `apps/web/next.config.js`**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@samadya/shared', '@samadya/prisma'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.iherb.com' },
      { protocol: 'https', hostname: 'drive.google.com' }
    ]
  }
}

module.exports = nextConfig
```

**File: `apps/web/.env.local`**

```env
# API URL (pointing to shared API)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### Step 7: Admin App

**File: `apps/admin/package.json`**

```json
{
  "name": "@samadya/admin",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@samadya/shared": "workspace:*",
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.12.0",
    "@types/react": "^18.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3"
  }
}
```

**File: `apps/admin/next.config.js`**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@samadya/shared', '@samadya/prisma'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.iherb.com' },
      { protocol: 'https', hostname: 'drive.google.com' }
    ]
  }
}

module.exports = nextConfig
```

**File: `apps/admin/.env.local`**

```env
# API URL (pointing to shared API)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Admin Auth
ADMIN_SECRET=your-admin-secret-key
```

---

### Step 8: Database Setup

```bash
# 1. Copy .env to prisma package
cp .env packages/prisma/.env

# 2. Generate Prisma client
cd packages/prisma
npx prisma generate

# 3. Run initial migration
npx prisma migrate dev --name init

# 4. Seed initial data (optional)
npx prisma db seed
```

---

### Step 9: Running Development

```bash
# Install all dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Run migrations (first time only)
pnpm db:migrate

# Run both apps in development
pnpm dev:web    # Public website: http://localhost:3000
pnpm dev:admin  # Admin website: http://localhost:3001

# OR run both at once with turbo
turbo dev
```

---

### Step 10: Deploy to Vercel

#### 1. Create Vercel Project

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy Web App
cd apps/web
vercel --prod

# Deploy Admin App
cd apps/admin
vercel --prod
```

#### 2. Configure Domains

| App | Root Directory | Production Domain |
|-----|----------------|-------------------|
| Web | `apps/web` | `samadyafarm.id` |
| Admin | `apps/admin` | `admin.samadyafarm.id` |

#### 3. Environment Variables (Vercel Dashboard)

**Web App:**
```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_API_URL=https://api.samadyafarm.id
NEXT_PUBLIC_APP_URL=https://samadyafarm.id
```

**Admin App:**
```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_API_URL=https://api.samadyafarm.id
ADMIN_SECRET=...
```

---

### Step 11: Local Development with Custom Domains

**For testing subdomain locally, edit `C:\Windows\System32\drivers\etc\hosts`:**

```hosts
127.0.0.1 samadyafarm.id
127.0.0.1 admin.samadyafarm.id
127.0.0.1 api.samadyafarm.id
```

Then run apps on different ports:
```bash
# Terminal 1 - API
cd packages/api && pnpm dev

# Terminal 2 - Web
cd apps/web && pnpm dev

# Terminal 3 - Admin
cd apps/admin && pnpm dev
```

---

### Step 12: Common Commands Reference

```bash
# Install dependencies
pnpm install

# Add new dependency to specific app
pnpm --filter @samadya/web add recharts
pnpm --filter @samadya/admin add recharts

# Update Prisma schema
# Edit packages/prisma/schema.prisma
pnpm db:generate
pnpm db:push  # For development
pnpm db:migrate  # For production

# Build for production
turbo build

# Type check all apps
pnpm tsc --noEmit

# Lint all apps
turbo lint

# Clean build cache
turbo clean
```

---

### Troubleshooting

#### "Cannot find module '@samadya/prisma'"
```bash
pnpm db:generate
```

#### "Workspace not found"
```bash
pnpm install
```

#### "Prisma client not generated"
```bash
cd packages/prisma
npx prisma generate
```

#### Port already in use
```bash
# Kill process on port
npx kill-port 3000
npx kill-port 3001
```

---

## Validation

```bash
# Full setup validation
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm build
pnpm tsc --noEmit
```

---

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Complex migration to monorepo | High | Do incremental, test each phase |
| API URL changes | High | Update all fetch calls to use env var |
| Shared component conflicts | Medium | Clear ownership boundaries |
| Deployment complexity | Medium | Use Vercel monorepo support |

---

## Acceptance Criteria

- [ ] Monorepo structure with apps/web and apps/admin
- [ ] Shared Prisma schema and API routes
- [ ] Public website at samadyafarm.id
- [ ] Admin website at admin.samadyafarm.id
- [ ] Hero section 80vh with Journey 20vh
- [ ] Dashboard has charts and financial metrics
- [ ] Cattle management unified with tabs
- [ ] Sales page with customer dropdown
- [ ] Customer page with purchase percentages
- [ ] Master data for jenis sapi, status, jenis pakan, testimonials
- [ ] Pantau Perkembangan containers consistent sizing
- [ ] Landing page fonts increased
- [ ] Testimonials replace comments
- [ ] Documentation photos in bento grid
- [ ] Documentation videos playable (16:9)
- [ ] QR code card cleaned up
