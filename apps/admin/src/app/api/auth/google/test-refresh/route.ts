/**
 * Test OAuth Token Refresh
 * Endpoint untuk verify auto-refresh berfungsi 100%
 */

import { NextResponse } from 'next/server'
import { loadTokens, saveTokens, getTokenStatus } from '@/lib/storage/token-store'
import { getOAuth2Client } from '@/lib/storage/google-drive-oauth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: [],
  }

  try {
    // Test 1: Load tokens
    results.tests.push({ name: 'loadTokens', status: 'pending' })
    const tokens = await loadTokens()

    if (!tokens) {
      results.tests[0].status = 'fail'
      results.tests[0].message = 'No tokens found - set GOOGLE_TOKEN_JSON first'
      results.status = 'fail'
      return NextResponse.json(results, { status: 400 })
    }

    results.tests[0].status = 'pass'
    results.tests[0].message = 'Tokens loaded successfully'
    results.tokens = {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiryDate: new Date(tokens.expiry_date).toISOString(),
      expiresIn: Math.floor((tokens.expiry_date - Date.now()) / 1000 / 60) + ' minutes',
      isExpired: Date.now() >= tokens.expiry_date,
    }

    // Test 2: Check current status
    results.tests.push({ name: 'tokenStatus', status: 'pending' })
    const status = await getTokenStatus()
    results.tests[1].status = 'pass'
    results.statusInfo = status

    // Test 3: Force token refresh (simulate expired token)
    results.tests.push({ name: 'forceRefresh', status: 'pending' })

    const oauth2Client = getOAuth2Client()
    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
    })

    // Check if token needs refresh (within 5 min buffer)
    const bufferMs = 5 * 60 * 1000
    const needsRefresh = Date.now() >= tokens.expiry_date - bufferMs

    if (needsRefresh) {
      results.tests[2].message = 'Token needs refresh, attempting...'

      try {
        const { credentials } = await oauth2Client.refreshAccessToken()

        results.tests[2].status = 'pass'
        results.tests[2].message = 'Token refreshed successfully!'
        results.newTokens = {
          hasNewAccessToken: !!credentials.access_token,
          hasRefreshToken: !!credentials.refresh_token,
          newExpiryDate: credentials.expiry_date
            ? new Date(credentials.expiry_date).toISOString()
            : 'not returned (refresh token reused)',
        }

        // Save new tokens
        await saveTokens({
          access_token: credentials.access_token!,
          refresh_token: credentials.refresh_token || tokens.refresh_token,
          expiry_date: credentials.expiry_date || (Date.now() + 3600 * 1000),
        })

        results.tests.push({
          name: 'saveTokens',
          status: 'pass',
          message: 'New tokens saved successfully'
        })
        results.status = 'success'
        results.conclusion = '✅ Auto-refresh works! Token has been refreshed and saved.'
      } catch (refreshError: any) {
        results.tests[2].status = 'fail'
        results.tests[2].message = `Refresh failed: ${refreshError.message}`
        results.tests[2].error = refreshError.response?.data || refreshError.message
        results.status = 'fail'
        results.conclusion = '❌ Auto-refresh FAILED. Check error details above.'
      }
    } else {
      results.tests[2].status = 'skip'
      results.tests[2].message = `Token still valid (expires in ${Math.floor((tokens.expiry_date - Date.now()) / 1000 / 60)} min). Force-refresh test skipped.`

      // Still try to refresh to verify it works
      try {
        // Manually set to expired to force refresh test
        oauth2Client.setCredentials({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expiry_date: Date.now() - 1000, // Set to expired
        })

        const { credentials } = await oauth2Client.refreshAccessToken()

        results.tests.push({
          name: 'forceRefreshTest',
          status: 'pass',
          message: 'Force refresh test PASSED - token refreshed successfully',
        })

        // Restore original tokens (don't save the test refresh)
        results.conclusion = '✅ Auto-refresh WORKS! Force refresh test succeeded.'
      } catch (refreshError: any) {
        results.tests.push({
          name: 'forceRefreshTest',
          status: 'fail',
          message: `Force refresh failed: ${refreshError.message}`,
        })
        results.status = 'fail'
        results.conclusion = '❌ Auto-refresh may have issues.'
      }
    }

  } catch (error: any) {
    results.status = 'error'
    results.error = error.message
    results.conclusion = '❌ Test failed with error'
  }

  return NextResponse.json(results)
}
