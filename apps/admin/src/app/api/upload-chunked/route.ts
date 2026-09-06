import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const chunk = formData.get('chunk') as File
    const sessionId = formData.get('sessionId') as string
    const chunkIndex = parseInt(formData.get('chunkIndex') as string)

    if (!chunk || !sessionId || isNaN(chunkIndex)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Ensure directory exists
    const chunkDir = path.join('/tmp', 'uploads', sessionId)
    if (!existsSync(chunkDir)) {
      await mkdir(chunkDir, { recursive: true })
    }

    // Save chunk
    const chunkPath = path.join(chunkDir, `chunk_${chunkIndex}`)
    const buffer = Buffer.from(await chunk.arrayBuffer())
    await writeFile(chunkPath, buffer)

    console.log('[Chunk Upload] Saved:', { sessionId, chunkIndex, size: chunk.size })

    return NextResponse.json({ success: true, chunkIndex })
  } catch (error: any) {
    console.error('[Chunk Upload] Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
