/**
 * Check if a URL is a video stream URL
 */
export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false
  return url.includes('/api/stream?') || url.includes('mimeType=video')
}

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

  // Don't process video URLs as images
  if (isVideoUrl(url)) return ''

  // If already a proxy URL, return as is
  if (url.startsWith('/api/')) return url

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

/**
 * Convert URL to video streaming URL
 * Handles both old Google Drive URLs and new proxy URLs
 */
export function getVideoUrl(url: string | null | undefined): string {
  if (!url) return ''

  // If already a stream proxy URL, return as is
  if (url.includes('/api/stream?')) return url

  // Extract fileId from Google Drive URL patterns
  const drivePatterns = [
    /export=view&id=([a-zA-Z0-9_-]+)/,
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /\/open\?id=([a-zA-Z0-9_-]+)/,
  ]

  for (const pattern of drivePatterns) {
    const match = url.match(pattern)
    if (match) {
      const fileId = match[1]
      return `/api/stream?fileId=${fileId}&mimeType=video%2Fmp4`
    }
  }

  // Return original URL if not recognized (fallback)
  return url
}
