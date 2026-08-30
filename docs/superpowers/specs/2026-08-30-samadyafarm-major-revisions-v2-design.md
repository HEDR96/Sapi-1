# Samadyafarm.id - Major Revisions V2 Design Spec

## Overview

Implementasi revisi major phase 2 dengan prioritas: Frontend (B) → Backend (A) → Fixes (C).

## Implementation Order

1. **Phase B - Frontend Experience** (Items 1, 2, 4)
2. **Phase A - Backend & Data Layer** (Items 8, 7, 5)
3. **Phase C - Fixes & Integration** (Items 3, 6)

---

## Item 1: Horizontal Scroll Catalog (Swiper Style)

### Design

**Desktop:**
- Swiper container dengan horizontal scroll
- Card width: ~280px
- Gap antar card: 16px
- Navigation: scroll halus + fade edges
- Pagination dots di bawah (opsional)

**Mobile:**
- Card width: ~200px
- Full-width horizontal dengan swipe native
- Card height menyesuaikan

### Components

```tsx
// src/components/catalog/CatalogSwiper.tsx
interface CatalogSwiperProps {
  cattle: Cattle[]
  onSelect: (cattle: Cattle) => void
  selectedId?: string
}

- SwiperContainer: Container dengan overflow-x-auto dan smooth scroll
- SwiperSlide: Individual card wrapper
- FadeMask: Gradient overlay di edges untuk indicate scroll
```

### Styling

```css
.catalog-swiper {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  padding: 0 16px;
}

.catalog-swiper::-webkit-scrollbar {
  display: none; /* Hide scrollbar, use touch */
}

.swiper-slide {
  flex: 0 0 280px; /* Desktop */
  scroll-snap-align: start;
}

@media (max-width: 640px) {
  .swiper-slide {
    flex: 0 0 200px; /* Mobile */
  }
}
```

### Selected State

- Card yang dipilih memiliki border highlight
- Border: `border-[hsl(var(--forest))]` dengan `ring-2 ring-[hsl(var(--forest))]`

---

## Item 2: Pantau Perkembangan Sapi Section

### Design

**Layout Structure:**

```
┌─────────────────────────────────────────────────────────┐
│  Pantau Perkembangan Sapi Anda 🐂                        │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌─────────────────────────────────┐ │
│  │              │  │  [Ringkasan] [Timbang] [Kesehatan]│ │
│  │  Card Detail │  │  [Pakan] [Dokumentasi]           │ │
│  │  Sapi        │  ├─────────────────────────────────┤ │
│  │  (Selected)  │  │                                 │ │
│  │              │  │  Tab Content Area                │ │
│  │  - Foto      │  │  (Bergantung tab yang dipilih)   │ │
│  │  - Nama      │  │                                 │ │
│  │  - Jenis    │  │                                 │ │
│  │  - Harga    │  │                                 │ │
│  │  - Bobot    │  │                                 │ │
│  │              │  │                                 │ │
│  └──────────────┘  └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Left Card (Detail Sapi)

Menampilkan data sapi yang dipilih dari horizontal swiper:

```tsx
interface SelectedCattleCardProps {
  cattle: CattleWithRelations
  isEmpty: boolean // Tampilkan placeholder saat belum pilih
}

// Empty state:
// "Pilih sapi dari katalog di atas untuk melihat detail"

interface CattleWithRelations {
  id: string
  code: string
  name: string
  breed: string
  price: number
  mainImage: string | null
  lastWeight: number | null
  status: Status
  targetWeight: number | null
  weights: CattleWeight[]
  healthRecords: CattleHealthRecord[]
  feedRecords: CattleFeedRecord[]
  media: CattleMedia[]
}
```

### Right Tabs

| Tab | Content |
|-----|---------|
| Ringkasan | Summary stats, ADG, target progress |
| Timbang | Weight chart + history list |
| Kesehatan | Health timeline dengan status badges |
| Pakan | Feed schedule dan notes |
| Dokumentasi | Media gallery (foto/video) |

### Interaction Flow

1. User scroll horizontal catalog
2. User klik card → selectedId state update
3. Left card menampilkan detail sapi
4. Tabs di kanan menampilkan data untuk sapi tersebut
5. Jika belum pilih → tampilkan empty state

### Components

```tsx
// src/components/home/PantauPerkembanganSection.tsx
// Main container

// src/components/home/SelectedCattleDetail.tsx
// Left card dengan detail sapi

// src/components/cattle/DetailTabs.tsx
// Tab navigation component

// src/components/cattle/WeightChart.tsx
// Chart untuk timbang tab
```

---

## Item 3: Resend Email Fix

### Problem

Alert "Kode verifikasi baru telah dikirim ke email Anda" tetap muncul padahal email tidak terkirim.

### Solution

**Hapus alert tersebut** dari:
1. `src/components/auth/VerificationForm.tsx` - fungsi handleResend
2. `src/app/api/auth/resend-verify/route.ts` - response

**Keep behavior:**
- Kode baru tetap di-generate
- Kode lama tetap tersimpan (valid sampai expired)
- Tidak perlu alert jika email gagal (silent fail di UI)

### Code Change

```tsx
// VerificationForm.tsx - handleResend
const handleResend = async () => {
  setLoading(true)
  try {
    await fetch('/api/auth/resend-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    // Hapus: alert('Kode verifikasi baru telah dikirim...')
  } finally {
    setLoading(false)
  }
}
```

---

## Item 4: Admin Form Dropdown Fix

### Problem

Background dropdown transparan → teks label bercampur dengan teks options.

### Solution

Tambahkan background solid dan styling yang konsisten:

```tsx
// Tailwind classes untuk dropdown
<select className={`
  w-full rounded-lg border border-[hsl(var(--line))]
  bg-white px-3 py-2
  text-[hsl(var(--forest))]
  focus:ring-2 focus:ring-[hsl(var(--forest))]
  focus:border-transparent
`}>
```

### Files to Fix

- `src/app/admin/cattle/new/page.tsx`
- `src/app/admin/cattle/[id]/page.tsx`

### Dropdown Fields

1. **Jenis Sapi (Breed)**
2. **Status**
3. **Health Status** (jika applicable)

---

## Item 5: Admin Pages

### Pages Structure

```
/admin
├── /weight      - Riwayat Penimbangan
├── /health     - Riwayat Kesehatan
├── /feed       - Riwayat Pakan
├── /media      - Dokumentasi
├── /users      - Manajemen User
└── /settings   - Pengaturan
```

### 5.1: /admin/weight - Riwayat Penimbangan

**Features:**
1. Dropdown pilih sapi (dari katalog)
2. List/table riwayat timbang untuk sapi tersebut
3. Form input data baru:
   - Tanggal penimbangan
   - Berat (kg)
   - Foto (optional)
   - Notes
4. Chart perkembangan berat

**API Endpoints:**
```
GET    /api/admin/weights           - List all weights (filter by cattleId)
POST   /api/admin/weights           - Create weight record
PUT    /api/admin/weights/:id      - Update weight record
DELETE /api/admin/weights/:id      - Delete weight record
GET    /api/admin/cattle/select    - Get cattle list for dropdown
```

**Database:**

```prisma
model CattleWeight {
  id              String   @id @default(cuid())
  cattleId        String   @map("cattle_id")
  cattle          Cattle   @relation(...)
  weight          Float
  measurementDate DateTime @map("measurement_date")
  notes           String?  @db.Text
  createdAt       DateTime @default(now())
  
  media CattleWeightMedia[]
}
```

### 5.2: /admin/health - Riwayat Kesehatan

**Features:**
1. Dropdown pilih sapi
2. Timeline kesehatan
3. Form input:
   - Tanggal
   - Jenis pemeriksaan
   - Status kesehatan (dropdown)
   - Notes
   - Foto (optional)

**API Endpoints:**
```
GET    /api/admin/health            - List all health records
POST   /api/admin/health            - Create health record
PUT    /api/admin/health/:id        - Update health record
DELETE /api/admin/health/:id        - Delete health record
```

### 5.3: /admin/feed - Riwayat Pakan

**Features:**
1. Dropdown pilih sapi
2. List jadwal pakan
3. Form input:
   - Tanggal
   - Jenis pakan
   - Jumlah
   - Frekuensi
   - Notes

**API Endpoints:**
```
GET    /api/admin/feed              - List all feed records
POST   /api/admin/feed              - Create feed record
PUT    /api/admin/feed/:id          - Update feed record
DELETE /api/admin/feed/:id          - Delete feed record
```

### 5.4: /admin/media - Dokumentasi

**Features:**
1. Dropdown pilih sapi
2. Gallery media
3. Upload form:
   - File (foto/video)
   - Kategori (GENERAL, WEIGHT, HEALTH, OTHER)
   - Title
   - Description

**API Endpoints:**
```
GET    /api/admin/media             - List all media
POST   /api/admin/media             - Upload media
DELETE /api/admin/media/:id         - Delete media
```

### 5.5: /admin/users - Manajemen User

**Features:**
1. Table list users
2. Kolom: Name, Email, Role, Verified, Created, Actions
3. Actions: View, Edit Role, Delete
4. Search/filter

**API Endpoints:**
```
GET    /api/admin/users             - List all users
GET    /api/admin/users/:id        - Get user detail
PUT    /api/admin/users/:id        - Update user (role, etc)
DELETE /api/admin/users/:id        - Delete user
```

### 5.6: /admin/settings - Pengaturan

**Settings Options:**
1. Farm Info
   - Farm name
   - Logo
   - Contact info
2. Email settings
   - Resend API key status
3. Storage settings
   - iDrive E2 credentials
4. About/Version info

**API Endpoints:**
```
GET    /api/admin/settings          - Get settings
PUT    /api/admin/settings          - Update settings
```

---

## Item 6: Dashboard Reports Update

### Problem

Dashboard tidak update saat ada perubahan status.

### Solution

Dashboard harus re-fetch data secara real-time:

1. **Use `refreshInterval`** atau SWR/React Query:
   ```tsx
   const { data, refresh } = useSWR('/api/admin/dashboard', fetcher, {
     refreshInterval: 30000, // Refresh every 30 seconds
   })
   ```

2. **Invalidate on mutation**:
   ```tsx
   // Setelah update status
   await mutate('/api/admin/dashboard')
   ```

3. **Dashboard Stats Components**:
   - Total sapi (by status)
   - Available, Sold, Booked counts
   - Recent activity feed
   - Monthly reports/charts

### API Enhancement

```typescript
// GET /api/admin/dashboard - Include summary stats
{
  summary: {
    totalCattle: number,
    available: number,
    sold: number,
    booked: number,
    lowStock: number
  },
  recentActivity: Activity[],
  monthlyStats: MonthlyStat[]
}
```

---

## Item 7: Comment System

### Database

```prisma
model Comment {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [id])
  cattleId  String   @map("cattle_id")
  cattle    Cattle   @relation(fields: [cattleId], references: [id])
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([cattleId])
  @@index([userId])
  @@index([createdAt])
}
```

### API Endpoints

```
GET    /api/comments                - List comments (by cattleId, newest first)
POST   /api/comments                - Create comment (auth required)
DELETE /api/comments/:id            - Delete own comment (auth required)
```

### Homepage Section: Top/Newest Comments

**Location:** Homepage, setelah "Pantau Perkembangan" section

**Features:**
1. List 5-10 newest comments
2. Show: User name, cattle code, comment preview, timestamp
3. Click → navigate ke detail sapi
4. Tampilkan avatar placeholder + user name

**Component:**
```tsx
// src/components/home/RecentComments.tsx
interface CommentWithUser {
  id: string
  content: string
  createdAt: Date
  user: { name: string | null }
  cattle: { code: string; name: string }
}
```

### Comment Form (di Cattle Detail Page)

**Location:** Di bawah detail sapi atau di tab khusus

**Form Fields:**
- Textarea untuk comment
- Submit button (disabled jika belum login)
- Login prompt jika guest

**Validation:**
- Min 3 karakter
- Max 1000 karakter
- Login required

---

## Item 8: iDrive E2 Storage

### Configuration

**Environment Variables:**
```env
IDRIVE_ACCESS_KEY_ID="n5f8JZgJdMa7vgZh6JVq"
IDRIVE_SECRET_ACCESS_KEY="uJbR5BhCvXobDzz395caFfK7VsudYdKbbdkRriRZ"
IDRIVE_BUCKET="farm"
IDRIVE_ENDPOINT="https://farm.s3.ap-northeast-1.idrivee2.com"
IDRIVE_REGION="ap-northeast-1"
```

### Setup

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### S3 Client

```typescript
// src/lib/storage/s3.ts
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: process.env.IDRIVE_REGION,
  endpoint: process.env.IDRIVE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.IDRIVE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.IDRIVE_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // Required for S3-compatible services
})
```

### Upload Function

```typescript
// src/lib/storage/upload.ts
export async function uploadToS3(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'cattle'
): Promise<string> {
  const key = `${folder}/${Date.now()}-${fileName}`
  
  const command = new PutObjectCommand({
    Bucket: process.env.IDRIVE_BUCKET,
    Key: key,
    Body: file,
    ContentType: contentType,
  })
  
  await s3Client.send(command)
  
  // Return public URL
  return `${process.env.IDRIVE_ENDPOINT}/${process.env.IDRIVE_BUCKET}/${key}`
}
```

### Get Signed URL (for private uploads)

```typescript
export async function getSignedUploadUrl(
  fileName: string,
  contentType: string,
  folder: string
): Promise<{ uploadUrl: string; key: string }> {
  const key = `${folder}/${Date.now()}-${fileName}`
  
  const command = new PutObjectCommand({
    Bucket: process.env.IDRIVE_BUCKET,
    Key: key,
    ContentType: contentType,
  })
  
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
  
  return { uploadUrl, key }
}
```

### Delete Function

```typescript
export async function deleteFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: process.env.IDRIVE_BUCKET,
    Key: key,
  })
  
  await s3Client.send(command)
}
```

### File Extension Mapping

```typescript
const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
const videoExtensions = ['mp4', 'webm', 'mov']

export function isImage(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase()
  return imageExtensions.includes(ext || '')
}

export function isVideo(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase()
  return videoExtensions.includes(ext || '')
}
```

### Replace Supabase References

**Files to Update:**
1. `src/components/admin/ImageUploader.tsx` → use S3
2. `src/lib/supabase/client.ts` → remove
3. `src/lib/supabase/server.ts` → remove
4. Any other files referencing `supabase.storage`

---

## Database Migration

```prisma
// Add Comment model
model Comment {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  cattleId  String   @map("cattle_id")
  cattle    Cattle   @relation(fields: [cattleId], references: [id], onDelete: Cascade)
  content   String   @db.Text
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([cattleId])
  @@index([userId])
  @@index([createdAt])
}

// Add Settings model
model Setting {
  id    String @id @default(cuid())
  key   String @unique
  value String @db.Text
}
```

---

## Files Summary

### Create

| File | Purpose |
|------|---------|
| `src/components/catalog/CatalogSwiper.tsx` | Horizontal scroll catalog |
| `src/components/home/PantauPerkembanganSection.tsx` | Main section container |
| `src/components/home/SelectedCattleDetail.tsx` | Left detail card |
| `src/components/cattle/DetailTabs.tsx` | Tab navigation |
| `src/components/home/RecentComments.tsx` | Homepage comments section |
| `src/components/admin/weights/WeightForm.tsx` | Weight input form |
| `src/components/admin/weights/WeightChart.tsx` | Weight chart |
| `src/components/admin/health/HealthTimeline.tsx` | Health timeline |
| `src/components/admin/feed/FeedSchedule.tsx` | Feed schedule |
| `src/components/admin/media/MediaGallery.tsx` | Media gallery |
| `src/lib/storage/s3.ts` | S3 client |
| `src/lib/storage/upload.ts` | Upload functions |
| `src/lib/storage/delete.ts` | Delete functions |
| `src/app/api/admin/weights/route.ts` | Weights CRUD |
| `src/app/api/admin/health/route.ts` | Health CRUD |
| `src/app/api/admin/feed/route.ts` | Feed CRUD |
| `src/app/api/admin/media/route.ts` | Media CRUD |
| `src/app/api/admin/users/route.ts` | Users CRUD |
| `src/app/api/admin/settings/route.ts` | Settings CRUD |
| `src/app/api/comments/route.ts` | Comments CRUD |
| `src/app/admin/weight/page.tsx` | Weight page |
| `src/app/admin/health/page.tsx` | Health page |
| `src/app/admin/feed/page.tsx` | Feed page |
| `src/app/admin/media/page.tsx` | Media page |
| `src/app/admin/users/page.tsx` | Users page |
| `src/app/admin/settings/page.tsx` | Settings page |

### Modify

| File | Changes |
|------|---------|
| `src/app/(public)/page.tsx` | Add Pantau Perkembangan + Comments sections |
| `src/app/admin/cattle/new/page.tsx` | Fix dropdown styling |
| `src/app/admin/cattle/[id]/page.tsx` | Fix dropdown styling |
| `src/app/admin/dashboard/page.tsx` | Real-time updates |
| `src/components/auth/VerificationForm.tsx` | Remove alert |
| `src/components/admin/ImageUploader.tsx` | Use S3 instead of Supabase |
| `prisma/schema.prisma` | Add Comment, Setting models |
| `.env.example` | Add iDrive E2 variables |

### Delete

| File | Reason |
|------|--------|
| `src/lib/supabase/client.ts` | Replaced by S3 |
| `src/lib/supabase/server.ts` | Replaced by S3 |

---

## Technical Dependencies

```json
{
  "dependencies": {
    "@aws-sdk/client-s3": "^3.x",
    "@aws-sdk/s3-request-presigner": "^3.x"
  },
  "devDependencies": {
    "@types/qrcode": "^1.x"
  }
}
```

---

## Environment Variables

```env
# iDrive E2
IDRIVE_ACCESS_KEY_ID="n5f8JZgJdMa7vgZh6JVq"
IDRIVE_SECRET_ACCESS_KEY="uJbR5BhCvXobDzz395caFfK7VsudYdKbbdkRriRZ"
IDRIVE_BUCKET="farm"
IDRIVE_ENDPOINT="https://farm.s3.ap-northeast-1.idrivee2.com"
IDRIVE_REGION="ap-northeast-1"
NEXT_PUBLIC_APP_URL="https://samadyafarm.id"
```
