import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentAdmin } from '@/lib/auth/jwt'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const records = await prisma.cattleHealthRecord.findMany({
      where: { cattleId: params.id },
      orderBy: { recordDate: 'desc' },
      include: { media: true },
    })
    return NextResponse.json({ success: true, data: records })
  } catch (error) {
    console.error('Error fetching health records:', error)
    return NextResponse.json({ error: 'Failed to fetch health records' }, { status: 500 })
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

    const { recordDate, healthType, status, notes } = await request.json()

    const record = await prisma.cattleHealthRecord.create({
      data: {
        cattleId: params.id,
        recordDate: new Date(recordDate),
        healthType,
        status,
        notes: notes || null,
      },
    })

    return NextResponse.json({ success: true, data: record })
  } catch (error) {
    console.error('Error creating health record:', error)
    return NextResponse.json({ error: 'Failed to create health record' }, { status: 500 })
  }
}
