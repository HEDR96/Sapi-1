import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentAdmin } from '@/lib/auth/jwt'
import { UpdateCattleSchema } from '@/lib/validations/cattle'

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
    const data = UpdateCattleSchema.parse(body)

    const cattle = await prisma.cattle.update({
      where: { id: params.id },
      data: {
        ...(data.code && { code: data.code }),
        ...(data.name && { name: data.name }),
        ...(data.breed && { breed: data.breed }),
        ...(data.status && { status: data.status }),
        ...(data.birthDate && { birthDate: data.birthDate }),
        ...(data.height !== undefined && { height: data.height }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.targetWeight !== undefined && { targetWeight: data.targetWeight }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.mainImage !== undefined && { mainImage: data.mainImage }),
      },
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
