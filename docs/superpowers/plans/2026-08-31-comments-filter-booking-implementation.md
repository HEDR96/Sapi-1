# Comments, Filter, and Booking System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 3 features: (1) Comment system with form on cattle detail page, (2) Search filter integrated into CatalogSection, (3) Booking system with login requirement, admin approval workflow, and notifications.

**Architecture:** 
- CommentSection component added to CattleProfile below tabs
- SearchFilter integrated into CatalogSection with client-side filtering
- Booking flow: login required → BookingModal form → API → Notification → Admin approval page

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Prisma, Lucide React

## Global Constraints

- Bahasa Indonesia untuk semua UI text
- Lucide React untuk icons
- Tailwind CSS dengan custom design tokens (forest, olive, cream, dll)
- Mobile-first responsive design
- Auth state tracked via cookies (existing pattern)

---

## Task 1: Comment Section Component

**Files:**
- Create: `src/components/cattle/CommentSection.tsx`
- Modify: `src/components/cattle/CattleProfile.tsx`
- Modify: `src/app/api/comments/route.ts` (fix userId issue)

**Interfaces:**
- Consumes: `cattleId: string`, `cattleCode: string`
- Produces: `<CommentSection>` dengan list komentar dan form
- Uses existing `/api/comments` endpoints

- [ ] **Step 1: Create CommentSection.tsx**

```tsx
// src/components/cattle/CommentSection.tsx
'use client'

import { useState, useEffect } from 'react'
import { formatRelativeTime } from '@/lib/utils/formatters'
import { MessageCircle, Send, Trash2, Loader2, User } from 'lucide-react'

interface Comment {
  id: string
  content: string
  createdAt: string
  user: { id: string; name: string | null }
  cattle: { code: string; name: string }
}

interface CommentSectionProps {
  cattleId: string
  cattleCode: string
  currentUserId?: string
}

export function CommentSection({ cattleId, cattleCode, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchComments()
  }, [cattleId])

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?cattleId=${cattleId}&limit=50`)
      const data = await res.json()
      setComments(data.comments || [])
    } catch {
      console.error('Failed to fetch comments')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || newComment.length < 3) return

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cattleId, content: newComment.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Gagal mengirim komentar')
      }

      setNewComment('')
      fetchComments()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Hapus komentar ini?')) return

    try {
      const res = await fetch(`/api/comments?id=${commentId}`, { method: 'DELETE' })
      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId))
      }
    } catch {
      console.error('Failed to delete comment')
    }
  }

  return (
    <div className="mt-6 border-t border-[hsl(var(--line))] pt-6">
      <h3 className="text-lg font-bold text-[hsl(var(--forest))] mb-4 flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        Komentar ({comments.length})
      </h3>

      {/* Comment Form */}
      {!currentUserId ? (
        <div className="mb-6 p-4 bg-[hsl(var(--cream))] rounded-lg text-center">
          <p className="text-sm text-[hsl(var(--forest))/70] mb-2">
            Login untuk memberikan komentar
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal'))}
            className="text-sm font-semibold text-[hsl(var(--forest))] hover:underline"
          >
            Masuk / Daftar
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Tulis komentar Anda..."
            rows={3}
            maxLength={1000}
            className="w-full rounded-lg border border-[hsl(var(--line))] p-3 text-sm text-[hsl(var(--forest))] placeholder:text-[hsl(var(--forest))/50] focus:border-[hsl(var(--forest))] focus:ring-2 focus:ring-[hsl(var(--forest))] focus:outline-none resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-[hsl(var(--forest))/50]">
              {newComment.length}/1000 karakter
            </span>
            <button
              type="submit"
              disabled={submitting || newComment.length < 3}
              className="flex items-center gap-2 rounded-lg bg-[hsl(var(--forest))] px-4 py-2 text-sm font-semibold text-white hover:bg-[hsl(var(--forest2))] disabled:opacity-50 transition-colors"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Kirim
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </form>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--cream))]" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-[hsl(var(--cream))] rounded mb-2" />
                  <div className="h-3 w-full bg-[hsl(var(--cream))] rounded mb-1" />
                  <div className="h-3 w-2/3 bg-[hsl(var(--cream))] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-[hsl(var(--forest))/50]">
          <div className="text-4xl mb-2">💬</div>
          <p className="text-sm">Belum ada komentar. Jadilah yang pertama!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3 p-3 rounded-lg bg-white border border-[hsl(var(--line))]">
              <div className="w-10 h-10 rounded-full bg-[hsl(var(--forest))] flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm text-[hsl(var(--forest))]">
                    {comment.user.name || 'User'}
                  </span>
                  <span className="text-xs text-[hsl(var(--forest))/50]">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[hsl(var(--forest))/80] whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
              </div>
              {currentUserId === comment.user.id && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="p-1.5 text-[hsl(var(--forest))/40 hover:text-red-500 transition-colors"
                  title="Hapus komentar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Modify CattleProfile.tsx to add CommentSection**

Locate the closing of the tabs content (after `</div>` that closes tab content) and add CommentSection:

```tsx
// Add import at top
import { CommentSection } from './CommentSection'

// In CattleProfile component, add state for current user
const [currentUserId, setCurrentUserId] = useState<string | undefined>()

useEffect(() => {
  // Fetch current user
  fetch('/api/auth/me')
    .then(res => res.ok ? res.json() : null)
    .then(data => setCurrentUserId(data?.user?.id))
    .catch(() => {})
}, [])

// After the tab content section (after the last tab's content div), add:
<CommentSection 
  cattleId={cattle.id} 
  cattleCode={cattle.code}
  currentUserId={currentUserId}
/>
```

- [ ] **Step 3: Fix userId issue in comments API**

Update `src/app/api/comments/route.ts` POST handler:

```typescript
// In POST handler, fix userId assignment:
// Replace: userId: user.userId || '',
// With:
const userId = user.userId || (user as any).id || ''
if (!userId) {
  return NextResponse.json({ error: 'User ID tidak ditemukan' }, { status: 400 })
}

// Then use userId in create
const comment = await prisma.comment.create({
  data: {
    userId,  // Use the corrected userId
    cattleId,
    content,
  },
  // ...
})
```

---

## Task 2: Search Filter Integration in CatalogSection

**Files:**
- Modify: `src/components/catalog/CatalogSection.tsx`
- Modify: `src/app/(public)/page.tsx`

**Interfaces:**
- Consumes: SearchFilter component, cattle data
- Produces: Filtered cattle display in CatalogSection

- [ ] **Step 1: Update CatalogSection with SearchFilter**

Replace the entire CatalogSection component:

```tsx
// src/components/catalog/CatalogSection.tsx
'use client'

import { useState, useMemo } from 'react'
import { CatalogSwiper } from './CatalogSwiper'
import { CattleCard } from './CattleCard'
import { SearchFilter, Filters } from './SearchFilter'
import { CattleWithLatestWeight, CattleWithRelations } from '@/types'
import { LayoutGrid, Columns3 } from 'lucide-react'

interface CatalogSectionProps {
  cattle: CattleWithLatestWeight[]
  onSelect: (cattle: CattleWithLatestWeight) => void
  selectedId?: string
}

export function CatalogSection({ cattle, onSelect, selectedId }: CatalogSectionProps) {
  const [viewMode, setViewMode] = useState<'swiper' | 'grid'>('swiper')
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: 'ALL',
    breed: 'ALL',
  })

  // Client-side filtering
  const filteredCattle = useMemo(() => {
    return cattle.filter(c => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch = 
          c.name.toLowerCase().includes(searchLower) ||
          c.code.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Status filter
      if (filters.status !== 'ALL' && c.status !== filters.status) {
        return false
      }

      // Breed filter
      if (filters.breed !== 'ALL' && c.breed !== filters.breed) {
        return false
      }

      // Price filter
      if (filters.minPrice && Number(c.price) < filters.minPrice) return false
      if (filters.maxPrice && Number(c.price) > filters.maxPrice) return false

      // Weight filter
      if (filters.minWeight && (!c.lastWeight || c.lastWeight < filters.minWeight)) return false
      if (filters.maxWeight && (!c.lastWeight || c.lastWeight > filters.maxWeight)) return false

      return true
    })
  }, [cattle, filters])

  const handleSearch = (newFilters: Filters) => {
    setFilters(newFilters)
  }

  return (
    <section id="katalog" className="py-6 bg-[hsl(var(--cream2))]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[hsl(var(--forest))]">Katalog Sapi</h2>
            <p className="text-sm text-[hsl(var(--forest))/60]">
              {viewMode === 'swiper'
                ? `Menampilkan ${filteredCattle.length} dari ${cattle.length} sapi`
                : `Menampilkan ${filteredCattle.length} sapi`}
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-[hsl(var(--line))] bg-white p-1">
            <button
              onClick={() => setViewMode('swiper')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'swiper'
                  ? 'bg-[hsl(var(--forest))] text-white'
                  : 'text-[hsl(var(--forest))/60] hover:bg-[hsl(var(--cream))]'
              }`}
            >
              <Columns3 className="h-4 w-4" />
              <span className="hidden sm:inline">Swiper</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[hsl(var(--forest))] text-white'
                  : 'text-[hsl(var(--forest))/60] hover:bg-[hsl(var(--cream))]'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>
        </div>

        {/* Search Filter */}
        <div className="mb-4">
          <SearchFilter onSearch={handleSearch} initialFilters={filters} />
        </div>

        {/* Content */}
        {filteredCattle.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-[hsl(var(--forest))/50]">
            <div className="text-4xl mb-2">🔍</div>
            <p>Tidak ada sapi yang sesuai filter</p>
            <button
              onClick={() => setFilters({ search: '', status: 'ALL', breed: 'ALL' })}
              className="mt-2 text-sm text-[hsl(var(--forest))] hover:underline"
            >
              Reset filter
            </button>
          </div>
        ) : viewMode === 'swiper' ? (
          <CatalogSwiper
            cattle={filteredCattle}
            onSelect={onSelect}
            selectedId={selectedId}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredCattle.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelect(c)}
                className={`cursor-pointer rounded-xl border-2 transition-all ${
                  selectedId === c.id
                    ? 'border-[hsl(var(--forest))] ring-2 ring-[hsl(var(--forest))] ring-offset-2'
                    : 'border-transparent hover:border-[hsl(var(--line))]'
                }`}
              >
                <CattleCard
                  id={c.id}
                  code={c.code}
                  name={c.name}
                  breed={c.breed}
                  status={c.status}
                  price={Number(c.price)}
                  lastWeight={c.lastWeight}
                  mainImage={c.mainImage}
                  quantity={c.quantity}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
```

---

## Task 3: Booking System - API

**Files:**
- Create: `src/app/api/bookings/route.ts`
- Create: `src/app/api/auth/me/route.ts` (if not exists)

**Interfaces:**
- Consumes: `cattleId`, `phone`, `quantity`, `notes`
- Produces: `Booking` model, `Notification` for admin
- Uses existing `BookingStatus` enum (PENDING, CONFIRMED, CANCELLED, COMPLETED)

- [ ] **Step 1: Create /api/auth/me endpoint**

```typescript
// src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/jwt'

export async function GET() {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json({ user: null })
  }

  return NextResponse.json({
    user: {
      id: user.userId || (user as any).id,
      email: user.email,
      name: (user as any).name,
      role: (user as any).role,
    }
  })
}
```

- [ ] **Step 2: Create /api/bookings endpoint**

```typescript
// src/app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentUser } from '@/lib/auth/jwt'

// GET /api/bookings - Get user's bookings
export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Login diperlukan' }, { status: 401 })
  }

  const userId = user.userId || (user as any).id

  try {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        cattle: { select: { id: true, code: true, name: true, mainImage: true, price: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// POST /api/bookings - Create new booking
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Login diperlukan' }, { status: 401 })
  }

  const userId = user.userId || (user as any).id

  try {
    const { cattleId, phone, quantity = 1, notes } = await request.json()

    // Validate required fields
    if (!cattleId || !phone) {
      return NextResponse.json({ error: 'ID sapi dan nomor telepon wajib diisi' }, { status: 400 })
    }

    // Validate phone format (Indonesian format)
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json({ error: 'Format nomor telepon tidak valid' }, { status: 400 })
    }

    // Check cattle exists and is available
    const cattle = await prisma.cattle.findUnique({
      where: { id: cattleId },
      select: { id: true, status: true, quantity: true, name: true, code: true }
    })

    if (!cattle) {
      return NextResponse.json({ error: 'Sapi tidak ditemukan' }, { status: 404 })
    }

    if (cattle.status !== 'AVAILABLE') {
      return NextResponse.json({ error: 'Sapi tidak tersedia untuk booking' }, { status: 400 })
    }

    if (quantity > cattle.quantity) {
      return NextResponse.json({ error: `Stok tidak mencukupi (tersedia: ${cattle.quantity})` }, { status: 400 })
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        cattleId,
        userId,
        quantity,
        notes: notes || null,
        status: 'PENDING',
      },
      include: {
        cattle: { select: { id: true, code: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    })

    // Create notification for super admin
    // Find admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    })

    // Create notifications for all admins
    await prisma.notification.createMany({
      data: admins.map(admin => ({
        userId: admin.id,
        title: 'Permintaan Booking Baru',
        message: `${booking.user.name || 'User'} ingin booking ${cattle.name} (${cattle.code}) - qty: ${quantity}`,
        type: 'BOOKING_REQUEST',
        data: JSON.stringify({ bookingId: booking.id, cattleId }),
      })),
    })

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
```

---

## Task 4: Booking System - BookingModal Component

**Files:**
- Create: `src/components/cattle/BookingModal.tsx`
- Modify: `src/components/cattle/CattleProfile.tsx`

**Interfaces:**
- Consumes: `cattle: CattleWithRelations`, `isOpen: boolean`, `onClose: () => void`, `onSuccess: () => void`
- Produces: Booking form modal with phone validation

- [ ] **Step 1: Create BookingModal.tsx**

```tsx
// src/components/cattle/BookingModal.tsx
'use client'

import { useState } from 'react'
import { X, Loader2, Phone, Package, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  cattle: {
    id: string
    name: string
    code: string
    price: number
    quantity: number
  }
  onSuccess?: () => void
}

export function BookingModal({ isOpen, onClose, cattle, onSuccess }: BookingModalProps) {
  const [phone, setPhone] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cattleId: cattle.id,
          phone: phone.trim(),
          quantity,
          notes: notes.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat booking')
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
        onClose()
        // Reset form
        setPhone('')
        setQuantity(1)
        setNotes('')
        setSuccess(false)
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const validatePhone = (value: string) => {
    const cleaned = value.replace(/\s/g, '')
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/
    if (cleaned && !phoneRegex.test(cleaned)) {
      return 'Format: 081234567890 atau +6281234567890'
    }
    return ''
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--line))]">
          <h2 className="text-lg font-bold text-[hsl(var(--forest))]">
            Booking Sekarang
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-[hsl(var(--cream))] rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-[hsl(var(--forest))]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-[hsl(var(--forest))] mb-2">
                Booking Terkirim!
              </h3>
              <p className="text-sm text-[hsl(var(--forest))/70]">
                Permintaan booking Anda sedang diproses. Admin akan menghubungi Anda soon.
              </p>
            </div>
          ) : (
            <>
              {/* Cattle Info */}
              <div className="bg-[hsl(var(--cream))] rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-[hsl(var(--forest))]">{cattle.name}</p>
                    <p className="text-xs text-[hsl(var(--forest))/60]">{cattle.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[hsl(var(--forest))]">{formatCurrency(cattle.price)}</p>
                    <p className="text-xs text-[hsl(var(--forest))/60]">Stok: {cattle.quantity}</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Phone */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--forest))] mb-1.5">
                    <Phone className="h-4 w-4" />
                    Nomor Telepon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    required
                    className="w-full rounded-lg border border-[hsl(var(--line))] px-3 py-2.5 text-sm text-[hsl(var(--forest))] placeholder:text-[hsl(var(--forest))/50] focus:border-[hsl(var(--forest))] focus:ring-2 focus:ring-[hsl(var(--forest))] focus:outline-none"
                  />
                  <p className="text-xs text-[hsl(var(--forest))/50] mt-1">
                    Admin akan menghubungi Anda via WhatsApp/telepon
                  </p>
                </div>

                {/* Quantity */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--forest))] mb-1.5">
                    <Package className="h-4 w-4" />
                    Jumlah
                  </label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full rounded-lg border border-[hsl(var(--line))] px-3 py-2.5 text-sm text-[hsl(var(--forest))] bg-white focus:border-[hsl(var(--forest))] focus:ring-2 focus:ring-[hsl(var(--forest))] focus:outline-none"
                  >
                    {Array.from({ length: Math.min(cattle.quantity, 10) }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--forest))] mb-1.5">
                    <FileText className="h-4 w-4" />
                    Catatan <span className="text-[hsl(var(--forest))/50]">(opsional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Catatan tambahan untuk admin..."
                    rows={3}
                    maxLength={500}
                    className="w-full rounded-lg border border-[hsl(var(--line))] px-3 py-2.5 text-sm text-[hsl(var(--forest))] placeholder:text-[hsl(var(--forest))/50] focus:border-[hsl(var(--forest))] focus:ring-2 focus:ring-[hsl(var(--forest))] focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !phone}
                  className="w-full bg-[hsl(var(--gold))] text-[hsl(var(--forest))] py-3 rounded-lg font-bold hover:bg-[hsl(var(--gold))/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Kirim Permintaan Booking'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Modify CattleProfile to add BookingModal**

Add to CattleProfile.tsx:

```tsx
// Add imports
import { BookingModal } from './BookingModal'

// Add state
const [showAuthModal, setShowAuthModal] = useState(false)
const [showBookingModal, setShowBookingModal] = useState(false)
const [currentUserId, setCurrentUserId] = useState<string | undefined>()

// Add useEffect to check auth
useEffect(() => {
  fetch('/api/auth/me')
    .then(res => res.ok ? res.json() : null)
    .then(data => setCurrentUserId(data?.user?.id))
    .catch(() => {})
}, [])

// Add event listener for auth modal
useEffect(() => {
  const handleOpenAuth = () => setShowAuthModal(true)
  window.addEventListener('openAuthModal', handleOpenAuth)
  return () => window.removeEventListener('openAuthModal', handleOpenAuth)
}, [])

// Modify booking button click handler
const handleBookingClick = () => {
  if (!currentUserId) {
    setShowAuthModal(true)
  } else {
    setShowBookingModal(true)
  }
}

// Update the booking button in the JSX:
// Replace:
{(isAvailable) && (
  <button className="col-span-2 flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--gold))] px-3 py-3 text-[12px] font-semibold text-[hsl(var(--forest))] hover:bg-[hsl(var(--gold))/90 transition-colors">
    <Check className="h-4 w-4" />
    Booking Sekarang
  </button>
)}
// With:
{isAvailable && (
  <button 
    onClick={handleBookingClick}
    className="col-span-2 flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--gold))] px-3 py-3 text-[12px] font-semibold text-[hsl(var(--forest))] hover:bg-[hsl(var(--gold))/90 transition-colors"
  >
    <Check className="h-4 w-4" />
    Booking Sekarang
  </button>
)}

// Add modals before closing div of main content
{showAuthModal && (
  <AuthModal 
    isOpen={showAuthModal} 
    onClose={() => setShowAuthModal(false)} 
  />
)}

{showBookingModal && (
  <BookingModal
    isOpen={showBookingModal}
    onClose={() => setShowBookingModal(false)}
    cattle={{
      id: cattle.id,
      name: cattle.name,
      code: cattle.code,
      price: Number(cattle.price),
      quantity: cattle.quantity || 1,
    }}
    onSuccess={() => {
      // Optionally show success message
      alert('Booking berhasil! Anda akan dihubungi oleh admin soon.')
    }}
  />
)}
```

---

## Task 5: Admin Booking Management Page

**Files:**
- Create: `src/app/api/admin/bookings/route.ts`
- Create: `src/app/admin/bookings/page.tsx`
- Modify: `src/components/admin/AdminSidebar.tsx`

**Interfaces:**
- Consumes: Admin auth, booking filters
- Produces: Booking list with approve/reject actions

- [ ] **Step 1: Create /api/admin/bookings endpoint**

```typescript
// src/app/api/admin/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentAdmin } from '@/lib/auth/jwt'

// GET /api/admin/bookings?status=PENDING&page=1
export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    const where = status && status !== 'ALL' ? { status: status as any } : {}

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          cattle: { 
            select: { id: true, code: true, name: true, mainImage: true, price: true, quantity: true }
          },
          user: {
            select: { id: true, name: true, email: true }
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where })
    ])

    return NextResponse.json({
      bookings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// PUT /api/admin/bookings?id=xxx&action=approve|reject
export async function PUT(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const action = searchParams.get('action')

  if (!id || !action) {
    return NextResponse.json({ error: 'ID dan action diperlukan' }, { status: 400 })
  }

  try {
    const newStatus = action === 'approve' ? 'CONFIRMED' : 'CANCELLED'

    const booking = await prisma.booking.update({
      where: { id },
      data: { status: newStatus },
      include: {
        user: { select: { id: true, name: true, email: true } },
        cattle: { select: { id: true, name: true, code: true } },
      },
    })

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: booking.user.id,
        title: action === 'approve' ? 'Booking Diterima' : 'Booking Ditolak',
        message: action === 'approve'
          ? `Booking Anda untuk ${booking.cattle.name} (${booking.cattle.code}) telah diterima!`
          : `Maaf, booking Anda untuk ${booking.cattle.name} (${booking.cattle.code}) ditolak.`,
        type: action === 'approve' ? 'BOOKING_CONFIRMED' : 'BOOKING_CANCELLED',
        data: JSON.stringify({ bookingId: booking.id }),
      },
    })

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create admin bookings page**

```tsx
// src/app/admin/bookings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { Check, X, Clock, Search, Filter, Phone } from 'lucide-react'

interface Booking {
  id: string
  quantity: number
  notes: string | null
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  createdAt: string
  cattle: {
    id: string
    code: string
    name: string
    mainImage: string | null
    price: number
    quantity: number
  }
  user: {
    id: string
    name: string | null
    email: string
  }
}

const statusConfig = {
  PENDING: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  CONFIRMED: { label: 'Diterima', color: 'bg-green-100 text-green-700', icon: Check },
  CANCELLED: { label: 'Ditolak', color: 'bg-red-100 text-red-700', icon: X },
  COMPLETED: { label: 'Selesai', color: 'bg-blue-100 text-blue-700', icon: Check },
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [statusFilter])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const url = `/api/admin/bookings${statusFilter !== 'ALL' ? `?status=${statusFilter}` : ''}`
      const res = await fetch(url)
      const data = await res.json()
      setBookings(data.bookings || [])
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    if (!confirm(action === 'approve' ? 'Terima booking ini?' : 'Tolak booking ini?')) return

    setProcessingId(id)
    try {
      const res = await fetch(`/api/admin/bookings?id=${id}&action=${action}`, {
        method: 'PUT',
      })

      if (res.ok) {
        fetchBookings()
      }
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[hsl(var(--forest))]">Manajemen Booking</h1>
        <p className="text-[hsl(var(--forest))/60]">Kelola permintaan booking dari pelanggan</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[hsl(var(--forest))/60]" />
          <span className="text-sm font-medium text-[hsl(var(--forest))]">Status:</span>
        </div>
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-[hsl(var(--forest))] text-white'
                  : 'bg-white border border-[hsl(var(--line))] text-[hsl(var(--forest))/70] hover:bg-[hsl(var(--cream))]'
              }`}
            >
              {status === 'ALL' ? 'Semua' : statusConfig[status as keyof typeof statusConfig]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(statusConfig).map(([key, config]) => {
          const count = bookings.filter(b => b.status === key).length
          return (
            <div key={key} className="bg-white rounded-lg border border-[hsl(var(--line))] p-4">
              <div className="flex items-center gap-2 mb-2">
                <config.icon className="h-4 w-4 text-[hsl(var(--forest))/60]" />
                <span className="text-sm text-[hsl(var(--forest))/60]">{config.label}</span>
              </div>
              <p className="text-2xl font-bold text-[hsl(var(--forest))]">{count}</p>
            </div>
          )
        })}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-white rounded-lg border border-[hsl(var(--line))] p-4 h-32" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-[hsl(var(--line))]">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-[hsl(var(--forest))/60]">Belum ada booking</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-lg border border-[hsl(var(--line))] overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Cattle Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-[hsl(var(--cream))] flex-shrink-0">
                    {booking.cattle.mainImage ? (
                      <Image
                        src={booking.cattle.mainImage}
                        alt={booking.cattle.name}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[hsl(var(--forest))/30]">
                        🐂
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-[hsl(var(--forest))]">
                          {booking.cattle.name}
                        </h3>
                        <p className="text-xs text-[hsl(var(--forest))/60]">
                          {booking.cattle.code}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[booking.status].color}`}>
                        {statusConfig[booking.status].label}
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div>
                        <span className="text-[hsl(var(--forest))/60]">Qty: </span>
                        <span className="font-medium">{booking.quantity}</span>
                      </div>
                      <div>
                        <span className="text-[hsl(var(--forest))/60]">Total: </span>
                        <span className="font-medium">{formatCurrency(Number(booking.cattle.price) * booking.quantity)}</span>
                      </div>
                    </div>

                    {booking.notes && (
                      <p className="mt-2 text-xs text-[hsl(var(--forest))/70] bg-[hsl(var(--cream))] p-2 rounded">
                        Catatan: {booking.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* User & Actions */}
              <div className="px-4 py-3 bg-[hsl(var(--cream))]/50 border-t border-[hsl(var(--line))]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[hsl(var(--forest))]">
                      {booking.user.name || 'User'}
                    </p>
                    <p className="text-xs text-[hsl(var(--forest))/60]">{booking.user.email}</p>
                    <p className="text-xs text-[hsl(var(--forest))/50] mt-1">
                      {formatDate(booking.createdAt)}
                    </p>
                  </div>

                  {booking.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(booking.id, 'reject')}
                        disabled={processingId === booking.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Tolak
                      </button>
                      <button
                        onClick={() => handleAction(booking.id, 'approve')}
                        disabled={processingId === booking.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-sm font-medium hover:bg-green-100 disabled:opacity-50 transition-colors"
                      >
                        <Check className="h-4 w-4" />
                        Terima
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Add bookings link to AdminSidebar**

Add to `src/components/admin/AdminSidebar.tsx`:

```tsx
// Add to sidebar navigation
{
  href: '/admin/bookings',
  icon: Calendar,
  label: 'Booking',
  badge: pendingBookingsCount > 0 ? pendingBookingsCount : undefined,
}
```

```tsx
// Add Calendar import from lucide-react
import { Calendar } from 'lucide-react'
```

---

## Task 6: Notification Badge for Booking Requests

**Files:**
- Modify: `src/components/admin/AdminSidebar.tsx`

**Interfaces:**
- Consumes: Pending bookings count
- Produces: Badge showing number of pending bookings

- [ ] **Step 1: Add notification badge to sidebar**

```tsx
// Add to AdminSidebar component
const [pendingBookingsCount, setPendingBookingsCount] = useState(0)

useEffect(() => {
  fetch('/api/admin/bookings?status=PENDING')
    .then(res => res.json())
    .then(data => setPendingBookingsCount(data.bookings?.length || 0))
    .catch(() => {})
}, [])

// Update the bookings nav item:
{
  href: '/admin/bookings',
  icon: Calendar,
  label: 'Booking',
  badge: pendingBookingsCount > 0 ? pendingBookingsCount : undefined,
}

// Add Badge component if not exists
// In the nav item rendering, add badge rendering:
{badge !== undefined && (
  <span className="ml-auto h-5 min-w-[20px] flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold px-1.5">
    {badge > 99 ? '99+' : badge}
  </span>
)}
```

---

## Task Summary

| Task | Files | Description |
|------|-------|-------------|
| 1 | 3 files | Comment section with form on cattle detail page |
| 2 | 2 files | Search filter integration in CatalogSection |
| 3 | 2 files | Booking API with notification |
| 4 | 2 files | BookingModal component and CattleProfile integration |
| 5 | 3 files | Admin booking management page |
| 6 | 1 file | Notification badge for pending bookings |

---

## Dependencies

No new dependencies required - using existing packages (lucide-react).

---

## Testing Checklist

- [ ] Comment form appears when logged in
- [ ] Comment form shows "Login to comment" when not logged in
- [ ] Comments persist after page refresh
- [ ] User can delete their own comments
- [ ] Search filter filters cattle by name/code
- [ ] Search filter filters by status
- [ ] Search filter filters by breed
- [ ] Booking button shows auth modal when not logged in
- [ ] Booking modal opens when logged in
- [ ] Phone validation works (Indonesian format)
- [ ] Booking creates notification for admin
- [ ] Admin sees booking in bookings page
- [ ] Admin can approve booking
- [ ] Admin can reject booking
- [ ] Badge shows pending bookings count
