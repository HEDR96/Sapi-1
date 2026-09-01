import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentAdmin } from '@/lib/auth/jwt'

// GET /api/admin/health?cattleId=xxx&page=1&limit=20
export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const cattleId = searchParams.get('cattleId')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    const where = cattleId ? { cattleId } : {}

    const [records, total] = await Promise.all([
      prisma.cattleHealthRecord.findMany({
        where,
        include: { cattle: { select: { id: true, code: true, name: true } } },
        orderBy: { recordDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.cattleHealthRecord.count({ where })
    ])

    return NextResponse.json({
      records,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error('Get health records error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// POST /api/admin/health
export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { cattleId, recordDate, healthType, status, notes } = await request.json()

    if (!cattleId || !recordDate || !healthType) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const record = await prisma.cattleHealthRecord.create({
      data: {
        cattleId,
        recordDate: new Date(recordDate),
        healthType,
        status: status || 'SEHAT',
        notes: notes || null,
      }
    })

    return NextResponse.json({ success: true, record })
  } catch (error) {
    console.error('Create health record error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// PUT /api/admin/health?id=xxx
export async function PUT(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const body = await request.json()

  try {
    const updated = await prisma.cattleHealthRecord.update({
      where: { id: id! },
      data: {
        recordDate: body.recordDate ? new Date(body.recordDate) : undefined,
        healthType: body.healthType,
        status: body.status,
        notes: body.notes,
      }
    })
    return NextResponse.json({ success: true, record: updated })
  } catch (error) {
    console.error('Update health record error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// DELETE /api/admin/health?id=xxx
export async function DELETE(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  try {
    await prisma.cattleHealthRecord.delete({ where: { id: id! } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete health record error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
