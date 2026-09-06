import { NextRequest, NextResponse } from 'next/server'
import { readFile, rm } from 'fs/promises'
import { existsSync, readdirSync } from 'fs'
import path from 'path'
import { uploadToGoogleDrive, validateGoogleDriveConfig } from '@/lib/storage/google-drive-oauth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const tempDir = path.join('/tmp', 'uploads', sessionId)

    if (!existsSync(tempDir)) {
      return NextResponse.json({ error: 'Session not found or expired' }, { status: 404 })
    }

    // Read all chunks
    const files = readdirSync(tempDir)
    const chunkFiles = files.filter(f => f.startsWith('chunk_')).sort((a, b) => {
      return parseInt(a.split('_')[1]) - parseInt(b.split('_')[1])
    })

    if (chunkFiles.length === 0) {
      return NextResponse.json({ error: 'No chunks found' }, { status: 400 })
    }

    console.log('[Finalize] Combining:', { sessionId, chunks: chunkFiles.length })

    const chunks: Buffer[] = []
    for (const chunkFile of chunkFiles) {
      const chunkPath = path.join(tempDir, chunkFile)
      const chunkData = await readFile(chunkPath)
      chunks.push(chunkData)
    }

    // Combine chunks
    const fileBuffer = Buffer.concat(chunks)
    const fileName = `video_${sessionId}.mp4`
    const mimeType = 'video/mp4'

    console.log('[Finalize] Combined size:', fileBuffer.length)

    // Validate Google Drive config
    try {
      validateGoogleDriveConfig()
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }

    // Upload to Google Drive
    const result = await uploadToGoogleDrive(fileBuffer, fileName, mimeType, 'video')
    const publicUrl = `/api/stream?fileId=${result.fileId}&mimeType=${encodeURIComponent(mimeType)}`

    // Cleanup temp files
    try {
      await rm(tempDir, { recursive: true, force: true })
    } catch (e) {
      console.warn('[Finalize] Cleanup failed:', e)
    }

    console.log('[Finalize] Success:', { fileId: result.fileId })

    return NextResponse.json({ success: true, url: publicUrl, fileId: result.fileId })
  } catch (error: any) {
    console.error('[Finalize] Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
