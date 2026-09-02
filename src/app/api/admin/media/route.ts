import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentAdmin } from '@/lib/auth/jwt'
import { uploadToGoogleDrive, deleteFromGoogleDrive, validateGoogleDriveConfig } from '@/lib/storage/google-drive-oauth'

// GET /api/admin/media?cattleId=xxx&page=1&limit=20
export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const cattleId = searchParams.get('cattleId')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    const where = cattleId ? { cattleId } : {}

    const [media, total] = await Promise.all([
      prisma.cattleMedia.findMany({
        where,
        include: { cattle: { select: { id: true, code: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.cattleMedia.count({ where })
    ])

    return NextResponse.json({
      media,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error('Get media error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// POST /api/admin/media (multipart/form-data or JSON)
export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Validate Google Drive config
    try {
      validateGoogleDriveConfig()
    } catch (configError: any) {
      console.error('[Media API] Configuration error:', configError.message)
      return NextResponse.json(
        { error: configError.message },
        { status: 500 }
      )
    }

    // Note: Token refresh happens automatically in uploadToGoogleDrive()

    let cattleId: string
    let fileUrl: string | null
    let fileType: string | null
    let category = 'GENERAL'
    let title: string | null = null
    let description: string | null = null
    let file: File | null = null

    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      // Handle JSON body (for URL-based uploads)
      const body = await request.json()
      cattleId = body.cattleId
      fileUrl = body.fileUrl
      fileType = body.fileType || 'IMAGE'
      category = body.category || 'GENERAL'
      title = body.title || null
      description = body.description || null
    } else {
      // Handle multipart/form-data
      const formData = await request.formData()
      cattleId = formData.get('cattleId') as string
      file = formData.get('file') as File | null
      const formFileUrl = formData.get('fileUrl')
      fileUrl = typeof formFileUrl === 'string' ? formFileUrl : null
      category = formData.get('category') as string || 'GENERAL'
      title = formData.get('title') as string | null
      description = formData.get('description') as string | null
    }

    if (!cattleId) {
      return NextResponse.json({ error: 'Cattle ID diperlukan' }, { status: 400 })
    }

    let url = fileUrl || ''

    // Upload file if provided (multipart only)
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const isVideo = file.type.startsWith('video/')
      const folder = isVideo ? 'video' : 'image'

      console.log('[Media API] Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size,
        folder,
      })

      const result = await uploadToGoogleDrive(buffer, file.name, file.type, folder)

      // Use webViewLink for display
      url = result.webViewLink || result.webContentLink || ''

      // Detect file type from upload
      fileType = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE'

      console.log('[Media API] Upload success:', result)
    }

    if (!url) {
      return NextResponse.json({ error: 'File atau URL diperlukan' }, { status: 400 })
    }

    // Detect file type from URL if not already set
    if (!fileType) {
      fileType = url.match(/\.(mp4|webm|mov)$/i) || url.includes('video') ? 'VIDEO' : 'IMAGE'
    }

    const media = await prisma.cattleMedia.create({
      data: {
        cattleId,
        category: category as any,
        fileUrl: url,
        fileType: fileType as any,
        title,
        description,
      }
    })

    return NextResponse.json({ success: true, media })
  } catch (error: any) {
    console.error('[Media API] Create media error:', {
      message: error.message,
      code: error.code,
    })
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan' },
      { status: 500 }
    )
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

  if (!id) {
    return NextResponse.json({ error: 'Media ID diperlukan' }, { status: 400 })
  }

  try {
    // Get media record first to get file URL
    const media = await prisma.cattleMedia.findUnique({
      where: { id },
    })

    if (!media) {
      return NextResponse.json({ error: 'Media tidak ditemukan' }, { status: 404 })
    }

    // Try to delete from Google Drive if it's a Google Drive URL
    const googleDriveFileId = extractGoogleDriveFileId(media.fileUrl)
    if (googleDriveFileId) {
      try {
        await deleteFromGoogleDrive(googleDriveFileId)
      } catch (deleteError: any) {
        console.error('[Media API] Failed to delete from Google Drive:', deleteError.message)
        // Continue with database deletion even if Drive deletion fails
      }
    }

    // Delete from database
    await prisma.cattleMedia.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Media API] Delete error:', {
      message: error.message,
      code: error.code,
    })
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}

/**
 * Extract Google Drive file ID from URL
 * Google Drive URLs format: https://drive.google.com/file/d/FILE_ID/view
 */
function extractGoogleDriveFileId(url: string): string | null {
  if (!url || !url.includes('drive.google.com')) {
    return null
  }

  // Try to match file ID pattern
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/open\?id=([a-zA-Z0-9_-]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}
