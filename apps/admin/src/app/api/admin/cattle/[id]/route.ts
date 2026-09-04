import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentAdmin } from '@/lib/auth/jwt'
import { UpdateCattleSchema } from '@/lib/validations/cattle'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cattle = await prisma.cattle.findUnique({
      where: { id: params.id },
      include: {
        weights: { orderBy: { measurementDate: 'asc' } },
        healthRecords: { orderBy: { recordDate: 'desc' } },
        feedRecords: { orderBy: { recordDate: 'desc' } },
        media: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!cattle) {
      return NextResponse.json({ error: 'Cattle not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: cattle })
  } catch (error) {
    console.error('Error fetching cattle:', error)
    return NextResponse.json({ error: 'Failed to fetch cattle' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Build update data dynamically
    const updateData: any = {}
    if (body.code) updateData.code = body.code
    if (body.name) updateData.name = body.name
    if (body.breed) updateData.breed = body.breed
    if (body.status) updateData.status = body.status
    if (body.birthDate) updateData.birthDate = new Date(body.birthDate)
    if (body.height !== undefined && body.height !== null) updateData.height = parseFloat(body.height)
    if (body.price !== undefined) updateData.price = parseFloat(body.price)
    if (body.targetWeight !== undefined) updateData.targetWeight = body.targetWeight ? parseFloat(body.targetWeight) : null
    if (body.description !== undefined) updateData.description = body.description || null
    if (body.mainImage !== undefined) updateData.mainImage = body.mainImage || null
    if (body.buyPrice !== undefined) updateData.buyPrice = body.buyPrice ? parseFloat(body.buyPrice) : null
    if (body.sellPrice !== undefined) updateData.sellPrice = body.sellPrice ? parseFloat(body.sellPrice) : null
    if (body.healthCost !== undefined) updateData.healthCost = body.healthCost ? parseFloat(body.healthCost) : null
    if (body.feedCost !== undefined) updateData.feedCost = body.feedCost ? parseFloat(body.feedCost) : null

    const cattle = await prisma.cattle.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: cattle })
  } catch (error) {
    console.error('Error updating cattle:', error)
    return NextResponse.json({ error: 'Failed to update cattle' }, { status: 500 })
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

    await prisma.cattle.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, message: 'Cattle deleted' })
  } catch (error) {
    console.error('Error deleting cattle:', error)
    return NextResponse.json({ error: 'Failed to delete cattle' }, { status: 500 })
  }
}
