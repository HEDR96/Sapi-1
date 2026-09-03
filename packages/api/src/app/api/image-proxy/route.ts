import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Image Proxy API
 *
 * Fetches images from Google Drive and serves them to bypass CORS/ORB restrictions
 * This is a server-side route, so there are no CORS issues
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('id')

  if (!fileId) {
    return NextResponse.json(
      { error: 'File ID is required' },
      { status: 400 }
    )
  }

  try {
    // Google Drive direct download URL
    const googleDriveUrl = `https://drive.google.com/uc?export=view&id=${fileId}`

    console.log('[Image Proxy] Fetching:', googleDriveUrl)

    // Fetch the image from Google Drive
    const response = await fetch(googleDriveUrl, {
      headers: {
        // Mimic a browser request
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://drive.google.com/',
      },
    })

    if (!response.ok) {
      console.error('[Image Proxy] Failed to fetch image:', response.status)
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: response.status }
      )
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    console.log('[Image Proxy] Success:', {
      fileId,
      contentType,
      size: imageBuffer.byteLength,
    })

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*', // Allow cross-origin
      },
    })
  } catch (error: any) {
    console.error('[Image Proxy] Error:', error.message)
    return NextResponse.json(
      { error: 'Failed to proxy image' },
      { status: 500 }
    )
  }
}
