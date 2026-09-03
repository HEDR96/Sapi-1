'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Download, Play, Grid, Maximize2, Film } from 'lucide-react'
import { CattleMedia } from '@samadya/shared/types'
import { getDirectImageUrl, getVideoUrl } from '@samadya/shared/lib/utils/imageUrl'

interface MediaTabProps {
  media: CattleMedia[]
}

export function MediaTab({ media }: MediaTabProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxType, setLightboxType] = useState<'image' | 'video'>('image')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid')

  if (!media || media.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-[hsl(var(--cream))] rounded-full flex items-center justify-center">
          <Grid className="h-8 w-8 text-[hsl(var(--forest))/40]" />
        </div>
        <h3 className="text-lg font-semibold text-[hsl(var(--forest))] mb-2">Belum Ada Dokumentasi</h3>
        <p className="text-sm text-[hsl(var(--forest))/60]">
          Foto dan video dokumentasi akan muncul setelah diupload.
        </p>
      </div>
    )
  }

  // Separate images and videos - use toUpperCase for case-insensitive comparison
  const images = media.filter(m => !m.fileType.toUpperCase().includes('VIDEO'))
  const videos = media.filter(m => m.fileType.toUpperCase().includes('VIDEO'))

  const openLightbox = (index: number) => {
    setLightboxType('image')
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  const openVideoLightbox = (index: number) => {
    setLightboxType('video')
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  const goToPrevious = () => {
    if (lightboxType === 'image') {
      setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    } else {
      setCurrentIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1))
    }
  }

  const goToNext = () => {
    if (lightboxType === 'image') {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    } else {
      setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious()
    if (e.key === 'ArrowRight') goToNext()
    if (e.key === 'Escape') setLightboxOpen(false)
  }

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-[hsl(var(--forest))]">
              Dokumentasi ({images.length} foto{videos.length > 0 && `, ${videos.length} video`})
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[hsl(var(--forest))] text-white'
                  : 'bg-[hsl(var(--cream))] text-[hsl(var(--forest)) hover:bg-[hsl(var(--line))]'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('masonry')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'masonry'
                  ? 'bg-[hsl(var(--forest))] text-white'
                  : 'bg-[hsl(var(--cream))] text-[hsl(var(--forest)) hover:bg-[hsl(var(--line))]'
              }`}
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Grid/Masonry Gallery */}
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'
              : 'columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3'
          }
        >
          {images.map((item, index) => (
            <button
              key={item.id}
              onClick={() => openLightbox(index)}
              className={`group relative overflow-hidden rounded-xl bg-[hsl(var(--cream))] ${
                viewMode === 'masonry' ? 'break-inside-avoid mb-3' : ''
              }`}
            >
              <div className="relative aspect-square">
                <Image
                  src={getDirectImageUrl(item.fileUrl)}
                  alt={item.title || 'Dokumentasi'}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                    <span className="p-2 bg-white/90 rounded-full">
                      <Maximize2 className="h-4 w-4 text-[hsl(var(--forest))]" />
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadImage(item.fileUrl, `${item.title || 'dokumentasi'}-${index + 1}.jpg`)
                      }}
                      className="p-2 bg-white/90 rounded-full"
                    >
                      <Download className="h-4 w-4 text-[hsl(var(--forest))]" />
                    </button>
                  </div>
                </div>
              </div>
              {item.title && (
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                  <span className="text-white text-xs font-medium">{item.title}</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Videos Section */}
        {videos.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-[hsl(var(--forest))] mb-3">Video</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {videos.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => openVideoLightbox(index)}
                  className="relative aspect-video rounded-xl overflow-hidden bg-[hsl(var(--cream))] group cursor-pointer"
                >
                  {/* Placeholder video thumbnail */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--forest))/20] to-[hsl(var(--forest))/40] flex items-center justify-center">
                    <Film className="h-10 w-10 text-[hsl(var(--forest))/50]" />
                  </div>
                  {/* Video badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">
                    VIDEO
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="h-6 w-6 text-[hsl(var(--forest))] fill-current ml-1" />
                    </div>
                  </div>
                  {item.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                      <span className="text-white text-xs font-medium">{item.title}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-3 text-white hover:bg-white/20 rounded-full transition-colors z-10"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image Lightbox */}
          {lightboxType === 'image' && images.length > 0 && (
            <>
              {/* Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white hover:bg-white/20 rounded-full transition-colors"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white hover:bg-white/20 rounded-full transition-colors"
                  >
                    <ChevronRight className="h-8 w-8" />
                  </button>
                </>
              )}

              {/* Image */}
              <div className="relative w-full h-full max-w-[90vw] max-h-[85vh] m-4">
                <Image
                  src={getDirectImageUrl(images[currentIndex]?.fileUrl || '')}
                  alt=""
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* Footer */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                <span className="text-white text-sm">
                  {currentIndex + 1} / {images.length}
                </span>
                <button
                  onClick={() => downloadImage(
                    images[currentIndex]?.fileUrl || '',
                    `${images[currentIndex]?.title || 'dokumentasi'}-${currentIndex + 1}.jpg`
                  )}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>

              {/* Dots */}
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 flex gap-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Video Lightbox */}
          {lightboxType === 'video' && videos.length > 0 && (
            <>
              {/* Navigation for videos */}
              {videos.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white hover:bg-white/20 rounded-full transition-colors"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white hover:bg-white/20 rounded-full transition-colors"
                  >
                    <ChevronRight className="h-8 w-8" />
                  </button>
                </>
              )}

              {/* Video Player */}
              <div className="relative w-full max-w-[90vw] max-h-[85vh] m-4">
                <video
                  key={videos[currentIndex]?.id} // Force reload on video change
                  src={getVideoUrl(videos[currentIndex]?.fileUrl || '')}
                  controls
                  autoPlay
                  className="max-w-full max-h-[85vh] rounded-lg"
                />
                {videos[currentIndex]?.title && (
                  <p className="text-white text-center mt-4 text-sm">{videos[currentIndex].title}</p>
                )}
              </div>

              {/* Counter */}
              <div className="absolute bottom-4 right-4 text-white text-sm">
                {currentIndex + 1} / {videos.length}
              </div>

              {/* Dots for video navigation */}
              {videos.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {videos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}
