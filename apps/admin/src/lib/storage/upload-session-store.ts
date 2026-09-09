/**
 * Upload Session Store
 *
 * Tracks in-progress Google Drive resumable upload sessions (chunked video
 * uploads) so that each chunk request - which may land on a different
 * serverless function instance - can find the Drive resumable session URI
 * without relying on local disk or in-memory state from a previous request.
 *
 * Supports Vercel KV (production) and file storage (local Docker) - same
 * persistence strategy as token-store.ts.
 */

import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'

export interface UploadSession {
  uploadUrl: string
  fileName: string
  mimeType: string
  folder: 'image' | 'video'
  totalSize: number
  completed?: boolean
  fileId?: string
}

// Unlike token-store's DATA_DIR (meant to be a persistent Docker volume),
// session data is short-lived by nature, so os.tmpdir() is an appropriate
// default when DATA_DIR isn't set - on Vercel that's the only writable path
// ('/app/data' does not exist there and mkdir on it throws ENOENT).
const SESSION_DIR = path.join(process.env.DATA_DIR || os.tmpdir(), 'upload-sessions')
const SESSION_TTL_SECONDS = 24 * 60 * 60

function sessionKey(id: string): string {
  return `upload_session:${id}`
}

function isVercelKV(): boolean {
  return !!(process.env.KV_REST_API_URL || process.env.VERCEL_KV_REST_API_URL)
}

async function kvClient() {
  const { createClient } = await import('@vercel/kv')
  return createClient({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  })
}

export async function saveUploadSession(id: string, data: UploadSession): Promise<void> {
  if (isVercelKV()) {
    try {
      const kv = await kvClient()
      await kv.set(sessionKey(id), data, { ex: SESSION_TTL_SECONDS })
      return
    } catch (error: any) {
      console.warn('[UploadSessionStore] KV save failed, falling back to file storage:', error.message)
    }
  }

  try {
    await fs.mkdir(SESSION_DIR, { recursive: true })
    await fs.writeFile(path.join(SESSION_DIR, `${id}.json`), JSON.stringify(data), 'utf-8')
  } catch (error: any) {
    console.error('[UploadSessionStore] File save failed:', error.message)
    throw new Error(
      'Gagal menyimpan sesi upload video. Konfigurasikan Vercel KV (KV_REST_API_URL / KV_REST_API_TOKEN) ' +
      'agar upload video chunked bekerja secara andal di lingkungan serverless.'
    )
  }
}

export async function getUploadSession(id: string): Promise<UploadSession | null> {
  if (isVercelKV()) {
    try {
      const kv = await kvClient()
      const data = await kv.get<UploadSession>(sessionKey(id))
      if (data) return data
    } catch (error: any) {
      console.warn('[UploadSessionStore] KV read failed:', error.message)
    }
  }

  try {
    const data = await fs.readFile(path.join(SESSION_DIR, `${id}.json`), 'utf-8')
    return JSON.parse(data) as UploadSession
  } catch {
    return null
  }
}

export async function deleteUploadSession(id: string): Promise<void> {
  if (isVercelKV()) {
    try {
      const kv = await kvClient()
      await kv.del(sessionKey(id))
    } catch (error: any) {
      console.warn('[UploadSessionStore] KV delete failed:', error.message)
    }
  }

  try {
    await fs.unlink(path.join(SESSION_DIR, `${id}.json`))
  } catch {
    // Not present on disk (e.g. was only ever in KV) - ignore.
  }
}
