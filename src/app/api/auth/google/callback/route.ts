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
    await handleOAuthCallback(code)

    console.log('[OAuth Callback] OAuth flow completed successfully')

    return NextResponse.json({
      success: true,
      message: 'Google Drive authorization successful! You can now upload files.',
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
 *
 * Show instructions for manual callback handling
 */
export async function GET() {
  return NextResponse.json({
    message: 'OAuth callback endpoint',
    instructions: [
      'This endpoint expects a POST request with the authorization code.',
      'After authorizing at /api/auth/google/init, you will be redirected.',
      'Use the code from the redirect URL to complete authorization:',
      '',
      'POST /api/auth/google/callback',
      'Content-Type: application/json',
      'Body: { "code": "your_authorization_code" }'
    ]
  })
}
