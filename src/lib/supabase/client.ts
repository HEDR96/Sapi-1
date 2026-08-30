import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not configured. Image uploads will not work.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to upload image with optimization
export async function uploadOptimizedImage(
  file: File,
  bucket: string = 'cattle-images',
  folder: string = 'cattle'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Generate unique filename
    const ext = 'webp' // Convert all images to WebP for optimization
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`

    // For now, we'll upload as-is since browser compression requires more setup
    // In production, you'd use browser-image-compression here
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, uint8Array, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)

    return { success: true, url: urlData.publicUrl }
  } catch (error) {
    console.error('Upload error:', error)
    return { success: false, error: 'Failed to upload image' }
  }
}

// Helper function to delete image
export async function deleteImage(
  path: string,
  bucket: string = 'cattle-images'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract path from full URL if needed
    const filePath = path.includes('/storage/v1/')
      ? path.split('/storage/v1/object/public/')[1]?.split('?')[0] || path
      : path

    const { error } = await supabase.storage.from(bucket).remove([filePath])

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    return { success: false, error: 'Failed to delete image' }
  }
}
