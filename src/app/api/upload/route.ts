import { NextRequest, NextResponse } from 'next/server'
import imageCompression from 'browser-image-compression'
import { uploadToGoogleDrive, validateGoogleDriveConfig } from '@/lib/storage/google-drive-oauth'

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

// Compression options for images
const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 1, // Max 1MB per image
  maxWidthOrHeight: 1920, // Max dimension 1920px
  useWebWorker: true, // Use web worker for compression
  fileType: 'image/jpeg' as const, // Convert to JPEG for smaller size
  initialQuality: 0.8, // Start with 80% quality
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

    // Note: Token refresh happens automatically in uploadToGoogleDrive()
    // If token is expired, it will be refreshed automatically

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

    // Validate file size before compression
    const maxSizeBefore = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024 // 100MB video, 10MB image before compression
    if (file.size > maxSizeBefore) {
      return NextResponse.json(
        { error: `Ukuran file terlalu besar. Maksimal ${isVideo ? '100MB' : '10MB'}.` },
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

    // Convert file to buffer (with compression for images)
    let buffer: Buffer
    let finalFileType = file.type
    let finalFileName = file.name

    if (isImage) {
      try {
        console.log('[Upload API] Compressing image...')

        // Compress the image
        const compressedFile = await imageCompression(file, IMAGE_COMPRESSION_OPTIONS)

        console.log('[Upload API] Compression result:', {
          originalSize: file.size,
          compressedSize: compressedFile.size,
          reduction: `${Math.round((1 - compressedFile.size / file.size) * 100)}%`,
        })

        // Update filename to .jpg if converted
        finalFileName = compressedFile.name.replace(/\.[^.]+$/, '.jpg')
        finalFileType = 'image/jpeg'
        buffer = Buffer.from(await compressedFile.arrayBuffer())
      } catch (compressionError: any) {
        console.warn('[Upload API] Compression failed, using original:', compressionError.message)
        // Fallback to original file if compression fails
        buffer = Buffer.from(await file.arrayBuffer())
      }
    } else {
      // Video or other files - no compression
      buffer = Buffer.from(await file.arrayBuffer())
    }

    // Upload to Google Drive
    const result = await uploadToGoogleDrive(buffer, finalFileName, finalFileType, driveFolder)

    console.log('[Upload API] Success:', result)

    // Use direct image URL format for public access
    const directUrl = result.directUrl || `https://drive.google.com/uc?export=view&id=${result.fileId}`

    return NextResponse.json({
      success: true,
      url: directUrl,
      fileId: result.fileId,
      webViewLink: result.webViewLink,
      thumbnailUrl: result.thumbnailLink,
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
