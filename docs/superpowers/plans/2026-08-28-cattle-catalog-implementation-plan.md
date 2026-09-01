# Cattle Catalog Web Application - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Full-stack cattle catalog web application with public catalog, cattle detail pages with weight tracking/health/feed documentation, and admin dashboard.

**Architecture:** Next.js 14 App Router with PostgreSQL/Prisma backend. Public pages use ISR for performance, admin uses client-side rendering. JWT authentication for admin routes.

**Tech Stack:** Next.js 14, TypeScript (strict), Tailwind CSS, shadcn/ui, Prisma, PostgreSQL, Recharts, Zod, QRCode.react

---

## Global Constraints

- **Node.js:** v18+
- **Package Manager:** npm (or bun)
- **Database:** PostgreSQL
- **TypeScript:** strict mode enabled
- **No `any` type** unless absolutely necessary
- **UI Framework:** shadcn/ui components
- **Image Formats:** jpg, jpeg, png, webp (max 10MB)
- **Video Formats:** mp4, webm (max 100MB)
- **Status Values:** AVAILABLE, SOLD, RESERVED, ARCHIVED
- **Health Status:** SEHAT, DALAM_PERAWATAN, OBSERVASI, SAKIT, SEMBUH

---

## Project Structure

```
d:\Sapi\
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── services/
│   ├── types/
│   └── hooks/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   └── uploads/
├── docs/
└── package.json
```

---

## Phase 1: Foundation (Setup + Public Catalog)

### Task 1.1: Initialize Next.js Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`

**Dependencies:**
```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@prisma/client": "^5.15.0",
    "recharts": "^2.12.0",
    "qrcode.react": "^3.1.0",
    "zod": "^3.23.0",
    "date-fns": "^3.6.0",
    "lucide-react": "^0.395.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3"
  }
}
```

**Steps:**
- [ ] **Step 1: Create package.json with all dependencies**

```json
{
  "name": "cattle-catalog",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@prisma/client": "^5.15.0",
    "recharts": "^2.12.0",
    "qrcode.react": "^3.1.0",
    "zod": "^3.23.0",
    "date-fns": "^3.6.0",
    "lucide-react": "^0.395.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "prisma": "^5.15.0",
    "typescript": "^5.4.0",
    "@types/node": "^20.12.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/bcryptjs": "^2.4.6",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "tsx": "^4.10.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create next.config.js**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
```

- [ ] **Step 4: Create tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        accent: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 5: Create postcss.config.js**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 6: Create .env.example**

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/cattle_catalog"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="24h"
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=10485760
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

- [ ] **Step 7: Create .gitignore**

```
# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# prisma
/prisma/*.db
/prisma/*.db-journal
```

- [ ] **Step 8: Install dependencies**

Run: `npm install`

---

### Task 1.2: Setup Prisma and Database Schema

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Modify: `src/lib/db/prisma.ts`

**Steps:**
- [ ] **Step 1: Create prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Cattle {
  id           String   @id @default(cuid())
  code         String   @unique
  name         String
  breed        String
  status       Status   @default(AVAILABLE)
  birthDate    DateTime @map("birth_date")
  height       Float?
  price        Decimal  @db.Decimal(15, 2)
  targetWeight Float?   @map("target_weight")
  description  String?   @db.Text
  mainImage   String?   @map("main_image")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  weights       CattleWeight[]
  healthRecords CattleHealthRecord[]
  feedRecords   CattleFeedRecord[]
  media         CattleMedia[]

  @@index([status])
  @@index([breed])
}

enum Status {
  AVAILABLE
  SOLD
  RESERVED
  ARCHIVED
}

model CattleWeight {
  id              String   @id @default(cuid())
  cattleId        String   @map("cattle_id")
  cattle          Cattle   @relation(fields: [cattleId], references: [id], onDelete: Cascade)
  weight          Float
  measurementDate DateTime @map("measurement_date")
  notes           String?  @db.Text
  createdAt       DateTime @default(now()) @map("created_at")

  media CattleWeightMedia[]

  @@index([cattleId])
  @@index([measurementDate])
}

model CattleWeightMedia {
  id        String       @id @default(cuid())
  weightId  String       @map("weight_id")
  weight    CattleWeight @relation(fields: [weightId], references: [id], onDelete: Cascade)
  fileUrl   String       @map("file_url")
  fileType  String       @map("file_type")
  createdAt DateTime     @default(now()) @map("created_at")
}

model CattleHealthRecord {
  id         String       @id @default(cuid())
  cattleId   String       @map("cattle_id")
  cattle     Cattle       @relation(fields: [cattleId], references: [id], onDelete: Cascade)
  recordDate DateTime     @map("record_date")
  healthType String       @map("health_type")
  status     HealthStatus @default(SEHAT)
  notes      String?      @db.Text
  createdAt  DateTime     @default(now()) @map("created_at")

  media CattleHealthMedia[]

  @@index([cattleId])
}

enum HealthStatus {
  SEHAT
  DALAM_PERAWATAN
  OBSERVASI
  SAKIT
  SEMBUH
}

model CattleHealthMedia {
  id             String             @id @default(cuid())
  healthRecordId String             @map("health_record_id")
  healthRecord   CattleHealthRecord @relation(fields: [healthRecordId], references: [id], onDelete: Cascade)
  fileUrl        String             @map("file_url")
  fileType       String             @map("file_type")
  createdAt      DateTime           @default(now()) @map("created_at")
}

model CattleFeedRecord {
  id         String   @id @default(cuid())
  cattleId   String   @map("cattle_id")
  cattle     Cattle   @relation(fields: [cattleId], references: [id], onDelete: Cascade)
  recordDate DateTime @map("record_date")
  feedType   String   @map("feed_type")
  amount     String
  frequency  String
  notes      String?  @db.Text
  createdAt DateTime  @default(now()) @map("created_at")

  @@index([cattleId])
}

model CattleMedia {
  id          String        @id @default(cuid())
  cattleId    String        @map("cattle_id")
  cattle      Cattle        @relation(fields: [cattleId], references: [id], onDelete: Cascade)
  category    MediaCategory @default(GENERAL)
  fileUrl     String        @map("file_url")
  fileType    String       @map("file_type")
  title       String?
  description String?
  createdAt   DateTime      @default(now()) @map("created_at")

  @@index([cattleId])
}

enum MediaCategory {
  GENERAL
  WEIGHT
  HEALTH
  OTHER
}

model Admin {
  id        String    @id @default(cuid())
  email     String    @unique
  password  String
  name      String
  role      AdminRole @default(STAFF)
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
}

enum AdminRole {
  ADMIN
  STAFF
}
```

- [ ] **Step 2: Create src/lib/db/prisma.ts**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 3: Create prisma/seed.ts**

```typescript
import { PrismaClient, Status, HealthStatus, MediaCategory } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.admin.upsert({
    where: { email: 'admin@sapikatalog.com' },
    update: {},
    create: {
      email: 'admin@sapikatalog.com',
      password: hashedPassword,
      name: 'Administrator',
      role: 'ADMIN',
    },
  })
  console.log('Admin created: admin@sapikatalog.com / admin123')

  // Seed cattle data
  const cattleData = [
    {
      code: 'NF-26001',
      name: 'Brahman Alpha',
      breed: 'Limousin',
      status: Status.AVAILABLE,
      birthDate: new Date('2025-08-10'),
      height: 145,
      price: 45000000,
      targetWeight: 650,
      description: 'Sapi Limousin dengan postur ideal, cocok untuk penggemukan.',
      mainImage: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800',
    },
    {
      code: 'NF-26002',
      name: 'Simental Bravo',
      breed: 'Simental',
      status: Status.AVAILABLE,
      birthDate: new Date('2025-06-15'),
      height: 150,
      price: 42000000,
      targetWeight: 700,
      description: 'Sapi Simental dengan pertumbuhan cepat dan daging berkualitas.',
      mainImage: 'https://images.unsplash.com/photo-1527150122806-f682d2fd8a12?w=800',
    },
    {
      code: 'NF-26003',
      name: 'Angus Charlie',
      breed: 'Angus',
      status: Status.SOLD,
      birthDate: new Date('2025-04-20'),
      height: 140,
      price: 55000000,
      targetWeight: 600,
      description: 'Sapi Angus premium dengan marble score tinggi.',
      mainImage: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800',
    },
    {
      code: 'NF-26004',
      name: 'Brahman Beta',
      breed: 'Brahman',
      status: Status.AVAILABLE,
      birthDate: new Date('2025-07-01'),
      height: 148,
      price: 48000000,
      targetWeight: 680,
      description: 'Sapi Brahman dengan adaptasi baik terhadap iklim tropis.',
      mainImage: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800',
    },
    {
      code: 'NF-26005',
      name: 'Limousin Delta',
      breed: 'Limousin',
      status: Status.RESERVED,
      birthDate: new Date('2025-05-10'),
      height: 142,
      price: 52000000,
      targetWeight: 620,
      description: 'Sapi Limousin dengan konformasi otot yang sangat baik.',
      mainImage: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=800',
    },
    {
      code: 'NF-26006',
      name: 'Simental Echo',
      breed: 'Simental',
      status: Status.AVAILABLE,
      birthDate: new Date('2025-09-05'),
      height: 155,
      price: 38000000,
      targetWeight: 720,
      description: 'Sapi Simental muda dengan potensi pertumbuhan besar.',
      mainImage: 'https://images.unsplash.com/photo-1605897472359-85e4b92c5c98?w=800',
    },
    {
      code: 'NF-26007',
      name: 'Angus Foxtrot',
      breed: 'Angus',
      status: Status.SOLD,
      birthDate: new Date('2025-03-15'),
      height: 138,
      price: 60000000,
      targetWeight: 580,
      description: 'Sapi Angus Black dengan genetik unggul.',
      mainImage: 'https://images.unsplash.com/photo-1569288063643-5d29ad64df09?w=800',
    },
    {
      code: 'NF-26008',
      name: 'Brahman Gamma',
      breed: 'Brahman',
      status: Status.AVAILABLE,
      birthDate: new Date('2025-08-25'),
      height: 152,
      price: 44000000,
      targetWeight: 690,
      description: 'Sapi Brahman dengan temperamen tenang dan mudah ditangani.',
      mainImage: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800',
    },
    {
      code: 'NF-26009',
      name: 'Limousin Hotel',
      breed: 'Limousin',
      status: Status.AVAILABLE,
      birthDate: new Date('2025-07-20'),
      height: 144,
      price: 51000000,
      targetWeight: 640,
      description: 'Sapi Limousin dengan frame besar dan pertumbuhan efisien.',
      mainImage: 'https://images.unsplash.com/photo-1606914501449-5a96b6ce24ca?w=800',
    },
    {
      code: 'NF-26010',
      name: 'Simental India',
      breed: 'Simental',
      status: Status.ARCHIVED,
      birthDate: new Date('2025-02-01'),
      height: 160,
      price: 65000000,
      targetWeight: 750,
      description: 'Sapi Simental champion dengan berbagai prestasi.',
      mainImage: 'https://images.unsplash.com/photo-1587764379873-97837921fd44?w=800',
    },
  ]

  for (const cattle of cattleData) {
    const created = await prisma.cattle.create({
      data: cattle,
    })

    // Add weight records
    const weights = [
      { weight: 380, days: 60 },
      { weight: 420, days: 45 },
      { weight: 450, days: 30 },
      { weight: 485, days: 20 },
      { weight: cattle.status === Status.AVAILABLE ? 485 + Math.floor(Math.random() * 40) : 485, days: 10 },
    ]

    for (let i = 0; i < weights.length; i++) {
      const date = new Date()
      date.setDate(date.getDate() - weights[i].days)
      
      await prisma.cattleWeight.create({
        data: {
          cattleId: created.id,
          weight: weights[i].weight,
          measurementDate: date,
          notes: i === 0 ? 'Pengukuran pertama saat masuk' : `Penimbangan rutin bulan ${i + 1}`,
        },
      })
    }

    // Add health records
    const healthRecords = [
      {
        recordDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        healthType: 'PEMERIKSAAN_RUTIN',
        status: HealthStatus.SEHAT,
        notes: 'Kondisi umum baik, nafsu makan normal.',
      },
      {
        recordDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        healthType: 'VAKSINASI',
        status: HealthStatus.SEHAT,
        notes: 'Vaksinasi lengkap telah dilakukan.',
      },
    ]

    for (const health of healthRecords) {
      await prisma.cattleHealthRecord.create({
        data: {
          cattleId: created.id,
          ...health,
        },
      })
    }

    // Add feed records
    const feedRecords = [
      {
        recordDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        feedType: JSON.stringify(['Rumput Fermentasi', 'Konsentrat', 'Mineral']),
        amount: '10 Kg / Hari',
        frequency: '2x Sehari',
        notes: 'Pakan standar penggemukan.',
      },
      {
        recordDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        feedType: JSON.stringify(['Rumput Segar', 'Konsentrat Premium']),
        amount: '12 Kg / Hari',
        frequency: '3x Sehari',
        notes: 'Peningkatan porsi untuk akselerasi pertumbuhan.',
      },
    ]

    for (const feed of feedRecords) {
      await prisma.cattleFeedRecord.create({
        data: {
          cattleId: created.id,
          ...feed,
        },
      })
    }

    // Add media
    const mediaItems = [
      { category: MediaCategory.GENERAL, fileType: 'IMAGE', title: 'Foto Utama' },
      { category: MediaCategory.GENERAL, fileType: 'IMAGE', title: 'Tampak Samping' },
      { category: MediaCategory.GENERAL, fileType: 'IMAGE', title: 'Tampak Belakang' },
    ]

    for (const media of mediaItems) {
      await prisma.cattleMedia.create({
        data: {
          cattleId: created.id,
          fileUrl: cattle.mainImage || '',
          ...media,
        },
      })
    }

    console.log(`Created cattle: ${cattle.code} - ${cattle.name}`)
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

- [ ] **Step 4: Initialize Prisma**

Run: `npx prisma generate`
Run: `npx prisma db push`

- [ ] **Step 5: Seed database**

Run: `npx tsx prisma/seed.ts`

---

### Task 1.3: Create Core Utilities and Types

**Files:**
- Create: `src/lib/utils/cn.ts`
- Create: `src/lib/utils/formatters.ts`
- Create: `src/lib/utils/calculations.ts`
- Create: `src/types/index.ts`

**Steps:**
- [ ] **Step 1: Create src/lib/utils/cn.ts**

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 2: Create src/lib/utils/formatters.ts**

```typescript
import { format, formatDistanceToNow, id } from 'date-fns'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatWeight(weight: number): string {
  return `${weight.toLocaleString('id-ID')} Kg`
}

export function formatHeight(height: number): string {
  return `${height.toLocaleString('id-ID')} cm`
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd MMMM yyyy', { locale: id })
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd MMM yyyy', { locale: id })
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: id })
}

export function formatCode(code: string): string {
  return code.toUpperCase()
}
```

- [ ] **Step 3: Create src/lib/utils/calculations.ts**

```typescript
import { differenceInDays, addDays } from 'date-fns'

export interface WeightData {
  weight: number
  measurementDate: Date
}

export interface WeightCalculation {
  initialWeight: number
  lastWeight: number
  weightGain: number
  adg: number | null
  daysDiff: number
}

export interface TargetEstimation {
  remainingWeight: number
  estimatedDays: number | null
  estimatedDate: Date | null
  progressPercentage: number
}

export function calculateWeightStats(weights: WeightData[]): WeightCalculation {
  if (weights.length === 0) {
    return {
      initialWeight: 0,
      lastWeight: 0,
      weightGain: 0,
      adg: null,
      daysDiff: 0,
    }
  }

  const sorted = [...weights].sort(
    (a, b) => new Date(a.measurementDate).getTime() - new Date(b.measurementDate).getTime()
  )

  const initialWeight = sorted[0].weight
  const lastWeight = sorted[sorted.length - 1].weight
  const weightGain = lastWeight - initialWeight

  const firstDate = new Date(sorted[0].measurementDate)
  const lastDate = new Date(sorted[sorted.length - 1].measurementDate)
  const daysDiff = differenceInDays(lastDate, firstDate)

  const adg = daysDiff > 0 ? Number((weightGain / daysDiff).toFixed(2)) : null

  return {
    initialWeight,
    lastWeight,
    weightGain,
    adg,
    daysDiff,
  }
}

export function estimateTargetCompletion(
  targetWeight: number,
  lastWeight: number,
  adg: number | null
): TargetEstimation {
  const remainingWeight = targetWeight - lastWeight
  const progressPercentage = Math.min(100, Math.round((lastWeight / targetWeight) * 100))

  if (remainingWeight <= 0) {
    return {
      remainingWeight: 0,
      estimatedDays: 0,
      estimatedDate: new Date(),
      progressPercentage,
    }
  }

  if (!adg || adg <= 0) {
    return {
      remainingWeight,
      estimatedDays: null,
      estimatedDate: null,
      progressPercentage,
    }
  }

  const estimatedDays = Math.ceil(remainingWeight / adg)
  const estimatedDate = addDays(new Date(), estimatedDays)

  return {
    remainingWeight,
    estimatedDays,
    estimatedDate,
    progressPercentage,
  }
}
```

- [ ] **Step 4: Create src/types/index.ts**

```typescript
import { Status, HealthStatus, MediaCategory, AdminRole } from '@prisma/client'

export type { Status, HealthStatus, MediaCategory, AdminRole }

export interface CattleWithRelations {
  id: string
  code: string
  name: string
  breed: string
  status: Status
  birthDate: Date
  height: number | null
  price: number
  targetWeight: number | null
  description: string | null
  mainImage: string | null
  createdAt: Date
  updatedAt: Date
  weights?: CattleWeightWithMedia[]
  healthRecords?: CattleHealthRecordWithMedia[]
  feedRecords?: CattleFeedRecord[]
  media?: CattleMedia[]
}

export interface CattleWeightWithMedia {
  id: string
  cattleId: string
  weight: number
  measurementDate: Date
  notes: string | null
  createdAt: Date
  media?: CattleWeightMedia[]
}

export interface CattleWeightMedia {
  id: string
  weightId: string
  fileUrl: string
  fileType: string
  createdAt: Date
}

export interface CattleHealthRecordWithMedia {
  id: string
  cattleId: string
  recordDate: Date
  healthType: string
  status: HealthStatus
  notes: string | null
  createdAt: Date
  media?: CattleHealthMedia[]
}

export interface CattleHealthMedia {
  id: string
  healthRecordId: string
  fileUrl: string
  fileType: string
  createdAt: Date
}

export interface CattleFeedRecord {
  id: string
  cattleId: string
  recordDate: Date
  feedType: string
  amount: string
  frequency: string
  notes: string | null
  createdAt: Date
}

export interface CattleMedia {
  id: string
  cattleId: string
  category: MediaCategory
  fileUrl: string
  fileType: string
  title: string | null
  description: string | null
  createdAt: Date
}

export interface Admin {
  id: string
  email: string
  name: string
  role: AdminRole
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CattleFilters {
  search?: string
  status?: Status
  breed?: string
  minPrice?: number
  maxPrice?: number
  minWeight?: number
  maxWeight?: number
  page?: number
  limit?: number
}

export interface JWTPayload {
  adminId: string
  email: string
  role: AdminRole
  iat?: number
  exp?: number
}

export const STATUS_LABELS: Record<Status, string> = {
  AVAILABLE: 'TERSEDIA',
  SOLD: 'TERJUAL',
  RESERVED: 'DIBOOKING',
  ARCHIVED: 'DIARCHIVE',
}

export const HEALTH_STATUS_LABELS: Record<HealthStatus, string> = {
  SEHAT: 'Sehat',
  DALAM_PERAWATAN: 'Dalam Perawatan',
  OBSERVASI: 'Observasi',
  SAKIT: 'Sakit',
  SEMBUH: 'Sembuh',
}

export const BREED_OPTIONS = [
  'Limousin',
  'Simental',
  'Brahman',
  'Angus',
  'Lainnya',
]
```

---

### Task 1.4: Create shadcn/ui Components

**Files:**
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/badge.tsx`
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/select.tsx`
- Create: `src/components/ui/dialog.tsx`
- Create: `src/components/ui/tabs.tsx`
- Create: `src/components/ui/accordion.tsx`
- Create: `src/components/ui/skeleton.tsx`
- Create: `src/components/ui/separator.tsx`
- Create: `src/components/ui/table.tsx`
- Create: `src/components/ui/progress.tsx`

**Steps:**
- [ ] **Step 1: Install shadcn/ui**

Run: `npx shadcn-ui@latest init`

**Select these options:**
- Style: Default
- Base color: Slate
- CSS file: src/app/globals.css
- CSS variables: Yes
- Customize default configuration: No

- [ ] **Step 2: Add shadcn components**

Run: `npx shadcn-ui@latest add button card badge input select dialog tabs accordion skeleton separator table progress label`

---

### Task 1.5: Create Shared Components

**Files:**
- Create: `src/components/shared/EmptyState.tsx`
- Create: `src/components/shared/LoadingSkeleton.tsx`
- Create: `src/components/shared/Breadcrumb.tsx`

**Steps:**
- [ ] **Step 1: Create src/components/shared/EmptyState.tsx**

```typescript
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        {icon || <FileQuestion className="h-10 w-10 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create src/components/shared/LoadingSkeleton.tsx**

```typescript
export function CattleCardSkeleton() {
  return (
    <div className="bg-card rounded-lg overflow-hidden border">
      <div className="aspect-[4/3] bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
        <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
        <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
      </div>
    </div>
  )
}

export function CattleDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="aspect-square bg-muted rounded-lg animate-pulse" />
        <div className="space-y-4">
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="h-10 w-3/4 bg-muted rounded animate-pulse" />
          <div className="h-6 w-1/3 bg-muted rounded animate-pulse" />
          <div className="grid grid-cols-2 gap-4 mt-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create src/components/shared/Breadcrumb.tsx**

```typescript
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      <Link href="/" className="hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4" />
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
```

---

### Task 1.6: Create API Routes

**Files:**
- Create: `src/app/api/cattle/route.ts`
- Create: `src/app/api/cattle/[code]/route.ts`
- Create: `src/lib/validations/cattle.ts`

**Steps:**
- [ ] **Step 1: Create src/lib/validations/cattle.ts**

```typescript
import { z } from 'zod'

export const CattleQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(12),
  search: z.string().optional(),
  status: z.enum(['AVAILABLE', 'SOLD', 'RESERVED', 'ARCHIVED']).optional(),
  breed: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minWeight: z.coerce.number().optional(),
  maxWeight: z.coerce.number().optional(),
})

export const CreateCattleSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  breed: z.string().min(1).max(50),
  status: z.enum(['AVAILABLE', 'SOLD', 'RESERVED', 'ARCHIVED']).default('AVAILABLE'),
  birthDate: z.string().transform((s) => new Date(s)),
  height: z.number().optional(),
  price: z.number().min(0),
  targetWeight: z.number().optional(),
  description: z.string().optional(),
  mainImage: z.string().optional(),
})

export const UpdateCattleSchema = CreateCattleSchema.partial()
```

- [ ] **Step 2: Create src/app/api/cattle/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { CattleQuerySchema } from '@/lib/validations/cattle'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = CattleQuerySchema.parse(Object.fromEntries(searchParams))

    const where: Record<string, unknown> = {}

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { breed: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    if (query.status) {
      where.status = query.status
    }

    if (query.breed) {
      where.breed = query.breed
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {}
      if (query.minPrice !== undefined) {
        (where.price as Record<string, number>).gte = query.minPrice
      }
      if (query.maxPrice !== undefined) {
        (where.price as Record<string, number>).lte = query.maxPrice
      }
    }

    // If weight filters are provided, we need to join with weights table
    // For simplicity, we'll handle this in a separate query
    const skip = (query.page - 1) * query.limit

    const [cattle, total] = await Promise.all([
      prisma.cattle.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          weights: {
            orderBy: { measurementDate: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.cattle.count({ where }),
    ])

    // Filter by weight if needed
    let filteredCattle = cattle
    if (query.minWeight !== undefined || query.maxWeight !== undefined) {
      filteredCattle = cattle.filter((c) => {
        const lastWeight = c.weights[0]?.weight || 0
        if (query.minWeight !== undefined && lastWeight < query.minWeight) return false
        if (query.maxWeight !== undefined && lastWeight > query.maxWeight) return false
        return true
      })
    }

    // Remove weights from response (only needed for filtering)
    const items = filteredCattle.map(({ weights, ...c }) => ({
      ...c,
      lastWeight: weights[0]?.weight || null,
    }))

    return NextResponse.json({
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    })
  } catch (error) {
    console.error('Error fetching cattle:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cattle' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 3: Create src/app/api/cattle/[code]/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { calculateWeightStats, estimateTargetCompletion } from '@/lib/utils/calculations'

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const cattle = await prisma.cattle.findUnique({
      where: { code: params.code },
      include: {
        weights: {
          orderBy: { measurementDate: 'asc' },
          include: {
            media: true,
          },
        },
        healthRecords: {
          orderBy: { recordDate: 'desc' },
          include: {
            media: true,
          },
        },
        feedRecords: {
          orderBy: { recordDate: 'desc' },
        },
        media: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!cattle) {
      return NextResponse.json(
        { error: 'Cattle not found' },
        { status: 404 }
      )
    }

    // Calculate weight stats
    const weightData = cattle.weights.map((w) => ({
      weight: w.weight,
      measurementDate: w.measurementDate,
    }))

    const weightStats = calculateWeightStats(weightData)

    // Calculate target estimation
    let targetEstimation = null
    if (cattle.targetWeight && weightStats.lastWeight) {
      targetEstimation = estimateTargetCompletion(
        cattle.targetWeight,
        weightStats.lastWeight,
        weightStats.adg
      )
    }

    // Get last weight
    const lastWeight = cattle.weights.length > 0
      ? cattle.weights[cattle.weights.length - 1].weight
      : null

    return NextResponse.json({
      ...cattle,
      lastWeight,
      weightStats,
      targetEstimation,
    })
  } catch (error) {
    console.error('Error fetching cattle:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cattle' },
      { status: 500 }
    )
  }
}
```

---

### Task 1.7: Create Public Layout and Homepage

**Files:**
- Create: `src/app/(public)/layout.tsx`
- Create: `src/app/(public)/page.tsx`
- Create: `src/components/layout/Navbar.tsx`
- Create: `src/components/layout/Footer.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`

**Steps:**
- [ ] **Step 1: Update src/app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --radius: 0.5rem;
    --background: 0 0% 100%;
    --foreground: 20 14.3% 4.1%;
    --card: 0 0% 100%;
    --card-foreground: 20 14.3% 4.1%;
    --popover: 0 0% 100%;
    --popover-foreground: 20 14.3% 4.1%;
    --primary: 142 76% 24%;
    --primary-foreground: 355.7 100% 97.3%;
    --secondary: 20 5.9% 90%;
    --secondary-foreground: 20 14.3% 4.1%;
    --muted: 20 5.9% 90%;
    --muted-foreground: 20 10% 40%;
    --accent: 43 96% 47%;
    --accent-foreground: 20 14.3% 4.1%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 60 9.1% 97.8%;
    --border: 20 5.9% 90%;
    --input: 20 5.9% 90%;
    --ring: 142 76% 24%;
  }

  .dark {
    --background: 20 14.3% 4.1%;
    --foreground: 60 9.1% 97.8%;
    --card: 20 14.3% 4.1%;
    --card-foreground: 60 9.1% 97.8%;
    --popover: 20 14.3% 4.1%;
    --popover-foreground: 60 9.1% 97.8%;
    --primary: 142 76% 40%;
    --primary-foreground: 355.7 100% 97.3%;
    --secondary: 20 14.3% 15%;
    --secondary-foreground: 60 9.1% 97.8%;
    --muted: 20 14.3% 15%;
    --muted-foreground: 20 5.9% 60%;
    --accent: 43 96% 47%;
    --accent-foreground: 20 14.3% 4.1%;
    --destructive: 0 62.8% 50.6%;
    --destructive-foreground: 60 9.1% 97.8%;
    --border: 20 14.3% 20%;
    --input: 20 14.3% 20%;
    --ring: 142 76% 40%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

- [ ] **Step 2: Create src/app/layout.tsx**

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Katalog Sapi - Temukan Sapi Berkualitas',
    template: '%s | Katalog Sapi',
  },
  description: 'Katalog sapi pilihan dengan informasi lengkap, transparan, dan riwayat pertumbuhan yang terdokumentasi.',
  keywords: ['katalog sapi', 'sapi berkualitas', 'peternakan', 'limousin', 'simental', 'brahman'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Create src/components/layout/Navbar.tsx**

```typescript
import Link from 'next/link'
import { Beef } from 'lucide-react'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-full bg-primary p-2">
            <Beef className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary">SapiKatalog</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Katalog
          </Link>
          <Link
            href="/admin"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 4: Create src/components/layout/Footer.tsx**

```typescript
export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SapiKatalog. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Katalog Sapi Berkualitas dengan Dokumentasi Lengkap
          </p>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 5: Create src/app/(public)/layout.tsx**

```typescript
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
```

---

### Task 1.8: Create Catalog Components

**Files:**
- Create: `src/components/catalog/HeroSection.tsx`
- Create: `src/components/catalog/StatisticsBar.tsx`
- Create: `src/components/catalog/SearchFilter.tsx`
- Create: `src/components/catalog/CattleGrid.tsx`
- Create: `src/components/catalog/CattleCard.tsx`
- Create: `src/components/catalog/CattleStatusBadge.tsx`

**Steps:**
- [ ] **Step 1: Create src/components/catalog/CattleStatusBadge.tsx**

```typescript
import { cn } from '@/lib/utils/cn'
import { Status, STATUS_LABELS } from '@/types'

interface StatusBadgeProps {
  status: Status
  className?: string
}

const statusStyles: Record<Status, string> = {
  AVAILABLE: 'bg-green-100 text-green-800 border-green-200',
  SOLD: 'bg-red-100 text-red-800 border-red-200',
  RESERVED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ARCHIVED: 'bg-gray-100 text-gray-800 border-gray-200',
}

const statusDots: Record<Status, string> = {
  AVAILABLE: 'bg-green-500',
  SOLD: 'bg-red-500',
  RESERVED: 'bg-yellow-500',
  ARCHIVED: 'bg-gray-500',
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
        statusStyles[status],
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', statusDots[status])} />
      {STATUS_LABELS[status]}
    </span>
  )
}
```

- [ ] **Step 2: Create src/components/catalog/CattleCard.tsx**

```typescript
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { StatusBadge } from './CattleStatusBadge'
import { formatCurrency, formatWeight } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'
import { Status } from '@/types'

interface CattleCardProps {
  id: string
  code: string
  name: string
  breed: string
  status: Status
  price: number
  lastWeight: number | null
  mainImage: string | null
}

export function CattleCard({
  code,
  name,
  breed,
  status,
  price,
  lastWeight,
  mainImage,
}: CattleCardProps) {
  return (
    <Link href={`/sapi/${code}`}>
      <Card className={cn(
        'group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1',
        status === 'SOLD' && 'opacity-90'
      )}>
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-muted-foreground">No Image</span>
            </div>
          )}
          <div className="absolute left-3 top-3">
            <StatusBadge status={status} />
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Nama:</p>
            <h3 className="font-semibold text-lg leading-tight">{name}</h3>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Kode</p>
              <p className="font-medium">{code}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Jenis</p>
              <p className="font-medium">{breed}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Bobot</p>
              <p className="font-medium">
                {lastWeight ? formatWeight(lastWeight) : '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Harga</p>
              <p className="font-medium text-primary">{formatCurrency(price)}</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
            Lihat Detail
            <ArrowRight className="h-4 w-4" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}
```

- [ ] **Step 3: Create src/components/catalog/HeroSection.tsx**

```typescript
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative h-[500px] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=1920&q=80')`,
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />

      {/* Content */}
      <div className="relative container flex h-full items-center">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Katalog Sapi Pilihan
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            Temukan sapi berkualitas dengan informasi lengkap, transparan, dan riwayat
            pertumbuhan yang terdokumentasi.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="#catalog">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Lihat Katalog
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#catalog">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/20"
              >
                Sapi Tersedia
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Create src/components/catalog/StatisticsBar.tsx**

```typescript
'use client'

import { useEffect, useState } from 'react'

interface Statistics {
  total: number
  available: number
  sold: number
}

export function StatisticsBar() {
  const [stats, setStats] = useState<Statistics>({ total: 0, available: 0, sold: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/cattle')
        const data = await res.json()
        
        const items = data.items || []
        setStats({
          total: data.total || 0,
          available: items.filter((c: { status: string }) => c.status === 'AVAILABLE').length,
          sold: items.filter((c: { status: string }) => c.status === 'SOLD').length,
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statItems = [
    { label: 'Total Sapi', value: stats.total, color: 'text-primary' },
    { label: 'Tersedia', value: stats.available, color: 'text-green-600' },
    { label: 'Terjual', value: stats.sold, color: 'text-red-600' },
  ]

  return (
    <section className="bg-muted/50 py-8">
      <div className="container">
        <div className="grid grid-cols-3 gap-4 md:gap-8">
          {statItems.map((stat) => (
            <div key={stat.label} className="text-center">
              {loading ? (
                <div className="h-12 w-20 mx-auto bg-muted animate-pulse rounded" />
              ) : (
                <p className={`text-3xl md:text-4xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Create src/components/catalog/SearchFilter.tsx**

```typescript
'use client'

import { useState, useCallback } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Status, BREED_OPTIONS } from '@/types'
import { cn } from '@/lib/utils/cn'

interface SearchFilterProps {
  onSearch: (filters: Filters) => void
  initialFilters?: Filters
}

export interface Filters {
  search: string
  status: Status | 'ALL'
  breed: string
}

export function SearchFilter({ onSearch, initialFilters }: SearchFilterProps) {
  const [filters, setFilters] = useState<Filters>({
    search: initialFilters?.search || '',
    status: initialFilters?.status || 'ALL',
    breed: initialFilters?.breed || 'ALL',
  })
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = useCallback(
    (newFilters: Filters) => {
      setFilters(newFilters)
      onSearch(newFilters)
    },
    [onSearch]
  )

  const handleReset = () => {
    const resetFilters = { search: '', status: 'ALL' as const, breed: 'ALL' }
    setFilters(resetFilters)
    onSearch(resetFilters)
  }

  const hasActiveFilters = filters.status !== 'ALL' || filters.breed !== 'ALL'

  return (
    <div className="bg-card rounded-lg border p-4 md:p-6 space-y-4">
      {/* Main Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau kode sapi..."
            value={filters.search}
            onChange={(e) =>
              handleSearch({ ...filters, search: e.target.value })
            }
            className="pl-10"
          />
          {filters.search && (
            <button
              onClick={() => handleSearch({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(showFilters && 'bg-muted')}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
          {hasActiveFilters && (
            <span className="ml-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              !
            </span>
          )}
        </Button>
      </div>

      {/* Extended Filters */}
      <div
        className={cn(
          'grid gap-4 md:grid-cols-4 transition-all',
          showFilters ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 md:hidden'
        )}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              handleSearch({ ...filters, status: value as Status | 'ALL' })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="AVAILABLE">Tersedia</SelectItem>
              <SelectItem value="SOLD">Terjual</SelectItem>
              <SelectItem value="RESERVED">Dibooking</SelectItem>
              <SelectItem value="ARCHIVED">Diarchive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Jenis Sapi</label>
          <Select
            value={filters.breed}
            onValueChange={(value) =>
              handleSearch({ ...filters, breed: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Semua Jenis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Jenis</SelectItem>
              {BREED_OPTIONS.map((breed) => (
                <SelectItem key={breed} value={breed}>
                  {breed}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-end">
            <Button variant="ghost" onClick={handleReset} className="w-full">
              Reset Filter
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create src/components/catalog/CattleGrid.tsx**

```typescript
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { CattleCard } from './CattleCard'
import { SearchFilter, Filters } from './SearchFilter'
import { EmptyState } from '@/components/shared/EmptyState'
import { CattleCardSkeleton } from '@/components/shared/LoadingSkeleton'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { Status, PaginatedResponse, CattleWithRelations } from '@/types'

export function CattleGrid() {
  const searchParams = useSearchParams()
  const [cattle, setCattle] = useState<CattleWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalPages: 1,
    total: 0,
  })
  const [filters, setFilters] = useState<Filters>({
    search: searchParams.get('search') || '',
    status: (searchParams.get('status') as Status) || 'ALL',
    breed: searchParams.get('breed') || 'ALL',
  })

  const fetchCattle = useCallback(async (filterParams: Filters, page: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', pagination.limit.toString())
      if (filterParams.search) params.set('search', filterParams.search)
      if (filterParams.status !== 'ALL') params.set('status', filterParams.status)
      if (filterParams.breed !== 'ALL') params.set('breed', filterParams.breed)

      const res = await fetch(`/api/cattle?${params.toString()}`)
      const data: PaginatedResponse<CattleWithRelations> = await res.json()

      setCattle(data.items)
      setPagination({
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        total: data.total,
      })
    } catch (error) {
      console.error('Failed to fetch cattle:', error)
    } finally {
      setLoading(false)
    }
  }, [pagination.limit])

  useEffect(() => {
    fetchCattle(filters, pagination.page)
  }, [filters, pagination.page, fetchCattle])

  const handleSearch = (newFilters: Filters) => {
    setFilters(newFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section id="catalog" className="py-12">
      <div className="container">
        <SearchFilter onSearch={handleSearch} initialFilters={filters} />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {[...Array(8)].map((_, i) => (
              <CattleCardSkeleton key={i} />
            ))}
          </div>
        ) : cattle.length === 0 ? (
          <EmptyState
            title="Tidak ada sapi ditemukan"
            description="Coba ubah filter atau kata kunci pencarian Anda."
          />
        ) : (
          <>
            <p className="text-sm text-muted-foreground mt-6 mb-4">
              Menampilkan {cattle.length} dari {pagination.total} sapi
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cattle.map((c) => (
                <CattleCard
                  key={c.id}
                  id={c.id}
                  code={c.code}
                  name={c.name}
                  breed={c.breed}
                  status={c.status}
                  price={Number(c.price)}
                  lastWeight={(c as CattleWithRelations & { lastWeight?: number }).lastWeight}
                  mainImage={c.mainImage}
                />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    />
                  </PaginationItem>
                  {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                    const page = i + 1
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={pagination.page === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 7: Create src/app/(public)/page.tsx**

```typescript
import { HeroSection } from '@/components/catalog/HeroSection'
import { StatisticsBar } from '@/components/catalog/StatisticsBar'
import { CattleGrid } from '@/components/catalog/CattleGrid'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatisticsBar />
      <CattleGrid />
    </>
  )
}
```

---

### Task 1.9: Create Cattle Detail Page

**Files:**
- Create: `src/app/(public)/sapi/[code]/page.tsx`
- Create: `src/components/cattle/CattleProfile.tsx`
- Create: `src/components/cattle/CattleStats.tsx`
- Create: `src/components/cattle/CattleGallery.tsx`

**Steps:**
- [ ] **Step 1: Create src/app/(public)/sapi/[code]/page.tsx**

```typescript
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { CattleProfile } from '@/components/cattle/CattleProfile'

interface PageProps {
  params: { code: string }
}

async function getCattle(code: string) {
  const cattle = await prisma.cattle.findUnique({
    where: { code },
    include: {
      weights: {
        orderBy: { measurementDate: 'asc' },
      },
      healthRecords: {
        orderBy: { recordDate: 'desc' },
      },
      feedRecords: {
        orderBy: { recordDate: 'desc' },
      },
      media: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  return cattle
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const cattle = await getCattle(params.code)
  
  if (!cattle) {
    return { title: 'Sapi Tidak Ditemukan' }
  }

  return {
    title: `${cattle.name} - ${cattle.code}`,
    description: cattle.description || `Informasi lengkap sapi ${cattle.name}, ${cattle.breed} dengan bobot terkini dan riwayat pertumbuhan.`,
    openGraph: {
      title: `${cattle.name} - ${cattle.code} | Katalog Sapi`,
      description: cattle.description || `Informasi lengkap sapi ${cattle.name}`,
      images: cattle.mainImage ? [cattle.mainImage] : [],
    },
  }
}

export default async function CattleDetailPage({ params }: PageProps) {
  const cattle = await getCattle(params.code)

  if (!cattle) {
    notFound()
  }

  return <CattleProfile cattle={cattle} />
}
```

- [ ] **Step 2: Create src/components/cattle/CattleProfile.tsx**

```typescript
'use client'

import { Breadcrumb } from '@/components/shared/Breadcrumb'
import { CattleStats } from './CattleStats'
import { CattleGallery } from './CattleGallery'
import { WeightHistory } from '@/components/weight/WeightHistory'
import { WeightChart } from '@/components/weight/WeightChart'
import { HealthTimeline } from '@/components/health/HealthTimeline'
import { FeedHistory } from '@/components/feed/FeedHistory'
import { DocumentationGallery } from '@/components/media/DocumentationGallery'
import { QRCodeCard } from './QRCodeCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { StatusBadge } from '@/components/catalog/CattleStatusBadge'
import { formatCurrency, formatWeight, formatHeight, formatDate } from '@/lib/utils/formatters'
import { calculateWeightStats, estimateTargetCompletion } from '@/lib/utils/calculations'
import { ArrowRight, Phone } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CattleWithRelations } from '@/types'

interface CattleProfileProps {
  cattle: CattleWithRelations
}

export function CattleProfile({ cattle }: CattleProfileProps) {
  const weightData = cattle.weights?.map((w) => ({
    weight: w.weight,
    measurementDate: w.measurementDate,
  })) || []

  const weightStats = calculateWeightStats(weightData)
  const targetEstimation = cattle.targetWeight && weightStats.lastWeight
    ? estimateTargetCompletion(cattle.targetWeight, weightStats.lastWeight, weightStats.adg)
    : null

  const breadcrumbItems = [
    { label: 'Katalog', href: '/' },
    { label: cattle.code },
  ]

  return (
    <div className="container py-8">
      <Breadcrumb items={breadcrumbItems} />

      <div className="mt-6 space-y-8">
        {/* Profile Header */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CattleGallery
            mainImage={cattle.mainImage}
            media={cattle.media}
          />

          <div className="space-y-6">
            <div>
              <StatusBadge status={cattle.status} className="mb-3" />
              <h1 className="text-3xl md:text-4xl font-bold">{cattle.name}</h1>
              <p className="text-xl text-muted-foreground">{cattle.code}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Jenis" value={cattle.breed} />
              <InfoItem label="Tanggal Lahir" value={formatDate(cattle.birthDate)} />
              <InfoItem label="Tinggi Badan" value={cattle.height ? formatHeight(cattle.height) : '-'} />
              <InfoItem label="Bobot Terakhir" value={weightStats.lastWeight ? formatWeight(weightStats.lastWeight) : '-'} />
              <div className="col-span-2">
                <InfoItem label="Harga" value={formatCurrency(Number(cattle.price))} highlight />
              </div>
            </div>

            {cattle.description && (
              <p className="text-muted-foreground">{cattle.description}</p>
            )}

            {cattle.status === 'AVAILABLE' && (
              <Button size="lg" className="w-full md:w-auto">
                <Phone className="mr-2 h-5 w-5" />
                Hubungi Kami
              </Button>
            )}
          </div>
        </section>

        {/* Quick Stats */}
        <CattleStats
          lastWeight={weightStats.lastWeight}
          adg={weightStats.adg}
          targetWeight={cattle.targetWeight}
          progressPercentage={targetEstimation?.progressPercentage || 0}
        />

        {/* Tabs / Accordion for Detail Sections */}
        <div className="block lg:hidden">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="summary">
              <AccordionTrigger>Ringkasan</AccordionTrigger>
              <AccordionContent>
                <SummaryContent weightStats={weightStats} targetEstimation={targetEstimation} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="weights">
              <AccordionTrigger>Riwayat Timbang</AccordionTrigger>
              <AccordionContent>
                <WeightHistory weights={cattle.weights || []} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="health">
              <AccordionTrigger>Kesehatan</AccordionTrigger>
              <AccordionContent>
                <HealthTimeline records={cattle.healthRecords || []} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="feed">
              <AccordionTrigger>Pakan</AccordionTrigger>
              <AccordionContent>
                <FeedHistory records={cattle.feedRecords || []} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="media">
              <AccordionTrigger>Dokumentasi</AccordionTrigger>
              <AccordionContent>
                <DocumentationGallery media={cattle.media || []} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="hidden lg:block">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="summary">Ringkasan</TabsTrigger>
              <TabsTrigger value="weights">Riwayat Timbang</TabsTrigger>
              <TabsTrigger value="health">Kesehatan</TabsTrigger>
              <TabsTrigger value="feed">Pakan</TabsTrigger>
              <TabsTrigger value="media">Dokumentasi</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-6">
              <SummaryContent weightStats={weightStats} targetEstimation={targetEstimation} />
            </TabsContent>
            <TabsContent value="weights" className="mt-6">
              <WeightChart weights={cattle.weights || []} />
              <WeightHistory weights={cattle.weights || []} />
            </TabsContent>
            <TabsContent value="health" className="mt-6">
              <HealthTimeline records={cattle.healthRecords || []} />
            </TabsContent>
            <TabsContent value="feed" className="mt-6">
              <FeedHistory records={cattle.feedRecords || []} />
            </TabsContent>
            <TabsContent value="media" className="mt-6">
              <DocumentationGallery media={cattle.media || []} />
            </TabsContent>
          </Tabs>
        </div>

        {/* QR Code Section */}
        <QRCodeCard code={cattle.code} name={cattle.name} />

        {/* Related Cattle */}
        <RelatedCattleSection breed={cattle.breed} excludeCode={cattle.code} />
      </div>
    </div>
  )
}

function InfoItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`font-medium ${highlight ? 'text-primary text-lg' : ''}`}>{value}</p>
    </div>
  )
}

function SummaryContent({
  weightStats,
  targetEstimation,
}: {
  weightStats: ReturnType<typeof calculateWeightStats>
  targetEstimation: ReturnType<typeof estimateTargetCompletion> | null
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <SummaryCard label="Bobot Awal" value={formatWeight(weightStats.initialWeight)} />
      <SummaryCard label="Bobot Terakhir" value={formatWeight(weightStats.lastWeight)} />
      <SummaryCard label="Kenaikan Bobot" value={formatWeight(weightStats.weightGain)} />
      <SummaryCard label="ADG" value={weightStats.adg ? `${weightStats.adg} Kg/Hari` : '-'} />
      {targetEstimation && (
        <>
          <SummaryCard label="Estimasi Target" value={targetEstimation.estimatedDate?.toLocaleDateString('id-ID') || '-'} />
          <SummaryCard label="Sisa Hari" value={targetEstimation.estimatedDays?.toString() || '-'} />
        </>
      )}
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold mt-1">{value}</p>
    </div>
  )
}

function RelatedCattleSection({ breed, excludeCode }: { breed: string; excludeCode: string }) {
  return (
    <section className="border-t pt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Sapi Lainnya</h2>
        <Link href={`/?breed=${breed}`} className="text-primary hover:underline flex items-center gap-1">
          Lihat Semua <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {/* Related cattle would be fetched client-side or via API */}
      <p className="text-muted-foreground">Sapi sejenis lainnya dapat dilihat di katalog.</p>
    </section>
  )
}
```

- [ ] **Step 3: Create src/components/cattle/CattleStats.tsx**

```typescript
import { Progress } from '@/components/ui/progress'
import { formatWeight } from '@/lib/utils/formatters'

interface CattleStatsProps {
  lastWeight: number
  adg: number | null
  targetWeight: number | null
  progressPercentage: number
}

export function CattleStats({
  lastWeight,
  adg,
  targetWeight,
  progressPercentage,
}: CattleStatsProps) {
  return (
    <section className="bg-muted/50 rounded-lg p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
        <StatItem label="Bobot Terakhir" value={formatWeight(lastWeight)} />
        <StatItem label="ADG" value={adg ? `${adg} Kg/Hari` : '-'} />
        <StatItem label="Target" value={targetWeight ? formatWeight(targetWeight) : '-'} />
        <StatItem label="Progress" value={`${progressPercentage}%`} />
      </div>

      {targetWeight && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{formatWeight(lastWeight)}</span>
            <span>Target: {formatWeight(targetWeight)}</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>
      )}
    </section>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl md:text-3xl font-bold text-primary">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
```

- [ ] **Step 4: Create src/components/cattle/CattleGallery.tsx**

```typescript
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { CattleMedia } from '@/types'

interface CattleGalleryProps {
  mainImage: string | null
  media: CattleMedia[]
}

export function CattleGallery({ mainImage, media }: CattleGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  
  const allImages = [
    mainImage,
    ...media
      .filter((m) => m.fileType === 'IMAGE')
      .map((m) => m.fileUrl),
  ].filter(Boolean) as string[]

  if (allImages.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
        <span className="text-muted-foreground">Tidak ada foto</span>
      </div>
    )
  }

  const openLightbox = (index: number) => setSelectedIndex(index)
  const closeLightbox = () => setSelectedIndex(null)
  
  const goNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % allImages.length)
    }
  }
  
  const goPrev = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + allImages.length) % allImages.length)
    }
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div 
          className="relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-muted"
          onClick={() => openLightbox(0)}
        >
          <Image
            src={allImages[0]}
            alt="Cattle main image"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        {/* Thumbnails */}
        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {allImages.slice(1).map((image, index) => (
              <button
                key={index}
                onClick={() => openLightbox(index + 1)}
                className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 border-transparent hover:border-primary transition-colors"
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
          
          <button
            onClick={goPrev}
            className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <div className="relative h-[80vh] w-[80vw]">
            <Image
              src={allImages[selectedIndex]}
              alt="Full size image"
              fill
              className="object-contain"
              sizes="80vw"
            />
          </div>
          
          <button
            onClick={goNext}
            className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          
          <div className="absolute bottom-4 text-white text-sm">
            {selectedIndex + 1} / {allImages.length}
          </div>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 5: Create src/components/cattle/QRCodeCard.tsx**

```typescript

```

- [ ] **Step 6: Create weight components**

```typescript
// src/components/weight/WeightHistory.tsx
// src/components/weight/WeightChart.tsx
```

- [ ] **Step 7: Create health components**

```typescript
// src/components/health/HealthTimeline.tsx
```

- [ ] **Step 8: Create feed components**

```typescript
// src/components/feed/FeedHistory.tsx
```

- [ ] **Step 9: Create media components**

```typescript
// src/components/media/DocumentationGallery.tsx
```

---

### Task 1.10: Verify Phase 1

- [ ] **Step 1: Run development server**

Run: `npm run dev`

- [ ] **Step 2: Test public catalog page**

Visit: http://localhost:3000

- [ ] **Step 3: Test cattle detail page**

Visit: http://localhost:3000/sapi/NF-26001

- [ ] **Step 4: Verify all acceptance criteria**

Public Catalog:
- [ ] Can view catalog page
- [ ] Search works
- [ ] Filter by status works
- [ ] Filter by breed works
- [ ] Can open cattle detail
- [ ] Responsive on mobile

---

## Phase 2: Detail Page Components

### Task 2.1: Weight History & Chart

**Files:**
- Create: `src/components/weight/WeightHistory.tsx`
- Create: `src/components/weight/WeightChart.tsx`

**Steps:**
- [ ] **Step 1: Create WeightHistory component**
- [ ] **Step 2: Create WeightChart component with Recharts**
- [ ] **Step 3: Test weight sections**

### Task 2.2: Health Timeline

**Files:**
- Create: `src/components/health/HealthTimeline.tsx`

**Steps:**
- [ ] **Step 1: Create HealthTimeline component**
- [ ] **Step 2: Add health status badges**
- [ ] **Step 3: Test health section**

### Task 2.3: Feed History

**Files:**
- Create: `src/components/feed/FeedHistory.tsx`

**Steps:**
- [ ] **Step 1: Create FeedHistory component**
- [ ] **Step 2: Parse feed type JSON**
- [ ] **Step 3: Test feed section**

### Task 2.4: Documentation Gallery

**Files:**
- Create: `src/components/media/DocumentationGallery.tsx`
- Create: `src/components/media/MediaPreview.tsx`

**Steps:**
- [ ] **Step 1: Create DocumentationGallery component**
- [ ] **Step 2: Create MediaPreview modal**
- [ ] **Step 3: Test media gallery**

### Task 2.5: QR Code Component

**Files:**
- Create: `src/components/cattle/QRCodeCard.tsx`

**Steps:**
- [ ] **Step 1: Create QRCodeCard component**
- [ ] **Step 2: Add download functionality**
- [ ] **Step 3: Test QR code display**

---

## Phase 3: Admin Authentication

### Task 3.1: JWT Auth Utilities

**Files:**
- Create: `src/lib/auth/jwt.ts`
- Create: `src/middleware.ts`
- Create: `src/app/api/admin/auth/login/route.ts`
- Create: `src/app/api/admin/auth/logout/route.ts`
- Create: `src/app/api/admin/auth/me/route.ts`

**Steps:**
- [ ] **Step 1: Create JWT utilities**
- [ ] **Step 2: Create auth API routes**
- [ ] **Step 3: Create Next.js middleware**

### Task 3.2: Admin Login Page

**Files:**
- Create: `src/app/admin/login/page.tsx`
- Create: `src/app/(admin)/layout.tsx`

**Steps:**
- [ ] **Step 1: Create login page**
- [ ] **Step 2: Create admin layout**
- [ ] **Step 3: Test authentication**

---

## Phase 4: Admin Dashboard

### Task 4.1: Admin Dashboard Layout

**Files:**
- Create: `src/components/admin/AdminSidebar.tsx`
- Create: `src/components/admin/AdminHeader.tsx`
- Update: `src/app/(admin)/layout.tsx`

**Steps:**
- [ ] **Step 1: Create sidebar navigation**
- [ ] **Step 2: Create header with user info**
- [ ] **Step 3: Test admin layout**

### Task 4.2: Admin Cattle CRUD

**Files:**
- Create: `src/app/(admin)/admin/cattle/page.tsx`
- Create: `src/app/(admin)/admin/cattle/new/page.tsx`
- Create: `src/app/(admin)/admin/cattle/[id]/page.tsx`
- Create: `src/app/api/admin/cattle/route.ts`
- Create: `src/app/api/admin/cattle/[id]/route.ts`

**Steps:**
- [ ] **Step 1: Create cattle list page**
- [ ] **Step 2: Create new/edit cattle form**
- [ ] **Step 3: Create CRUD API routes**
- [ ] **Step 4: Test CRUD operations**

### Task 4.3: Admin Weight Management

**Files:**
- Create: `src/app/(admin)/admin/cattle/[id]/weights/page.tsx`
- Create: `src/app/api/admin/cattle/[id]/weights/route.ts`
- Create: `src/app/api/admin/weights/[id]/route.ts`

**Steps:**
- [ ] **Step 1: Create weight management page**
- [ ] **Step 2: Create weight API routes**
- [ ] **Step 3: Test weight CRUD**

### Task 4.4: Admin Health Management

**Files:**
- Create: `src/app/(admin)/admin/cattle/[id]/health/page.tsx`
- Create: `src/app/api/admin/cattle/[id]/health/route.ts`
- Create: `src/app/api/admin/health/[id]/route.ts`

**Steps:**
- [ ] **Step 1: Create health management page**
- [ ] **Step 2: Create health API routes**
- [ ] **Step 3: Test health CRUD**

### Task 4.5: Admin Feed Management

**Files:**
- Create: `src/app/(admin)/admin/cattle/[id]/feed/page.tsx`
- Create: `src/app/api/admin/cattle/[id]/feed/route.ts`
- Create: `src/app/api/admin/feed/[id]/route.ts`

**Steps:**
- [ ] **Step 1: Create feed management page**
- [ ] **Step 2: Create feed API routes**
- [ ] **Step 3: Test feed CRUD**

### Task 4.6: Admin Media Upload

**Files:**
- Create: `src/app/(admin)/admin/cattle/[id]/media/page.tsx`
- Create: `src/app/api/admin/cattle/[id]/media/route.ts`
- Create: `src/app/api/admin/media/[id]/route.ts`
- Create: `src/lib/storage/storage.ts`

**Steps:**
- [ ] **Step 1: Create storage abstraction**
- [ ] **Step 2: Create media upload page**
- [ ] **Step 3: Create media API routes**
- [ ] **Step 4: Test media upload**

---

## Phase 5: Polish & Optimization

### Task 5.1: Loading States

**Files:**
- Update: Various components

**Steps:**
- [ ] **Step 1: Add skeleton loading to all components**
- [ ] **Step 2: Add suspense boundaries**

### Task 5.2: Empty States

**Files:**
- Update: Various components

**Steps:**
- [ ] **Step 1: Add empty state messages**
- [ ] **Step 2: Add empty state actions**

### Task 5.3: Error Handling

**Files:**
- Create: `src/app/error.tsx`
- Create: `src/app/not-found.tsx`
- Create: `src/components/shared/ErrorBoundary.tsx`

**Steps:**
- [ ] **Step 1: Create error boundaries**
- [ ] **Step 2: Create 404 page**
- [ ] **Step 3: Test error scenarios**

### Task 5.4: SEO Optimization

**Steps:**
- [ ] **Step 1: Add sitemap**
- [ ] **Step 2: Add robots.txt**
- [ ] **Step 3: Verify meta tags**

### Task 5.5: Final Testing

**Steps:**
- [ ] **Step 1: Test all acceptance criteria**
- [ ] **Step 2: Verify responsive design**
- [ ] **Step 3: Performance check**

---

## Spec Coverage Check

| Spec Requirement | Task |
|-----------------|------|
| Public Catalog | Task 1.6 - 1.8 |
| Search & Filter | Task 1.8 |
| Cattle Detail | Task 1.9 |
| Weight History | Task 2.1 |
| Weight Chart | Task 2.1 |
| ADG Calculation | Task 1.3, 1.9 |
| Target Estimation | Task 1.3, 1.9 |
| Health Records | Task 2.2 |
| Feed Records | Task 2.3 |
| Documentation | Task 2.4 |
| QR Code | Task 2.5 |
| Admin Auth | Task 3.1, 3.2 |
| Admin CRUD | Task 4.2 - 4.6 |
| Responsive | All UI tasks |
| Loading States | Task 5.1 |
| Empty States | Task 5.2 |
| Error Handling | Task 5.3 |

---

## Dependencies

```json
{
  "next": "^14.2.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@prisma/client": "^5.15.0",
  "recharts": "^2.12.0",
  "qrcode.react": "^3.1.0",
  "zod": "^3.23.0",
  "date-fns": "^3.6.0",
  "lucide-react": "^0.395.0",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.3.0",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3"
}
```

---

## Environment Variables

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/cattle_catalog"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="24h"
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=10485760
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
