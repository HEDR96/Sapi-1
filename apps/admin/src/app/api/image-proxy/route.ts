import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { loadTokens } from '@/lib/storage/token-store'

export const dynamic = 'force-dynamic'

/**
 * Image Proxy API
 *
 * Fetches images from Google Drive using OAuth and serves them to bypass ORB blocking
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('id')

  if (!fileId) {
    return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
  }

  console.log('[Image Proxy] Request for fileId:', fileId)

  try {
    // Load tokens from environment variable or file
    const tokens = await loadTokens()

    if (!tokens) {
      console.error('[Image Proxy] No OAuth tokens found')
      return createPlaceholderResponse('Not authorized')
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
      console.log('[Image Proxy] Token expired, refreshing...')
      try {
        const { credentials } = await oauth2Client.refreshAccessToken()
        oauth2Client.setCredentials({
          access_token: credentials.access_token!,
          refresh_token: credentials.refresh_token || tokens.refresh_token,
          expiry_date: credentials.expiry_date || (Date.now() + 3600 * 1000),
        })
        console.log('[Image Proxy] Token refreshed successfully')
      } catch (refreshError: any) {
        console.error('[Image Proxy] Token refresh failed:', refreshError.message)
        return createPlaceholderResponse('Token expired')
      }
    }

    // Use Google Drive API to get the file
    const drive = google.drive({ version: 'v3', auth: oauth2Client })

    console.log('[Image Proxy] Fetching file metadata from Drive API...')

    // Get file metadata to determine content type
    const fileMetadata = await drive.files.get({
      fileId,
      fields: 'name,mimeType,fileExtension',
    })

    const mimeType = fileMetadata.data.mimeType || 'image/jpeg'
    console.log('[Image Proxy] File mimeType:', mimeType)

    // Download the file using alt=media
    const response = await drive.files.get({
      fileId,
      alt: 'media',
    }, {
      responseType: 'arraybuffer',
    })

    const imageBuffer = Buffer.from(response.data as ArrayBuffer)

    console.log('[Image Proxy] Success:', {
      fileId,
      mimeType,
      size: imageBuffer.length,
    })

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error: any) {
    console.error('[Image Proxy] Error:', {
      message: error.message,
      code: error.code,
    })

    // Check for specific errors
    if (error.message?.includes('File not found') || error.code === 404) {
      return createPlaceholderResponse('File not found')
    }

    if (error.message?.includes('Not authorized') || error.code === 401) {
      return createPlaceholderResponse('Not authorized')
    }

    return createPlaceholderResponse('Error loading image')
  }
}

/**
 * Create SVG placeholder response
 */
function createPlaceholderResponse(message: string): NextResponse {
  const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <rect fill="#f3f4f6" width="400" height="300"/>
    <text fill="#6b7280" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle" dy=".3em">${message}</text>
  </svg>`

  return new NextResponse(placeholderSvg, {
    status: 200,
    headers: { 'Content-Type': 'image/svg+xml' },
  })
}
