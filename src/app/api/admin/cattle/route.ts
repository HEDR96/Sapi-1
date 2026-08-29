import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentAdmin } from '@/lib/auth/jwt'
import { CreateCattleSchema } from '@/lib/validations/cattle'

export async function GET() {
  try {
    const cattle = await prisma.cattle.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        weights: {
          orderBy: { measurementDate: 'desc' },
          take: 1,
        },
      },
    })

    const items = cattle.map(({ weights, ...c }) => ({
      ...c,
      lastWeight: weights[0]?.weight || null,
    }))

    return NextResponse.json({ items, total: items.length })
  } catch (error) {
    console.error('Error fetching cattle:', error)
    return NextResponse.json({ error: 'Failed to fetch cattle' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = CreateCattleSchema.parse(body)

    const cattle = await prisma.cattle.create({
      data: {
        code: data.code,
        name: data.name,
        breed: data.breed,
        status: data.status,
        birthDate: data.birthDate,
        height: data.height,
        price: data.price,
        targetWeight: data.targetWeight,
        description: data.description,
        mainImage: data.mainImage,
      },
    })

    return NextResponse.json({ success: true, data: cattle })
  } catch (error) {
    console.error('Error creating cattle:', error)
    return NextResponse.json({ error: 'Failed to create cattle' }, { status: 500 })
  }
}
