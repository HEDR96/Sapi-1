import { NextResponse } from 'next/server'
import { isAuthorized } from '@/lib/storage/google-drive-oauth'
import { getTokenStatus } from '@/lib/storage/token-store'

export const dynamic = 'force-dynamic'

/**
 * GET /api/auth/google/status
 *
 * Check OAuth authorization status
 */
export async function GET() {
  try {
    const authorized = await isAuthorized()
    const tokenStatus = await getTokenStatus()

    return NextResponse.json({
      authorized,
      tokenStatus,
      message: authorized
        ? 'Google Drive is authorized and ready to use'
        : 'Google Drive is not authorized. Visit /api/auth/google/init to authorize.',
    })
  } catch (error: any) {
    console.error('[OAuth Status] Error:', error.message)

    return NextResponse.json(
      { authorized: false, error: error.message },
      { status: 500 }
    )
  }
}
