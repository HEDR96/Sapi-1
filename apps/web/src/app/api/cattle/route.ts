import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { CattleQuerySchema } from '@/lib/validations/cattle'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = CattleQuerySchema.parse(Object.fromEntries(searchParams))

    const where: Record<string, unknown> = {}

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { breed: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    if (query.status) {
      where.status = query.status
    }

    if (query.breed) {
      where.breed = query.breed
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {}
      if (query.minPrice !== undefined) {
        (where.price as Record<string, number>).gte = query.minPrice
      }
      if (query.maxPrice !== undefined) {
        (where.price as Record<string, number>).lte = query.maxPrice
      }
    }

    const skip = (query.page - 1) * query.limit

    const [cattle, total] = await Promise.all([
      prisma.cattle.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          weights: {
            orderBy: { measurementDate: 'desc' },
            take: 1,
          },
          media: {
            orderBy: { createdAt: 'asc' },
            take: 1,
          },
        },
      }),
      prisma.cattle.count({ where }),
    ])

    // Filter by weight if needed
    let filteredCattle = cattle
    if (query.minWeight !== undefined || query.maxWeight !== undefined) {
      filteredCattle = cattle.filter((c) => {
        const lastWeight = c.weights[0]?.weight || 0
        if (query.minWeight !== undefined && lastWeight < query.minWeight) return false
        if (query.maxWeight !== undefined && lastWeight > query.maxWeight) return false
        return true
      })
    }

    // Remove weights/media from response (only needed for filtering / fallback thumbnail).
    // This is a public unauthenticated route - never include internal
    // cost/margin fields in the response.
    const items = filteredCattle.map(({ weights, media, buyPrice, sellPrice, healthCost, feedCost, ...c }) => ({
      ...c,
      lastWeight: weights[0]?.weight || null,
      // Fall back to the first gallery item when no dedicated mainImage was set
      // (e.g. photos/videos added only via the Dokumentasi tab)
      mainImage: c.mainImage || media[0]?.fileUrl || null,
    }))

    return NextResponse.json({
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    })
  } catch (error) {
    console.error('Error fetching cattle:', error)

    // Handle Zod validation errors with 400 status
    if (error instanceof ZodError) {
      const issues = error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }))
      return NextResponse.json(
        { error: 'Validation failed', issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch cattle' },
      { status: 500 }
    )
  }
}
