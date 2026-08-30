# Nusa Farm - Major Revisions & New Features Design Spec

## Overview
Implementasi 16 revision items dan fitur baru sesuai request user.

---

## Item 1: Image Fit to Container

### Problem
Gambar di CattleCard tidak fit dengan sempurna ke container.

### Solution
- Gunakan `object-fit: cover` dengan aspect ratio tetap
- Pastikan `fill` property di Next.js Image sudah benar
- Tambah `sizes` attribute untuk responsive images

### Implementation
```tsx
// CattleCard.tsx
<Image
  src={mainImage}
  alt={name}
  fill
  className="object-cover"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

---

## Item 2: Pagination Dots & Arrows di Detail Page

### Problem
Tidak ada pagination controls untuk gallery di halaman detail sapi.

### Solution
Tambahkan:
- Dots indicator (pagination dots) di bawah gambar utama
- Arrow buttons (kiri/kanan) untuk navigasi
- Keyboard navigation (arrow keys)
- Thumbnail strip di bawah dots

### Components
1. **PaginationDots** - dots indicator
2. **NavigationArrows** - prev/next buttons
3. **ThumbnailStrip** - thumbnail gallery

---

## Item 3: Fix Float Decimals

### Problem
Terlalu banyak angka di belakang koma pada data numerik.

### Solution
Buat utility function untuk formatting:
```typescript
// lib/utils/formatters.ts
export function formatWeight(weight: number | null): string {
  if (weight === null) return '-'
  return `${weight.toFixed(1)} kg`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatADG(adg: number): string {
  return `${adg.toFixed(2)} kg/hari`
}
```

---

## Item 4: User Registration dengan Email Verification

### Current State
- Register API sudah ada
- Verification code sudah di-generate
- Belum ada email sending

### Solution
1. **Setup Resend** untuk email sending
   - Install `resend` package
   - Buat environment variables
   - Buat email template
   
2. **Update Register API** untuk kirim email
   - Kirim verification code via email
   - Simpan code ke database

3. **UI Flow**:
   ```
   Register Form → Submit → Show Verification Modal → Enter Code → Verified
   ```

### Components
- `AuthModal` - Login/Register modal
- `VerificationForm` - Input kode verifikasi
- `ResendCodeButton` - Kirim ulang kode

---

## Item 5: Sold Status Card Styling

### Current State
- Card sudah ada opacity dan grayscale
- Tapi overlay text masih "SOLD"

### Solution
Perbaiki styling:
```tsx
{isSold && (
  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
    <span className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm">
      TERJUAL
    </span>
  </div>
)}
```

### Changes
1. Full black overlay (bg-black/50)
2. Text "TERJUAL" (sesuai Bahasa)
3. Grayscale filter pada gambar

---

## Item 6: Fix Spelling & Booking Feature

### Current State
- Typo "DIBOOKING" → "DIBOOKING" (sebenarnya sudah benar)
- Status enum: `RESERVED` → `BOOKED`

### Solution
1. **Update Status Enum**:
   ```prisma
   enum Status {
     AVAILABLE
     SOLD
     BOOKED  // Ubah dari RESERVED
     ARCHIVED
   }
   ```

2. **Create Booking Feature**:
   - API endpoint untuk booking
   - Frontend booking form
   - Notification ke admin
   - Update quantity saat booking

### Booking Flow
```
User Login → Pilih Sapi → Klik Booking → Form Booking → Submit → Notif Admin
```

---

## Item 7: History Pages Implementation

### Problem
Tabs untuk Riwayat Timbang, Kesehatan, Pakan, Media belum ada datanya.

### Solution
1. **Weight History Tab**:
   - List semua penimbangan
   - Group by month
   - Photo gallery per timbang
   - Grafik trend

2. **Health History Tab**:
   - Timeline kesehatan
   - Status badges
   - Notes dokter/healer
   - Photo documentation

3. **Feed/Pakan Tab**:
   - Jadwal pakan
   - Jenis & jumlah
   - Notes nutrisi

4. **Media Tab**:
   - Masonry gallery
   - Lightbox preview
   - Download functionality

### API Endpoints
- `GET /api/cattle/[code]/weights`
- `GET /api/cattle/[code]/health`
- `GET /api/cattle/[code]/feed`
- `GET /api/cattle/[code]/media`

---

## Item 8: Image Upload dengan Supabase

### Solution
1. **Setup Supabase**:
   - Buat project baru di Supabase
   - Buat storage bucket `cattle-images`
   - Set bucket public

2. **Frontend Upload Component**:
   ```tsx
   // components/admin/ImageUploader.tsx
   - Drag & drop zone
   - Preview images
   - Progress bar
   - Multiple file support
   ```

3. **API Integration**:
   - Upload ke Supabase Storage
   - Return public URL
   - Delete old images

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## Item 9: Auto-Generate Cattle Code

### Solution
Update API untuk auto-generate:
```typescript
// lib/utils/cattleCode.ts
export async function generateCattleCode(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `NF-${year}`
  
  // Get last code with this prefix
  const lastCattle = await prisma.cattle.findFirst({
    where: { code: { startsWith: prefix } },
    orderBy: { code: 'desc' }
  })
  
  if (lastCattle) {
    const lastNum = parseInt(lastCattle.code.split('-').pop() || '0')
    return `${prefix}${String(lastNum + 1).padStart(4, '0')}`
  }
  
  return `${prefix}0001`
}
```

### Frontend
- Hapus input kode sapi
- Tampilkan auto-generated code setelah submit
- Atau generate saat page load

---

## Item 10: Fix Empty Data Issue

### Problem
Katalog menampilkan data sapi tapi API returns empty.

### Solution
1. **Check API Response**:
   - Debug API endpoint
   - Verify database connection
   - Check query filters

2. **Common Causes**:
   - `status: AVAILABLE` filter terlalu strict
   - Missing include relations
   - Pagination issue

### Fix
```typescript
// API route
const cattle = await prisma.cattle.findMany({
  where: {
    ...filters,
    // Jangan filter status jika tidak diperlukan
  },
  include: {
    weights: { orderBy: { measurementDate: 'desc' }, take: 1 }
  }
})
```

---

## Item 11: Notification Button Logic

### Solution
1. **Check Unread Notifications**:
   ```typescript
   // Check if user has unread notifications
   const unreadCount = await prisma.notification.count({
     where: { userId, isRead: false }
   })
   ```

2. **Show/Hide Button**:
   - Visible only when unreadCount > 0
   - Badge dengan count

3. **Notification Types**:
   - `BOOKING_REQUEST` - Ada booking baru
   - `BOOKING_CONFIRMED` - Booking dikonfirmasi
   - `QUESTION` - Ada pertanyaan

---

## Item 12: Fix Logout Function

### Solution
Update logout API dan frontend:

```typescript
// API
export async function POST() {
  const cookie = clearAuthCookie()
  return NextResponse.json({ success: true }, {
    headers: { 'Set-Cookie': `${cookie.name}=; Max-Age=0; Path=/` }
  })
}
```

Frontend:
```tsx
const handleLogout = async () => {
  await fetch('/api/auth/logout', { method: 'POST' })
  // Clear local state
  setUser(null)
  router.push('/')
  router.refresh()
}
```

---

## Item 13: Fix Share Button

### Solution
Implement Web Share API dengan fallback:

```typescript
const handleShare = async () => {
  const url = window.location.href
  const text = `Lihat sapi ${cattle.name} (${cattle.code}) di Nusa Farm`
  
  if (navigator.share) {
    try {
      await navigator.share({ title: cattle.name, text, url })
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        copyToClipboard(url)
      }
    }
  } else {
    copyToClipboard(url)
    showToast('Link berhasil disalin!')
  }
}
```

---

## Item 14: Add Quantity Field

### Current State
- `quantity` field sudah ada di schema
- Sudah ada di CattleCard UI

### Solution
1. **Update Admin Form**:
   - Tambah input quantity di form tambah sapi
   - Tambah input quantity di form edit sapi

2. **Update DB**:
   - Quantity sudah ada di schema ✅

3. **Business Logic**:
   - Quantity = 0 → Disable booking
   - Quantity > 0 → Allow booking
   - Decrement saat SOLD

---

## Item 15: Fix PDF QR Code Format

### Solution
1. **Install Library**:
   ```bash
   npm install jspdf qrcode
   ```

2. **Create Print Template**:
   ```typescript
   // lib/utils/qrPdf.ts
   export function generateQRPdf(cattle: CattleWithRelations) {
     const doc = new jsPDF()
     
     // QR Code
     doc.addImage(qrCodeDataUrl, 'PNG', 10, 10, 50, 50)
     
     // Info
     doc.setFontSize(16)
     doc.text(cattle.name, 70, 20)
     doc.setFontSize(12)
     doc.text(`Kode: ${cattle.code}`, 70, 30)
     doc.text(`Jenis: ${cattle.breed}`, 70, 40)
     
     doc.save(`QR-${cattle.code}.pdf`)
   }
   ```

---

## Item 16: Login Modal & Role-based Access

### Solution
1. **Create AuthModal Component**:
   ```
   ┌─────────────────────────────────┐
   │  Masuk / Daftar                  │
   │  ─────────────────────────────── │
   │  [Email]                         │
   │  [Password]                      │
   │  [Masuk]  [Daftar]              │
   │                                  │
   │  ── Atau daftar ──               │
   │  [Nama] [Email] [Password]      │
   │  [Daftar Sekarang]               │
   └─────────────────────────────────┘
   ```

2. **Verification Flow**:
   ```
   Daftar → Show Verification Modal → Input Code → Success
   ```

3. **Role-based Redirect**:
   ```typescript
   // After login
   if (user.role === 'ADMIN' && email === 'admin@sapikatalog.com') {
     router.push('/admin/dashboard')
   } else {
     router.push('/')
   }
   ```

4. **Admin Protection**:
   ```typescript
   // middleware.ts atau layout
   if (path.startsWith('/admin') && user.role !== 'ADMIN') {
     redirect('/')
   }
   ```

---

## Technical Stack Changes

### New Dependencies
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "resend": "^3.x",
    "jspdf": "^2.x",
    "qrcode": "^1.x"
  }
}
```

### New Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend
RESEND_API_KEY=
```

---

## Implementation Order

1. **Quick Fixes** (Items 1, 2, 3, 5)
   - Fix image styling
   - Fix pagination
   - Fix decimal formatting
   - Fix sold overlay

2. **Auth System** (Items 4, 16)
   - Setup Resend
   - Create AuthModal
   - Email verification flow
   - Role-based access

3. **Supabase Setup** (Item 8)
   - Create Supabase project
   - Setup bucket
   - Image uploader component

4. **Booking System** (Items 6, 11)
   - Update status enum
   - Create booking API
   - Notification system

5. **Data & Features** (Items 7, 9, 10, 12, 13, 14, 15)
   - Auto-generate code
   - Fix data issues
   - Implement history pages
   - Fix buttons
   - PDF QR code

---

## Files to Modify/Create

### Modify
- `src/components/catalog/CattleCard.tsx`
- `src/components/catalog/CattleGrid.tsx`
- `src/components/cattle/CattleProfile.tsx`
- `src/app/(public)/page.tsx`
- `src/app/admin/cattle/new/page.tsx`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/verify/route.ts`
- `src/lib/utils/formatters.ts`
- `prisma/schema.prisma`

### Create
- `src/components/auth/AuthModal.tsx`
- `src/components/auth/VerificationForm.tsx`
- `src/components/admin/ImageUploader.tsx`
- `src/components/cattle/WeightHistory.tsx`
- `src/components/cattle/HealthHistory.tsx`
- `src/components/cattle/FeedHistory.tsx`
- `src/components/cattle/MediaGallery.tsx`
- `src/lib/utils/qrPdf.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/email/resend.ts`

---

## Database Migration

```prisma
// schema.prisma changes

enum Status {
  AVAILABLE
  SOLD
  BOOKED  // Changed from RESERVED
  ARCHIVED
}

model User {
  // existing fields...
  // Add notifications relation
  notifications Notification[]
}

model Notification {
  // existing fields...
  type NotificationType
  
  @@index([userId, isRead])
}

enum NotificationType {
  BOOKING_REQUEST
  BOOKING_CONFIRMED
  BOOKING_CANCELLED
  QUESTION
}
```
