import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentAdmin } from '@/lib/auth/jwt'

// GET /api/admin/feed?cattleId=xxx
export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const cattleId = searchParams.get('cattleId')

  try {
    const where = cattleId ? { cattleId } : {}
    const records = await prisma.cattleFeedRecord.findMany({
      where,
      include: { cattle: { select: { id: true, code: true, name: true } } },
      orderBy: { recordDate: 'desc' }
    })
    return NextResponse.json({ records })
  } catch (error) {
    console.error('Get feed records error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// POST /api/admin/feed
export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { cattleId, recordDate, feedType, amount, frequency, notes } = await request.json()

    if (!cattleId || !recordDate || !feedType) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const record = await prisma.cattleFeedRecord.create({
      data: {
        cattleId,
        recordDate: new Date(recordDate),
        feedType,
        amount: amount || '',
        frequency: frequency || '',
        notes: notes || null,
      }
    })

    return NextResponse.json({ success: true, record })
  } catch (error) {
    console.error('Create feed record error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// PUT /api/admin/feed?id=xxx
export async function PUT(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const body = await request.json()

  try {
    const updated = await prisma.cattleFeedRecord.update({
      where: { id: id! },
      data: {
        recordDate: body.recordDate ? new Date(body.recordDate) : undefined,
        feedType: body.feedType,
        amount: body.amount,
        frequency: body.frequency,
        notes: body.notes,
      }
    })
    return NextResponse.json({ success: true, record: updated })
  } catch (error) {
    console.error('Update feed record error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// DELETE /api/admin/feed?id=xxx
export async function DELETE(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  try {
    await prisma.cattleFeedRecord.delete({ where: { id: id! } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete feed record error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
