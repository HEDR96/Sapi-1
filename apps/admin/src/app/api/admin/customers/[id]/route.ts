import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentAdmin } from '@/lib/auth/jwt'

// GET /api/admin/customers/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        sales: {
          include: {
            cattle: {
              select: {
                code: true,
                name: true,
                mainImage: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({ customer })
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 })
  }
}

// PUT /api/admin/customers/[id]
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
    const { name, email, phone, address, purchasePercentage } = body

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        purchasePercentage: purchasePercentage ? parseFloat(purchasePercentage) : null,
      },
    })

    return NextResponse.json({ customer })
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
  }
}

// DELETE /api/admin/customers/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const salesCount = await prisma.sale.count({ where: { customerId: params.id } })
    if (salesCount > 0) {
      return NextResponse.json(
        { error: `Tidak bisa menghapus: pelanggan ini memiliki ${salesCount} riwayat penjualan. Hapus penjualan terkait terlebih dahulu.` },
        { status: 400 }
      )
    }

    await prisma.customer.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 })
  }
}
