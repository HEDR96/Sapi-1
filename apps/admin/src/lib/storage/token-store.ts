/**
 * Token Store Module
 *
 * Securely stores and retrieves OAuth tokens
 * Supports Vercel KV (production), file storage (local Docker), and environment variable fallback
 */

import { promises as fs } from 'fs'
import path from 'path'

const TOKEN_KEY = 'google_oauth_token'

// Token file path - stored outside web root (for local Docker)
const TOKEN_DIR = process.env.DATA_DIR || '/app/data'
const TOKEN_FILE = path.join(TOKEN_DIR, 'google-token.json')

export interface StoredToken {
  access_token: string
  refresh_token: string
  expiry_date: number
}

// In-memory cache for performance (avoids repeated storage reads)
let tokenCache: StoredToken | null = null
let cacheExpiry: number = 0
const CACHE_TTL = 60 * 1000 // 1 minute cache

/**
 * Check if we're running on Vercel with KV available
 */
function isVercelKV(): boolean {
  return !!(
    process.env.VERCEL ||
    process.env.KV_REST_API_URL ||
    process.env.VERCEL_KV_REST_API_URL
  )
}

/**
 * Load tokens from Vercel KV
 */
async function loadFromVercelKV(): Promise<StoredToken | null> {
  try {
    const { createClient } = await import('@vercel/kv')

    const kv = createClient({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    })

    const data = await kv.get<StoredToken>(TOKEN_KEY)

    if (data) {
      console.log('[TokenStore] Tokens loaded from Vercel KV')
      return data
    }

    console.log('[TokenStore] No tokens in Vercel KV')
    return null
  } catch (error: any) {
    console.error('[TokenStore] Vercel KV error:', error.message)
    return null
  }
}

/**
 * Save tokens to Vercel KV
 */
async function saveToVercelKV(tokens: StoredToken): Promise<void> {
  try {
    const { createClient } = await import('@vercel/kv')

    const kv = createClient({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    })

    // Set with 90 day expiry (tokens typically refresh before this)
    await kv.set(TOKEN_KEY, tokens, { ex: 90 * 24 * 60 * 60 })
    console.log('[TokenStore] Tokens saved to Vercel KV')
  } catch (error: any) {
    console.error('[TokenStore] Vercel KV save error:', error.message)
    throw error
  }
}

/**
 * Load stored tokens with caching
 */
export async function loadTokens(): Promise<StoredToken | null> {
  // Check memory cache first
  if (tokenCache && Date.now() < cacheExpiry) {
    console.log('[TokenStore] Tokens loaded from memory cache')
    return tokenCache
  }

  // Use Vercel KV in production
  if (isVercelKV()) {
    const kvToken = await loadFromVercelKV()
    if (kvToken) {
      tokenCache = kvToken
      cacheExpiry = Date.now() + CACHE_TTL
      return kvToken
    }
  }

  // Fallback: Environment variable (initial load)
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

  // Fallback: File storage (for local Docker)
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
 * Save tokens to persistent storage
 * Priority: Vercel KV > File storage
 */
export async function saveTokens(tokens: StoredToken): Promise<void> {
  // Update memory cache
  tokenCache = tokens
  cacheExpiry = Date.now() + CACHE_TTL

  // Save to Vercel KV in production
  if (isVercelKV()) {
    await saveToVercelKV(tokens)
    return
  }

  // Fallback: File storage
  try {
    await fs.mkdir(TOKEN_DIR, { recursive: true })
    await fs.writeFile(TOKEN_FILE, JSON.stringify(tokens, null, 2), 'utf-8')
    console.log('[TokenStore] Tokens saved to file')
  } catch (error: any) {
    console.warn('[TokenStore] Could not save tokens to file:', error.message)
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
