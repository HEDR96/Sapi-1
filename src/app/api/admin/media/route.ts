import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentAdmin } from '@/lib/auth/jwt'
import { uploadToS3 } from '@/lib/storage/upload'

// GET /api/admin/media?cattleId=xxx
export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const cattleId = searchParams.get('cattleId')

  try {
    const where = cattleId ? { cattleId } : {}
    const media = await prisma.cattleMedia.findMany({
      where,
      include: { cattle: { select: { id: true, code: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ media })
  } catch (error) {
    console.error('Get media error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// POST /api/admin/media (multipart/form-data)
export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const cattleId = formData.get('cattleId') as string
    const file = formData.get('file') as File | null
    const fileUrl = formData.get('fileUrl') as string | null
    const category = formData.get('category') as string || 'GENERAL'
    const title = formData.get('title') as string | null
    const description = formData.get('description') as string | null

    if (!cattleId) {
      return NextResponse.json({ error: 'Cattle ID diperlukan' }, { status: 400 })
    }

    let url = fileUrl || ''

    // Upload file if provided
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const fileType = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE'
      url = await uploadToS3(buffer, file.name, file.type, 'media')
    }

    if (!url) {
      return NextResponse.json({ error: 'File atau URL diperlukan' }, { status: 400 })
    }

    const fileType = url.match(/\.(mp4|webm|mov)$/i) ? 'VIDEO' : 'IMAGE'

    const media = await prisma.cattleMedia.create({
      data: {
        cattleId,
        category: category as any,
        fileUrl: url,
        fileType,
        title,
        description,
      }
    })

    return NextResponse.json({ success: true, media })
  } catch (error) {
    console.error('Create media error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// DELETE /api/admin/media?id=xxx
export async function DELETE(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  try {
    await prisma.cattleMedia.delete({ where: { id: id! } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete media error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
