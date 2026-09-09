import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentAdmin } from '@/lib/auth/jwt'

// GET /api/admin/sales/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const sale = await prisma.sale.findUnique({
      where: { id: params.id },
      include: {
        cattle: true,
        customer: true,
      },
    })

    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 })
    }

    return NextResponse.json({ sale })
  } catch (error) {
    console.error('Error fetching sale:', error)
    return NextResponse.json({ error: 'Failed to fetch sale' }, { status: 500 })
  }
}

// PUT /api/admin/sales/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { quantity, price, margin, status, notes } = body

    // Get current sale
    const currentSale = await prisma.sale.findUnique({
      where: { id: params.id },
    })

    if (!currentSale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 })
    }

    const sale = await prisma.sale.update({
      where: { id: params.id },
      data: {
        quantity: quantity !== undefined ? quantity : currentSale.quantity,
        price: price !== undefined ? parseFloat(price) : currentSale.price,
        margin: margin !== undefined ? (margin ? parseFloat(margin) : null) : currentSale.margin,
        status: status || currentSale.status,
        notes: notes !== undefined ? notes : currentSale.notes,
      },
      include: {
        cattle: true,
        customer: true,
      },
    })

    // Update cattle status based on sale status
    if (status === 'CONFIRMED' || status === 'COMPLETED') {
      await prisma.cattle.update({
        where: { id: currentSale.cattleId },
        data: { status: 'SOLD' },
      })
    } else if (status === 'CANCELLED') {
      // Only free the cattle up if no OTHER active sale still claims it
      // (e.g. a shared/qurban-patungan cattle with several sale rows).
      const otherActiveSales = await prisma.sale.count({
        where: {
          cattleId: currentSale.cattleId,
          id: { not: params.id },
          status: { in: ['CONFIRMED', 'COMPLETED'] },
        },
      })
      if (otherActiveSales === 0) {
        await prisma.cattle.update({
          where: { id: currentSale.cattleId },
          data: { status: 'AVAILABLE' },
        })
      }
    }

    return NextResponse.json({ sale })
  } catch (error) {
    console.error('Error updating sale:', error)
    return NextResponse.json({ error: 'Failed to update sale' }, { status: 500 })
  }
}

// DELETE /api/admin/sales/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const sale = await prisma.sale.findUnique({
      where: { id: params.id },
    })

    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 })
    }

    // If sale was confirmed/completed, make cattle available again - but
    // only if no OTHER active sale still claims the same cattle (e.g. a
    // shared/qurban-patungan cattle with several sale rows).
    if (sale.status === 'CONFIRMED' || sale.status === 'COMPLETED') {
      const otherActiveSales = await prisma.sale.count({
        where: {
          cattleId: sale.cattleId,
          id: { not: params.id },
          status: { in: ['CONFIRMED', 'COMPLETED'] },
        },
      })
      if (otherActiveSales === 0) {
        await prisma.cattle.update({
          where: { id: sale.cattleId },
          data: { status: 'AVAILABLE' },
        })
      }
    }

    await prisma.sale.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting sale:', error)
    return NextResponse.json({ error: 'Failed to delete sale' }, { status: 500 })
  }
}
