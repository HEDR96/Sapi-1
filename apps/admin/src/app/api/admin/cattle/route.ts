import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentAdmin } from '@/lib/auth/jwt'

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
    console.log('[GET /api/admin/cattle] Starting...')

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : undefined

    const cattle = await prisma.cattle.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        weights: { orderBy: { measurementDate: 'desc' }, take: 1 },
        media: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    })

    const items = cattle.map(({ weights, media, ...c }) => ({
      ...c,
      price: Number(c.price),
      buyPrice: c.buyPrice ? Number(c.buyPrice) : null,
      sellPrice: c.sellPrice ? Number(c.sellPrice) : null,
      healthCost: c.healthCost ? Number(c.healthCost) : null,
      feedCost: c.feedCost ? Number(c.feedCost) : null,
      lastWeight: weights[0]?.weight || null,
      // Keep buyPrice for sales calculations
    }))

    console.log(`[GET /api/admin/cattle] Found ${items.length} cattle`)

    return NextResponse.json({ items, total: items.length })
  } catch (error: any) {
    console.error('[GET /api/admin/cattle] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch cattle', details: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('[POST /api/admin/cattle] Body:', JSON.stringify(body, null, 2))

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
        buyPrice: body.buyPrice ? parseFloat(body.buyPrice) : null,
        sellPrice: body.sellPrice ? parseFloat(body.sellPrice) : null,
        healthCost: body.healthCost ? parseFloat(body.healthCost) : null,
        feedCost: body.feedCost ? parseFloat(body.feedCost) : null,
      },
    })

    console.log('[POST /api/admin/cattle] Created:', cattle.id)

    return NextResponse.json({ success: true, data: cattle })
  } catch (error: any) {
    console.error('[POST /api/admin/cattle] Error:', error)
    return NextResponse.json({ error: 'Failed to create cattle', details: error.message }, { status: 500 })
  }
}
