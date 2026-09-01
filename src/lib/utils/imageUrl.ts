/**
 * Convert Google Drive URL to direct image URL
 *
 * Google Drive URLs like:
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/open?id=FILE_ID
 *
 * Will be converted to a proxy URL that handles CORS
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
      // Return the file ID - the image proxy will handle fetching
      return `/api/image-proxy?id=${fileId}`
    }
  }

  // Return original URL if not a Google Drive URL
  return url
}
