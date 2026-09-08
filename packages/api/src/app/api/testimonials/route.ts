import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// GET /api/testimonials - Public endpoint for website
export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      include: {
        cattle: { select: { id: true, code: true, name: true } },
      },
      orderBy: { order: 'asc' },
      take: 3,
    })

    return NextResponse.json({ testimonials })
  } catch (error) {
    console.error('Get testimonials error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
