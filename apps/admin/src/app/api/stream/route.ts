import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { loadTokens } from '@/lib/storage/token-store'

export const dynamic = 'force-dynamic'

/**
 * Video Streaming API
 *
 * Proxies video from Google Drive using OAuth to bypass ORB blocking
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('fileId')
  const mimeType = searchParams.get('mimeType') || 'video/mp4'

  if (!fileId) {
    return NextResponse.json({ error: 'fileId is required' }, { status: 400 })
  }

  console.log('[Stream API] Request:', { fileId, mimeType })

  try {
    // Load tokens from environment variable or file
    const tokens = await loadTokens()

    if (!tokens) {
      console.error('[Stream API] No OAuth tokens found')
      return NextResponse.json({ error: 'Not authorized. Please visit /api/auth/google/init' }, { status: 401 })
    }

    // Check if token is expired
    const bufferMs = 5 * 60 * 1000 // 5 minute buffer
    const isExpired = Date.now() >= tokens.expiry_date - bufferMs

    // Create OAuth2 client
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

    // Refresh token if expired
    if (isExpired) {
      console.log('[Stream API] Token expired, refreshing...')
      try {
        const { credentials } = await oauth2Client.refreshAccessToken()
        oauth2Client.setCredentials({
          access_token: credentials.access_token!,
          refresh_token: credentials.refresh_token || tokens.refresh_token,
          expiry_date: credentials.expiry_date || (Date.now() + 3600 * 1000),
        })
        console.log('[Stream API] Token refreshed successfully')
      } catch (refreshError: any) {
        console.error('[Stream API] Token refresh failed:', refreshError.message)
        return NextResponse.json({ error: 'Token expired. Please re-authorize.' }, { status: 401 })
      }
    }

    // Use Google Drive API to get the file
    const drive = google.drive({ version: 'v3', auth: oauth2Client })

    console.log('[Stream API] Fetching file from Drive API...')

    // First get file metadata to get the correct mimeType
    const fileMetadata = await drive.files.get({
      fileId,
      fields: 'name,mimeType,size',
    })

    const actualMimeType = fileMetadata.data.mimeType || mimeType
    console.log('[Stream API] File metadata:', {
      name: fileMetadata.data.name,
      mimeType: actualMimeType,
      size: fileMetadata.data.size,
    })

    // Download the video using alt=media
    const response = await drive.files.get({
      fileId,
      alt: 'media',
    }, {
      responseType: 'arraybuffer',
    })

    const videoBuffer = Buffer.from(response.data as ArrayBuffer)

    console.log('[Stream API] Success:', {
      fileId,
      mimeType: actualMimeType,
      size: videoBuffer.length,
    })

    return new Response(videoBuffer, {
      headers: {
        'Content-Type': actualMimeType,
        'Content-Length': videoBuffer.length.toString(),
        'Accept-Ranges': 'none',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error: any) {
    console.error('[Stream API] Error:', {
      message: error.message,
      code: error.code,
    })

    // Check for specific errors
    if (error.message?.includes('File not found') || error.code === 404) {
      return NextResponse.json({ error: 'Video not found in Google Drive' }, { status: 404 })
    }

    if (error.message?.includes('Not authorized') || error.code === 401) {
      return NextResponse.json({ error: 'Not authorized. Please re-authorize.' }, { status: 401 })
    }

    return NextResponse.json({
      error: 'Video tidak dapat diputar. Error: ' + error.message
    }, { status: 500 })
  }
}
