# Task 1.6: Create API Routes

## Goal
Create public API routes for cattle listing and detail.

## Files to Create
- `src/lib/validations/cattle.ts`
- `src/app/api/cattle/route.ts`
- `src/app/api/cattle/[code]/route.ts`

## src/lib/validations/cattle.ts
```typescript
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
```

## src/app/api/cattle/route.ts
GET handler that returns paginated cattle list.

Features:
- Pagination (page, limit)
- Search by name, code, breed
- Filter by status
- Filter by breed
- Filter by price range
- Filter by weight (using last weight from weights relation)

Response:
```typescript
{
  items: Cattle[],
  total: number,
  page: number,
  limit: number,
  totalPages: number
}
```

Each cattle item should include lastWeight from the most recent weight record.

## src/app/api/cattle/[code]/route.ts
GET handler that returns full cattle detail.

Includes:
- All cattle fields
- Weights (ordered by date ascending)
- Health records (ordered by date descending)
- Feed records (ordered by date descending)
- Media
- Calculated weight stats (using calculateWeightStats)
- Target estimation (using estimateTargetCompletion)

Response:
```typescript
{
  ...cattle,
  lastWeight: number,
  weightStats: WeightCalculation,
  targetEstimation: TargetEstimation
}
```

Return 404 if cattle not found.

## Verification
- API returns correct data
- Pagination works
- Filters work
- 404 handling works
