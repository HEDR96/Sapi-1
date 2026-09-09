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

    // Validate code format
    if (typeof code !== 'string' || code.length < 10) {
      return NextResponse.json(
        { error: 'Invalid authorization code format' },
        { status: 400 }
      )
    }

    console.log('[OAuth Callback] Processing callback...')
    console.log('[OAuth Callback] Code length:', code.length)
    console.log('[OAuth Callback] Code prefix:', code.substring(0, 20) + '...')

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
    // Log full error details
    console.error('[OAuth Callback] Error:', error.message)
    console.error('[OAuth Callback] Error name:', error.name)
    console.error('[OAuth Callback] Error stack:', error.stack)
    console.error('[OAuth Callback] Full error:', JSON.stringify(error, null, 2))

    // Check for specific error types
    let errorMessage = error.message || 'Unknown error'
    let errorDetails: any = {}

    if (error.message?.includes('invalid_grant')) {
      errorDetails = {
        type: 'invalid_grant',
        cause: 'Authorization code expired, already used, or invalid redirect_uri mismatch',
        solution: 'Get a new authorization code and ensure redirect_uri matches exactly'
      }
    } else if (error.message?.includes('startsWith')) {
      errorDetails = {
        type: 'undefined_property',
        cause: 'Internal error - possibly malformed response from Google',
        stack: error.stack
      }
    }

    return NextResponse.json(
      {
        error: `Authorization failed: ${errorMessage}`,
        errorDetails,
        hint: 'Check server logs for full stack trace'
      },
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
