import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentUser } from '@/lib/auth/jwt'

// GET /api/bookings
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Login diperlukan' }, { status: 401 })
  }

  // Both admin and user login set adminId in the token
  const userId = user.adminId || (user as any).id

  try {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        cattle: { select: { id: true, code: true, name: true, mainImage: true, price: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// POST /api/bookings
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Login diperlukan' }, { status: 401 })
  }

  // Both admin and user login set adminId in the token
  const userId = user.adminId || (user as any).id

  try {
    const { cattleId, phone, quantity = 1, notes } = await request.json()

    // Validate required fields
    if (!cattleId || !phone) {
      return NextResponse.json({ error: 'ID sapi dan nomor telepon wajib diisi' }, { status: 400 })
    }

    // Validate quantity
    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json({ error: 'Jumlah harus minimal 1' }, { status: 400 })
    }

    // Validate phone format
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json({ error: 'Format nomor telepon tidak valid' }, { status: 400 })
    }

    // Check cattle exists and is available
    const cattle = await prisma.cattle.findUnique({
      where: { id: cattleId },
      select: { id: true, status: true, quantity: true, name: true, code: true }
    })

    if (!cattle) {
      return NextResponse.json({ error: 'Sapi tidak ditemukan' }, { status: 404 })
    }

    if (cattle.status !== 'AVAILABLE') {
      return NextResponse.json({ error: 'Sapi tidak tersedia untuk booking' }, { status: 400 })
    }

    if (quantity > cattle.quantity) {
      return NextResponse.json({ error: `Stok tidak mencukupi (tersedia: ${cattle.quantity})` }, { status: 400 })
    }

    // Create booking and notification in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Create booking - connect to existing cattle and user records
      const newBooking = await tx.booking.create({
        data: {
          cattle: { connect: { id: cattleId } },
          user: { connect: { id: userId } },
          quantity,
          notes: notes || null,
          status: 'PENDING',
        },
        include: {
          cattle: { select: { id: true, code: true, name: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      })

      // Create notification for super admin
      const admins = await tx.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      })

      if (admins.length > 0) {
        await tx.notification.createMany({
          data: admins.map(admin => ({
            userId: admin.id,
            title: 'Permintaan Booking Baru',
            message: `${newBooking.user.name || 'User'} ingin booking ${cattle.name} (${cattle.code}) - qty: ${quantity}`,
            type: 'BOOKING_REQUEST',
            data: JSON.stringify({ bookingId: newBooking.id, cattleId }),
          })),
        })
      }

      return newBooking
    })

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
