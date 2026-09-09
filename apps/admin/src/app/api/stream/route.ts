import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedDriveClient } from '@/lib/storage/google-drive-oauth'

export const dynamic = 'force-dynamic'

/**
 * Video Streaming API
 *
 * Proxies video from Google Drive using OAuth to bypass ORB blocking.
 * Streams the response (rather than buffering the whole file in memory)
 * and honors Range requests so <video> seeking and thumbnail-frame
 * grabbing work, and large videos don't blow serverless memory/time limits.
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

    const meta = await drive.files.get({
      fileId,
      fields: 'size, name',
    })
    const fileSize = parseInt(meta.data.size || '0', 10)

    const rangeHeader = request.headers.get('range')
    const driveRequestConfig: Record<string, unknown> = { responseType: 'stream' }

    let status = 200
    const headers: Record<string, string> = {
      'Content-Type': mimeType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000, immutable',
    }

    const rangeMatch = rangeHeader?.match(/bytes=(\d*)-(\d*)/)
    if (rangeMatch && fileSize > 0) {
      const start = rangeMatch[1] ? parseInt(rangeMatch[1], 10) : 0
      const end = rangeMatch[2] ? Math.min(parseInt(rangeMatch[2], 10), fileSize - 1) : fileSize - 1

      driveRequestConfig.headers = { Range: `bytes=${start}-${end}` }
      status = 206
      headers['Content-Range'] = `bytes ${start}-${end}/${fileSize}`
      headers['Content-Length'] = (end - start + 1).toString()
    } else {
      headers['Content-Length'] = fileSize.toString()
    }

    const response = await drive.files.get({ fileId, alt: 'media' }, driveRequestConfig)
    const stream = response.data as unknown as ReadableStream

    return new Response(stream, { status, headers })
  } catch (error: any) {
    console.error('[Stream API] Error:', error.message)

    if (error.message?.includes('No OAuth tokens found') || error.code === 401) {
      return NextResponse.json({ error: 'Not authorized. Please re-authorize.' }, { status: 401 })
    }
    if (error.code === 404) {
      return NextResponse.json({ error: 'Video not found in Google Drive' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Failed to stream file' }, { status: 500 })
  }
}
