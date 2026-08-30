# Nusa Farm Major Revisions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementasi 16 revision items dan fitur baru sesuai design spec untuk Nusa Farm website.

**Architecture:** Implementasi dilakukan secara bertahap dari quick fixes (styling) → Auth System → Supabase → Booking System → Data & Features. Menggunakan modular component structure dengan clear separation of concerns.

**Tech Stack:** Next.js 14, Prisma, PostgreSQL, Resend (email), Supabase Storage, jsPDF, React

## Global Constraints

- Next.js 14 App Router dengan TypeScript
- Prisma ORM dengan PostgreSQL
- Tailwind CSS dengan custom design tokens
- Lucide React untuk icons
- Bahasa Indonesia untuk semua UI text

---

## Implementation Phases

### Phase 1: Quick Fixes (Items 1, 2, 3, 5)

---

### Task 1.1: Fix Image Fit & Sold Overlay Styling

**Files:**
- Modify: `src/components/catalog/CattleCard.tsx:40-70`

**Interfaces:**
- Consumes: `mainImage: string | null`, `status: Status`, `isSold: boolean`
- Produces: Updated CattleCard dengan image styling yang benar

- [ ] **Step 1: Update CattleCard image container**

```tsx
// Image Container - Fixed aspect ratio dengan object-cover
<div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
  {mainImage ? (
    <>
      <Image
        src={mainImage}
        alt={name}
        fill
        className={`object-cover transition-transform duration-300 ${
          isSold ? 'brightness-50 grayscale' : 'group-hover:scale-105'
        }`}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      {/* Sold Overlay */}
      {isSold && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <span className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm">
            TERJUAL
          </span>
        </div>
      )}
    </>
  ) : (
    <div className="flex h-full items-center justify-center bg-[hsl(var(--cream))]">
      <span className="text-[10px] text-[hsl(var(--forest))/50]">Tidak Ada Foto</span>
    </div>
  )}
</div>
```

---

### Task 1.2: Add Pagination Dots & Arrows di Detail Page

**Files:**
- Modify: `src/components/cattle/CattleProfile.tsx`

**Interfaces:**
- Consumes: `allImages: string[]`, `currentImageIndex: number`, `setCurrentImageIndex: function`
- Produces: Image gallery dengan dots, arrows, dan thumbnails

- [ ] **Step 1: Add Pagination Arrows**

```tsx
{allImages.length > 1 && (
  <>
    <button
      onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
      className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
    >
      <ChevronLeft className="h-5 w-5 text-[hsl(var(--forest))]" />
    </button>
    <button
      onClick={() => setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
      className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
    >
      <ChevronRight className="h-5 w-5 text-[hsl(var(--forest))]" />
    </button>
  </>
)}
```

- [ ] **Step 2: Add Pagination Dots**

```tsx
{allImages.length > 1 && (
  <div className="flex justify-center gap-2 mt-2">
    {allImages.map((_, idx) => (
      <button
        key={idx}
        onClick={() => setCurrentImageIndex(idx)}
        className={`h-2.5 w-2.5 rounded-full transition-all ${
          idx === currentImageIndex
            ? 'bg-[hsl(var(--forest))] w-6'
            : 'bg-[hsl(var(--line))] hover:bg-[hsl(var(--forest))/50'
        }`}
      />
    ))}
  </div>
)}
```

- [ ] **Step 3: Add Thumbnail Strip**

```tsx
{allImages.length > 1 && (
  <div className="flex gap-2 overflow-x-auto pb-1 mt-2">
    {allImages.map((img, idx) => (
      <button
        key={idx}
        onClick={() => setCurrentImageIndex(idx)}
        className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
          idx === currentImageIndex
            ? 'border-[hsl(var(--forest))]'
            : 'border-transparent hover:border-[hsl(var(--forest))/50'
        }`}
      >
        <Image src={img} alt="" fill className="object-cover" sizes="64px" />
      </button>
    ))}
  </div>
)}
```

---

### Task 1.3: Fix Decimal Formatting

**Files:**
- Modify: `src/lib/utils/formatters.ts`

**Interfaces:**
- Consumes: `weight: number`, `price: number`, `adg: number`
- Produces: Formatted strings

- [ ] **Step 1: Update formatters.ts**

```typescript
// lib/utils/formatters.ts
export function formatWeight(weight: number | null | undefined): string {
  if (weight === null || weight === undefined) return '-'
  return `${Number(weight).toFixed(1)} kg`
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatADG(adg: number): string {
  if (!adg || isNaN(adg)) return '-'
  return `${adg.toFixed(2)} kg/hari`
}

export function formatHeight(height: number | null | undefined): string {
  if (height === null || height === undefined) return '-'
  return `${Number(height).toFixed(1)} cm`
}

export function formatDate(date: Date | string | null): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
```

---

### Phase 2: Auth System (Items 4, 16)

---

### Task 2.1: Setup Resend & Email Template

**Files:**
- Create: `src/lib/email/resend.ts`
- Create: `src/lib/email/templates/verification.tsx`
- Modify: `src/app/api/auth/register/route.ts`

**Interfaces:**
- Consumes: `email: string`, `code: string`
- Produces: `sendVerificationEmail(email, code)` function

- [ ] **Step 1: Install Resend**

```bash
npm install resend
```

- [ ] **Step 2: Create email client**

```typescript
// src/lib/email/resend.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, code: string) {
  try {
    await resend.emails.send({
      from: 'Nusa Farm <noreply@nusafarm.id>',
      to: email,
      subject: 'Kode Verifikasi Nusa Farm',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #173F31;">Nusa Farm</h1>
          <p>Kode verifikasi Anda:</p>
          <div style="background: #F7F2E7; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 8px;">
            ${code}
          </div>
          <p style="color: #666; margin-top: 20px;">Kode ini berlaku selama 30 menit.</p>
        </div>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}
```

- [ ] **Step 3: Update register API to send email**

```typescript
// src/app/api/auth/register/route.ts
import { sendVerificationEmail } from '@/lib/email/resend'

// ... existing code ...
// After creating user, send email:
await sendVerificationEmail(email, verificationCode)

return NextResponse.json({
  success: true,
  message: 'Akun berhasil dibuat. Silakan verifikasi email Anda.',
  // Hapus verificationCode dari response di production
  // verificationCode,
})
```

---

### Task 2.2: Create AuthModal Component

**Files:**
- Create: `src/components/auth/AuthModal.tsx`
- Create: `src/components/auth/VerificationForm.tsx`
- Modify: `src/components/layout/Navbar.tsx`

**Interfaces:**
- Consumes: `isOpen: boolean`, `onClose: function`
- Produces: Modal dengan login/register/verification flow

- [ ] **Step 1: Create AuthModal.tsx**

```tsx
// src/components/auth/AuthModal.tsx
'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { VerificationForm } from './VerificationForm'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthView = 'login' | 'register' | 'verify'

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [view, setView] = useState<AuthView>('login')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login gagal')
        return
      }

      onClose()
      window.location.reload()
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
          name: formData.get('name'),
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registrasi gagal')
        return
      }

      setEmail(formData.get('email') as string)
      setView('verify')
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--line))]">
          <h2 className="text-lg font-bold text-[hsl(var(--forest))]">
            {view === 'login' && 'Masuk'}
            {view === 'register' && 'Daftar Akun Baru'}
            {view === 'verify' && 'Verifikasi Email'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[hsl(var(--cream))] rounded-full">
            <X className="h-5 w-5 text-[hsl(var(--forest))]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--forest))]">Email</label>
                <input name="email" type="email" required className="mt-1 w-full rounded-lg border border-[hsl(var(--line))] px-3 py-2 focus:ring-2 focus:ring-[hsl(var(--forest))]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--forest))]">Password</label>
                <input name="password" type="password" required className="mt-1 w-full rounded-lg border border-[hsl(var(--line))] px-3 py-2 focus:ring-2 focus:ring-[hsl(var(--forest))]" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[hsl(var(--forest))] text-white py-2.5 rounded-lg font-semibold hover:bg-[hsl(var(--forest2))] disabled:opacity-50">
                {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Masuk'}
              </button>
              <p className="text-center text-sm text-[hsl(var(--forest))/60]">
                Belum punya akun?{' '}
                <button type="button" onClick={() => setView('register')} className="text-[hsl(var(--forest))] font-semibold hover:underline">
                  Daftar sekarang
                </button>
              </p>
            </form>
          )}

          {view === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--forest))]">Nama</label>
                <input name="name" type="text" required className="mt-1 w-full rounded-lg border border-[hsl(var(--line))] px-3 py-2 focus:ring-2 focus:ring-[hsl(var(--forest))]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--forest))]">Email</label>
                <input name="email" type="email" required className="mt-1 w-full rounded-lg border border-[hsl(var(--line))] px-3 py-2 focus:ring-2 focus:ring-[hsl(var(--forest))]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--forest))]">Password</label>
                <input name="password" type="password" minLength={6} required className="mt-1 w-full rounded-lg border border-[hsl(var(--line))] px-3 py-2 focus:ring-2 focus:ring-[hsl(var(--forest))]" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[hsl(var(--forest))] text-white py-2.5 rounded-lg font-semibold hover:bg-[hsl(var(--forest2))] disabled:opacity-50">
                {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Daftar'}
              </button>
              <p className="text-center text-sm text-[hsl(var(--forest))/60]">
                Sudah punya akun?{' '}
                <button type="button" onClick={() => setView('login')} className="text-[hsl(var(--forest))] font-semibold hover:underline">
                  Masuk
                </button>
              </p>
            </form>
          )}

          {view === 'verify' && (
            <VerificationForm
              email={email}
              onSuccess={() => {
                onClose()
                window.location.reload()
              }}
              onBack={() => setView('login')}
            />
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create VerificationForm.tsx**

```tsx
// src/components/auth/VerificationForm.tsx
'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface VerificationFormProps {
  email: string
  onSuccess: () => void
  onBack: () => void
}

export function VerificationForm({ email, onSuccess, onBack }: VerificationFormProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Verifikasi gagal')
        return
      }

      setSuccess(true)
      setTimeout(onSuccess, 1500)
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)
    try {
      await fetch('/api/auth/resend-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-lg font-bold text-[hsl(var(--forest))]">Email Diverifikasi!</h3>
        <p className="text-[hsl(var(--forest))/60] mt-2">Akun Anda sudah aktif.</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-[hsl(var(--forest))/70] mb-4">
        Kami telah mengirim kode verifikasi ke <strong>{email}</strong>
      </p>
      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--forest))]">Kode Verifikasi</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            placeholder="000000"
            required
            className="mt-1 w-full rounded-lg border border-[hsl(var(--line))] px-3 py-2 text-center text-2xl tracking-widest focus:ring-2 focus:ring-[hsl(var(--forest))]"
          />
        </div>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}
        <button type="submit" disabled={loading || code.length !== 6} className="w-full bg-[hsl(var(--forest))] text-white py-2.5 rounded-lg font-semibold hover:bg-[hsl(var(--forest2))] disabled:opacity-50">
          {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Verifikasi'}
        </button>
      </form>
      <div className="mt-4 text-center">
        <button onClick={handleResend} disabled={loading} className="text-sm text-[hsl(var(--forest))] hover:underline">
          Kirim ulang kode
        </button>
        <span className="mx-2 text-[hsl(var(--forest))/30]">|</span>
        <button onClick={onBack} className="text-sm text-[hsl(var(--forest))/60] hover:underline">
          Kembali
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Update Navbar to use AuthModal**

```tsx
// src/components/layout/Navbar.tsx - Add:
const [authModalOpen, setAuthModalOpen] = useState(false)

// Replace the login button:
<button onClick={() => setAuthModalOpen(true)} className="...">Masuk / Daftar</button>

// Add at the end:
<AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
```

---

### Phase 3: Supabase Setup (Item 8)

---

### Task 3.1: Setup Supabase Storage for Images

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/components/admin/ImageUploader.tsx`

**Interfaces:**
- Consumes: `file: File`
- Produces: `uploadImage(file): Promise<string>` (returns URL)

- [ ] **Step 1: Install Supabase**

```bash
npm install @supabase/supabase-js
```

- [ ] **Step 2: Create Supabase client**

```typescript
// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 3: Create ImageUploader component**

```tsx
// src/components/admin/ImageUploader.tsx
'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface ImageUploaderProps {
  value?: string
  onChange: (url: string) => void
  folder?: string
}

export function ImageUploader({ value, onChange, folder = 'cattle' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File) => {
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`
      const path = `${folder}/${fileName}`

      const { data, error } = await supabase.storage
        .from('cattle-images')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      const { data: urlData } = supabase.storage
        .from('cattle-images')
        .getPublicUrl(data.path)

      onChange(urlData.publicUrl)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Gagal mengupload gambar')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      uploadFile(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  if (value) {
    return (
      <div className="relative w-full h-40 rounded-lg overflow-hidden border border-[hsl(var(--line))]">
        <img src={value} alt="Preview" className="w-full h-full object-cover" />
        <button
          onClick={() => onChange('')}
          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`w-full h-40 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
        dragOver ? 'border-[hsl(var(--forest))] bg-[hsl(var(--cream))]' : 'border-[hsl(var(--line))] hover:border-[hsl(var(--forest))]'
      }`}
    >
      {uploading ? (
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--forest))]" />
      ) : (
        <>
          <Upload className="h-8 w-8 text-[hsl(var(--forest))/50] mb-2" />
          <p className="text-sm text-[hsl(var(--forest))/60]">
            Klik atau drag gambar ke sini
          </p>
        </>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </div>
  )
}
```

---

### Phase 4: Booking System (Items 6, 11)

---

### Task 4.1: Update Status Enum & Create Booking API

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/app/api/bookings/route.ts`
- Create: `src/app/api/notifications/route.ts`

**Interfaces:**
- Consumes: `cattleId`, `userId`, `quantity`
- Produces: `Booking` object

- [ ] **Step 1: Update Prisma schema**

```prisma
// prisma/schema.prisma
enum Status {
  AVAILABLE
  SOLD
  BOOKED  // Changed from RESERVED
  ARCHIVED
}

model Booking {
  id          String        @id @default(cuid())
  cattleId   String        @map("cattle_id")
  cattle     Cattle        @relation(fields: [cattleId], references: [id], onDelete: Cascade)
  userId     String        @map("user_id")
  user       User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  quantity   Int           @default(1)
  status     BookingStatus @default(PENDING)
  notes      String?
  createdAt  DateTime     @default(now()) @map("created_at")
  updatedAt  DateTime     @updatedAt @map("updated_at")

  @@index([cattleId])
  @@index([userId])
  @@index([status])
}

model Notification {
  id        String   @id @default(cuid())
  userId    String?  @map("user_id")
  title     String
  message   String   @db.Text
  type      String   @default("INFO")
  isRead    Boolean  @default(false)
  data      String?  @db.Text
  createdAt DateTime @default(now()) @map("created_at")

  @@index([userId])
  @@index([isRead])
}
```

- [ ] **Step 2: Create booking API**

```typescript
// src/app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentUser } from '@/lib/auth/jwt'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { cattleId, quantity = 1, notes } = await request.json()

    if (!cattleId) {
      return NextResponse.json({ error: 'Cattle ID diperlukan' }, { status: 400 })
    }

    // Check cattle availability
    const cattle = await prisma.cattle.findUnique({
      where: { id: cattleId }
    })

    if (!cattle) {
      return NextResponse.json({ error: 'Sapi tidak ditemukan' }, { status: 404 })
    }

    if (cattle.status !== 'AVAILABLE' || cattle.quantity < quantity) {
      return NextResponse.json({ error: 'Sapi tidak tersedia' }, { status: 400 })
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        cattleId,
        userId: user.userId || user.adminId, // Adjust based on your User model
        quantity,
        notes,
        status: 'PENDING'
      }
    })

    // Create notification for admin
    await prisma.notification.create({
      data: {
        title: 'Booking Baru',
        message: `Ada booking baru untuk sapi ${cattle.name} (${cattle.code}) dari ${user.email}`,
        type: 'BOOKING_REQUEST',
        data: JSON.stringify({ bookingId: booking.id, cattleId })
      }
    })

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: user.userId || user.adminId },
      include: {
        cattle: {
          select: { id: true, code: true, name: true, breed: true, mainImage: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
```

---

### Phase 5: Data & Features (Items 7, 9, 10, 12, 13, 14, 15)

---

### Task 5.1: Implement Auto-Generate Cattle Code

**Files:**
- Create: `src/lib/utils/cattleCode.ts`
- Modify: `src/app/api/admin/cattle/route.ts`

**Interfaces:**
- Consumes: none
- Produces: `generateCattleCode(): Promise<string>`

- [ ] **Step 1: Create cattle code generator**

```typescript
// src/lib/utils/cattleCode.ts
import { prisma } from '@/lib/db/prisma'

export async function generateCattleCode(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `NF-${year}`

  // Get last code with this prefix
  const lastCattle = await prisma.cattle.findFirst({
    where: {
      code: {
        startsWith: prefix
      }
    },
    orderBy: {
      code: 'desc'
    }
  })

  if (lastCattle) {
    const lastNum = parseInt(lastCattle.code.split('-').pop() || '0')
    return `${prefix}${String(lastNum + 1).padStart(4, '0')}`
  }

  return `${prefix}0001`
}
```

- [ ] **Step 2: Update admin cattle API**

```typescript
// src/app/api/admin/cattle/route.ts - POST handler
import { generateCattleCode } from '@/lib/utils/cattleCode'

// In POST handler:
export async function POST(request: NextRequest) {
  // ... validation ...
  
  // Generate code if not provided
  let code = body.code
  if (!code) {
    code = await generateCattleCode()
  }
  
  // Create cattle
  const cattle = await prisma.cattle.create({
    data: {
      code,
      name: body.name,
      breed: body.breed,
      status: body.status || 'AVAILABLE',
      birthDate: new Date(body.birthDate),
      height: body.height ? parseFloat(body.height) : null,
      price: body.price,
      targetWeight: body.targetWeight ? parseFloat(body.targetWeight) : null,
      description: body.description || null,
      mainImage: body.mainImage || null,
      quantity: body.quantity || 1,
    }
  })
  
  return NextResponse.json({ success: true, cattle })
}
```

---

### Task 5.2: Add Quantity Field to Admin Form

**Files:**
- Modify: `src/app/admin/cattle/new/page.tsx`
- Modify: `src/app/admin/cattle/[id]/page.tsx`

**Interfaces:**
- Consumes: `form: object`
- Produces: Updated form dengan quantity field

- [ ] **Step 1: Add quantity to new cattle form**

```tsx
// src/app/admin/cattle/new/page.tsx
// Add to form state:
const [form, setForm] = useState({
  // ... existing fields ...
  quantity: '1',
})

// Add to form JSX:
<div className="space-y-2">
  <Label htmlFor="quantity">Jumlah Stok *</Label>
  <Input
    id="quantity"
    name="quantity"
    type="number"
    min="1"
    value={form.quantity}
    onChange={handleChange}
    required
  />
</div>
```

---

### Task 5.3: Implement History Tabs Components

**Files:**
- Create: `src/components/cattle/WeightHistoryTab.tsx`
- Create: `src/components/cattle/HealthHistoryTab.tsx`
- Create: `src/components/cattle/FeedHistoryTab.tsx`
- Create: `src/components/cattle/MediaTab.tsx`
- Modify: `src/components/cattle/CattleProfile.tsx`

**Interfaces:**
- Consumes: `weights: CattleWeight[]`, `healthRecords: CattleHealthRecord[]`, etc.
- Produces: Tab content components

- [ ] **Step 1: Create WeightHistoryTab**

```tsx
// src/components/cattle/WeightHistoryTab.tsx
'use client'

import { CattleWeightWithMedia } from '@/types'
import { formatWeight, formatDate } from '@/lib/utils/formatters'
import { TrendingUp } from 'lucide-react'

interface WeightHistoryTabProps {
  weights: CattleWeightWithMedia[]
}

export function WeightHistoryTab({ weights }: WeightHistoryTabProps) {
  if (!weights || weights.length === 0) {
    return (
      <div className="text-center py-12 text-[hsl(var(--forest))/60]">
        <div className="text-4xl mb-2">📋</div>
        <p className="text-[14px]">Belum ada data penimbangan.</p>
      </div>
    )
  }

  // Group by month
  const grouped = weights.reduce((acc, w) => {
    const month = new Date(w.measurementDate).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    if (!acc[month]) acc[month] = []
    acc[month].push(w)
    return acc
  }, {} as Record<string, CattleWeightWithMedia[]>)

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([month, items]) => (
        <div key={month}>
          <h4 className="text-sm font-bold text-[hsl(var(--forest))] mb-3">{month}</h4>
          <div className="space-y-2">
            {items.map((weight) => (
              <div key={weight.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-[hsl(var(--line))]">
                <div>
                  <div className="text-sm font-medium text-[hsl(var(--forest))]">
                    {formatDate(weight.measurementDate)}
                  </div>
                  {weight.notes && (
                    <div className="text-xs text-[hsl(var(--forest))/60]">{weight.notes}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[hsl(var(--forest))]">
                    {formatWeight(weight.weight)}
                  </div>
                  <TrendingUp className="h-4 w-4 text-[hsl(var(--olive))] ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create HealthHistoryTab**

```tsx
// src/components/cattle/HealthHistoryTab.tsx
'use client'

import { CattleHealthRecordWithMedia } from '@/types'
import { formatDate } from '@/lib/utils/formatters'
import { HEALTH_STATUS_LABELS, HealthStatus } from '@/types'

interface HealthHistoryTabProps {
  records: CattleHealthRecordWithMedia[]
}

const statusColors: Record<HealthStatus, string> = {
  SEHAT: 'bg-green-100 text-green-700',
  DALAM_PERAWATAN: 'bg-yellow-100 text-yellow-700',
  OBSERVASI: 'bg-orange-100 text-orange-700',
  SAKIT: 'bg-red-100 text-red-700',
  SEMBUH: 'bg-blue-100 text-blue-700',
}

export function HealthHistoryTab({ records }: HealthHistoryTabProps) {
  if (!records || records.length === 0) {
    return (
      <div className="text-center py-12 text-[hsl(var(--forest))/60]">
        <div className="text-4xl mb-2">🏥</div>
        <p className="text-[14px]">Belum ada data kesehatan.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <div key={record.id} className="p-4 bg-white rounded-lg border border-[hsl(var(--line))]">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-sm font-medium text-[hsl(var(--forest))]">
                {formatDate(record.recordDate)}
              </div>
              <div className="text-xs text-[hsl(var(--forest))/60]">{record.healthType}</div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[record.status]}`}>
              {HEALTH_STATUS_LABELS[record.status]}
            </span>
          </div>
          {record.notes && (
            <p className="text-sm text-[hsl(var(--forest))/70]">{record.notes}</p>
          )}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create FeedHistoryTab**

```tsx
// src/components/cattle/FeedHistoryTab.tsx
'use client'

import { CattleFeedRecord } from '@/types'
import { formatDate } from '@/lib/utils/formatters'
import { Sprout, Wheat, Pill, Droplets } from 'lucide-react'

interface FeedHistoryTabProps {
  records: CattleFeedRecord[]
}

const feedIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Rumput': Sprout,
  'Konsentrat': Wheat,
  'Vitamin': Pill,
  'Air': Droplets,
  'default': Sprout,
}

export function FeedHistoryTab({ records }: FeedHistoryTabProps) {
  if (!records || records.length === 0) {
    return (
      <div className="text-center py-12 text-[hsl(var(--forest))/60]">
        <div className="text-4xl mb-2">🌿</div>
        <p className="text-[14px]">Belum ada data pakan.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {records.map((record) => {
        const Icon = feedIcons[record.feedType] || feedIcons.default
        return (
          <div key={record.id} className="p-4 bg-white rounded-lg border border-[hsl(var(--line))]">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[hsl(var(--cream))] rounded-lg">
                <Icon className="h-5 w-5 text-[hsl(var(--forest))]" />
              </div>
              <div>
                <div className="font-medium text-[hsl(var(--forest))]">{record.feedType}</div>
                <div className="text-sm text-[hsl(var(--forest))/60]">{record.amount} - {record.frequency}</div>
              </div>
            </div>
            {record.notes && (
              <p className="text-xs text-[hsl(var(--forest))/70] mt-2">{record.notes}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Create MediaTab**

```tsx
// src/components/cattle/MediaTab.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { CattleMedia } from '@/types'

interface MediaTabProps {
  media: CattleMedia[]
}

export function MediaTab({ media }: MediaTabProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!media || media.length === 0) {
    return (
      <div className="text-center py-12 text-[hsl(var(--forest))/60]">
        <div className="text-4xl mb-2">📷</div>
        <p className="text-[14px]">Belum ada dokumentasi.</p>
      </div>
    )
  }

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {media.map((item, index) => (
          <button
            key={item.id}
            onClick={() => openLightbox(index)}
            className="relative aspect-square rounded-lg overflow-hidden group"
          >
            <Image
              src={item.fileUrl}
              alt={item.title || 'Dokumentasi'}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            {item.title && (
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                <span className="text-white text-xs">{item.title}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center">
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full">
            <X className="h-6 w-6" />
          </button>
          <button onClick={() => setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/20 rounded-full">
            <ChevronLeft className="h-8 w-8" />
          </button>
          <div className="relative w-[80vw] h-[80vh]">
            <Image src={media[currentIndex].fileUrl} alt="" fill className="object-contain" />
          </div>
          <button onClick={() => setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1))} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/20 rounded-full">
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>
      )}
    </>
  )
}
```

---

### Task 5.4: Fix Buttons (Share, Logout)

**Files:**
- Modify: `src/components/cattle/CattleProfile.tsx`
- Create: `src/components/auth/LogoutButton.tsx`

**Interfaces:**
- Consumes: `cattle: CattleWithRelations`
- Produces: Working share and logout buttons

- [ ] **Step 1: Fix Share Button**

```tsx
// In CattleProfile.tsx - add handleShare function
const handleShare = async () => {
  const url = window.location.href
  const text = `Lihat sapi ${cattle.name} (${cattle.code}) di Nusa Farm`

  if (navigator.share) {
    try {
      await navigator.share({ title: cattle.name, text, url })
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(url)
        alert('Link berhasil disalin!')
      }
    }
  } else {
    await navigator.clipboard.writeText(url)
    alert('Link berhasil disalin!')
  }
}

// Button JSX:
<button onClick={handleShare} className="...">
  <Share2 className="h-4 w-4" />
  Bagikan
</button>
```

- [ ] **Step 2: Create LogoutButton**

```tsx
// src/components/auth/LogoutButton.tsx
'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700">
      <LogOut className="h-4 w-4" />
      Keluar
    </button>
  )
}
```

---

### Task 5.5: Implement PDF QR Code

**Files:**
- Create: `src/lib/utils/qrPdf.ts`
- Modify: `src/components/cattle/QRCodeCard.tsx`

**Interfaces:**
- Consumes: `cattle: CattleWithRelations`
- Produces: PDF file download

- [ ] **Step 1: Install jsPDF and qrcode**

```bash
npm install jspdf qrcode
```

- [ ] **Step 2: Create QR PDF utility**

```typescript
// src/lib/utils/qrPdf.ts
import jsPDF from 'jspdf'
import QRCode from 'qrcode'

export async function generateQRPdf(cattle: {
  code: string
  name: string
  breed: string
  price: number
}) {
  const doc = new jsPDF()

  // Generate QR Code
  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sapi/${cattle.code}`
  const qrDataUrl = await QRCode.toDataURL(qrUrl, {
    width: 200,
    margin: 1,
    color: { dark: '#173F31', light: '#ffffff' }
  })

  // Add QR Code
  doc.addImage(qrDataUrl, 'PNG', 15, 15, 50, 50)

  // Add Info
  doc.setFontSize(24)
  doc.setTextColor(23, 63, 49)
  doc.text('NUSA FARM', 75, 25)

  doc.setFontSize(12)
  doc.setTextColor(100)
  doc.text('Sapi Pilihan Qurban', 75, 32)

  doc.setFontSize(16)
  doc.setTextColor(0)
  doc.text(cattle.name, 75, 45)
  doc.setFontSize(12)
  doc.text(`Kode: ${cattle.code}`, 75, 52)
  doc.text(`Jenis: ${cattle.breed}`, 75, 59)

  doc.setFontSize(14)
  doc.text(`Harga: Rp ${cattle.price.toLocaleString('id-ID')}`, 75, 70)

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(150)
  doc.text('Scan QR code untuk melihat detail sapi', 15, 75)
  doc.text(`Generated: ${new Date().toLocaleDateString('id-ID')}`, 15, 80)

  // Save
  doc.save(`QR-${cattle.code}.pdf`)
}
```

---

### Task 5.6: Fix Logout API

**Files:**
- Modify: `src/app/api/auth/logout/route.ts`

**Interfaces:**
- Consumes: none
- Produces: Cleared auth cookie

- [ ] **Step 1: Update logout API**

```typescript
// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { success: true, message: 'Logged out successfully' },
    {
      headers: {
        'Set-Cookie': 'auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
      }
    }
  )
}
```

---

### Task 5.7: Add Notification Badge to Navbar

**Files:**
- Modify: `src/components/layout/Navbar.tsx`
- Create: `src/app/api/notifications/unread-count/route.ts`

**Interfaces:**
- Consumes: none
- Produces: Badge dengan unread count

- [ ] **Step 1: Create unread count API**

```typescript
// src/app/api/notifications/unread-count/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentUser } from '@/lib/auth/jwt'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ count: 0 })
    }

    const count = await prisma.notification.count({
      where: {
        userId: user.userId || user.adminId,
        isRead: false
      }
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Notification count error:', error)
    return NextResponse.json({ count: 0 })
  }
}
```

- [ ] **Step 2: Add notification badge to Navbar**

```tsx
// In Navbar.tsx
const [unreadCount, setUnreadCount] = useState(0)

useEffect(() => {
  const fetchUnread = async () => {
    const res = await fetch('/api/notifications/unread-count')
    const data = await res.json()
    setUnreadCount(data.count)
  }
  fetchUnread()
}, [])

// Add badge to notification icon:
{unreadCount > 0 && (
  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
    {unreadCount > 9 ? '9+' : unreadCount}
  </span>
)}
```

---

## Verification Steps

After implementing all tasks, verify:

1. [ ] Image cards display correctly with `object-cover`
2. [ ] Pagination dots and arrows work in detail page
3. [ ] Decimal formatting shows 1 decimal place
4. [ ] Sold overlay displays "TERJUAL" text
5. [ ] Registration sends email via Resend
6. [ ] Auth modal shows login/register/verify flow
7. [ ] Supabase upload works for images
8. [ ] Booking creates notification for admin
9. [ ] Cattle code auto-generates correctly
10. [ ] Quantity field appears in admin forms
11. [ ] History tabs display data correctly
12. [ ] Share button copies link
13. [ ] Logout clears session
14. [ ] QR PDF downloads correctly
15. [ ] Notification badge shows unread count

---

## Files Summary

### Create (15 files)
- `src/lib/email/resend.ts`
- `src/lib/supabase/client.ts`
- `src/lib/utils/cattleCode.ts`
- `src/lib/utils/qrPdf.ts`
- `src/components/auth/AuthModal.tsx`
- `src/components/auth/VerificationForm.tsx`
- `src/components/auth/LogoutButton.tsx`
- `src/components/admin/ImageUploader.tsx`
- `src/components/cattle/WeightHistoryTab.tsx`
- `src/components/cattle/HealthHistoryTab.tsx`
- `src/components/cattle/FeedHistoryTab.tsx`
- `src/components/cattle/MediaTab.tsx`
- `src/app/api/bookings/route.ts`
- `src/app/api/notifications/route.ts`
- `src/app/api/notifications/unread-count/route.ts`

### Modify (12 files)
- `prisma/schema.prisma`
- `src/lib/utils/formatters.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/verify/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/components/catalog/CattleCard.tsx`
- `src/components/cattle/CattleProfile.tsx`
- `src/components/layout/Navbar.tsx`
- `src/app/admin/cattle/new/page.tsx`
- `src/app/admin/cattle/[id]/page.tsx`
- `src/app/api/admin/cattle/route.ts`
- `src/components/cattle/QRCodeCard.tsx`
