import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// GET /api/admin/sales - List all sales
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const search = searchParams.get('search') || ''

    console.log('[GET /api/admin/sales] Starting...')

    const sales = await prisma.sale.findMany({
      where: {
        ...(status && { status: status as any }),
      },
      include: {
        cattle: {
          select: {
            code: true,
            name: true,
            breed: true,
            mainImage: true,
            buyPrice: true,
            sellPrice: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Filter by search if provided
    let filteredSales = sales
    if (search) {
      const searchLower = search.toLowerCase()
      filteredSales = sales.filter(
        (s) =>
          s.cattle.name.toLowerCase().includes(searchLower) ||
          s.cattle.code.toLowerCase().includes(searchLower) ||
          s.customer.name.toLowerCase().includes(searchLower)
      )
    }

    // Convert Decimal to number
    const formattedSales = filteredSales.map(s => ({
      ...s,
      price: Number(s.price),
      margin: s.margin ? Number(s.margin) : null,
    }))

    console.log(`[GET /api/admin/sales] Found ${formattedSales.length} sales`)

    return NextResponse.json({ sales: formattedSales })
  } catch (error: any) {
    console.error('[GET /api/admin/sales] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch sales', details: error.message }, { status: 500 })
  }
}

// POST /api/admin/sales - Create sale
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cattleId, customerId, quantity, price, margin, status, notes } = body

    console.log('[POST /api/admin/sales] Body:', body)

    if (!cattleId || !customerId || !price) {
      return NextResponse.json(
        { error: 'cattleId, customerId, and price are required' },
        { status: 400 }
      )
    }

    // Create sale
    const sale = await prisma.sale.create({
      data: {
        cattleId,
        customerId,
        quantity: quantity ? parseInt(quantity, 10) : 1,
        price: parseFloat(price),
        margin: margin ? parseFloat(margin) : null,
        status: status || 'PENDING',
        notes: notes || null,
      },
      include: {
        cattle: true,
        customer: true,
      },
    })

    // Update cattle status to SOLD when a sale is created
    await prisma.cattle.update({
      where: { id: cattleId },
      data: { status: 'SOLD' },
    })

    return NextResponse.json({ sale })
  } catch (error: any) {
    console.error('[POST /api/admin/sales] Error:', error)
    return NextResponse.json({ error: 'Failed to create sale', details: error.message }, { status: 500 })
  }
}
