/**
 * Token Store Module
 *
 * Securely stores and retrieves OAuth tokens
 * Tokens are stored in a JSON file on the server
 */

import { promises as fs } from 'fs'
import path from 'path'

// Token file path - stored outside web root
const TOKEN_DIR = process.env.DATA_DIR || '/app/data'
const TOKEN_FILE = path.join(TOKEN_DIR, 'google-token.json')

export interface StoredToken {
  access_token: string
  refresh_token: string
  expiry_date: number
}

/**
 * Ensure token directory exists
 */
async function ensureTokenDir(): Promise<void> {
  try {
    await fs.mkdir(TOKEN_DIR, { recursive: true })
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      throw error
    }
  }
}

/**
 * Load stored tokens from file
 */
export async function loadTokens(): Promise<StoredToken | null> {
  try {
    await ensureTokenDir()
    const data = await fs.readFile(TOKEN_FILE, 'utf-8')
    const tokens = JSON.parse(data) as StoredToken

    console.log('[TokenStore] Tokens loaded successfully')
    return tokens
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log('[TokenStore] No tokens stored yet')
      return null
    }
    console.error('[TokenStore] Error loading tokens:', error.message)
    throw error
  }
}

/**
 * Save tokens to file
 */
export async function saveTokens(tokens: StoredToken): Promise<void> {
  try {
    await ensureTokenDir()
    await fs.writeFile(TOKEN_FILE, JSON.stringify(tokens, null, 2), 'utf-8')
    console.log('[TokenStore] Tokens saved successfully')
  } catch (error: any) {
    console.error('[TokenStore] Error saving tokens:', error.message)
    throw error
  }
}

/**
 * Check if tokens exist and are valid
 */
export async function hasValidTokens(): Promise<boolean> {
  const tokens = await loadTokens()
  if (!tokens) {
    return false
  }

  // Check if access token is expired (with 5 minute buffer)
  const bufferMs = 5 * 60 * 1000
  const isExpired = Date.now() >= tokens.expiry_date - bufferMs

  if (isExpired) {
    console.log('[TokenStore] Tokens are expired or about to expire')
    return false
  }

  return true
}

/**
 * Delete stored tokens
 */
export async function deleteTokens(): Promise<void> {
  try {
    await fs.unlink(TOKEN_FILE)
    console.log('[TokenStore] Tokens deleted')
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      throw error
    }
  }
}

/**
 * Get token status for debugging
 */
export async function getTokenStatus(): Promise<{
  exists: boolean
  isExpired: boolean
  expiresIn?: number
  expiresAt?: string
}> {
  const tokens = await loadTokens()

  if (!tokens) {
    return { exists: false, isExpired: true }
  }

  const isExpired = Date.now() >= tokens.expiry_date
  const expiresIn = Math.floor((tokens.expiry_date - Date.now()) / 1000)

  return {
    exists: true,
    isExpired,
    expiresIn: isExpired ? 0 : expiresIn,
    expiresAt: new Date(tokens.expiry_date).toISOString(),
  }
}
