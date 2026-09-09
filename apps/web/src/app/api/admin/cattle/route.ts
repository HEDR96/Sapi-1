import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentUser } from '@/lib/auth/jwt'

export const dynamic = 'force-dynamic'

// Auto-generate cattle code as SP-<year><month>-<sequence>, e.g. SP-202602-001
async function generateCattleCode(): Promise<string> {
  const now = new Date()
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const prefix = `SP-${yearMonth}-`

  const lastCattle = await prisma.cattle.findFirst({
    where: { code: { startsWith: prefix } },
    orderBy: { code: 'desc' },
    select: { code: true },
  })

  let nextNum = 1
  if (lastCattle) {
    // Slice off the known prefix rather than splitting on '-' so the
    // extracted sequence can't accidentally swallow the year/month too
    // (that mistake previously produced codes like "SP-20262026002").
    const lastNum = parseInt(lastCattle.code.slice(prefix.length), 10)
    if (!isNaN(lastNum)) nextNum = lastNum + 1
  }

  return `${prefix}${String(nextNum).padStart(3, '0')}`
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : undefined

    const cattle = await prisma.cattle.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
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

    // This route is called unauthenticated by the public site (homepage /
    // katalog transparency features), so internal cost/margin fields must
    // never be included in the response even though the DB query needs
    // them for other calculations elsewhere in the app.
    const items = cattle.map(({ weights, healthRecords, feedRecords, media, buyPrice, sellPrice, healthCost, feedCost, ...c }) => ({
      ...c,
      lastWeight: weights[0]?.weight || null,
      weights,
      healthRecords,
      feedRecords,
      media,
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
