import { NextRequest, NextResponse } from 'next/server'
import {
  validateGoogleDriveConfig,
  getValidAccessToken,
  DRIVE_FOLDERS,
} from '@/lib/storage/google-drive-oauth'
import { saveUploadSession } from '@/lib/storage/upload-session-store'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName, fileSize, mimeType, folder, uploadId } = body

    if (!fileName || !fileSize || !mimeType || !uploadId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    try {
      validateGoogleDriveConfig()
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }

    const driveFolder: 'image' | 'video' = folder === 'image' ? 'image' : 'video'
    const folderId = DRIVE_FOLDERS[driveFolder]
    if (!folderId) {
      return NextResponse.json({ error: `Invalid folder type: ${driveFolder}` }, { status: 400 })
    }

    const accessToken = await getValidAccessToken()
    const uniqueFileName = `${Date.now()}-${String(fileName).replace(/[^a-zA-Z0-9.-]/g, '_')}`

    // Open a resumable upload session directly with Google Drive.
    // Each chunk is later PUT straight to Google using the returned session
    // URI - Drive tracks byte-offset progress on its side, so our server
    // never needs to buffer the raw video bytes on local disk.
    const initRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Type': mimeType,
          'X-Upload-Content-Length': String(fileSize),
        },
        body: JSON.stringify({
          name: uniqueFileName,
          parents: [folderId],
        }),
      }
    )

    if (!initRes.ok) {
      const text = await initRes.text()
      console.error('[Chunked Init] Google Drive session init failed:', initRes.status, text)
      return NextResponse.json(
        { error: `Gagal membuka sesi upload ke Google Drive (${initRes.status})` },
        { status: 502 }
      )
    }

    const uploadUrl = initRes.headers.get('Location')
    if (!uploadUrl) {
      return NextResponse.json({ error: 'Google Drive tidak mengembalikan session URL' }, { status: 502 })
    }

    await saveUploadSession(uploadId, {
      uploadUrl,
      fileName: uniqueFileName,
      mimeType,
      folder: driveFolder,
      totalSize: fileSize,
    })

    console.log('[Chunked Init] Drive resumable session created:', { uploadId, fileName: uniqueFileName })

    return NextResponse.json({ sessionId: uploadId })
  } catch (error: any) {
    console.error('[Chunked Init] Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
