'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, X, Loader2, Image as ImageIcon, Play, Pause, FileVideo } from 'lucide-react'
import { getDirectImageUrl } from '@samadya/shared/lib/utils/imageUrl'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

interface ImageUploaderProps {
  value?: string
  onChange: (url: string) => void
  folder?: string
  accept?: string
  maxSize?: number
}

// Max file size for direct upload (4MB - Vercel limit)
const MAX_DIRECT_UPLOAD_SIZE = 4 * 1024 * 1024
// Target video size after compression
const TARGET_VIDEO_SIZE = 4 * 1024 * 1024 // 4MB

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
  const [compressing, setCompressing] = useState(false)
  const [statusText, setStatusText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const ffmpegRef = useRef<FFmpeg | null>(null)
  const ffmpegLoaded = useRef(false)

  const isVideo = value?.includes('/api/stream') || value?.match(/\.(mp4|webm|ogg)$/i) || value?.startsWith('data:video')

  // Initialize FFmpeg once
  useEffect(() => {
    const loadFFmpeg = async () => {
      if (ffmpegLoaded.current) return

      const ffmpeg = new FFmpeg()
      ffmpegRef.current = ffmpeg

      ffmpeg.on('progress', ({ progress }) => {
        setUploadProgress(Math.round(progress * 100))
      })

      try {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        })
        ffmpegLoaded.current = true
        console.log('[ImageUploader] FFmpeg loaded successfully')
      } catch (err) {
        console.error('[ImageUploader] Failed to load FFmpeg:', err)
        ffmpegLoaded.current = false
      }
    }

    loadFFmpeg()
  }, [])

  const validateFile = (file: File): string | null => {
    const isVideoFile = file.type.startsWith('video/')
    const isImageFile = file.type.startsWith('image/')

    if (!isImageFile && !isVideoFile) {
      return 'Format file tidak didukung. Gunakan JPG, PNG, atau MP4.'
    }

    const maxSizeBytes = isVideoFile ? 100 * 1024 * 1024 : maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `Ukuran file terlalu besar. Maksimal ${isVideoFile ? '100MB' : `${maxSize}MB`}.`
    }
    return null
  }

  const compressVideo = async (file: File): Promise<File> => {
    if (!ffmpegRef.current || !ffmpegLoaded.current) {
      throw new Error('Video compressor tidak tersedia')
    }

    setCompressing(true)
    setStatusText('Memuat compressor video...')

    try {
      const ffmpeg = ffmpegRef.current

      // Write input file
      setStatusText('Mempersiapkan video...')
      const inputName = 'input.mp4'
      const outputName = 'output.mp4'

      await ffmpeg.writeFile(inputName, await fetchFile(file))

      // Calculate target bitrate based on file size
      // Target: compress to ~4MB or less while maintaining reasonable quality
      const duration = await getVideoDuration(file)
      const targetBitrate = Math.max(500, (TARGET_VIDEO_SIZE * 8) / duration) // kbps

      setStatusText('Mengcompress video...')

      // Compress with FFmpeg
      await ffmpeg.exec([
        '-i', inputName,
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '28',
        '-b:v', `${targetBitrate}k`,
        '-c:a', 'aac',
        '-b:a', '64k',
        '-movflags', '+faststart',
        '-y',
        outputName
      ])

      // Read output file
      const data = await ffmpeg.readFile(outputName)
      // Create blob from ffmpeg output
      const compressedBlob = new Blob([data as unknown as BlobPart], { type: 'video/mp4' })

      // Cleanup
      await ffmpeg.deleteFile(inputName)
      await ffmpeg.deleteFile(outputName)

      const compressedFile = new File([compressedBlob], file.name.replace(/\.[^.]+$/, '.mp4'), {
        type: 'video/mp4'
      })

      console.log('[ImageUploader] Compression result:', {
        originalSize: file.size,
        compressedSize: compressedFile.size,
        reduction: `${Math.round((1 - compressedFile.size / file.size) * 100)}%`
      })

      return compressedFile
    } finally {
      setCompressing(false)
      setStatusText('')
    }
  }

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src)
        resolve(video.duration)
      }
      video.onerror = () => {
        URL.revokeObjectURL(video.src)
        resolve(60) // Default 60 seconds
      }
      video.src = URL.createObjectURL(file)
    })
  }

  const handleUpload = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setUploading(true)
    const isVideoFile = file.type.startsWith('video/')
    setUploadingIsVideo(isVideoFile)
    setError(null)
    setUploadProgress(0)

    try {
      let fileToUpload = file

      // Compress video if it's larger than 4MB (Vercel limit)
      if (isVideoFile && file.size > MAX_DIRECT_UPLOAD_SIZE) {
        try {
          fileToUpload = await compressVideo(file)
        } catch (compressErr) {
          console.error('[ImageUploader] Compression failed:', compressErr)
          // If compression fails and file is too large, show error
          if (file.size > MAX_DIRECT_UPLOAD_SIZE) {
            throw new Error('Video terlalu besar. Maksimal 4MB atau gunakan video yang lebih kecil.')
          }
        }
      }

      const uploadFolder = isVideoFile ? 'video' : 'image'

      const formData = new FormData()
      formData.append('file', fileToUpload)
      formData.append('folder', uploadFolder)

      setUploadProgress(30)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      setUploadProgress(80)

      let data
      const responseText = await response.text()

      try {
        data = JSON.parse(responseText)
      } catch (jsonError) {
        console.error('Server response (not JSON):', responseText)
        throw new Error(responseText || 'Server error: ' + response.status)
      }

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengupload file')
      }

      if (data.url) {
        onChange(data.url)
        setUploadProgress(100)
      } else {
        throw new Error('URL tidak ditemukan')
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
      setCompressing(false)
      setUploadProgress(0)
      setStatusText('')
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
              {compressing ? statusText : (uploadingIsVideo ? 'Mengupload video...' : 'Mengupload gambar...')} {uploadProgress}%
            </p>
            {compressing && (
              <p className="text-xs text-[hsl(var(--forest))/40] mt-1">
                Mohon tunggu, compress video...
              </p>
            )}
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
              JPG, PNG - Maksimal {maxSize}MB | Video - Maksimal 4MB (otomatis compress jika lebih besar)
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
