import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Video Streaming API
 *
 * Proxies video from Google Drive to bypass ORB blocking
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('fileId')
  const mimeType = searchParams.get('mimeType') || 'video/mp4'

  if (!fileId) {
    return NextResponse.json({ error: 'fileId is required' }, { status: 400 })
  }

  console.log('[Stream API] Request:', { fileId, mimeType })

  try {
    // Google Drive export URL for video streaming
    const googleDriveUrl = `https://drive.google.com/uc?export=download&confirm=t&id=${fileId}`

    console.log('[Stream API] Fetching from:', googleDriveUrl)

    const response = await fetch(googleDriveUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'video/mp4,video/webm,video/*,*/*',
        'Referer': 'https://drive.google.com/',
      },
    })

    console.log('[Stream API] Google response:', {
      status: response.status,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
    })

    if (response.ok || response.status === 200) {
      const videoBuffer = await response.arrayBuffer()

      console.log('[Stream API] Success:', {
        fileId,
        size: videoBuffer.byteLength,
      })

      return new Response(videoBuffer, {
        headers: {
          'Content-Type': mimeType,
          'Content-Length': videoBuffer.byteLength.toString(),
          'Accept-Ranges': 'none',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // If download fails, try direct view URL redirect
    console.log('[Stream API] Download failed, trying view URL')
    const viewUrl = `https://drive.google.com/file/d/${fileId}/view`
    return NextResponse.redirect(viewUrl, 302)

  } catch (error: any) {
    console.error('[Stream API] Error:', error.message)

    return NextResponse.json({
      error: 'Video tidak dapat diputar. Error: ' + error.message
    }, { status: 500 })
  }
}
