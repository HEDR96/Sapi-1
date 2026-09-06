import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentAdmin } from '@/lib/auth/jwt'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const records = await prisma.cattleFeedRecord.findMany({
      where: { cattleId: params.id },
      orderBy: { recordDate: 'desc' },
    })
    return NextResponse.json({ success: true, data: records })
  } catch (error) {
    console.error('Error fetching feed records:', error)
    return NextResponse.json({ error: 'Failed to fetch feed records' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { recordDate, feedType, amount, frequency, notes } = await request.json()

    const record = await prisma.cattleFeedRecord.create({
      data: {
        cattleId: params.id,
        recordDate: new Date(recordDate),
        feedType: JSON.stringify(feedType),
        amount,
        frequency,
        notes: notes || null,
      },
    })

    return NextResponse.json({ success: true, data: record })
  } catch (error) {
    console.error('Error creating feed record:', error)
    return NextResponse.json({ error: 'Failed to create feed record' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const feedId = url.searchParams.get('recordId')

    if (!feedId) {
      return NextResponse.json({ error: 'Feed record ID is required' }, { status: 400 })
    }

    await prisma.cattleFeedRecord.delete({
      where: { id: feedId },
    })

    return NextResponse.json({ success: true, message: 'Feed record deleted' })
  } catch (error) {
    console.error('Error deleting feed record:', error)
    return NextResponse.json({ error: 'Failed to delete feed record' }, { status: 500 })
  }
}
