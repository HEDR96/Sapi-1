import { NextRequest, NextResponse } from 'next/server'
import { getUploadSession, saveUploadSession } from '@/lib/storage/upload-session-store'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const chunk = formData.get('chunk') as File
    const sessionId = formData.get('sessionId') as string
    const chunkIndex = parseInt(formData.get('chunkIndex') as string)
    const start = parseInt(formData.get('start') as string)
    const end = parseInt(formData.get('end') as string)

    if (!chunk || !sessionId || isNaN(chunkIndex) || isNaN(start) || isNaN(end)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const session = await getUploadSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: 'Session not found or expired' }, { status: 404 })
    }

    const buffer = Buffer.from(await chunk.arrayBuffer())

    // Forward this chunk straight to the Google Drive resumable session.
    // Google tracks how many bytes it has received - we don't persist any
    // of the video bytes ourselves, so this works regardless of which
    // serverless instance handles this request.
    const putRes = await fetch(session.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Length': String(buffer.length),
        'Content-Range': `bytes ${start}-${end}/${session.totalSize}`,
      },
      body: buffer,
    })

    if (putRes.status === 308) {
      // Resume Incomplete - chunk accepted, more chunks expected.
      console.log('[Chunk Upload] Accepted:', { sessionId, chunkIndex, start, end })
      return NextResponse.json({ success: true, chunkIndex, done: false })
    }

    if (putRes.status === 200 || putRes.status === 201) {
      // Final chunk - Drive has assembled the complete file.
      const fileData = await putRes.json()
      await saveUploadSession(sessionId, {
        ...session,
        completed: true,
        fileId: fileData.id,
      })
      console.log('[Chunk Upload] Upload complete:', { sessionId, fileId: fileData.id })
      return NextResponse.json({ success: true, chunkIndex, done: true })
    }

    const errorText = await putRes.text()
    console.error('[Chunk Upload] Google Drive rejected chunk:', putRes.status, errorText)
    return NextResponse.json(
      { error: `Google Drive menolak chunk (${putRes.status})` },
      { status: 502 }
    )
  } catch (error: any) {
    console.error('[Chunk Upload] Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
