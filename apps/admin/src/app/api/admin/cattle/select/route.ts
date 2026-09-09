import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentAdmin } from '@/lib/auth/jwt'

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const cattle = await prisma.cattle.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        breed: true,
        status: true,
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ cattle })
  } catch (error) {
    console.error('Get cattle select error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
