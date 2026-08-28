# Cattle Catalog Web Application - Design Specification

**Date:** 2026-08-28  
**Status:** Draft - Pending Review

---

## 1. Overview

Web application untuk katalog dan monitoring sapi dengan dua fungsi utama:
1. **Public Catalog** - Pengunjung dapat melihat daftar sapi yang tersedia maupun yang sudah terjual
2. **Cattle Detail & Monitoring** - Setiap sapi memiliki halaman detail dengan informasi lengkap

---

## 2. Technical Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Frontend** | Next.js 14+ App Router | Full-stack capabilities, RSC, file-based routing |
| **Language** | TypeScript (strict mode) | Type safety, better DX |
| **Styling** | Tailwind CSS + shadcn/ui | Modern, customizable components |
| **Database** | PostgreSQL | Production-ready relational DB |
| **ORM** | Prisma | Type-safe queries, excellent migrations |
| **Authentication** | Custom JWT + middleware | Full control, lightweight |
| **File Storage** | Local filesystem | Development simplicity, S3-compatible interface |
| **Charts** | Recharts | React-native, customizable |
| **Validation** | Zod | TypeScript-first schema validation |
| **QR Code** | qrcode / qrcode.react | QR generation for cattle profiles |

---

## 3. Database Schema

### 3.1 Core Tables

```prisma
model Cattle {
  id            String   @id @default(cuid())
  code          String   @unique @db.VarChar(20)
  name          String   @db.VarChar(100)
  breed         String   @db.VarChar(50)
  status        Status   @default(AVAILABLE)
  birthDate     DateTime @map("birth_date")
  height        Float?   // cm
  price         Decimal  @db.Decimal(15, 2)
  targetWeight  Float?   @map("target_weight") // kg
  description   String?  @db.Text
  mainImage     String?  @map("main_image")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

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
  weight          Float    // kg
  measurementDate DateTime @map("measurement_date")
  notes           String?  @db.Text
  createdAt       DateTime @default(now()) @map("created_at")

  media           CattleWeightMedia[]

  @@index([cattleId])
  @@index([measurementDate])
}

model CattleWeightMedia {
  id        String   @id @default(cuid())
  weightId  String   @map("weight_id")
  weight    CattleWeight @relation(fields: [weightId], references: [id], onDelete: Cascade)
  fileUrl   String   @map("file_url")
  fileType  String   @map("file_type") // IMAGE, VIDEO
  createdAt DateTime @default(now()) @map("created_at")
}

model CattleHealthRecord {
  id          String   @id @default(cuid())
  cattleId    String   @map("cattle_id")
  cattle      Cattle   @relation(fields: [cattleId], references: [id], onDelete: Cascade)
  recordDate  DateTime @map("record_date")
  healthType  String   @map("health_type") // PEMERIKSAAN_RUTIN, VAKSINASI, dll
  status      HealthStatus @default(SEHAT)
  notes       String?  @db.Text
  createdAt   DateTime @default(now()) @map("created_at")

  media       CattleHealthMedia[]

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
  id             String   @id @default(cuid())
  healthRecordId String   @map("health_record_id")
  healthRecord   CattleHealthRecord @relation(fields: [healthRecordId], references: [id], onDelete: Cascade)
  fileUrl        String   @map("file_url")
  fileType       String   @map("file_type")
  createdAt      DateTime @default(now()) @map("created_at")
}

model CattleFeedRecord {
  id          String   @id @default(cuid())
  cattleId    String   @map("cattle_id")
  cattle      Cattle   @relation(fields: [cattleId], references: [id], onDelete: Cascade)
  recordDate  DateTime @map("record_date")
  feedType    String   @map("feed_type") // JSON array of feed types
  amount      String   // e.g., "10 Kg / Hari"
  frequency   String   // e.g., "2x Sehari"
  notes       String?  @db.Text
  createdAt   DateTime @default(now()) @map("created_at")

  @@index([cattleId])
}

model CattleMedia {
  id          String   @id @default(cuid())
  cattleId    String   @map("cattle_id")
  cattle      Cattle   @relation(fields: [cattleId], references: [id], onDelete: Cascade)
  category    MediaCategory @default(GENERAL)
  fileUrl     String   @map("file_url")
  fileType    String   @map("file_type") // IMAGE, VIDEO, DOCUMENT
  title       String?
  description String?
  createdAt   DateTime @default(now()) @map("created_at")

  @@index([cattleId])
}

enum MediaCategory {
  GENERAL
  WEIGHT
  HEALTH
  OTHER
}

model Admin {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // hashed
  name      String
  role      AdminRole @default(STAFF)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
}

enum AdminRole {
  ADMIN
  STAFF
}
```

---

## 4. API Design

### 4.1 Public API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cattle` | List all cattle with pagination & filters |
| GET | `/api/cattle/[code]` | Get cattle detail |
| GET | `/api/cattle/[code]/weights` | Get weight history |
| GET | `/api/cattle/[code]/health` | Get health records |
| GET | `/api/cattle/[code]/feed` | Get feed records |
| GET | `/api/cattle/[code]/media` | Get media gallery |

### 4.2 Admin API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/auth/login` | Admin login |
| POST | `/api/admin/auth/logout` | Admin logout |
| GET | `/api/admin/auth/me` | Get current admin |
| GET | `/api/admin/cattle` | List all cattle (admin) |
| POST | `/api/admin/cattle` | Create cattle |
| PUT | `/api/admin/cattle/[id]` | Update cattle |
| DELETE | `/api/admin/cattle/[id]` | Delete cattle |
| POST | `/api/admin/cattle/[id]/weights` | Add weight record |
| PUT | `/api/admin/weights/[id]` | Update weight |
| DELETE | `/api/admin/weights/[id]` | Delete weight |
| POST | `/api/admin/cattle/[id]/health` | Add health record |
| PUT | `/api/admin/health/[id]` | Update health record |
| DELETE | `/api/admin/health/[id]` | Delete health record |
| POST | `/api/admin/cattle/[id]/feed` | Add feed record |
| PUT | `/api/admin/feed/[id]` | Update feed record |
| DELETE | `/api/admin/feed/[id]` | Delete feed record |
| POST | `/api/admin/cattle/[id]/media` | Upload media |
| DELETE | `/api/admin/media/[id]` | Delete media |

---

## 5. Folder Structure

```
src/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx              # Public layout
│   │   ├── page.tsx                # Home / Catalog
│   │   ├── sapi/
│   │   │   └── [code]/
│   │   │       └── page.tsx        # Cattle detail page
│   │   └── layout.tsx
│   ├── admin/
│   │   ├── layout.tsx              # Admin layout with sidebar
│   │   ├── page.tsx                # Dashboard
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── cattle/
│   │   │   ├── page.tsx            # Cattle list
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Edit cattle
│   │   │       └── weights/
│   │   │       ├── page.tsx        # Weight history
│   │   │       ├── health/
│   │   │       │   └── page.tsx
│   │   │       ├── feed/
│   │   │       │   └── page.tsx
│   │   │       └── media/
│   │   │           └── page.tsx
│   │   └── media/
│   │       └── page.tsx            # Media library
│   ├── api/
│   │   ├── cattle/
│   │   │   └── route.ts
│   │   │   └── [code]/
│   │   │       ├── route.ts
│   │   │       ├── weights/
│   │   │       │   └── route.ts
│   │   │       ├── health/
│   │   │       │   └── route.ts
│   │   │       ├── feed/
│   │   │       │   └── route.ts
│   │   │       └── media/
│   │   │           └── route.ts
│   │   └── admin/
│   │       ├── auth/
│   │       │   ├── login/
│   │       │   │   └── route.ts
│   │       │   ├── logout/
│   │       │   │   └── route.ts
│   │       │   └── me/
│   │       │       └── route.ts
│   │       ├── cattle/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       ├── route.ts
│   │       │       └── weights/
│   │       │           └── route.ts
│   │       ├── weights/
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       ├── health/
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       ├── feed/
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       └── media/
│   │           └── [id]/
│   │               └── route.ts
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── cattle/
│   │   ├── CattleCard.tsx
│   │   ├── CattleStatusBadge.tsx
│   │   ├── CattleGallery.tsx
│   │   ├── CattleProfile.tsx
│   │   ├── CattleStats.tsx
│   │   └── QRCodeCard.tsx
│   ├── catalog/
│   │   ├── HeroSection.tsx
│   │   ├── SearchFilter.tsx
│   │   ├── StatisticsBar.tsx
│   │   └── CattleGrid.tsx
│   ├── weight/
│   │   ├── WeightSummary.tsx
│   │   ├── WeightHistory.tsx
│   │   └── WeightChart.tsx
│   ├── health/
│   │   └── HealthTimeline.tsx
│   ├── feed/
│   │   └── FeedHistory.tsx
│   ├── media/
│   │   ├── DocumentationGallery.tsx
│   │   └── MediaPreview.tsx
│   ├── admin/
│   │   ├── AdminSidebar.tsx
│   │   ├── AdminHeader.tsx
│   │   └── DataTable.tsx
│   └── shared/
│       ├── EmptyState.tsx
│       ├── LoadingSkeleton.tsx
│       ├── ConfirmDialog.tsx
│       ├── FileUploader.tsx
│       └── Breadcrumb.tsx
├── lib/
│   ├── api/
│   │   └── client.ts               # API client utilities
│   ├── db/
│   │   └── prisma.ts               # Prisma client singleton
│   ├── utils/
│   │   ├── formatters.ts           # Number, date formatters
│   │   ├── calculations.ts         # ADG, target estimation
│   │   └── cn.ts                  # Class name utility
│   ├── validations/
│   │   ├── cattle.ts               # Zod schemas for cattle
│   │   ├── weight.ts
│   │   ├── health.ts
│   │   └── feed.ts
│   ├── storage/
│   │   └── storage.ts              # Storage abstraction
│   └── auth/
│       ├── jwt.ts                  # JWT utilities
│       └── middleware.ts           # Auth middleware
├── services/
│   ├── cattle.service.ts
│   ├── weight.service.ts
│   ├── health.service.ts
│   ├── feed.service.ts
│   ├── media.service.ts
│   └── auth.service.ts
├── types/
│   └── index.ts                    # Shared TypeScript types
└── hooks/
    ├── useCattle.ts
    ├── useAdmin.ts
    └── useMedia.ts
```

---

## 6. Visual Design System

### 6.1 Color Palette

```css
/* Primary - Dark Forest Green */
--primary-50: #f0fdf4;
--primary-100: #dcfce7;
--primary-200: #bbf7d0;
--primary-300: #86efac;
--primary-400: #4ade80;
--primary-500: #22c55e;
--primary-600: #16a34a;
--primary-700: #15803d;
--primary-800: #166534;  /* Main primary */
--primary-900: #14532d;
--primary-950: #052e16;

/* Accent - Warm Gold/Yellow */
--accent-400: #fbbf24;
--accent-500: #f59e0b;
--accent-600: #d97706;

/* Neutral - Grays */
--neutral-50: #fafafa;
--neutral-100: #f5f5f5;
--neutral-200: #e5e5e5;
--neutral-300: #d4d4d4;
--neutral-400: #a3a3a3;
--neutral-500: #737373;
--neutral-600: #525252;
--neutral-700: #404040;
--neutral-800: #262626;
--neutral-900: #171717;
--neutral-950: #0a0a0a;

/* Status Colors */
--status-available: #22c55e;
--status-sold: #ef4444;
--status-reserved: #f59e0b;
--status-archived: #737373;

/* Health Status */
--health-sehat: #22c55e;
--health-observasi: #f59e0b;
--health-sakit: #ef4444;
--health-sembuh: #3b82f6;
--health-perawatan: #8b5cf6;
```

### 6.2 Typography

- **Heading Font:** Inter (Google Fonts)
- **Body Font:** Inter
- **Monospace:** JetBrains Mono (for code/IDs)

### 6.3 Spacing System

4px base unit:
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `2xl`: 48px
- `3xl`: 64px

### 6.4 Border Radius

- **sm:** 4px
- **md:** 8px
- **lg:** 12px
- **xl:** 16px
- **full:** 9999px

---

## 7. Page Layouts

### 7.1 Public Catalog Page (/)

```
┌──────────────────────────────────────────────────────────────┐
│  NAVBAR                                                      │
│  🌾 SapiKatalog    Katalog                    [Admin Login]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  HERO SECTION                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  [Background: High-quality cattle image with overlay]   │  │
│  │                                                        │  │
│  │           Katalog Sapi Pilihan                         │  │
│  │     Temukan sapi berkualitas dengan informasi lengkap    │  │
│  │                                                        │  │
│  │     [ Lihat Katalog ]  [ Sapi Tersedia ]               │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  STATISTICS BAR                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ 120      │  │ 45       │  │ 75       │                   │
│  │ Total    │  │ Tersedia │  │ Terjual  │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
│                                                              │
│  SEARCH & FILTER BAR                                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🔍  Cari nama atau kode sapi...                        │  │
│  │                                                        │  │
│  │ Status: [Semua ▼]  Jenis: [Semua ▼]                   │  │
│  │ Harga: [Min] - [Max]  Bobot: [Min] - [Max]           │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  CATTLE GRID (3 columns desktop, 2 tablet, 1 mobile)         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │ [PHOTO]    │  │ [PHOTO]    │  │ [PHOTO]    │             │
│  │ ● TERSEDIA │  │ ● TERSEDIA │  │ ● TERJUAL  │             │
│  │            │  │            │  │            │             │
│  │ Brahman A  │  │ Simental B │  │ Angus C    │             │
│  │ NF-26001   │  │ NF-26002   │  │ NF-26003   │             │
│  │ Limousin   │  │ Simental  │  │ Angus      │             │
│  │ 527 Kg    │  │ 485 Kg    │  │ 560 Kg    │             │
│  │ Rp 45 Jt  │  │ Rp 42 Jt  │  │ Rp 55 Jt  │             │
│  │            │  │            │  │            │             │
│  │[Lihat Detail]│[Lihat Detail]│[Lihat Detail]│             │
│  └────────────┘  └────────────┘  └────────────┘             │
│                                                              │
│  PAGINATION                                                  │
│  [< Prev]  1  2  3  ... 10  [Next >]                      │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  FOOTER                                                      │
│  © 2026 SapiKatalog. All rights reserved.                   │
└──────────────────────────────────────────────────────────────┘
```

### 7.2 Cattle Detail Page (/sapi/[code])

```
┌──────────────────────────────────────────────────────────────┐
│  BREADCRUMB                                                 │
│  Home > Katalog > NF-26001                                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  CATTLE PROFILE SECTION                                      │
│  ┌────────────────────────┬─────────────────────────────┐   │
│  │                        │  ● TERSEDIA                 │   │
│  │   [MAIN IMAGE]         │                             │   │
│  │   ┌────┐ ┌────┐       │  Brahman Alpha               │   │
│  │   │img1│ │img2│       │  NF-26001                    │   │
│  │   └────┘ └────┘       │                             │   │
│  │                        │  Jenis: Limousin            │   │
│  │                        │  Tgl Lahir: 10 Ags 2025     │   │
│  │                        │  Tinggi: 145 cm              │   │
│  │                        │  Bobot: 527 Kg              │   │
│  │                        │  Harga: Rp 45.000.000        │   │
│  │                        │                             │   │
│  │                        │  [ Hubungi Kami ]          │   │
│  └────────────────────────┴─────────────────────────────┘   │
│                                                              │
│  QUICK STATISTICS                                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────┐ │
│  │ 527 Kg     │  │ 1.4 Kg/h  │  │ 650 Kg     │  │  81%   │ │
│  │ Bobot Ter. │  │ ADG       │  │ Target    │  │ Progress│ │
│  └────────────┘  └────────────┘  └────────────┘  └────────┘ │
│                                                              │
│  PROGRESS BAR                                               │
│  [████████████████████░░░░░░░░░░░░░] 527/650 Kg            │
│                                                              │
│  TABS (Desktop) / ACCORDION (Mobile)                        │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ [Ringkasan] [Timbang] [Kesehatan] [Pakan] [Dokumentasi] ││
│  ├──────────────────────────────────────────────────────────┤│
│  │                                                          ││
│  │  TAB CONTENT                                             ││
│  │                                                          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  QR CODE SECTION                                             │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  ┌────────┐                                           │  │
│  │  │ QR     │  Scan untuk melihat profil sapi            │  │
│  │  │ CODE   │  [ Download PNG ]  [ Cetak ]              │  │
│  │  └────────┘                                           │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  RELATED CATTLE                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │ [PHOTO]    │  │ [PHOTO]    │  │ [PHOTO]    │             │
│  │ Limousin X │  │ Limousin Y │  │ Limousin Z │             │
│  └────────────┘  └────────────┘  └────────────┘             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 8. Business Logic

### 8.1 Weight Calculations

```typescript
// Initial Weight (first measurement)
const initialWeight = weights.sort((a, b) => 
  a.measurementDate - b.measurementDate
)[0].weight;

// Last Weight (most recent measurement)
const lastWeight = weights.sort((a, b) => 
  b.measurementDate - a.measurementDate
)[0].weight;

// Weight Gain
const weightGain = lastWeight - initialWeight;

// ADG (Average Daily Gain)
const daysDiff = daysBetween(initialDate, lastDate);
const adg = daysDiff > 0 ? weightGain / daysDiff : null;

// Target Estimation
if (targetWeight > lastWeight && adg > 0) {
  const remainingWeight = targetWeight - lastWeight;
  const estimatedDays = remainingWeight / adg;
  const estimatedDate = addDays(today, estimatedDays);
}
```

### 8.2 Status Display Mapping

| Database Status | Display Text | Badge Color |
|----------------|--------------|-------------|
| AVAILABLE | TERSEDIA | Green |
| SOLD | TERJUAL | Red |
| RESERVED | DIBOOKING | Yellow |
| ARCHIVED | DIARCHIVE | Gray |

### 8.3 Health Status Display

| Status | Badge Color | Icon |
|--------|-------------|------|
| SEHAT | Green | Check |
| DALAM_PERAWATAN | Purple | Heart |
| OBSERVASI | Yellow | Eye |
| SAKIT | Red | Alert |
| SEMBUH | Blue | Recovery |

---

## 9. Seed Data Requirements

Minimum 10 cattle with:
- Complete basic info (name, code, breed, birth date, height, price)
- Main image
- Minimum 3 weight records spanning at least 30 days
- Minimum 2 health records
- Minimum 2 feed records
- Minimum 5 media items (photos/videos)

Example seed data structure:
```typescript
const seedCattle = [
  {
    code: 'NF-26001',
    name: 'Brahman Alpha',
    breed: 'Limousin',
    status: 'AVAILABLE',
    birthDate: new Date('2025-08-10'),
    height: 145,
    price: 45000000,
    targetWeight: 650,
  },
  // ... 9 more cattle
];
```

---

## 10. Security Requirements

1. **Authentication**
   - JWT tokens with 24h expiry
   - Secure HTTP-only cookies
   - CSRF protection
   - Rate limiting on login attempts

2. **Authorization**
   - Admin routes protected by middleware
   - Role-based access (ADMIN, STAFF)
   - Public routes require no auth

3. **Input Validation**
   - Zod schemas for all inputs
   - File type validation (images: jpg, jpeg, png, webp; videos: mp4, webm)
   - File size limits (images: 10MB, videos: 100MB)
   - SQL injection prevention via Prisma

4. **File Upload Security**
   - Generate unique filenames
   - Validate MIME types
   - Sanitize filenames

---

## 11. Performance Requirements

1. **Database**
   - Indexes on: code, status, breed, cattle_id, measurement_date
   - Pagination on all list endpoints
   - Efficient Prisma queries with select

2. **Images**
   - Next.js Image component for optimization
   - Lazy loading
   - Responsive images (srcset)
   - WebP format when possible

3. **Caching**
   - Static generation for public catalog (ISR)
   - Client-side caching for detail pages
   - API response caching where appropriate

---

## 12. Implementation Phases

### Phase 1: Foundation
- [ ] Initialize Next.js project with TypeScript
- [ ] Setup Prisma with PostgreSQL
- [ ] Create database schema
- [ ] Add seed data
- [ ] Basic public catalog page
- [ ] Cattle card component
- [ ] Search and filter functionality

### Phase 2: Detail Page
- [ ] Cattle detail page
- [ ] Weight history with chart
- [ ] ADG calculation
- [ ] Target estimation with progress bar
- [ ] Tabs/Accordion navigation

### Phase 3: Additional Features
- [ ] Health records display
- [ ] Feed records display
- [ ] Media gallery
- [ ] QR Code generation

### Phase 4: Admin
- [ ] Admin authentication (JWT)
- [ ] Admin dashboard
- [ ] CRUD for cattle
- [ ] CRUD for weights
- [ ] CRUD for health records
- [ ] CRUD for feed records
- [ ] Media upload system

### Phase 5: Polish
- [ ] Responsive refinements
- [ ] Loading states (skeleton)
- [ ] Empty states
- [ ] Error handling
- [ ] SEO optimization
- [ ] Performance optimization

---

## 13. Dependencies

```json
{
  "dependencies": {
    "next": "^14.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "@prisma/client": "^5.x",
    "recharts": "^2.x",
    "qrcode.react": "^3.x",
    "zod": "^3.x",
    "date-fns": "^3.x",
    "lucide-react": "^0.x",
    "class-variance-authority": "^0.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x"
  },
  "devDependencies": {
    "prisma": "^5.x",
    "typescript": "^5.x",
    "@types/node": "^20.x",
    "tailwindcss": "^3.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x",
    "eslint": "^8.x",
    "eslint-config-next": "^14.x"
  }
}
```

---

## 14. Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cattle_catalog"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="24h"

# Storage
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=10485760

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 15. Next Steps

1. User reviews and approves this design
2. Invoke writing-plans skill for detailed implementation plan
3. Begin Phase 1 implementation
