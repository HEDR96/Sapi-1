'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Loader2, Image as ImageIcon, Play, Pause } from 'lucide-react'
import { getDirectImageUrl } from '@samadya/shared/lib/utils/imageUrl'

interface ImageUploaderProps {
  value?: string
  onChange: (url: string) => void
  folder?: string
  accept?: string
  maxSize?: number
}

export function ImageUploader({
  value,
  onChange,
  folder = 'cattle',
  accept = 'image/jpeg,image/png,image/jpg,video/mp4,video/webm',
  maxSize = 20,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [uploadingIsVideo, setUploadingIsVideo] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const isVideo = value?.includes('/api/stream') || value?.match(/\.(mp4|webm|ogg)$/i) || value?.startsWith('data:video')

  const validateFile = (file: File): string | null => {
    const isVideoFile = file.type.startsWith('video/')
    const isImageFile = file.type.startsWith('image/')

    if (!isImageFile && !isVideoFile) {
      return 'Format file tidak didukung. Gunakan JPG, PNG, atau MP4.'
    }

    const maxSizeBytes = isVideoFile ? 500 * 1024 * 1024 : maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `Ukuran file terlalu besar. Maksimal ${isVideoFile ? '500MB' : `${maxSize}MB`}.`
    }
    return null
  }

  const handleUpload = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setUploading(true)
    setUploadingIsVideo(file.type.startsWith('video/'))
    setError(null)
    setUploadProgress(5)

    try {
      const uploadFolder = file.type.startsWith('video/') ? 'video' : 'image'
      const isVideoFile = file.type.startsWith('video/')

      // For small files (<5MB), use server upload
      // For large files, use direct-to-Google Drive upload
      const SMALL_FILE_LIMIT = 5 * 1024 * 1024 // 5MB

      if (file.size <= SMALL_FILE_LIMIT) {
        // Use server upload for small files
        setUploadProgress(10)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', uploadFolder)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        setUploadProgress(80)

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Gagal mengupload file')
        }

        if (data.url) {
          onChange(data.url)
          setUploadProgress(100)
        } else {
          throw new Error('URL tidak ditemukan')
        }
      } else {
        // Use direct upload to Google Drive for large files
        setUploadProgress(10)

        // Step 1: Get resumable upload URL from server
        const initRes = await fetch('/api/upload-init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            mimeType: file.type,
            folder: uploadFolder,
          }),
        })

        if (!initRes.ok) {
          const initData = await initRes.json()
          throw new Error(initData.error || 'Gagal inisialisasi upload')
        }

        const { fileId, uploadUrl } = await initRes.json()
        setUploadProgress(30)

        // Step 2: Upload directly to Google Drive using resumable upload
        const xhr = new XMLHttpRequest()

        await new Promise<void>((resolve, reject) => {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const progress = 30 + (event.loaded / event.total) * 60
              setUploadProgress(Math.round(progress))
            }
          }

          xhr.onload = () => {
            if (xhr.status === 200 || xhr.status === 201) {
              resolve()
            } else {
              reject(new Error(`Upload gagal: ${xhr.status}`))
            }
          }

          xhr.onerror = () => reject(new Error('Gagal upload ke Google Drive'))

          xhr.open('PUT', uploadUrl)
          xhr.setRequestHeader('Content-Type', file.type)
          xhr.send(file)
        })

        setUploadProgress(95)

        // Step 3: Get the file URL
        const isVideoType = isVideoFile || file.type.includes('video')
        let publicUrl: string
        if (isVideoType) {
          publicUrl = `/api/stream?fileId=${fileId}&mimeType=${encodeURIComponent(file.type)}`
        } else {
          publicUrl = `/api/image-proxy?id=${fileId}`
        }

        onChange(publicUrl)
        setUploadProgress(100)
      }
    } catch (err) {
      console.error('Upload error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengupload'
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setError('Tidak dapat terhubung ke server.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setUploading(false)
      setUploadingIsVideo(false)
      setUploadProgress(0)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    setError(null)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleUpload(file)
    }
  }, [folder])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleRemove = () => {
    onChange('')
    setError(null)
    setIsVideoPlaying(false)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsVideoPlaying(!isVideoPlaying)
    }
  }

  // Show video preview
  if (value && isVideo) {
    const videoUrl = value.startsWith('/') ? value : getDirectImageUrl(value)

    return (
      <div className="space-y-2">
        <div className="relative w-full rounded-lg overflow-hidden border border-[hsl(var(--line))] bg-black">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-48 object-contain"
            onEnded={() => setIsVideoPlaying(false)}
            onError={(e) => {
              console.error('Video load error:', e)
              e.currentTarget.poster = ''
            }}
          />
          <button
            type="button"
            onClick={toggleVideoPlayback}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
            title={isVideoPlaying ? 'Pause' : 'Play'}
          >
            {isVideoPlaying ? (
              <Pause className="h-8 w-8 text-white" />
            ) : (
              <Play className="h-8 w-8 text-white ml-1" />
            )}
          </button>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            title="Hapus video"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-[hsl(var(--forest))/50] text-center">
          Video dokumentasi
        </p>
      </div>
    )
  }

  // Show image preview
  if (value) {
    const imageUrl = getDirectImageUrl(value)

    return (
      <div className="space-y-2">
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-[hsl(var(--line))] bg-[hsl(var(--cream))]">
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.src = value
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            title="Hapus gambar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-[hsl(var(--forest))/40] text-center break-all px-2">
          URL: {value}
        </p>
        <p className="text-xs text-[hsl(var(--forest))/50] text-center">
          Klik gambar untuk menghapus
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`w-full h-48 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
          dragOver
            ? 'border-[hsl(var(--forest))] bg-[hsl(var(--cream))]'
            : 'border-[hsl(var(--line))] hover:border-[hsl(var(--forest))] hover:bg-[hsl(var(--cream))/50]'
        } ${uploading ? 'cursor-not-allowed' : ''}`}
      >
        {uploading ? (
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--forest))] mx-auto mb-3" />
            <p className="text-sm text-[hsl(var(--forest))/60]">
              {uploadingIsVideo ? 'Mengupload video...' : 'Mengupload gambar...'} {uploadProgress}%
            </p>
            <div className="w-48 h-2 bg-[hsl(var(--line))] rounded-full mt-3 mx-auto overflow-hidden">
              <div
                className="h-full bg-[hsl(var(--forest))] transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-[hsl(var(--cream))] flex items-center justify-center mb-3">
              {dragOver ? (
                <ImageIcon className="h-8 w-8 text-[hsl(var(--forest))]" />
              ) : (
                <Upload className="h-8 w-8 text-[hsl(var(--forest))/40]" />
              )}
            </div>
            <p className="text-sm text-[hsl(var(--forest))/60]">
              {dragOver ? 'Lepaskan file di sini' : 'Klik atau drag gambar/video ke sini'}
            </p>
            <p className="text-xs text-[hsl(var(--forest))/40] mt-1">
              JPG, PNG, MP4 - Maksimal {folder === 'video' || folder === 'video-upload' ? '100MB' : `${maxSize}MB`}
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}
