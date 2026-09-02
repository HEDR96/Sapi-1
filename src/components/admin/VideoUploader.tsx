'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Loader2, Video, Check, AlertCircle, Film } from 'lucide-react'

interface VideoUploaderProps {
  onUploadComplete: (url: string) => void
  folder?: string
  maxSize?: number // in MB after compression
  maxDuration?: number // in seconds
}

type UploadStatus = 'idle' | 'compressing' | 'uploading' | 'done' | 'error'

export function VideoUploader({
  onUploadComplete,
  folder = 'cattle',
  maxSize = 100, // 100MB after compression
  maxDuration = 180, // 3 minutes
}: VideoUploaderProps) {
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [originalSize, setOriginalSize] = useState<number>(0)

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src)
        resolve(video.duration)
      }
      video.onerror = () => resolve(0)
      video.src = URL.createObjectURL(file)
    })
  }

  const compressVideo = async (file: File): Promise<File> => {
    setStatus('compressing')
    setProgress(0)
    setProgressText('Memuat encoder...')

    // Load FFmpeg.wasm dynamically
    const { FFmpeg } = await import('@ffmpeg/ffmpeg')
    const { fetchFile, toBlobURL } = await import('@ffmpeg/util')

    const ffmpeg = new FFmpeg()

    ffmpeg.on('progress', ({ progress: p }) => {
      setProgress(Math.round(p * 100))
      setProgressText(`Mengecilkan video... ${Math.round(p * 100)}%`)
    })

    setProgressText('Memuat FFmpeg...')
    setProgress(5)

    try {
      // Load FFmpeg core
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      })

      setProgressText('Memproses video...')
      setProgress(10)

      // Write input file
      const inputName = 'input.mp4'
      const outputName = 'output.mp4'

      await ffmpeg.writeFile(inputName, await fetchFile(file))

      setProgressText('Mengecilkan video...')
      setProgress(20)

      // Get video duration
      const duration = await getVideoDuration(file)

      if (duration > maxDuration) {
        throw new Error(`Video terlalu panjang. Maksimal ${Math.floor(maxDuration / 60)} menit.`)
      }

      // Calculate target bitrate based on file size
      // Target: compress to roughly 1MB per 6 seconds of video, or maxSize MB
      const targetBitrate = Math.min(
        Math.floor((maxSize * 8 * 1024) / Math.max(duration, 1)), // bits per second
        2000 // max 2 Mbps
      )

      // Run FFmpeg compression
      await ffmpeg.exec([
        '-i', inputName,
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '28',
        '-b:v', `${targetBitrate}k`,
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        outputName
      ])

      setProgressText('Menyelesaikan...')
      setProgress(95)

      // Read output file
      const data = await ffmpeg.readFile(outputName)
      const blob = new Blob([data as BlobPart], { type: 'video/mp4' })
      const outputFile = new File([blob], file.name.replace(/\.[^.]+$/, '.mp4'), { type: 'video/mp4' })

      // Cleanup
      await ffmpeg.deleteFile(inputName)
      await ffmpeg.deleteFile(outputName)

      return outputFile
    } catch (err) {
      throw new Error(`Gagal mengecilkan video: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const uploadFile = async (file: File) => {
    setStatus('uploading')
    setProgress(0)
    setProgressText('Mengupload...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      // Use XMLHttpRequest for progress tracking
      const result = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100)
            setProgress(pct)
            setProgressText(`Mengupload... ${pct}%`)
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText)
              if (data.url) {
                resolve(data.url)
              } else {
                reject(new Error('URL tidak ditemukan'))
              }
            } catch {
              reject(new Error('Response tidak valid'))
            }
          } else {
            reject(new Error(`Upload gagal: ${xhr.status}`))
          }
        }

        xhr.onerror = () => reject(new Error('Koneksi gagal'))

        xhr.open('POST', '/api/upload')
        xhr.send(formData)
      })

      setProgress(100)
      setProgressText('Selesai!')
      setStatus('done')
      setVideoUrl(result)
      onUploadComplete(result)

    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Upload gagal')
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setOriginalSize(file.size)

    // Check file type
    if (!file.type.startsWith('video/')) {
      setError('File harus berupa video')
      return
    }

    try {
      // Check duration
      setStatus('compressing')
      setProgressText('Memeriksa video...')

      const duration = await getVideoDuration(file)
      if (duration > maxDuration) {
        throw new Error(`Video terlalu panjang. Maksimal ${Math.floor(maxDuration / 60)} menit.`)
      }

      // If file is small enough, upload directly
      const threshold = maxSize * 1024 * 1024
      if (file.size <= threshold) {
        setProgressText('Video sudah kecil, langsung upload...')
        await uploadFile(file)
      } else {
        // Compress the video
        const compressedFile = await compressVideo(file)

        // Show compression result
        const compressionRatio = Math.round((1 - compressedFile.size / file.size) * 100)
        setProgressText(`Ukuran berhasil dikecilkan ${compressionRatio}%`)
        setProgress(98)

        // Upload compressed file
        await uploadFile(compressedFile)
      }

    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    }
  }

  const handleRemove = () => {
    setVideoUrl(null)
    setStatus('idle')
    setProgress(0)
    setProgressText('')
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  if (status === 'done' && videoUrl) {
    return (
      <div className="space-y-2">
        <div className="relative w-full rounded-lg overflow-hidden border border-[hsl(var(--line))] bg-[hsl(var(--cream))] aspect-video">
          <video src={videoUrl} controls className="w-full h-full object-contain" />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-center text-[hsl(var(--forest))/60]">
          {originalSize > 0 && (
            <span>Ukuran asli: {formatFileSize(originalSize)}</span>
          )}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div
        onClick={() => status !== 'compressing' && status !== 'uploading' && inputRef.current?.click()}
        className={`w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all aspect-video ${
          status === 'compressing' || status === 'uploading'
            ? 'border-[hsl(var(--forest))] bg-[hsl(var(--cream))] cursor-not-allowed'
            : 'border-[hsl(var(--line))] hover:border-[hsl(var(--forest))] hover:bg-[hsl(var(--cream))/50]'
        }`}
      >
        {(status === 'compressing' || status === 'uploading') ? (
          <div className="text-center px-4">
            <div className="w-16 h-16 mx-auto mb-3 relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-[hsl(var(--line))]"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                  className="text-[hsl(var(--forest))] transition-all duration-300"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[hsl(var(--forest))]">
                {progress}%
              </span>
            </div>
            <p className="text-sm text-[hsl(var(--forest))/80]">
              {progressText}
            </p>
            {status === 'compressing' && (
              <p className="text-xs text-[hsl(var(--forest))/50] mt-1">
                Mohon tunggu, proses ini mungkin memakan waktu beberapa menit
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-[hsl(var(--cream))] flex items-center justify-center mb-3">
              <Video className="h-7 w-7 text-[hsl(var(--forest))/40]" />
            </div>
            <p className="text-sm text-[hsl(var(--forest))/60]">
              Klik untuk upload video
            </p>
            <p className="text-xs text-[hsl(var(--forest))/40] mt-1">
              MP4, MOV, AVI • Maksimal {maxDuration / 60} menit
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-[hsl(var(--forest))/50]">
        <Film className="h-3 w-3" />
        <span>Video besar akan dikecilkan secara otomatis sebelum diupload</span>
      </div>
    </div>
  )
}
