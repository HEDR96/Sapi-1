import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// GET /api/admin/visitors - List visitors with stats
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    console.log('[GET /api/admin/visitors] Starting...')

    const [visitors, total] = await Promise.all([
      prisma.visitor.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.visitor.count(),
    ])

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [todayVisitors, weekVisitors, monthVisitors, totalVisitors] = await Promise.all([
      prisma.visitor.count({ where: { createdAt: { gte: today } } }),
      prisma.visitor.count({ where: { createdAt: { gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) } } }),
      prisma.visitor.count({ where: { createdAt: { gte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) } } }),
      prisma.visitor.count(),
    ])

    // Get page views
    let pageViews: { page: string; count: number }[] = []
    try {
      const rawPageViews = await prisma.$queryRaw<{ page: string; count: bigint }[]>`
        SELECT page, COUNT(*) as count
        FROM "Visitor"
        GROUP BY page
        ORDER BY count DESC
        LIMIT 10
      `
      pageViews = rawPageViews.map((p) => ({ page: p.page, count: Number(p.count) }))
    } catch (e: any) {
      console.log('[GET /api/admin/visitors] Page views query error:', e.message)
    }

    console.log(`[GET /api/admin/visitors] Found ${visitors.length} visitors, total: ${total}`)

    return NextResponse.json({
      visitors,
      stats: {
        today: todayVisitors,
        week: weekVisitors,
        month: monthVisitors,
        total: totalVisitors,
      },
      pageViews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error: any) {
    console.error('[GET /api/admin/visitors] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch visitors', details: error.message }, { status: 500 })
  }
}
