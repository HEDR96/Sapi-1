import { NextRequest, NextResponse } from 'next/server'
import { uploadToGoogleDrive, validateGoogleDriveConfig, isAuthorized } from '@/lib/storage/google-drive-oauth'

export const dynamic = 'force-dynamic'

// Map folder names to drive folder types
const FOLDER_MAPPING: Record<string, 'image' | 'video'> = {
  'cattle': 'image',
  'media': 'image',
  'profile': 'image',
  'image': 'image',
  'video': 'video',
  'video-upload': 'video',
}

export async function POST(request: NextRequest) {
  try {
    // First validate configuration
    try {
      validateGoogleDriveConfig()
    } catch (configError: any) {
      console.error('[Upload API] Configuration error:', configError.message)
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
    const file = formData.get('file') as File | null
    const folder = formData.get('folder') as string || 'image'

    if (!file) {
      return NextResponse.json(
        { error: 'File tidak ditemukan' },
        { status: 400 }
      )
    }

    // Determine file category based on type
    const isVideo = file.type.startsWith('video/')
    const isImage = file.type.startsWith('image/')

    // Validate file type
    if (isVideo) {
      if (folder !== 'video' && folder !== 'video-upload') {
        return NextResponse.json(
          { error: 'Video hanya bisa diupload ke folder video' },
          { status: 400 }
        )
      }
    } else if (isImage) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Format file tidak didukung' },
        { status: 400 }
      )
    }

    // Validate file size
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Ukuran file terlalu besar. Maksimal ${isVideo ? '50MB' : '5MB'}.` },
        { status: 400 }
      )
    }

    // Map folder to drive folder type
    const driveFolder = FOLDER_MAPPING[folder] || 'image'

    console.log('[Upload API] Processing file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      folder,
      driveFolder,
    })

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to Google Drive
    const result = await uploadToGoogleDrive(buffer, file.name, file.type, driveFolder)

    console.log('[Upload API] Success:', result)

    // Return the webViewLink as the URL for display
    const url = result.webViewLink || result.webContentLink

    return NextResponse.json({
      success: true,
      url,
      fileId: result.fileId,
    })
  } catch (error: any) {
    console.error('[Upload API] Error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    })

    // Return clearer error message
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat mengupload file' },
      { status: 500 }
    )
  }
}
