import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedDriveClient } from '@/lib/storage/google-drive-oauth'

export const dynamic = 'force-dynamic'

/**
 * Proxy to stream files from Google Drive
 * Bypasses CORS/ORB blocking that affects direct drive.google.com URLs
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('fileId')
  const mimeType = searchParams.get('mimeType') || 'video/mp4'

  if (!fileId) {
    return NextResponse.json({ error: 'fileId is required' }, { status: 400 })
  }

  try {
    const drive = await getAuthenticatedDriveClient()

    // First get file metadata to know the size
    const metaResponse = await drive.files.get({
      fileId,
      fields: 'size, name',
    })

    const fileSize = parseInt(metaResponse.data.size || '0', 10)

    // For range requests (video seeking), use the webContentLink approach
    const rangeHeader = request.headers.get('range')

    if (rangeHeader) {
      // Parse range header: "bytes=start-end"
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/)
      if (match) {
        const start = parseInt(match[1], 10)
        const end = match[2] ? parseInt(match[2], 10) : fileSize - 1

        // Use webContentLink with OAuth for range requests
        // First, get a download URL with the user's credentials
        const tokens = await getTokensFromStore()
        if (!tokens) {
          return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
        const authHeader = `Bearer ${tokens.access_token}`

        const rangeResponse = await fetch(downloadUrl, {
          headers: {
            Authorization: authHeader,
            Range: `bytes=${start}-${end}`,
          },
        })

        if (!rangeResponse.ok && rangeResponse.status !== 206) {
          // Fallback: stream full content
          const fullResponse = await drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'stream' }
          )
          const stream = fullResponse.data as unknown as ReadableStream
          return new Response(stream, {
            headers: {
              'Content-Type': mimeType,
              'Content-Length': fileSize.toString(),
              'Accept-Ranges': 'bytes',
              'Cache-Control': 'public, max-age=31536000',
            },
          })
        }

        const contentRange = `bytes ${start}-${end}/${fileSize}`
        const contentLength = end - start + 1

        const stream = rangeResponse.body as ReadableStream

        return new Response(stream, {
          status: 206,
          headers: {
            'Content-Type': mimeType,
            'Content-Length': contentLength.toString(),
            'Content-Range': contentRange,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=31536000',
          },
        })
      }
    }

    // No range request - stream full content
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    )

    const stream = response.data as ReadableStream

    return new Response(stream, {
      headers: {
        'Content-Type': mimeType,
        'Content-Length': fileSize.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error: any) {
    console.error('[Stream API] Error:', error.message)
    return NextResponse.json({ error: 'Failed to stream file' }, { status: 500 })
  }
}

async function getTokensFromStore() {
  try {
    const { loadTokens } = await import('@/lib/storage/token-store')
    return await loadTokens()
  } catch {
    return null
  }
}
