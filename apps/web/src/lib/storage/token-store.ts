/**
 * Token Store Module
 *
 * Securely stores and retrieves OAuth tokens
 * Supports both file storage and environment variable fallback
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
 * Load stored tokens from file OR environment variable
 */
export async function loadTokens(): Promise<StoredToken | null> {
  // First try environment variable (for Railway/production)
  const envToken = process.env.GOOGLE_TOKEN_JSON
  if (envToken) {
    try {
      const tokens = JSON.parse(envToken) as StoredToken
      console.log('[TokenStore] Tokens loaded from environment variable')
      return tokens
    } catch (error: any) {
      console.error('[TokenStore] Error parsing GOOGLE_TOKEN_JSON:', error.message)
    }
  }

  // Then try file storage (for local Docker)
  try {
    await fs.mkdir(TOKEN_DIR, { recursive: true })
    const data = await fs.readFile(TOKEN_FILE, 'utf-8')
    const tokens = JSON.parse(data) as StoredToken
    console.log('[TokenStore] Tokens loaded from file')
    return tokens
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log('[TokenStore] No tokens stored yet')
      return null
    }
    console.error('[TokenStore] Error loading tokens from file:', error.message)
    return null
  }
}

/**
 * Save tokens to file (for local Docker)
 * Note: In production (Railway), tokens come from env var, so this may fail silently
 */
export async function saveTokens(tokens: StoredToken): Promise<void> {
  // Try to save to file for local development
  try {
    await fs.mkdir(TOKEN_DIR, { recursive: true })
    await fs.writeFile(TOKEN_FILE, JSON.stringify(tokens, null, 2), 'utf-8')
    console.log('[TokenStore] Tokens saved to file')
  } catch (error: any) {
    console.warn('[TokenStore] Could not save tokens to file (production environment):', error.message)
    console.log('[TokenStore] Add GOOGLE_TOKEN_JSON to environment variables for production')
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
    console.log('[TokenStore] Tokens deleted from file')
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      console.warn('[TokenStore] Could not delete tokens:', error.message)
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
