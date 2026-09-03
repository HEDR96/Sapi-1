const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '/api/images'
const VIDEO_BASE_URL = process.env.NEXT_PUBLIC_VIDEO_BASE_URL || '/api/videos'

/**
 * Get direct image URL for display
 */
export function getDirectImageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder-cattle.png'

  // If it's already an absolute URL (external), return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // If it's a path starting with /, prepend the image base URL
  if (path.startsWith('/')) {
    return `${IMAGE_BASE_URL}${path}`
  }

  // Otherwise treat as a storage path
  return `${IMAGE_BASE_URL}/${path}`
}

/**
 * Get direct video URL for display
 */
export function getVideoUrl(path: string | null | undefined): string {
  if (!path) return ''

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  if (path.startsWith('/')) {
    return `${VIDEO_BASE_URL}${path}`
  }

  return `${VIDEO_BASE_URL}/${path}`
}

/**
 * Check if a URL is a video
 */
export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false
  const lower = url.toLowerCase()
  return (
    lower.includes('/api/videos') ||
    lower.includes('/videos/') ||
    lower.endsWith('.mp4') ||
    lower.endsWith('.webm') ||
    lower.endsWith('.mov') ||
    lower.includes('mimeType=video')
  )
}
