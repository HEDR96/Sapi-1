import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentAdmin } from '@/lib/auth/jwt'

// GET /api/admin/bookings?status=PENDING&page=1
export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    const where = status && status !== 'ALL' ? { status: status as any } : {}

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          cattle: {
            select: { id: true, code: true, name: true, mainImage: true, price: true, quantity: true }
          },
          user: {
            select: { id: true, name: true, email: true }
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where })
    ])

    return NextResponse.json({
      bookings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// PUT /api/admin/bookings?id=xxx&action=approve|reject
export async function PUT(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const action = searchParams.get('action')

  if (!id || !action) {
    return NextResponse.json({ error: 'ID dan action diperlukan' }, { status: 400 })
  }

  try {
    const newStatus = action === 'approve' ? 'CONFIRMED' : 'CANCELLED'

    const booking = await prisma.booking.update({
      where: { id },
      data: { status: newStatus },
      include: {
        user: { select: { id: true, name: true, email: true } },
        cattle: { select: { id: true, name: true, code: true } },
      },
    })

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: booking.user.id,
        title: action === 'approve' ? 'Booking Diterima' : 'Booking Ditolak',
        message: action === 'approve'
          ? `Booking Anda untuk ${booking.cattle.name} (${booking.cattle.code}) telah diterima!`
          : `Maaf, booking Anda untuk ${booking.cattle.name} (${booking.cattle.code}) ditolak.`,
        type: action === 'approve' ? 'BOOKING_CONFIRMED' : 'BOOKING_CANCELLED',
        data: JSON.stringify({ bookingId: booking.id }),
      },
    })

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
