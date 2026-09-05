import { NextRequest, NextResponse } from 'next/server'
import { handleOAuthCallback } from '@/lib/storage/google-drive-oauth'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/google/callback
 *
 * Handle OAuth callback - exchange authorization code for tokens
 *
 * Body: { code: "authorization_code_from_google" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      )
    }

    console.log('[OAuth Callback] Processing callback...')

    // Exchange code for tokens
    const token = await handleOAuthCallback(code)

    console.log('[OAuth Callback] OAuth flow completed successfully')

    // Return the token JSON so user can copy it for environment variable
    return NextResponse.json({
      success: true,
      message: 'Google Drive authorization successful! Token received.',
      token: token,
      instructions: [
        'For production (Vercel): Set the following environment variable:',
        '',
        'GOOGLE_TOKEN_JSON=' + JSON.stringify(token),
        '',
        'Copy the token value above and add it to your Vercel project environment variables.',
      ],
    })
  } catch (error: any) {
    console.error('[OAuth Callback] Error:', error.message)

    return NextResponse.json(
      { error: `Authorization failed: ${error.message}` },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/google/callback
 */
export async function GET() {
  return NextResponse.json({
    message: 'OAuth callback endpoint - use POST with authorization code',
  })
}
