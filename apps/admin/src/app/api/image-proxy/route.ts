import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedDriveClient } from '@/lib/storage/google-drive-oauth'

export const dynamic = 'force-dynamic'

/**
 * Image Proxy API
 *
 * Fetches images from Google Drive using authenticated API
 * to bypass CORS/ORB restrictions
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('id')

  if (!fileId) {
    return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
  }

  try {
    const drive = await getAuthenticatedDriveClient()

    // Get file from Google Drive using authenticated API
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    )

    // Get file metadata for content type
    const meta = await drive.files.get({
      fileId,
      fields: 'mimeType, name',
    })

    const contentType = meta.data.mimeType || 'image/jpeg'

    // Get the stream data
    const chunks: Buffer[] = []
    const stream = response.data as unknown as AsyncIterable<Buffer>

    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk))
    }

    const imageBuffer = Buffer.concat(chunks)

    console.log('[Image Proxy] Success:', {
      fileId,
      contentType,
      size: imageBuffer.length,
    })

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error: any) {
    console.error('[Image Proxy] Error:', error.message, error.code)

    // If Google Drive API fails, try direct URL as fallback
    try {
      const googleDriveUrl = `https://drive.google.com/uc?export=view&id=${fileId}`

      const response = await fetch(googleDriveUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        },
      })

      if (response.ok) {
        const imageBuffer = await response.arrayBuffer()
        const contentType = response.headers.get('content-type') || 'image/jpeg'

        return new NextResponse(imageBuffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }
    } catch (fallbackError) {
      console.error('[Image Proxy] Fallback also failed:', fallbackError)
    }

    // Return a simple placeholder SVG if all else fails
    const placeholderSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <rect fill="#e5e7eb" width="400" height="300"/>
        <text fill="#9ca3af" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle" dy=".3em">Image unavailable</text>
      </svg>
    `

    return new NextResponse(placeholderSvg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache',
      },
    })
  }
}
