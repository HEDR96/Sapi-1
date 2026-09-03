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

  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'Action harus approve atau reject' }, { status: 400 })
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Check booking exists and is PENDING
      const existing = await tx.booking.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, name: true, email: true } },
          cattle: { select: { id: true, name: true, code: true, status: true, quantity: true } },
        },
      })

      if (!existing) {
        throw new Error('Booking tidak ditemukan')
      }

      if (existing.status !== 'PENDING') {
        throw new Error('Booking sudah diproses')
      }

      const newStatus = action === 'approve' ? 'CONFIRMED' : 'CANCELLED'

      // Update booking status
      const booking = await tx.booking.update({
        where: { id },
        data: { status: newStatus },
        include: {
          user: { select: { id: true, name: true, email: true } },
          cattle: { select: { id: true, name: true, code: true } },
        },
      })

      // If approving, update cattle status to BOOKED
      if (action === 'approve') {
        await tx.cattle.update({
          where: { id: booking.cattleId },
          data: { status: 'BOOKED' },
        })
      }

      // Create notification for user
      await tx.notification.create({
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

      return booking
    })

    return NextResponse.json({ success: true, booking: result })
  } catch (error: any) {
    console.error('Update booking error:', error)
    const message = error.message || 'Terjadi kesalahan'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
