import { Status, HealthStatus, MediaCategory, AdminRole } from '@prisma/client'

// Re-export Prisma enums
export type { Status, HealthStatus, MediaCategory, AdminRole }

// CattleWeight media interface
export interface CattleWeightMedia {
  id: string
  weightId: string
  fileUrl: string
  fileType: string
  createdAt: Date
}

// CattleWeight interface
export interface CattleWeightWithMedia {
  id: string
  cattleId: string
  weight: number
  measurementDate: Date
  notes: string | null
  createdAt: Date
  media?: CattleWeightMedia[]
}

// CattleHealthMedia interface
export interface CattleHealthMedia {
  id: string
  healthRecordId: string
  fileUrl: string
  fileType: string
  createdAt: Date
}

// CattleHealthRecord interface
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

// CattleFeedRecord interface
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

// CattleMedia interface
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

// CattleWithRelations interface - matches Prisma schema
export interface CattleWithRelations {
  id: string
  code: string
  name: string
  breed: string
  status: Status
  birthDate: Date
  height: number | null
  price: import('@prisma/client').Prisma.Decimal
  targetWeight: number | null
  description: string | null
  mainImage: string | null
  quantity: number
  createdAt: Date
  updatedAt: Date
  weights?: CattleWeightWithMedia[]
  healthRecords?: CattleHealthRecordWithMedia[]
  feedRecords?: CattleFeedRecord[]
  media?: CattleMedia[]
}

// Admin interface
export interface Admin {
  id: string
  email: string
  name: string
  role: AdminRole
  createdAt: Date
  updatedAt: Date
}

// API types
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
  adminId?: string
  userId?: string
  email: string
  role: AdminRole | 'USER'
  iat?: number
  exp?: number
}

// Constants
export const STATUS_LABELS: Record<Status, string> = {
  AVAILABLE: 'TERSEDIA',
  SOLD: 'TERJUAL',
  BOOKED: 'DIBOOKING',
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
