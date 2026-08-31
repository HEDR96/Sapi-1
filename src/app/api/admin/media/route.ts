import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentAdmin } from '@/lib/auth/jwt'
import { uploadToGoogleDrive, deleteFromGoogleDrive, isAuthorized, validateGoogleDriveConfig } from '@/lib/storage/google-drive-oauth'

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

    // Check if authorized
    const authorized = await isAuthorized()
    if (!authorized) {
      return NextResponse.json(
        { error: 'Google Drive not authorized. Please authorize at /api/auth/google/init' },
        { status: 401 }
      )
    }

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

      console.log('[Media API] Upload success:', result)
    }

    if (!url) {
      return NextResponse.json({ error: 'File atau URL diperlukan' }, { status: 400 })
    }

    const fileType = url.match(/\.(mp4|webm|mov)$/i) || url.includes('video') ? 'VIDEO' : 'IMAGE'

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
