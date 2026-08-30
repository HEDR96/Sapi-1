'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { uploadToS3 } from '@/lib/storage/upload'

interface ImageUploaderProps {
  value?: string
  onChange: (url: string) => void
  folder?: string
  accept?: string
  maxSize?: number // in MB
}

export function ImageUploader({
  value,
  onChange,
  folder = 'cattle',
  accept = 'image/jpeg,image/png,image/jpg',
  maxSize = 5, // 5MB default
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!accept.includes(file.type)) {
      return 'Format file tidak didukung. Gunakan JPG atau PNG.'
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `Ukuran file terlalu besar. Maksimal ${maxSize}MB.`
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
    setError(null)
    setUploadProgress(10)

    try {
      setUploadProgress(30)

      // Convert file to buffer and upload to S3
      const buffer = Buffer.from(await file.arrayBuffer())
      const url = await uploadToS3(buffer, file.name, file.type, folder)

      setUploadProgress(90)

      if (url) {
        onChange(url)
        setUploadProgress(100)
      } else {
        setError('Gagal mengupload gambar')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('Terjadi kesalahan saat mengupload')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    setError(null)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleUpload(file)
    } else {
      setError('File harus berupa gambar')
    }
  }, [folder, bucket])

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
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  // Show preview if has value
  if (value) {
    return (
      <div className="space-y-2">
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-[hsl(var(--line))] bg-[hsl(var(--cream))]">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-contain"
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
        <p className="text-xs text-[hsl(var(--forest))/50] text-center">
          Klik gambar untuk menghapus
        </p>
      </div>
    )
  }

  // Upload dropzone
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
              Mengupload... {uploadProgress}%
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
              {dragOver ? 'Lepaskan file di sini' : 'Klik atau drag gambar ke sini'}
            </p>
            <p className="text-xs text-[hsl(var(--forest))/40] mt-1">
              JPG, PNG • Maksimal {maxSize}MB
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
