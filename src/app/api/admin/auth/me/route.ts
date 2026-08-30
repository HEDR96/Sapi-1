import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const adminPayload = await getCurrentAdmin()

    if (!adminPayload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminPayload.adminId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      admin,
    })
  } catch (error) {
    console.error('Get admin error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
