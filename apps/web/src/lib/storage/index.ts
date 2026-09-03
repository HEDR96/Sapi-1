/**
 * Storage Module Exports
 *
 * Unified interface for all storage operations
 * Using OAuth 2.0 for Google Drive
 */

// Re-export OAuth functions
export {
  uploadToGoogleDrive,
  deleteFromGoogleDrive,
  isAuthorized,
  validateGoogleDriveConfig,
  getAuthorizationUrl,
  handleOAuthCallback,
} from './google-drive-oauth'

// Token store functions
export {
  loadTokens,
  saveTokens,
  getTokenStatus,
} from './token-store'
