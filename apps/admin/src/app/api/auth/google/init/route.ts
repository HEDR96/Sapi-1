import { NextResponse } from 'next/server'
import { getAuthorizationUrl, validateGoogleDriveConfig } from '@/lib/storage/google-drive-oauth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/auth/google/init
 *
 * Initialize OAuth flow - returns authorization URL
 * User should be redirected to this URL to grant access
 */
export async function GET() {
  try {
    // Validate configuration
    validateGoogleDriveConfig()

    // Get authorization URL
    const authUrl = getAuthorizationUrl()

    // Log the full URL for debugging
    console.log('[OAuth Init] Full authorization URL:', authUrl)

    // Extract redirect_uri from URL for debugging
    try {
      const url = new URL(authUrl)
      console.log('[OAuth Init] redirect_uri in URL:', url.searchParams.get('redirect_uri'))
      console.log('[OAuth Init] client_id in URL:', url.searchParams.get('client_id'))
    } catch (e) {
      console.error('[OAuth Init] Failed to parse auth URL')
    }

    return NextResponse.json({
      success: true,
      message: 'Redirect user to this URL to authorize',
      authUrl,
      redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI,
      instructions: [
        '1. Open the authUrl in your browser',
        '2. Sign in with your Google account',
        '3. Grant permission to access Google Drive',
        '4. You will be redirected to a callback page',
        '5. Copy the "code" parameter from the URL',
        '6. POST the code to /api/auth/google/callback'
      ]
    })
  } catch (error: any) {
    console.error('[OAuth Init] Error:', error.message)

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
