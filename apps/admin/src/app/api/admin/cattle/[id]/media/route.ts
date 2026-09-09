import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentAdmin } from '@/lib/auth/jwt'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const media = await prisma.cattleMedia.findMany({
      where: { cattleId: params.id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data: media })
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string || 'GENERAL'
    const title = formData.get('title') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type exists and is valid
    if (!file.type || typeof file.type !== 'string') {
      return NextResponse.json({ error: 'Invalid file type: missing or undefined' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Generate unique filename
    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

    // Create uploads directory if not exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'cattle')
    await mkdir(uploadDir, { recursive: true })

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Determine file type
    const fileType = file.type.startsWith('image/') ? 'IMAGE' : 'VIDEO'

    // Create media record
    const media = await prisma.cattleMedia.create({
      data: {
        cattleId: params.id,
        category: category as 'GENERAL' | 'WEIGHT' | 'HEALTH' | 'OTHER',
        fileUrl: `/uploads/cattle/${filename}`,
        fileType,
        title,
      },
    })

    return NextResponse.json({ success: true, data: media })
  } catch (error) {
    console.error('Error uploading media:', error)
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 })
  }
}
