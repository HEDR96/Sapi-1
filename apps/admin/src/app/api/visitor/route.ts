import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { headers } from 'next/headers'

// Track visitor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { page, cattleId } = body

    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || ''
    const referer = headersList.get('referer') || ''

    // Get client IP (handle proxies)
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || null

    // Detect device type
    let device = 'desktop'
    if (/mobile/i.test(userAgent)) device = 'mobile'
    else if (/tablet|ipad/i.test(userAgent)) device = 'tablet'

    // Parse browser
    let browser = 'Unknown'
    if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) browser = 'Chrome'
    else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Safari'
    else if (/firefox/i.test(userAgent)) browser = 'Firefox'
    else if (/edge/i.test(userAgent)) browser = 'Edge'

    // Parse OS
    let os = 'Unknown'
    if (/windows/i.test(userAgent)) os = 'Windows'
    else if (/mac/i.test(userAgent)) os = 'macOS'
    else if (/linux/i.test(userAgent)) os = 'Linux'
    else if (/android/i.test(userAgent)) os = 'Android'
    else if (/ios|iphone|ipad/i.test(userAgent)) os = 'iOS'

    // Create visitor record
    await prisma.visitor.create({
      data: {
        ipAddress,
        userAgent,
        page: page || '/',
        referrer: referer || null,
        device,
        browser,
        os,
      },
    })

    // Update daily stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.dailyStats.upsert({
      where: { date: today },
      create: {
        date: today,
        pageViews: 1,
        uniqueVisitors: 1,
        cattleViews: cattleId ? 1 : 0,
      },
      update: {
        pageViews: { increment: 1 },
        cattleViews: cattleId ? { increment: 1 } : undefined,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Visitor tracking error:', error)
    // Don't fail the request if tracking fails
    return NextResponse.json({ success: false })
  }
}

// Get visitor stats (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7' // days

    const days = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    // Get daily stats
    const dailyStats = await prisma.dailyStats.findMany({
      where: {
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    })

    // Get total stats
    const totalStats = await prisma.dailyStats.aggregate({
      _sum: {
        pageViews: true,
        uniqueVisitors: true,
        cattleViews: true,
      },
    })

    // Get recent visitors
    const recentVisitors = await prisma.visitor.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    // Get page breakdown
    const pageViews = await prisma.visitor.groupBy({
      by: ['page'],
      _count: { page: true },
      orderBy: { _count: { page: 'desc' } },
      take: 10,
    })

    // Get device breakdown
    const deviceStats = await prisma.visitor.groupBy({
      by: ['device'],
      _count: { device: true },
    })

    // Get browser breakdown
    const browserStats = await prisma.visitor.groupBy({
      by: ['browser'],
      _count: { browser: true },
    })

    return NextResponse.json({
      summary: {
        totalPageViews: totalStats._sum.pageViews || 0,
        totalVisitors: totalStats._sum.uniqueVisitors || 0,
        totalCattleViews: totalStats._sum.cattleViews || 0,
      },
      dailyStats,
      recentVisitors: recentVisitors.map(v => ({
        ...v,
        createdAt: v.createdAt.toISOString(),
      })),
      pageBreakdown: pageViews.map(p => ({
        page: p.page,
        views: p._count.page,
      })),
      deviceBreakdown: deviceStats.map(d => ({
        device: d.device,
        count: d._count.device,
      })),
      browserBreakdown: browserStats.map(b => ({
        browser: b.browser,
        count: b._count.browser,
      })),
    })
  } catch (error) {
    console.error('Get visitor stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
