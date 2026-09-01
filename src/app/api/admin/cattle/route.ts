import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentUser } from '@/lib/auth/jwt'

export const dynamic = 'force-dynamic'

// Auto-generate cattle code with sequential numbering
async function generateCattleCode(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `NF-${year}`

  // Get the last cattle code with this year's prefix
  const lastCattle = await prisma.cattle.findFirst({
    where: {
      code: {
        startsWith: prefix,
      },
    },
    orderBy: {
      code: 'desc',
    },
    select: {
      code: true,
    },
  })

  if (lastCattle) {
    // Extract the number from the last code (e.g., "NF-20260001" -> 1)
    const parts = lastCattle.code.split('-')
    const lastNum = parseInt(parts[parts.length - 1], 10)
    const newNum = lastNum + 1
    return `${prefix}${String(newNum).padStart(4, '0')}`
  }

  // First cattle of the year
  return `${prefix}0001`
}

export async function GET() {
  try {
    const cattle = await prisma.cattle.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        weights: {
          orderBy: { measurementDate: 'desc' },
          take: 20,
        },
        healthRecords: {
          orderBy: { recordDate: 'desc' },
          take: 10,
        },
        feedRecords: {
          orderBy: { recordDate: 'desc' },
          take: 10,
        },
        media: {
          orderBy: { createdAt: 'desc' },
          take: 20,
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
    const admin = await getCurrentUser()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Auto-generate code if not provided
    let code = body.code
    if (!code) {
      code = await generateCattleCode()
    }

    // Check if code already exists
    const existing = await prisma.cattle.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json({ error: 'Kode sapi sudah digunakan' }, { status: 400 })
    }

    const cattle = await prisma.cattle.create({
      data: {
        code,
        name: body.name,
        breed: body.breed,
        status: body.status || 'AVAILABLE',
        birthDate: new Date(body.birthDate),
        height: body.height ? parseFloat(body.height) : null,
        price: parseFloat(body.price),
        targetWeight: body.targetWeight ? parseFloat(body.targetWeight) : null,
        description: body.description || null,
        mainImage: body.mainImage || null,
        quantity: body.quantity ? parseInt(body.quantity) : 1,
      },
    })

    return NextResponse.json({ success: true, data: cattle })
  } catch (error) {
    console.error('Error creating cattle:', error)
    return NextResponse.json({ error: 'Failed to create cattle' }, { status: 500 })
  }
}
