import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { loadTokens } from '@/lib/storage/token-store'

export const dynamic = 'force-dynamic'

const FOLDER_MAPPING: Record<string, 'image' | 'video'> = {
  'cattle': 'image',
  'media': 'image',
  'profile': 'image',
  'image': 'image',
  'video': 'video',
  'video-upload': 'video',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName, mimeType, folder = 'image' } = body

    if (!fileName || !mimeType) {
      return NextResponse.json({ error: 'fileName and mimeType are required' }, { status: 400 })
    }

    const tokens = await loadTokens()
    if (!tokens) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      process.env.GOOGLE_OAUTH_REDIRECT_URI
    )

    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
    })

    if (Date.now() >= tokens.expiry_date - 5 * 60 * 1000) {
      try {
        const { credentials } = await oauth2Client.refreshAccessToken()
        oauth2Client.setCredentials({
          access_token: credentials.access_token!,
          refresh_token: credentials.refresh_token || tokens.refresh_token,
          expiry_date: credentials.expiry_date || (Date.now() + 3600 * 1000),
        })
      } catch (refreshError: any) {
        return NextResponse.json({ error: 'Token expired. Please re-authorize.' }, { status: 401 })
      }
    }

    const drive = google.drive({ version: 'v3', auth: oauth2Client })
    const folderType = FOLDER_MAPPING[folder] || 'image'
    const folderId = folderType === 'video'
      ? process.env.GOOGLE_DRIVE_VIDEO_FOLDER_ID
      : process.env.GOOGLE_DRIVE_IMAGE_FOLDER_ID

    const uniqueFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    // Create file metadata (empty content initially)
    const fileMetadata = {
      name: uniqueFileName,
      parents: [folderId],
    }

    // Get access token for direct upload
    const authToken = oauth2Client.credentials.access_token

    // Create resumable upload session
    const sessionResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Length': '0', // Will update later
      },
      body: JSON.stringify(fileMetadata),
    })

    if (!sessionResponse.ok) {
      const errorText = await sessionResponse.text()
      console.error('[Upload Init] Session creation failed:', errorText)
      return NextResponse.json({ error: 'Failed to create upload session' }, { status: 500 })
    }

    const uploadUrl = sessionResponse.headers.get('Location')
    const fileIdMatch = uploadUrl?.match(/\/files\/([^?\/]+)/)
    const fileId = fileIdMatch ? fileIdMatch[1] : uniqueFileName

    // Make file public
    try {
      await drive.permissions.create({
        fileId,
        requestBody: { role: 'reader', type: 'anyone' },
      })
    } catch (permError) {
      console.warn('[Upload Init] Could not make file public:', permError)
    }

    console.log('[Upload Init] Created resumable session:', { fileId, uploadUrl: uploadUrl?.substring(0, 50) + '...' })

    return NextResponse.json({ fileId, uploadUrl, fileName: uniqueFileName })
  } catch (error: any) {
    console.error('[Upload Init] Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
