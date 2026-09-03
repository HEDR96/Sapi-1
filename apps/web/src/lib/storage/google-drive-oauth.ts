/**
 * Google Drive OAuth 2.0 Client
 *
 * Handles OAuth 2.0 authentication with refresh token flow
 * Uses user's personal Google account for storage quota
 */

import { google, drive_v3 } from 'googleapis'
import { loadTokens, saveTokens } from './token-store'

// OAuth 2.0 Scopes - minimal required for upload
const SCOPES = ['https://www.googleapis.com/auth/drive.file']

// Folder IDs from environment
export const DRIVE_FOLDERS = {
  image: process.env.GOOGLE_DRIVE_IMAGE_FOLDER_ID || '',
  video: process.env.GOOGLE_DRIVE_VIDEO_FOLDER_ID || '',
}

/**
 * Validate Google Drive configuration
 */
export function validateGoogleDriveConfig(): void {
  const missing: string[] = []

  if (!process.env.GOOGLE_OAUTH_CLIENT_ID) {
    missing.push('GOOGLE_OAUTH_CLIENT_ID')
  }
  if (!process.env.GOOGLE_OAUTH_CLIENT_SECRET) {
    missing.push('GOOGLE_OAUTH_CLIENT_SECRET')
  }
  if (!process.env.GOOGLE_OAUTH_REDIRECT_URI) {
    missing.push('GOOGLE_OAUTH_REDIRECT_URI')
  }
  if (!process.env.GOOGLE_DRIVE_IMAGE_FOLDER_ID) {
    missing.push('GOOGLE_DRIVE_IMAGE_FOLDER_ID')
  }
  if (!process.env.GOOGLE_DRIVE_VIDEO_FOLDER_ID) {
    missing.push('GOOGLE_DRIVE_VIDEO_FOLDER_ID')
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required Google Drive environment variables: ${missing.join(', ')}. ` +
      `Please set these in your .env file or Docker environment.`
    )
  }
}

/**
 * Get OAuth2 client configuration
 */
function getOAuth2Client() {
  validateGoogleDriveConfig()

  return new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URI
  )
}

/**
 * Get the OAuth authorization URL for user to grant access
 */
export function getAuthorizationUrl(): string {
  const oauth2Client = getOAuth2Client()

  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // Important: get refresh token
    scope: SCOPES,
    prompt: 'consent', // Force consent screen to get refresh token
  })
}

/**
 * Handle OAuth callback - exchange code for tokens
 */
export async function handleOAuthCallback(code: string): Promise<void> {
  const oauth2Client = getOAuth2Client()

  console.log('[Google OAuth] Exchanging code for tokens...')

  const { tokens } = await oauth2Client.getToken(code)

  console.log('[Google OAuth] Tokens received:', {
    hasAccessToken: !!tokens.access_token,
    hasRefreshToken: !!tokens.refresh_token,
    expiryDate: tokens.expiry_date,
  })

  // Calculate actual expiry date if not provided (default: 1 hour from now)
  const expiryDate = tokens.expiry_date || (Date.now() + 3600 * 1000)

  // Save tokens
  await saveTokens({
    access_token: tokens.access_token!,
    refresh_token: tokens.refresh_token!,
    expiry_date: expiryDate,
  })

  console.log('[Google OAuth] Tokens saved successfully')
}

/**
 * Get authenticated Google Drive client
 * Automatically refreshes token if expired
 */
export async function getAuthenticatedDriveClient(): Promise<drive_v3.Drive> {
  validateGoogleDriveConfig()

  const oauth2Client = getOAuth2Client()

  // Load stored tokens
  const tokens = await loadTokens()

  if (!tokens) {
    throw new Error(
      'No OAuth tokens found. Please authorize the application first by visiting /api/auth/google/init'
    )
  }

  // Set credentials
  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date,
  })

  // Force token refresh if expired
  const bufferMs = 5 * 60 * 1000 // 5 minute buffer
  const isExpired = Date.now() >= tokens.expiry_date - bufferMs

  if (isExpired) {
    console.log('[Google OAuth] Token expired, refreshing...')
    try {
      // Manually refresh the token
      const { credentials } = await oauth2Client.refreshAccessToken()
      console.log('[Google OAuth] Token refreshed successfully')

      // Save new tokens
      await saveTokens({
        access_token: credentials.access_token!,
        refresh_token: credentials.refresh_token || tokens.refresh_token,
        expiry_date: credentials.expiry_date || (Date.now() + 3600 * 1000),
      })
    } catch (refreshError: any) {
      console.error('[Google OAuth] Token refresh failed:', refreshError.message)
      throw new Error(
        'Token expired and refresh failed. Please re-authorize at /api/auth/google/init'
      )
    }
  }

  return google.drive({ version: 'v3', auth: oauth2Client })
}

/**
 * Upload a file to Google Drive using OAuth
 * @param buffer - File buffer
 * @param fileName - Original file name
 * @param mimeType - MIME type of the file
 * @param folder - 'image' or 'video'
 * @returns Object containing file ID and public URL
 */
export async function uploadToGoogleDrive(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  folder: 'image' | 'video' = 'image'
): Promise<{ fileId: string; webViewLink: string; webContentLink: string; thumbnailLink: string; directUrl: string }> {
  const drive = await getAuthenticatedDriveClient()
  const folderId = DRIVE_FOLDERS[folder]

  if (!folderId) {
    throw new Error(`Invalid folder type: ${folder}. Use 'image' or 'video'.`)
  }

  console.log('[Google Drive OAuth] Starting upload:', {
    fileName,
    mimeType,
    folder,
    folderId,
    fileSize: buffer.length,
  })

  // Create unique filename with timestamp
  const uniqueFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`

  // File metadata
  const fileMetadata: drive_v3.Schema$File = {
    name: uniqueFileName,
    parents: [folderId],
  }

  // Media object
  const media = {
    mimeType,
    body: bufferToStream(buffer),
  }

  try {
    // Upload file
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name, webViewLink, webContentLink, mimeType, thumbnailLink',
    })

    const fileId = response.data.id!
    const webViewLink = response.data.webViewLink || ''
    const webContentLink = response.data.webContentLink || ''
    const thumbnailLink = response.data.thumbnailLink || ''

    console.log('[Google Drive OAuth] File created:', {
      fileId,
      name: response.data.name,
    })

    // Make file publicly accessible
    await makeFilePublic(drive, fileId)

    console.log('[Google Drive OAuth] Upload successful:', {
      fileId,
      webViewLink,
    })

    // Generate direct download URL for images
    const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`

    return {
      fileId,
      webViewLink,
      webContentLink,
      thumbnailLink,
      directUrl,
    }
  } catch (error: any) {
    console.error('[Google Drive OAuth] Upload failed:', {
      error: error.message,
      code: error.code,
    })

    if (error.message?.includes('No OAuth tokens found')) {
      throw new Error(
        'Google Drive not authorized. Please visit /api/auth/google/init to authorize.'
      )
    }

    throw new Error(`Google Drive upload failed: ${error.message}`)
  }
}

/**
 * Make a file publicly accessible
 */
async function makeFilePublic(drive: drive_v3.Drive, fileId: string): Promise<void> {
  try {
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    })
    console.log('[Google Drive OAuth] File made public:', fileId)
  } catch (error: any) {
    console.error('[Google Drive OAuth] Failed to make file public:', error.message)
    // Don't throw - file is uploaded, just not public
  }
}

/**
 * Delete a file from Google Drive
 */
export async function deleteFromGoogleDrive(fileId: string): Promise<void> {
  const drive = await getAuthenticatedDriveClient()

  console.log('[Google Drive OAuth] Deleting file:', fileId)

  try {
    await drive.files.delete({
      fileId,
    })
    console.log('[Google Drive OAuth] File deleted:', fileId)
  } catch (error: any) {
    console.error('[Google Drive OAuth] Delete failed:', {
      error: error.message,
      code: error.code,
    })
    throw new Error(`Google Drive delete failed: ${error.message}`)
  }
}

/**
 * Convert Buffer to Readable Stream
 */
function bufferToStream(buffer: Buffer): NodeJS.ReadableStream {
  const { Readable } = require('stream')
  const readable = new Readable()
  readable.push(buffer)
  readable.push(null)
  return readable
}

/**
 * Check if user is authorized (has tokens, even if expired - refresh will happen on use)
 */
export async function isAuthorized(): Promise<boolean> {
  try {
    const tokens = await loadTokens()
    // Return true if we have tokens, even if expired
    // The actual refresh will happen in getAuthenticatedDriveClient()
    return tokens !== null
  } catch {
    return false
  }
}
