import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentAdmin } from '@/lib/auth/jwt'

export const dynamic = 'force-dynamic'

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[Dashboard Stats] Starting...')

    // Get counts - handle case where tables might not exist yet
    let totalCattle = 0, availableCattle = 0, soldCattle = 0, bookedCattle = 0
    let totalCustomers = 0, totalSales = 0
    let totalRevenue = 0, totalMargin = 0
    let todayVisitors = 0, weekVisitors = 0, monthVisitors = 0

    try {
      ;[totalCattle, availableCattle, soldCattle, bookedCattle] = await Promise.all([
        prisma.cattle.count(),
        prisma.cattle.count({ where: { status: 'AVAILABLE' } }),
        prisma.cattle.count({ where: { status: 'SOLD' } }),
        prisma.cattle.count({ where: { status: 'BOOKED' } }),
      ])
      console.log('[Dashboard Stats] Cattle counts:', { totalCattle, availableCattle, soldCattle, bookedCattle })
    } catch (e: any) {
      console.error('[Dashboard Stats] Cattle count error:', e.message)
    }

    try {
      ;[totalCustomers, totalSales] = await Promise.all([
        prisma.customer.count(),
        prisma.sale.count(),
      ])
      console.log('[Dashboard Stats] Customer/Sale counts:', { totalCustomers, totalSales })
    } catch (e: any) {
      console.error('[Dashboard Stats] Customer/Sale count error:', e.message)
    }

    // Get recent sales with cattle info
    let recentSales: any[] = []
    try {
      recentSales = await prisma.sale.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          cattle: { select: { code: true, name: true, mainImage: true, buyPrice: true, sellPrice: true } },
          customer: { select: { name: true, phone: true } },
        },
      })
    } catch (e: any) {
      console.error('[Dashboard Stats] Recent sales error:', e.message)
    }

    // Calculate financial stats
    try {
      const salesData = await prisma.sale.findMany({
        where: { status: { in: ['COMPLETED', 'CONFIRMED'] } },
        select: { price: true, margin: true, quantity: true },
      })
      totalRevenue = salesData.reduce((sum, s) => sum + Number(s.price) * s.quantity, 0)
      totalMargin = salesData.reduce((sum, s) => sum + (Number(s.margin) || 0), 0)
    } catch (e: any) {
      console.error('[Dashboard Stats] Sales data error:', e.message)
    }

    // Get visitors stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    try {
      ;[todayVisitors, weekVisitors, monthVisitors] = await Promise.all([
        prisma.visitor.count({ where: { createdAt: { gte: today } } }),
        prisma.visitor.count({ where: { createdAt: { gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) } } }),
        prisma.visitor.count({ where: { createdAt: { gte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) } } }),
      ])
    } catch (e: any) {
      console.error('[Dashboard Stats] Visitors count error:', e.message)
    }

    // Get recent cattle
    let recentCattle: any[] = []
    try {
      recentCattle = await prisma.cattle.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, code: true, name: true, breed: true, status: true,
          price: true, mainImage: true, buyPrice: true, sellPrice: true,
          weights: { take: 1, orderBy: { measurementDate: 'desc' }, select: { weight: true } },
        },
      })
    } catch (e: any) {
      console.error('[Dashboard Stats] Recent cattle error:', e.message)
    }

    console.log('[Dashboard Stats] Completed successfully')

    return NextResponse.json({
      stats: {
        cattle: { total: totalCattle, available: availableCattle, sold: soldCattle, booked: bookedCattle },
        sales: { total: totalSales, revenue: totalRevenue, margin: totalMargin },
        customers: { total: totalCustomers },
        visitors: { today: todayVisitors, week: weekVisitors, month: monthVisitors },
      },
      recentSales,
      recentCattle: recentCattle.map((c) => ({
        ...c,
        price: Number(c.price),
        buyPrice: c.buyPrice ? Number(c.buyPrice) : null,
        sellPrice: c.sellPrice ? Number(c.sellPrice) : null,
        lastWeight: c.weights[0]?.weight || null,
        weights: undefined,
      })),
    })
  } catch (error: any) {
    console.error('[Dashboard Stats] Fatal error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats', details: error.message }, { status: 500 })
  }
}
