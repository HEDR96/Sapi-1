# Samadyafarm.id Major Revisions V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementasi revisi major phase 2: horizontal scroll catalog, Pantau Perkembangan section, admin pages, comment system, dan iDrive E2 storage.

**Architecture:** Next.js 14 App Router dengan TypeScript, Prisma/PostgreSQL, iDrive E2 S3-compatible storage, AWS SDK v3.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Prisma, @aws-sdk/client-s3, Lucide React

## Global Constraints

- Bahasa Indonesia untuk semua UI text
- Lucide React untuk icons
- Tailwind CSS dengan custom design tokens (forest, olive, cream, dll)
- Next.js 14 App Router patterns
- Responsive: mobile-first approach

---

## Phase B: Frontend Experience

---

### Task 1: Horizontal Scroll Catalog (Swiper Style)

**Files:**
- Create: `src/components/catalog/CatalogSwiper.tsx`
- Create: `src/components/catalog/CatalogSwiperCard.tsx`
- Modify: `src/app/(public)/page.tsx`

**Interfaces:**
- Consumes: `cattle: Cattle[]`, `onSelect: (cattle: Cattle) => void`
- Produces: `<CatalogSwiper>` component dengan selected state

- [ ] **Step 1: Create CatalogSwiperCard component**

```tsx
// src/components/catalog/CatalogSwiperCard.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CattleCard } from './CattleCard'
import { StatusBadge } from './CattleStatusBadge'
import { formatCurrency, formatWeight } from '@/lib/utils/formatters'

interface CatalogSwiperCardProps {
  id: string
  code: string
  name: string
  breed: string
  status: Status
  price: number
  lastWeight: number | null
  mainImage: string | null
  quantity?: number
  isSelected?: boolean
  onClick?: () => void
}

export function CatalogSwiperCard({
  code, name, breed, status, price, lastWeight, mainImage, quantity = 1,
  isSelected = false, onClick
}: CatalogSwiperCardProps) {
  const isSold = status === 'SOLD'
  const isBooked = status === 'BOOKED'
  const isAvailable = status === 'AVAILABLE' && quantity > 0

  return (
    <article
      onClick={onClick}
      className={`
        flex-shrink-0 w-[200px] sm:w-[280px] rounded-lg border bg-white shadow-card
        transition-all duration-200 cursor-pointer
        ${isSelected 
          ? 'border-[hsl(var(--forest))] ring-2 ring-[hsl(var(--forest))]' 
          : 'border-[hsl(var(--line))] hover:border-[hsl(var(--forest))]'}
        ${isSold || isBooked ? 'opacity-75' : ''}
      `}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
        {mainImage ? (
          <>
            <Image src={mainImage} alt={name} fill className="object-cover" sizes="280px" />
            {(isSold || isBooked) && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                  isSold ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {isSold ? 'TERJUAL' : 'DIBOOKING'}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-[hsl(var(--cream))]">
            <span className="text-[10px] text-[hsl(var(--forest))/50]">Tidak Ada Foto</span>
          </div>
        )}
        {quantity > 0 && !isSold && !isBooked && (
          <div className="absolute right-2 top-2 rounded-full bg-[hsl(var(--forest))] px-2 py-0.5 text-[9px] font-bold text-white">
            Stok: {quantity}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h4 className="text-[12px] font-bold text-[hsl(var(--forest))] truncate">{name}</h4>
        <p className="mt-0.5 text-[9px] text-[hsl(var(--forest))/60]">{code} • {breed}</p>
        <p className="mt-1 text-[10px] text-[hsl(var(--forest))/70]">
          Bobot: <span className="font-semibold">{formatWeight(lastWeight)}</span>
        </p>
        <div className="mt-2 text-[13px] font-extrabold text-[hsl(var(--forest))]">
          {formatCurrency(price)}
        </div>
      </div>
    </article>
  )
}
```

- [ ] **Step 2: Create CatalogSwiper main component**

```tsx
// src/components/catalog/CatalogSwiper.tsx
'use client'

import { useRef, useEffect, useState } from 'react'
import { CatalogSwiperCard } from './CatalogSwiperCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CattleWithLatestWeight } from '@/types'

interface CatalogSwiperProps {
  cattle: CattleWithLatestWeight[]
  onSelect: (cattle: CattleWithLatestWeight) => void
  selectedId?: string
}

export function CatalogSwiper({ cattle, onSelect, selectedId }: CatalogSwiperProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setShowLeftArrow(scrollLeft > 0)
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll)
      window.addEventListener('resize', checkScroll)
      return () => {
        el.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', checkScroll)
      }
    }
  }, [cattle])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = 300
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  if (!cattle || cattle.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-[hsl(var(--forest))/50]">
        Belum ada sapi tersedia
      </div>
    )
  }

  return (
    <div className="relative group">
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 shadow-lg items-center justify-center hover:bg-white transition-colors hidden sm:flex"
        >
          <ChevronLeft className="h-5 w-5 text-[hsl(var(--forest))]" />
        </button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth scroll-snap-x-mandatory pb-4 px-4 sm:px-12
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
      >
        {cattle.map((c) => (
          <CatalogSwiperCard
            key={c.id}
            id={c.id}
            code={c.code}
            name={c.name}
            breed={c.breed}
            status={c.status}
            price={Number(c.price)}
            lastWeight={c.lastWeight}
            mainImage={c.mainImage}
            quantity={c.quantity}
            isSelected={selectedId === c.id}
            onClick={() => onSelect(c)}
          />
        ))}
      </div>

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 shadow-lg items-center justify-center hover:bg-white transition-colors hidden sm:flex"
        >
          <ChevronRight className="h-5 w-5 text-[hsl(var(--forest))]" />
        </button>
      )}

      {/* Fade masks */}
      <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-[hsl(var(--cream2))] to-transparent pointer-events-none hidden sm:block" />
      <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-[hsl(var(--cream2))] to-transparent pointer-events-none hidden sm:block" />
    </div>
  )
}
```

- [ ] **Step 3: Add types for CattleWithLatestWeight**

```typescript
// src/types/index.ts - add interface
interface CattleWithLatestWeight extends Cattle {
  lastWeight: number | null
}
```

- [ ] **Step 4: Update homepage to use CatalogSwiper**

```tsx
// src/app/(public)/page.tsx - add after HeroSection
import { CatalogSwiper } from '@/components/catalog/CatalogSwiper'
import { useState } from 'react'
import { CattleWithLatestWeight } from '@/types'

// In component:
const [selectedCattle, setSelectedCattle] = useState<CattleWithLatestWeight | null>(null)

// Add after HeroSection:
<CatalogSwiper 
  cattle={cattle}
  onSelect={setSelectedCattle}
  selectedId={selectedCattle?.id}
/>
```

---

### Task 2: Pantau Perkembangan Section

**Files:**
- Create: `src/components/home/PantauPerkembanganSection.tsx`
- Create: `src/components/home/SelectedCattleDetail.tsx`
- Create: `src/components/cattle/DetailTabs.tsx`
- Create: `src/components/cattle/SummaryTab.tsx`
- Create: `src/components/cattle/WeightChart.tsx`
- Create: `src/components/cattle/WeightHistory.tsx`
- Create: `src/components/cattle/HealthTimeline.tsx`
- Create: `src/components/cattle/FeedSchedule.tsx`
- Create: `src/components/cattle/MediaGallery.tsx`
- Modify: `src/app/(public)/page.tsx`

**Interfaces:**
- Consumes: `selectedCattle: CattleWithRelations | null`
- Produces: `<PantauPerkembanganSection>` dengan tabs content

- [ ] **Step 1: Create SelectedCattleDetail component**

```tsx
// src/components/home/SelectedCattleDetail.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency, formatWeight, formatDate } from '@/lib/utils/formatters'
import { StatusBadge } from '@/components/catalog/CattleStatusBadge'
import { CattleWithRelations } from '@/types'

interface SelectedCattleDetailProps {
  cattle: CattleWithRelations | null
}

export function SelectedCattleDetail({ cattle }: SelectedCattleDetailProps) {
  if (!cattle) {
    return (
      <div className="h-full rounded-xl border border-dashed border-[hsl(var(--line))] bg-[hsl(var(--cream))]/50 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-5xl mb-3">🐂</div>
        <h3 className="text-lg font-semibold text-[hsl(var(--forest))]">
          Pilih Sapi
        </h3>
        <p className="text-sm text-[hsl(var(--forest))/60] mt-1">
          Pilih sapi dari katalog di atas untuk melihat detail perkembangan
        </p>
      </div>
    )
  }

  const lastWeight = cattle.weights?.[0]?.weight
  const weightProgress = cattle.targetWeight && lastWeight 
    ? Math.min(100, (lastWeight / cattle.targetWeight) * 100) 
    : null

  return (
    <div className="h-full rounded-xl border border-[hsl(var(--line))] bg-white overflow-hidden">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-[hsl(var(--cream))]">
        {cattle.mainImage ? (
          <Image src={cattle.mainImage} alt={cattle.name} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-[hsl(var(--forest))/30]">
            Tidak ada foto
          </div>
        )}
        <div className="absolute top-2 left-2">
          <StatusBadge status={cattle.status} />
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-[hsl(var(--forest))]">{cattle.name}</h3>
        <p className="text-xs text-[hsl(var(--forest))/60]">{cattle.code} • {cattle.breed}</p>

        <div className="mt-4 space-y-3">
          <div>
            <span className="text-xs text-[hsl(var(--forest))/60]">Harga</span>
            <p className="text-lg font-bold text-[hsl(var(--forest))]">
              {formatCurrency(Number(cattle.price))}
            </p>
          </div>

          <div>
            <span className="text-xs text-[hsl(var(--forest))/60]">Bobot Terakhir</span>
            <p className="text-xl font-bold text-[hsl(var(--forest))]">
              {formatWeight(lastWeight || null)}
            </p>
          </div>

          {cattle.targetWeight && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[hsl(var(--forest))/60]">Target</span>
                <span className="font-medium text-[hsl(var(--forest))]">
                  {formatWeight(cattle.targetWeight)}
                </span>
              </div>
              <div className="h-2 bg-[hsl(var(--cream))] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[hsl(var(--forest))] rounded-full transition-all"
                  style={{ width: `${weightProgress || 0}%` }}
                />
              </div>
              <p className="text-xs text-[hsl(var(--forest))/60] mt-1">
                {weightProgress?.toFixed(0)}% tercapai
              </p>
            </div>
          )}
        </div>

        <Link
          href={`/sapi/${cattle.code}`}
          className="mt-4 block w-full text-center bg-[hsl(var(--forest))] text-white py-2 rounded-lg font-semibold hover:bg-[hsl(var(--forest2))] transition-colors"
        >
          Lihat Detail Lengkap
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create DetailTabs component**

```tsx
// src/components/cattle/DetailTabs.tsx
'use client'

import { useState } from 'react'
import { CattleWithRelations } from '@/types'
import { SummaryTab } from './SummaryTab'
import { WeightHistory } from './WeightHistory'
import { HealthTimeline } from './HealthTimeline'
import { FeedSchedule } from './FeedSchedule'
import { MediaGallery } from './MediaGallery'

interface DetailTabsProps {
  cattle: CattleWithRelations | null
}

type TabKey = 'summary' | 'weights' | 'health' | 'feed' | 'media'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'summary', label: 'Ringkasan' },
  { key: 'weights', label: 'Timbang' },
  { key: 'health', label: 'Kesehatan' },
  { key: 'feed', label: 'Pakan' },
  { key: 'media', label: 'Dokumentasi' },
]

export function DetailTabs({ cattle }: DetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('summary')

  if (!cattle) {
    return (
      <div className="h-full flex items-center justify-center text-[hsl(var(--forest))/50]">
        Pilih sapi untuk melihat detail
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col rounded-xl border border-[hsl(var(--line))] bg-white overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b border-[hsl(var(--line))] overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'text-[hsl(var(--forest))] border-b-2 border-[hsl(var(--forest))]'
                : 'text-[hsl(var(--forest))/60] hover:text-[hsl(var(--forest))]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'summary' && <SummaryTab cattle={cattle} />}
        {activeTab === 'weights' && <WeightHistory weights={cattle.weights || []} />}
        {activeTab === 'health' && <HealthTimeline records={cattle.healthRecords || []} />}
        {activeTab === 'feed' && <FeedSchedule records={cattle.feedRecords || []} />}
        {activeTab === 'media' && <MediaGallery media={cattle.media || []} />}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create SummaryTab component**

```tsx
// src/components/cattle/SummaryTab.tsx
'use client'

import { CattleWithRelations } from '@/types'
import { formatWeight, formatCurrency, formatDate, formatADG } from '@/lib/utils/formatters'
import { calculateWeightStats } from '@/lib/utils/calculations'
import { TrendingUp, Target, Scale, Calendar } from 'lucide-react'

interface SummaryTabProps {
  cattle: CattleWithRelations
}

export function SummaryTab({ cattle }: SummaryTabProps) {
  const weights = cattle.weights || []
  const weightStats = calculateWeightStats(weights)
  const lastWeight = weights[0]?.weight
  const weightProgress = cattle.targetWeight && lastWeight
    ? Math.min(100, (lastWeight / cattle.targetWeight) * 100)
    : null

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-[hsl(var(--cream))] rounded-lg">
          <div className="flex items-center gap-2 text-[hsl(var(--forest))/60] text-xs mb-1">
            <Scale className="h-3 w-3" />
            Bobot Terakhir
          </div>
          <p className="text-lg font-bold text-[hsl(var(--forest))]">
            {formatWeight(lastWeight || null)}
          </p>
        </div>

        <div className="p-3 bg-[hsl(var(--cream))] rounded-lg">
          <div className="flex items-center gap-2 text-[hsl(var(--forest))/60] text-xs mb-1">
            <TrendingUp className="h-3 w-3" />
            ADG
          </div>
          <p className="text-lg font-bold text-[hsl(var(--forest))]">
            {formatADG(weightStats.adg)}
          </p>
        </div>

        <div className="p-3 bg-[hsl(var(--cream))] rounded-lg">
          <div className="flex items-center gap-2 text-[hsl(var(--forest))/60] text-xs mb-1">
            <Target className="h-3 w-3" />
            Target
          </div>
          <p className="text-lg font-bold text-[hsl(var(--forest))]">
            {formatWeight(cattle.targetWeight)}
          </p>
        </div>

        <div className="p-3 bg-[hsl(var(--cream))] rounded-lg">
          <div className="flex items-center gap-2 text-[hsl(var(--forest))/60] text-xs mb-1">
            <Calendar className="h-3 w-3" />
            Total Timbang
          </div>
          <p className="text-lg font-bold text-[hsl(var(--forest))]">
            {weights.length}x
          </p>
        </div>
      </div>

      {/* Progress */}
      {cattle.targetWeight && weightProgress !== null && (
        <div className="p-4 bg-[hsl(var(--cream))] rounded-lg">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-[hsl(var(--forest))]">Progress Target</span>
            <span className="text-[hsl(var(--forest))]">{weightProgress.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-white rounded-full overflow-hidden">
            <div 
              className="h-full bg-[hsl(var(--forest))] rounded-full transition-all"
              style={{ width: `${weightProgress}%` }}
            />
          </div>
          <p className="text-xs text-[hsl(var(--forest))/60] mt-2">
            {formatWeight(lastWeight)} / {formatWeight(cattle.targetWeight)}
          </p>
        </div>
      )}

      {/* Health Summary */}
      {cattle.healthRecords && cattle.healthRecords.length > 0 && (
        <div className="p-4 bg-[hsl(var(--cream))] rounded-lg">
          <h4 className="text-sm font-semibold text-[hsl(var(--forest))] mb-2">Kesehatan</h4>
          <p className="text-sm text-[hsl(var(--forest))/70]">
            {cattle.healthRecords[0].status} - {cattle.healthRecords[0].healthType}
          </p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create WeightHistory component (with chart placeholder)**

```tsx
// src/components/cattle/WeightHistory.tsx
'use client'

import { CattleWeight } from '@/types'
import { formatWeight, formatDate } from '@/lib/utils/formatters'
import { TrendingUp } from 'lucide-react'

interface WeightHistoryProps {
  weights: CattleWeight[]
}

export function WeightHistory({ weights }: WeightHistoryProps) {
  if (!weights || weights.length === 0) {
    return (
      <div className="text-center py-8 text-[hsl(var(--forest))/50]">
        <div className="text-4xl mb-2">📋</div>
        <p>Belum ada data penimbangan</p>
      </div>
    )
  }

  // Sort by date descending
  const sorted = [...weights].sort((a, b) => 
    new Date(b.measurementDate).getTime() - new Date(a.measurementDate).getTime()
  )

  return (
    <div className="space-y-3">
      {/* Simple Chart - TODO: Add real chart library */}
      <div className="h-32 flex items-end gap-1 p-4 bg-[hsl(var(--cream))] rounded-lg">
        {sorted.slice(0, 10).reverse().map((w, i) => {
          const maxWeight = Math.max(...sorted.map(x => x.weight))
          const height = maxWeight > 0 ? (w.weight / maxWeight) * 100 : 0
          return (
            <div key={w.id} className="flex-1 flex flex-col items-center gap-1">
              <div 
                className="w-full bg-[hsl(var(--forest))] rounded-t transition-all"
                style={{ height: `${height}%` }}
                title={`${formatWeight(w.weight)} - ${formatDate(w.measurementDate)}`}
              />
              <span className="text-[8px] text-[hsl(var(--forest))/60]">
                {new Date(w.measurementDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          )
        })}
      </div>

      {/* History List */}
      <div className="space-y-2">
        {sorted.map((weight, index) => (
          <div key={weight.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-[hsl(var(--line))]">
            <div>
              <p className="text-sm font-medium text-[hsl(var(--forest))]">
                {formatDate(weight.measurementDate)}
              </p>
              {weight.notes && (
                <p className="text-xs text-[hsl(var(--forest))/60]">{weight.notes}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-[hsl(var(--forest))]">
                {formatWeight(weight.weight)}
              </p>
              {index < sorted.length - 1 && (
                <p className="text-xs text-[hsl(var(--olive))] flex items-center gap-1 justify-end">
                  <TrendingUp className="h-3 w-3" />
                  +{formatWeight(weight.weight - sorted[index + 1].weight)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create HealthTimeline component**

```tsx
// src/components/cattle/HealthTimeline.tsx
'use client'

import { CattleHealthRecord, HealthStatus } from '@/types'
import { formatDate } from '@/lib/utils/formatters'
import { HEALTH_STATUS_LABELS } from '@/types'

interface HealthTimelineProps {
  records: CattleHealthRecord[]
}

const statusColors: Record<HealthStatus, string> = {
  SEHAT: 'bg-green-100 text-green-700',
  DALAM_PERAWATAN: 'bg-yellow-100 text-yellow-700',
  OBSERVASI: 'bg-orange-100 text-orange-700',
  SAKIT: 'bg-red-100 text-red-700',
  SEMBUH: 'bg-blue-100 text-blue-700',
}

export function HealthTimeline({ records }: HealthTimelineProps) {
  if (!records || records.length === 0) {
    return (
      <div className="text-center py-8 text-[hsl(var(--forest))/50]">
        <div className="text-4xl mb-2">🏥</div>
        <p>Belum ada data kesehatan</p>
      </div>
    )
  }

  const sorted = [...records].sort((a, b) => 
    new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
  )

  return (
    <div className="space-y-4">
      {sorted.map((record) => (
        <div key={record.id} className="relative pl-6 pb-4 border-l-2 border-[hsl(var(--line))] last:border-0">
          {/* Timeline dot */}
          <div className={`absolute left-[-5px] top-0 w-2 h-2 rounded-full ${
            record.status === 'SEHAT' ? 'bg-green-500' :
            record.status === 'SAKIT' ? 'bg-red-500' :
            'bg-amber-500'
          }`} />
          
          <div className="p-3 bg-white rounded-lg border border-[hsl(var(--line))]">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--forest))]">
                  {formatDate(record.recordDate)}
                </p>
                <p className="text-xs text-[hsl(var(--forest))/60]">{record.healthType}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[record.status]}`}>
                {HEALTH_STATUS_LABELS[record.status]}
              </span>
            </div>
            {record.notes && (
              <p className="text-sm text-[hsl(var(--forest))/70]">{record.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 6: Create FeedSchedule component**

```tsx
// src/components/cattle/FeedSchedule.tsx
'use client'

import { CattleFeedRecord } from '@/types'
import { formatDate } from '@/lib/utils/formatters'
import { Sprout, Wheat, Pill, Droplets } from 'lucide-react'

interface FeedScheduleProps {
  records: CattleFeedRecord[]
}

const feedIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Rumput': Sprout,
  'Konsentrat': Wheat,
  'Vitamin': Pill,
  'Air': Droplets,
  'default': Sprout,
}

export function FeedSchedule({ records }: FeedScheduleProps) {
  if (!records || records.length === 0) {
    return (
      <div className="text-center py-8 text-[hsl(var(--forest))/50]">
        <div className="text-4xl mb-2">🌿</div>
        <p>Belum ada data pakan</p>
      </div>
    )
  }

  const sorted = [...records].sort((a, b) => 
    new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {sorted.map((record) => {
        const Icon = feedIcons[record.feedType] || feedIcons.default
        return (
          <div key={record.id} className="p-4 bg-white rounded-lg border border-[hsl(var(--line))]">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[hsl(var(--cream))] rounded-lg">
                <Icon className="h-5 w-5 text-[hsl(var(--forest))]" />
              </div>
              <div>
                <p className="font-medium text-[hsl(var(--forest))]">{record.feedType}</p>
                <p className="text-sm text-[hsl(var(--forest))/60]">
                  {record.amount} - {record.frequency}
                </p>
              </div>
            </div>
            <p className="text-xs text-[hsl(var(--forest))/60]">
              {formatDate(record.recordDate)}
            </p>
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

- [ ] **Step 7: Create MediaGallery component**

```tsx
// src/components/cattle/MediaGallery.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Play, Download } from 'lucide-react'
import { CattleMedia } from '@/types'

interface MediaGalleryProps {
  media: CattleMedia[]
}

export function MediaGallery({ media }: MediaGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const images = media.filter(m => m.fileType === 'IMAGE')
  const videos = media.filter(m => m.fileType === 'VIDEO')

  if (!media || media.length === 0) {
    return (
      <div className="text-center py-8 text-[hsl(var(--forest))/50]">
        <div className="text-4xl mb-2">📷</div>
        <p>Belum ada dokumentasi</p>
      </div>
    )
  }

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {media.map((item, index) => (
          <button
            key={item.id}
            onClick={() => openLightbox(index)}
            className="relative aspect-square rounded-lg overflow-hidden group"
          >
            <Image src={item.fileUrl} alt={item.title || 'Media'} fill className="object-cover" />
            {item.fileType === 'VIDEO' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Play className="h-10 w-10 text-white" fill="white" />
              </div>
            )}
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
          <button 
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full"
          >
            <X className="h-6 w-6" />
          </button>
          
          {media[currentIndex].fileType === 'VIDEO' ? (
            <video 
              src={media[currentIndex].fileUrl}
              controls
              className="max-w-[90vw] max-h-[80vh]"
            />
          ) : (
            <div className="relative w-[80vw] h-[80vh]">
              <Image 
                src={media[currentIndex].fileUrl} 
                alt="" 
                fill 
                className="object-contain" 
              />
            </div>
          )}
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 8: Create main PantauPerkembanganSection**

```tsx
// src/components/home/PantauPerkembanganSection.tsx
'use client'

import { useState } from 'react'
import { CattleWithRelations } from '@/types'
import { CatalogSwiper } from '@/components/catalog/CatalogSwiper'
import { SelectedCattleDetail } from './SelectedCattleDetail'
import { DetailTabs } from '@/components/cattle/DetailTabs'

interface PantauPerkembanganSectionProps {
  cattle: CattleWithRelations[]
}

export function PantauPerkembanganSection({ cattle }: PantauPerkembanganSectionProps) {
  const [selectedCattle, setSelectedCattle] = useState<CattleWithRelations | null>(null)

  // Transform for CatalogSwiper (add lastWeight)
  const cattleForSwiper = cattle.map(c => ({
    ...c,
    lastWeight: c.weights?.[0]?.weight || null
  }))

  return (
    <section className="py-12 bg-[hsl(var(--cream2))]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--forest))]">
            Pantau Perkembangan Sapi Anda 🐂
          </h2>
          <p className="text-[hsl(var(--forest))/60] mt-2">
            Pilih sapi untuk melihat detail perkembangan
          </p>
        </div>

        {/* Catalog Swiper */}
        <div className="mb-8">
          <CatalogSwiper
            cattle={cattleForSwiper}
            onSelect={setSelectedCattle}
            selectedId={selectedCattle?.id}
          />
        </div>

        {/* Detail Panel */}
        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          <SelectedCattleDetail cattle={selectedCattle} />
          <DetailTabs cattle={selectedCattle} />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 9: Update homepage to include PantauPerkembanganSection**

```tsx
// src/app/(public)/page.tsx
import { PantauPerkembanganSection } from '@/components/home/PantauPerkembanganSection'

// Add after CatalogSwiper:
// <PantauPerkembanganSection cattle={cattle} />
```

---

### Task 3: Admin Dropdown Fix

**Files:**
- Modify: `src/app/admin/cattle/new/page.tsx`
- Modify: `src/app/admin/cattle/[id]/page.tsx`

**Interfaces:**
- Consumes: existing form state and handlers
- Produces: fixed dropdown styling with solid background

- [ ] **Step 1: Fix dropdown in new cattle form**

```tsx
// Add this className to all <select> elements in src/app/admin/cattle/new/page.tsx

// Replace all select elements with:
<select
  className={`
    w-full rounded-lg border border-[hsl(var(--line))]
    bg-white px-3 py-2
    text-[hsl(var(--forest))]
    focus:ring-2 focus:ring-[hsl(var(--forest))]
    focus:border-transparent
  `}
  // ... other props
>
```

- [ ] **Step 2: Fix dropdown in edit cattle form**

```tsx
// Same fix for src/app/admin/cattle/[id]/page.tsx
// Apply the same bg-white className to all select elements
```

---

## Phase A: Backend & Data Layer

---

### Task 4: iDrive E2 Storage Setup

**Files:**
- Modify: `.env`
- Modify: `.env.example`
- Create: `src/lib/storage/s3.ts`
- Create: `src/lib/storage/upload.ts`
- Create: `src/lib/storage/delete.ts`
- Delete: `src/lib/supabase/client.ts`
- Delete: `src/lib/supabase/server.ts`
- Modify: `src/components/admin/ImageUploader.tsx`

**Interfaces:**
- Consumes: `file: File/Buffer`, `fileName: string`, `folder: string`
- Produces: `uploadToS3()`, `deleteFromS3()`, `getSignedUploadUrl()`

- [ ] **Step 1: Update .env with iDrive credentials**

```env
# iDrive E2 Storage
IDRIVE_ACCESS_KEY_ID="n5f8JZgJdMa7vgZh6JVq"
IDRIVE_SECRET_ACCESS_KEY="uJbR5BhCvXobDzz395caFfK7VsudYdKbbdkRriRZ"
IDRIVE_BUCKET="farm"
IDRIVE_ENDPOINT="https://farm.s3.ap-northeast-1.idrivee2.com"
IDRIVE_REGION="ap-northeast-1"
```

- [ ] **Step 2: Update .env.example**

```env
# iDrive E2 Storage
IDRIVE_ACCESS_KEY_ID="your_idrive_access_key"
IDRIVE_SECRET_ACCESS_KEY="your_idrive_secret_key"
IDRIVE_BUCKET="farm"
IDRIVE_ENDPOINT="https://farm.s3.ap-northeast-1.idrivee2.com"
IDRIVE_REGION="ap-northeast-1"
```

- [ ] **Step 3: Install AWS SDK**

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

- [ ] **Step 4: Create S3 client**

```typescript
// src/lib/storage/s3.ts
import { S3Client } from '@aws-sdk/client-s3'

export const s3Client = new S3Client({
  region: process.env.IDRIVE_REGION || 'ap-northeast-1',
  endpoint: process.env.IDRIVE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.IDRIVE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.IDRIVE_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
})
```

- [ ] **Step 5: Create upload functions**

```typescript
// src/lib/storage/upload.ts
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3Client } from './s3'

export async function uploadToS3(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'cattle'
): Promise<string> {
  const key = `${folder}/${Date.now()}-${fileName}`
  
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.IDRIVE_BUCKET,
    Key: key,
    Body: file,
    ContentType: contentType,
    ACL: 'public-read',
  }))
  
  return `${process.env.IDRIVE_ENDPOINT}/${process.env.IDRIVE_BUCKET}/${key}`
}

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

- [ ] **Step 6: Create delete function**

```typescript
// src/lib/storage/delete.ts
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { s3Client } from './s3'

export async function deleteFromS3(key: string): Promise<void> {
  // Extract key from full URL if needed
  const keyName = key.includes(process.env.IDRIVE_ENDPOINT!)
    ? key.split(`${process.env.IDRIVE_ENDPOINT}/${process.env.IDRIVE_BUCKET}/`)[1]
    : key
  
  await s3Client.send(new DeleteObjectCommand({
    Bucket: process.env.IDRIVE_BUCKET,
    Key: keyName,
  }))
}
```

- [ ] **Step 7: Update ImageUploader to use S3**

```typescript
// src/components/admin/ImageUploader.tsx - Replace Supabase with S3
import { useState, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { uploadToS3 } from '@/lib/storage/upload'

// Replace the uploadFile function
const uploadFile = async (file: File) => {
  setUploading(true)
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadToS3(buffer, file.name, file.type, folder)
    onChange(url)
  } catch (error) {
    console.error('Upload error:', error)
    alert('Gagal mengupload gambar')
  } finally {
    setUploading(false)
  }
}
```

- [ ] **Step 8: Delete Supabase files**

```bash
rm src/lib/supabase/client.ts
rm src/lib/supabase/server.ts
```

---

### Task 5: Comment System

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/app/api/comments/route.ts`
- Create: `src/components/home/RecentComments.tsx`
- Modify: `src/app/(public)/page.tsx`
- Modify: `src/app/sapi/[code]/page.tsx`

**Interfaces:**
- Consumes: `userId`, `cattleId`, `content`
- Produces: `Comment` model, API endpoints, RecentComments component

- [ ] **Step 1: Add Comment model to Prisma schema**

```prisma
// prisma/schema.prisma - add after Notification model

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

// Also add to User model:
model User {
  // existing fields...
  comments Comment[]
}

// And to Cattle model:
model Cattle {
  // existing fields...
  comments Comment[]
}
```

- [ ] **Step 2: Run Prisma migrate**

```bash
npx prisma migrate dev --name add_comment_model
```

- [ ] **Step 3: Create Comments API**

```typescript
// src/app/api/comments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentUser } from '@/lib/auth/jwt'

// GET /api/comments?cattleId=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cattleId = searchParams.get('cattleId')
  const limit = parseInt(searchParams.get('limit') || '10')

  try {
    const where = cattleId ? { cattleId } : {}
    
    const comments = await prisma.comment.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        cattle: { select: { id: true, code: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// POST /api/comments
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Login diperlukan' }, { status: 401 })
  }

  try {
    const { cattleId, content } = await request.json()

    if (!cattleId || !content) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    if (content.length < 3 || content.length > 1000) {
      return NextResponse.json({ error: 'Komentar 3-1000 karakter' }, { status: 400 })
    }

    const comment = await prisma.comment.create({
      data: {
        userId: user.userId || user.id,
        cattleId,
        content,
      },
      include: {
        user: { select: { id: true, name: true } },
        cattle: { select: { id: true, code: true, name: true } },
      },
    })

    return NextResponse.json({ success: true, comment })
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// DELETE /api/comments?id=xxx
export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Login diperlukan' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    const comment = await prisma.comment.findUnique({ where: { id } })
    if (!comment) {
      return NextResponse.json({ error: 'Komentar tidak ditemukan' }, { status: 404 })
    }

    // Check ownership
    if (comment.userId !== (user.userId || user.id)) {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 })
    }

    await prisma.comment.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete comment error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Create RecentComments component**

```tsx
// src/components/home/RecentComments.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils/formatters'
import { MessageCircle } from 'lucide-react'

interface Comment {
  id: string
  content: string
  createdAt: string
  user: { name: string | null }
  cattle: { code: string; name: string }
}

export function RecentComments() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/comments?limit=5')
      .then(res => res.json())
      .then(data => {
        setComments(data.comments || [])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="h-40 animate-pulse bg-[hsl(var(--cream))] rounded-lg" />
  }

  if (comments.length === 0) {
    return null // Don't show section if no comments
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-xl font-bold text-[hsl(var(--forest))] mb-4">
          Komentar Terbaru 💬
        </h2>
        
        <div className="grid gap-3">
          {comments.map((comment) => (
            <Link
              key={comment.id}
              href={`/sapi/${comment.cattle.code}`}
              className="block p-4 bg-white rounded-lg border border-[hsl(var(--line))] hover:border-[hsl(var(--forest))] transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[hsl(var(--cream))] rounded-full">
                  <MessageCircle className="h-4 w-4 text-[hsl(var(--forest))]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[hsl(var(--forest))]">
                      {comment.user.name || 'User'}
                    </span>
                    <span className="text-xs text-[hsl(var(--forest))/60]">
                      tentang
                    </span>
                    <span className="text-xs font-medium text-[hsl(var(--forest))]">
                      {comment.cattle.name} ({comment.cattle.code})
                    </span>
                  </div>
                  <p className="text-sm text-[hsl(var(--forest))/80] line-clamp-2">
                    {comment.content}
                  </p>
                  <p className="text-xs text-[hsl(var(--forest))/50] mt-2">
                    {formatRelativeTime(comment.createdAt)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Add RecentComments to homepage**

```tsx
// src/app/(public)/page.tsx
import { RecentComments } from '@/components/home/RecentComments'

// Add after PantauPerkembanganSection:
// <RecentComments />
```

- [ ] **Step 6: Add comment form to cattle detail page**

```tsx
// src/app/sapi/[code]/page.tsx - add comment form
// Add CommentForm component and include in page
```

---

### Task 6: Admin Pages

**Files:**
- Create: `src/app/api/admin/weights/route.ts`
- Create: `src/app/api/admin/health/route.ts`
- Create: `src/app/api/admin/feed/route.ts`
- Create: `src/app/api/admin/media/route.ts`
- Create: `src/app/api/admin/users/route.ts`
- Create: `src/app/api/admin/settings/route.ts`
- Create: `src/app/api/admin/cattle/select/route.ts`
- Create: `src/app/admin/weight/page.tsx`
- Create: `src/app/admin/health/page.tsx`
- Create: `src/app/admin/feed/page.tsx`
- Create: `src/app/admin/media/page.tsx`
- Create: `src/app/admin/users/page.tsx`
- Create: `src/app/admin/settings/page.tsx`
- Create: `src/components/admin/CattleSelect.tsx`
- Modify: `src/components/admin/AdminSidebar.tsx`

**Interfaces:**
- Consumes: Admin auth, form data
- Produces: CRUD operations for weights, health, feed, media, users, settings

- [ ] **Step 1: Create Cattle Select API for dropdowns**

```typescript
// src/app/api/admin/cattle/select/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const cattle = await prisma.cattle.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        breed: true,
        status: true,
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ cattle })
  } catch (error) {
    console.error('Get cattle select error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create Weights API**

```typescript
// src/app/api/admin/weights/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentAdmin } from '@/lib/auth/jwt'

// GET /api/admin/weights?cattleId=xxx
export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const cattleId = searchParams.get('cattleId')

  try {
    const where = cattleId ? { cattleId } : {}
    
    const weights = await prisma.cattleWeight.findMany({
      where,
      include: {
        cattle: { select: { id: true, code: true, name: true } },
      },
      orderBy: { measurementDate: 'desc' }
    })

    return NextResponse.json({ weights })
  } catch (error) {
    console.error('Get weights error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// POST /api/admin/weights
export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { cattleId, weight, measurementDate, notes } = await request.json()

    if (!cattleId || !weight || !measurementDate) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const newWeight = await prisma.cattleWeight.create({
      data: {
        cattleId,
        weight: parseFloat(weight),
        measurementDate: new Date(measurementDate),
        notes: notes || null,
      }
    })

    return NextResponse.json({ success: true, weight: newWeight })
  } catch (error) {
    console.error('Create weight error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// PUT /api/admin/weights?id=xxx
export async function PUT(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const { weight, measurementDate, notes } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    const updated = await prisma.cattleWeight.update({
      where: { id },
      data: {
        weight: weight ? parseFloat(weight) : undefined,
        measurementDate: measurementDate ? new Date(measurementDate) : undefined,
        notes,
      }
    })

    return NextResponse.json({ success: true, weight: updated })
  } catch (error) {
    console.error('Update weight error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// DELETE /api/admin/weights?id=xxx
export async function DELETE(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
  }

  try {
    await prisma.cattleWeight.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete weight error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Create Health API**

```typescript
// src/app/api/admin/health/route.ts
// Similar structure to weights API but for CattleHealthRecord
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentAdmin } from '@/lib/auth/jwt'

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const cattleId = searchParams.get('cattleId')

  try {
    const where = cattleId ? { cattleId } : {}
    const records = await prisma.cattleHealthRecord.findMany({
      where,
      include: { cattle: { select: { id: true, code: true, name: true } } },
      orderBy: { recordDate: 'desc' }
    })
    return NextResponse.json({ records })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { cattleId, recordDate, healthType, status, notes } = await request.json()

    if (!cattleId || !recordDate || !healthType) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const record = await prisma.cattleHealthRecord.create({
      data: {
        cattleId,
        recordDate: new Date(recordDate),
        healthType,
        status: status || 'SEHAT',
        notes: notes || null,
      }
    })

    return NextResponse.json({ success: true, record })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const body = await request.json()

  try {
    const updated = await prisma.cattleHealthRecord.update({
      where: { id: id! },
      data: {
        recordDate: body.recordDate ? new Date(body.recordDate) : undefined,
        healthType: body.healthType,
        status: body.status,
        notes: body.notes,
      }
    })
    return NextResponse.json({ success: true, record: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  try {
    await prisma.cattleHealthRecord.delete({ where: { id: id! } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Create Feed API**

```typescript
// src/app/api/admin/feed/route.ts
// Similar structure for CattleFeedRecord
// POST, GET, PUT, DELETE operations
```

- [ ] **Step 5: Create Media API**

```typescript
// src/app/api/admin/media/route.ts
// CRUD for CattleMedia with S3 upload
import { uploadToS3 } from '@/lib/storage/upload'
import { deleteFromS3 } from '@/lib/storage/delete'

// POST with file upload to iDrive E2
```

- [ ] **Step 6: Create Users API**

```typescript
// src/app/api/admin/users/route.ts
// CRUD for User model
// Include role management
```

- [ ] **Step 7: Create Settings API**

```typescript
// src/app/api/admin/settings/route.ts
// GET/PUT for application settings
```

- [ ] **Step 8: Create CattleSelect component**

```tsx
// src/components/admin/CattleSelect.tsx
'use client'

import { useState, useEffect } from 'react'

interface CattleOption {
  id: string
  code: string
  name: string
  breed: string
}

interface CattleSelectProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function CattleSelect({ value, onChange, className = '' }: CattleSelectProps) {
  const [cattle, setCattle] = useState<CattleOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/cattle/select')
      .then(res => res.json())
      .then(data => {
        setCattle(data.cattle || [])
        setLoading(false)
      })
  }, [])

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-lg border border-[hsl(var(--line))] bg-white px-3 py-2 text-[hsl(var(--forest))] focus:ring-2 focus:ring-[hsl(var(--forest))] focus:border-transparent ${className}`}
      disabled={loading}
    >
      <option value="">Pilih Sapi</option>
      {cattle.map(c => (
        <option key={c.id} value={c.id}>
          {c.name} ({c.code}) - {c.breed}
        </option>
      ))}
    </select>
  )
}
```

- [ ] **Step 9: Create admin pages**

```tsx
// src/app/admin/weight/page.tsx
// src/app/admin/health/page.tsx
// src/app/admin/feed/page.tsx
// src/app/admin/media/page.tsx
// src/app/admin/users/page.tsx
// src/app/admin/settings/page.tsx
```

- [ ] **Step 10: Update AdminSidebar with new links**

```tsx
// src/components/admin/AdminSidebar.tsx - add links to new pages
```

---

## Phase C: Fixes & Integration

---

### Task 7: Resend Email Fix

**Files:**
- Modify: `src/components/auth/VerificationForm.tsx`

**Interfaces:**
- Consumes: `email`, `onSuccess`, `onBack`
- Produces: Verification form without alert

- [ ] **Step 1: Remove resend alert from VerificationForm**

```tsx
// src/components/auth/VerificationForm.tsx - handleResend function
const handleResend = async () => {
  setLoading(true)
  try {
    await fetch('/api/auth/resend-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    // Remove: alert('Kode verifikasi baru telah dikirim...')
  } catch {
    // Silent fail
  } finally {
    setLoading(false)
  }
}
```

---

### Task 8: Dashboard Real-time Updates

**Files:**
- Modify: `src/app/admin/dashboard/page.tsx`

**Interfaces:**
- Consumes: Dashboard data
- Produces: Auto-refresh dashboard

- [ ] **Step 1: Add refresh mechanism to dashboard**

```tsx
// src/app/admin/dashboard/page.tsx
// Option 1: Add refresh button
// Option 2: Use useEffect with polling
// Option 3: Use SWR/React Query (recommended)

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function DashboardPage() {
  const { data, error, isLoading, mutate } = useSWR('/api/admin/dashboard', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  })

  // Call mutate() after any data mutation to refresh
  // ...

  return (
    // Dashboard content with data.summary, data.recentActivity, etc.
  )
}
```

---

## Task Summary

| Task | Files | Description |
|------|-------|-------------|
| 1 | 4 files | Horizontal scroll catalog |
| 2 | 10 files | Pantau Perkembangan section |
| 3 | 2 files | Admin dropdown fix |
| 4 | 8 files | iDrive E2 storage setup |
| 5 | 16 files | Comment system |
| 6 | 17 files | Admin pages |
| 7 | 1 file | Resend email fix |
| 8 | 1 file | Dashboard updates |

---

## Dependencies Installation

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner swr
npm install --save-dev @types/qrcode
```
