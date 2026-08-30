import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentAdmin } from '@/lib/auth/jwt'

// GET /api/admin/weights?cattleId=xxx
export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const cattleId = searchParams.get('cattleId')

  try {
    const where = cattleId ? { cattleId } : {}

    const weights = await prisma.cattleWeight.findMany({
      where,
      include: {
        cattle: { select: { id: true, code: true, name: true } },
      },
      orderBy: { measurementDate: 'desc' }
    })

    return NextResponse.json({ weights })
  } catch (error) {
    console.error('Get weights error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// POST /api/admin/weights
export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { cattleId, weight, measurementDate, notes } = await request.json()

    if (!cattleId || !weight || !measurementDate) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const newWeight = await prisma.cattleWeight.create({
      data: {
        cattleId,
        weight: parseFloat(weight),
        measurementDate: new Date(measurementDate),
        notes: notes || null,
      }
    })

    return NextResponse.json({ success: true, weight: newWeight })
  } catch (error) {
    console.error('Create weight error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// PUT /api/admin/weights?id=xxx
export async function PUT(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const { weight, measurementDate, notes } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    const updated = await prisma.cattleWeight.update({
      where: { id },
      data: {
        weight: weight ? parseFloat(weight) : undefined,
        measurementDate: measurementDate ? new Date(measurementDate) : undefined,
        notes,
      }
    })

    return NextResponse.json({ success: true, weight: updated })
  } catch (error) {
    console.error('Update weight error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// DELETE /api/admin/weights?id=xxx
export async function DELETE(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
  }

  try {
    await prisma.cattleWeight.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete weight error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
