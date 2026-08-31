import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentUser } from '@/lib/auth/jwt'

// GET /api/comments?cattleId=xxx&limit=10
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cattleId = searchParams.get('cattleId')
  const limit = parseInt(searchParams.get('limit') || '10')

  try {
    const where = cattleId ? { cattleId } : {}

    const comments = await prisma.comment.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        cattle: { select: { id: true, code: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// POST /api/comments
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Login diperlukan' }, { status: 401 })
  }

  try {
    const { cattleId, content } = await request.json()

    if (!cattleId || !content) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    if (content.length < 3 || content.length > 1000) {
      return NextResponse.json({ error: 'Komentar 3-1000 karakter' }, { status: 400 })
    }

    const userId = user.userId || (user as any).id || ''
    if (!userId) {
      return NextResponse.json({ error: 'User ID tidak ditemukan' }, { status: 400 })
    }

    const comment = await prisma.comment.create({
      data: {
        userId,
        cattleId,
        content,
      },
      include: {
        user: { select: { id: true, name: true } },
        cattle: { select: { id: true, code: true, name: true } },
      },
    })

    return NextResponse.json({ success: true, comment })
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// DELETE /api/comments?id=xxx
export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Login diperlukan' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    const comment = await prisma.comment.findUnique({ where: { id } })
    if (!comment) {
      return NextResponse.json({ error: 'Komentar tidak ditemukan' }, { status: 404 })
    }

    // Check ownership
    const currentUserId = user.userId || (user as any).id || ''
    if (comment.userId !== currentUserId) {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 })
    }

    await prisma.comment.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete comment error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
