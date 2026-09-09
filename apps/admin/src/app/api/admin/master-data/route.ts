import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentAdmin } from '@/lib/auth/jwt'

export const dynamic = 'force-dynamic'

// GET /api/admin/master-data - Get all master data
export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')

    const where = category ? { category, isActive: true } : { isActive: true }

    const items = await prisma.masterData.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { order: 'asc' },
        { value: 'asc' },
      ],
    })

    return NextResponse.json({ items })
  } catch (error: any) {
    console.error('[GET /api/admin/master-data] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch master data', details: error.message }, { status: 500 })
  }
}

// POST /api/admin/master-data - Create master data
export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { category, key, value } = body

    console.log('[POST /api/admin/master-data] Received:', { category, key, value })

    if (!category || !key || !value) {
      return NextResponse.json({ error: 'category, key, and value are required' }, { status: 400 })
    }

    // Check if already exists
    const existing = await prisma.masterData.findUnique({
      where: { category_key: { category, key } },
    })

    if (existing) {
      return NextResponse.json({ error: 'Master data with this category and key already exists' }, { status: 400 })
    }

    // Get max order for this category and auto-increment
    const maxOrderItem = await prisma.masterData.findFirst({
      where: { category },
      orderBy: { order: 'desc' },
    })
    const newOrder = maxOrderItem ? maxOrderItem.order + 1 : 1

    const item = await prisma.masterData.create({
      data: { category, key, value, order: newOrder },
    })

    console.log('[POST /api/admin/master-data] Created:', item)
    return NextResponse.json({ item })
  } catch (error: any) {
    console.error('[POST /api/admin/master-data] Error:', error)
    return NextResponse.json({ error: 'Failed to create master data', details: error.message }, { status: 500 })
  }
}

// PUT /api/admin/master-data - Update master data
export async function PUT(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, value, isActive, order } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const item = await prisma.masterData.update({
      where: { id },
      data: {
        ...(value !== undefined && { value }),
        ...(isActive !== undefined && { isActive }),
        ...(order !== undefined && { order }),
      },
    })

    return NextResponse.json({ item })
  } catch (error: any) {
    console.error('[PUT /api/admin/master-data] Error:', error)
    return NextResponse.json({ error: 'Failed to update master data', details: error.message }, { status: 500 })
  }
}

// DELETE /api/admin/master-data?id=xxx - Delete master data
export async function DELETE(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    await prisma.masterData.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[DELETE /api/admin/master-data] Error:', error)
    return NextResponse.json({ error: 'Failed to delete master data', details: error.message }, { status: 500 })
  }
}
