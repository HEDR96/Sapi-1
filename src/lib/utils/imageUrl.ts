/**
 * Convert Google Drive URL to direct image URL
 *
 * Google Drive URLs like:
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/open?id=FILE_ID
 *
 * Will be converted to:
 * - https://drive.google.com/uc?export=view&id=FILE_ID
 */
export function getDirectImageUrl(url: string | null | undefined): string {
  if (!url) return ''

  // Google Drive URL patterns
  const drivePatterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/open\?id=([a-zA-Z0-9_-]+)/,
  ]

  for (const pattern of drivePatterns) {
    const match = url.match(pattern)
    if (match) {
      const fileId = match[1]
      // Use uc URL for direct image access
      return `https://drive.google.com/uc?export=view&id=${fileId}`
    }
  }

  // Return original URL if not a Google Drive URL
  return url
}
