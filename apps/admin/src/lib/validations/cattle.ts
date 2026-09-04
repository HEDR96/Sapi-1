import { z } from 'zod'

export const CattleQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(12),
  search: z.string().optional(),
  status: z.enum(['AVAILABLE', 'SOLD', 'BOOKED', 'ARCHIVED']).optional(),
  breed: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minWeight: z.coerce.number().optional(),
  maxWeight: z.coerce.number().optional(),
})

const CattleCreateSchema = z.object({
  code: z.string().min(1).max(20).optional(),
  name: z.string().min(1).max(100),
  breed: z.string().min(1).max(50),
  status: z.enum(['AVAILABLE', 'SOLD', 'BOOKED', 'ARCHIVED']).default('AVAILABLE'),
  birthDate: z.string().transform((s) => new Date(s)),
  height: z.number().optional().nullable(),
  price: z.number().min(0),
  targetWeight: z.number().optional().nullable(),
  description: z.string().optional().nullable(),
  mainImage: z.string().optional().nullable(),
  quantity: z.number().int().min(1).default(1),
  buyPrice: z.number().optional().nullable(),
  sellPrice: z.number().optional().nullable(),
  healthCost: z.number().optional().nullable(),
  feedCost: z.number().optional().nullable(),
})

export const UpdateCattleSchema = CattleCreateSchema.partial()
