# Task 1.3: Create Core Utilities and Types

## Goal
Create core utility functions and TypeScript types.

## Files to Create
- `src/lib/utils/cn.ts`
- `src/lib/utils/formatters.ts`
- `src/lib/utils/calculations.ts`
- `src/types/index.ts`

## src/lib/utils/cn.ts
```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## src/lib/utils/formatters.ts
Create utility functions for formatting:
- `formatCurrency(amount: number)` - Format as IDR currency (e.g., "Rp 45.000.000")
- `formatWeight(weight: number)` - Format as "527 Kg"
- `formatHeight(height: number)` - Format as "145 cm"
- `formatDate(date: Date | string)` - Format as "10 Agustus 2025" (Indonesian)
- `formatDateShort(date: Date | string)` - Format as "10 Ags 2025"
- `formatRelativeTime(date: Date | string)` - Format as relative time
- `formatCode(code: string)` - Format code as uppercase

Use date-fns with Indonesian locale (date-fns/locale/id)

## src/lib/utils/calculations.ts
Create weight calculation functions:

```typescript
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

export function calculateWeightStats(weights: WeightData[]): WeightCalculation
// Returns initial weight (first), last weight (most recent), weight gain, ADG, days diff

export function estimateTargetCompletion(
  targetWeight: number,
  lastWeight: number,
  adg: number | null
): TargetEstimation
// Returns remaining weight, estimated days, estimated date, progress percentage
```

ADG formula: (lastWeight - initialWeight) / daysDiff
Use date-fns differenceInDays and addDays

## src/types/index.ts
Export all types and constants:

```typescript
import { Status, HealthStatus, MediaCategory, AdminRole } from '@prisma/client'

export type { Status, HealthStatus, MediaCategory, AdminRole }

// Re-export Prisma types for use in app
export interface CattleWithRelations { /* full cattle with all relations */ }
export interface CattleWeightWithMedia { /* weight with media */ }
export interface CattleHealthRecordWithMedia { /* health with media */ }
export interface CattleFeedRecord { /* feed record */ }
export interface CattleMedia { /* media item */ }
export interface Admin { /* admin user */ }

// API types
export interface ApiResponse<T> { success: boolean; data?: T; error?: string }
export interface PaginatedResponse<T> { items: T[]; total: number; page: number; limit: number; totalPages: number }
export interface CattleFilters { search?: string; status?: Status; breed?: string; minPrice?: number; maxPrice?: number; minWeight?: number; maxWeight?: number; page?: number; limit?: number }
export interface JWTPayload { adminId: string; email: string; role: AdminRole }

// Constants
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

export const BREED_OPTIONS = ['Limousin', 'Simental', 'Brahman', 'Angus', 'Lainnya']
```

## Verification
- All TypeScript types compile without errors
- Utility functions work correctly
