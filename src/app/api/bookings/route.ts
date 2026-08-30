import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentUser } from '@/lib/auth/jwt'

export const dynamic = 'force-dynamic'

// GET - List user's bookings
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.userId || user.adminId

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        cattle: {
          select: {
            id: true,
            code: true,
            name: true,
            breed: true,
            mainImage: true,
            price: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// POST - Create new booking
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.userId || user.adminId
    if (!userId) {
      return NextResponse.json({ error: 'User ID tidak ditemukan' }, { status: 400 })
    }

    const { cattleId, quantity = 1, notes } = await request.json()

    if (!cattleId) {
      return NextResponse.json({ error: 'ID sapi diperlukan' }, { status: 400 })
    }

    // Check cattle availability
    const cattle = await prisma.cattle.findUnique({
      where: { id: cattleId },
    })

    if (!cattle) {
      return NextResponse.json({ error: 'Sapi tidak ditemukan' }, { status: 404 })
    }

    if (cattle.status !== 'AVAILABLE') {
      return NextResponse.json({ error: 'Sapi tidak tersedia untuk booking' }, { status: 400 })
    }

    if (cattle.quantity < quantity) {
      return NextResponse.json({ error: 'Jumlah stok tidak mencukupi' }, { status: 400 })
    }

    // Check if user already has a pending booking for this cattle
    const existingBooking = await prisma.booking.findFirst({
      where: {
        userId,
        cattleId,
        status: 'PENDING',
      },
    })

    if (existingBooking) {
      return NextResponse.json({ error: 'Anda sudah memiliki booking pending untuk sapi ini' }, { status: 400 })
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        cattleId,
        userId,
        quantity,
        notes: notes || null,
        status: 'PENDING',
      },
      include: {
        cattle: {
          select: {
            id: true,
            code: true,
            name: true,
            breed: true,
            mainImage: true,
          },
        },
      },
    })

    // Create notification for admin
    await prisma.notification.create({
      data: {
        title: 'Booking Baru',
        message: `Ada booking baru untuk sapi ${cattle.name} (${cattle.code}) dari ${user.email}. Jumlah: ${quantity}`,
        type: 'BOOKING_REQUEST',
        data: JSON.stringify({
          bookingId: booking.id,
          cattleId: cattle.id,
          userId,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Booking berhasil dibuat',
      booking,
    })
  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
