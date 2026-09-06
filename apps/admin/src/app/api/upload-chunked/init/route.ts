import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

// Store sessions in a global variable (survives across function invocations in same instance)
declare global {
  var uploadSessions: Map<string, {
    fileName: string
    fileSize: number
    mimeType: string
    folder: string
    totalChunks: number
    tempDir: string
  }>
}

if (!global.uploadSessions) {
  global.uploadSessions = new Map()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName, fileSize, mimeType, folder, totalChunks, uploadId } = body

    if (!fileName || !fileSize || !mimeType || !totalChunks || !uploadId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const tempDir = path.join('/tmp', 'uploads', uploadId)
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true })
    }

    global.uploadSessions.set(uploadId, {
      fileName,
      fileSize,
      mimeType,
      folder,
      totalChunks,
      tempDir,
    })

    console.log('[Chunked Init] Created:', { uploadId, fileName, totalChunks })

    return NextResponse.json({ sessionId: uploadId, tempDir })
  } catch (error: any) {
    console.error('[Chunked Init] Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
