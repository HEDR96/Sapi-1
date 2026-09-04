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

    console.log('[OAuth Init] Generated authorization URL')

    return NextResponse.json({
      success: true,
      message: 'Redirect user to this URL to authorize',
      authUrl,
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
