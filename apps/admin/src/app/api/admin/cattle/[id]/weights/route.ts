import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentAdmin } from '@/lib/auth/jwt'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const weights = await prisma.cattleWeight.findMany({
      where: { cattleId: params.id },
      orderBy: { measurementDate: 'asc' },
      include: { media: true },
    })
    return NextResponse.json({ success: true, data: weights })
  } catch (error) {
    console.error('Error fetching weights:', error)
    return NextResponse.json({ error: 'Failed to fetch weights' }, { status: 500 })
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

    const { weight, measurementDate, notes } = await request.json()

    const newWeight = await prisma.cattleWeight.create({
      data: {
        cattleId: params.id,
        weight: parseFloat(weight),
        measurementDate: new Date(measurementDate),
        notes: notes || null,
      },
    })

    return NextResponse.json({ success: true, data: newWeight })
  } catch (error) {
    console.error('Error creating weight:', error)
    return NextResponse.json({ error: 'Failed to create weight' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[DELETE /api/admin/cattle/[id]/weights] Called')
  console.log('[DELETE /api/admin/cattle/[id]/weights] request.url:', request.url)

  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      console.log('[DELETE /api/admin/cattle/[id]/weights] Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse URL to get query params
    const url = new URL(request.url)
    const weightId = url.searchParams.get('id')
    console.log('[DELETE /api/admin/cattle/[id]/weights] weightId:', weightId)
    console.log('[DELETE /api/admin/cattle/[id]/weights] url.searchParams:', url.searchParams.toString())

    if (!weightId) {
      console.log('[DELETE /api/admin/cattle/[id]/weights] No weightId found')
      return NextResponse.json({ error: 'Weight ID is required' }, { status: 400 })
    }

    await prisma.cattleWeight.delete({
      where: { id: weightId },
    })

    console.log('[DELETE /api/admin/cattle/[id]/weights] Success')
    return NextResponse.json({ success: true, message: 'Weight deleted' })
  } catch (error) {
    console.error('Error deleting weight:', error)
    return NextResponse.json({ error: 'Failed to delete weight' }, { status: 500 })
  }
}
