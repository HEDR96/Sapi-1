import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedDriveClient } from '@/lib/storage/google-drive-oauth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('fileId')
  const mimeType = searchParams.get('mimeType') || 'video/mp4'

  if (!fileId) {
    return NextResponse.json({ error: 'fileId is required' }, { status: 400 })
  }

  try {
    const drive = await getAuthenticatedDriveClient()

    // Get file from Google Drive
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    )

    // Get file metadata for size
    const meta = await drive.files.get({
      fileId,
      fields: 'size, name',
    })
    const fileSize = parseInt(meta.data.size || '0', 10)

    // Collect stream chunks
    const chunks: Buffer[] = []
    const stream = response.data as unknown as AsyncIterable<Buffer>

    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk))
    }

    const videoBuffer = Buffer.concat(chunks)

    console.log('[Stream API] Success:', {
      fileId,
      mimeType,
      size: videoBuffer.length,
    })

    return new Response(videoBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Length': videoBuffer.length.toString(),
        'Accept-Ranges': 'none',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error: any) {
    console.error('[Stream API] Error:', error.message, error.code)

    // Try fallback to direct Google Drive URL
    try {
      const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`

      const response = await fetch(directUrl)
      if (response.ok) {
        const videoBuffer = await response.arrayBuffer()
        return new Response(videoBuffer, {
          headers: {
            'Content-Type': mimeType,
            'Content-Length': videoBuffer.byteLength.toString(),
            'Cache-Control': 'public, max-age=3600',
          },
        })
      }
    } catch (fallbackError) {
      console.error('[Stream API] Fallback also failed:', fallbackError)
    }

    return NextResponse.json({ error: 'Failed to stream video: ' + error.message }, { status: 500 })
  }
}
