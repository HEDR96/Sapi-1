import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentAdmin } from '@/lib/auth/admin'

// GET /api/admin/testimonials
export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const testimonials = await prisma.testimonial.findMany({
      include: {
        cattle: { select: { id: true, code: true, name: true } },
      },
      orderBy: [
        { isActive: 'desc' },
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({ testimonials })
  } catch (error) {
    console.error('Get testimonials error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// POST /api/admin/testimonials
export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { customerName, content, rating, isActive, order, cattleId } = await request.json()

    if (!customerName || !content) {
      return NextResponse.json({ error: 'Nama dan konten wajib diisi' }, { status: 400 })
    }

    // Check max 3 active testimonials
    if (isActive !== false) {
      const activeCount = await prisma.testimonial.count({
        where: { isActive: true },
      })
      if (activeCount >= 3) {
        return NextResponse.json({ error: 'Maksimal 3 testimoni aktif' }, { status: 400 })
      }
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        customerName,
        content,
        rating: rating || 5,
        isActive: isActive !== false,
        order: order || 0,
        cattleId: cattleId || null,
      },
      include: {
        cattle: { select: { id: true, code: true, name: true } },
      },
    })

    return NextResponse.json({ success: true, testimonial })
  } catch (error) {
    console.error('Create testimonial error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// PUT /api/admin/testimonials?id=xxx
export async function PUT(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    const { customerName, content, rating, isActive, order, cattleId } = await request.json()

    const existing = await prisma.testimonial.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Testimoni tidak ditemukan' }, { status: 404 })
    }

    // Check max 3 active testimonials when activating
    if (isActive === true && !existing.isActive) {
      const activeCount = await prisma.testimonial.count({
        where: { isActive: true },
      })
      if (activeCount >= 3) {
        return NextResponse.json({ error: 'Maksimal 3 testimoni aktif' }, { status: 400 })
      }
    }

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        customerName,
        content,
        rating,
        isActive,
        order,
        cattleId: cattleId || null,
      },
      include: {
        cattle: { select: { id: true, code: true, name: true } },
      },
    })

    return NextResponse.json({ success: true, testimonial })
  } catch (error) {
    console.error('Update testimonial error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// DELETE /api/admin/testimonials?id=xxx
export async function DELETE(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    await prisma.testimonial.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete testimonial error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
