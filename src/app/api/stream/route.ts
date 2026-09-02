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

    // Get file metadata for size
    const meta = await drive.files.get({
      fileId,
      fields: 'size, name',
    })
    const fileSize = parseInt(meta.data.size || '0', 10)

    // Stream from Google Drive
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    )

    // Convert Node.js Readable to Web ReadableStream
    const stream = response.data as unknown as ReadableStream

    return new Response(stream, {
      headers: {
        'Content-Type': mimeType,
        'Content-Length': fileSize.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error: any) {
    console.error('[Stream API] Error:', error.message)
    return NextResponse.json({ error: 'Failed to stream file' }, { status: 500 })
  }
}
