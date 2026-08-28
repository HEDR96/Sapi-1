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
