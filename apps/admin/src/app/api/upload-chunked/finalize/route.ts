import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedDriveClient, makeFilePublic } from '@/lib/storage/google-drive-oauth'
import { getUploadSession, deleteUploadSession } from '@/lib/storage/upload-session-store'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const session = await getUploadSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: 'Session not found or expired' }, { status: 404 })
    }

    let fileId = session.fileId

    if (!session.completed || !fileId) {
      // The last chunk PUT should have already completed the Drive upload.
      // As a safety net, ask Google for the current status in case the
      // client's chunking didn't land exactly on the final byte in one shot.
      const statusRes = await fetch(session.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Range': `bytes */${session.totalSize}` },
      })

      if (statusRes.status !== 200 && statusRes.status !== 201) {
        return NextResponse.json(
          { error: 'Upload belum selesai. Beberapa bagian video mungkin belum terkirim.' },
          { status: 409 }
        )
      }

      const fileData = await statusRes.json()
      fileId = fileData.id
    }

    console.log('[Finalize] Drive upload complete:', { sessionId, fileId })

    const drive = await getAuthenticatedDriveClient()
    const isPublic = await makeFilePublic(drive, fileId!)

    const publicUrl = `/api/stream?fileId=${fileId}&mimeType=${encodeURIComponent(session.mimeType)}`

    await deleteUploadSession(sessionId)

    console.log('[Finalize] Success:', { fileId, isPublic })

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileId,
      ...(isPublic ? {} : { warning: 'Video berhasil diupload tetapi gagal dibuat publik.' }),
    })
  } catch (error: any) {
    console.error('[Finalize] Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
