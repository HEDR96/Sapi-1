import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// GET /api/admin/customers - List all customers
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''

    console.log('[GET /api/admin/customers] Starting...')

    const customers = await prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: {
        sales: {
          select: {
            id: true,
            quantity: true,
            price: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    console.log(`[GET /api/admin/customers] Found ${customers.length} customers`)

    return NextResponse.json({ customers })
  } catch (error: any) {
    console.error('[GET /api/admin/customers] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch customers', details: error.message }, { status: 500 })
  }
}

// POST /api/admin/customers - Create customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, address, purchasePercentage } = body

    console.log('[POST /api/admin/customers] Body:', body)

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        purchasePercentage: purchasePercentage ? parseFloat(purchasePercentage) : null,
      },
    })

    return NextResponse.json({ customer })
  } catch (error: any) {
    console.error('[POST /api/admin/customers] Error:', error)
    return NextResponse.json({ error: 'Failed to create customer', details: error.message }, { status: 500 })
  }
}
