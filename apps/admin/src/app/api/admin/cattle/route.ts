import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentAdmin } from '@/lib/auth/jwt'

export const dynamic = 'force-dynamic'

// Auto-generate cattle code with sequential numbering (format: SP-YYYY-NNN)
async function generateCattleCode(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `SP-${year}`

  const lastCattle = await prisma.cattle.findFirst({
    where: { code: { startsWith: prefix } },
    orderBy: { code: 'desc' },
    select: { code: true },
  })

  if (lastCattle) {
    // Expected format: SP-YYYY-NNN (e.g., SP-2026-001)
    const parts = lastCattle.code.split('-')
    const lastNum = parseInt(parts[parts.length - 1], 10)
    return `${prefix}-${String(lastNum + 1).padStart(3, '0')}`
  }

  return `${prefix}-001`
}

export async function GET() {
  try {
    console.log('[GET /api/admin/cattle] Starting...')

    const cattle = await prisma.cattle.findMany({
      orderBy: { createdAt: 'desc' },
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
