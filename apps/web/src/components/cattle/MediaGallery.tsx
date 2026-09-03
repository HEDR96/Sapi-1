'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Play } from 'lucide-react'
import { CattleMedia } from '@samadya/shared/types'
import { getDirectImageUrl, getVideoUrl } from '@samadya/shared/lib/utils/imageUrl'

interface MediaGalleryProps {
  media: CattleMedia[]
}

export function MediaGallery({ media }: MediaGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!media || media.length === 0) {
    return (
      <div className="text-center py-8 text-[hsl(var(--forest))/50]">
        <img src="/images/9448047941553668332.svg" alt="Sapi" className="w-14 h-14 mx-auto mb-2 opacity-50" />
        <p>Belum ada dokumentasi</p>
      </div>
    )
  }

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {media.map((item, index) => (
          <button
            key={item.id}
            onClick={() => openLightbox(index)}
            className="relative aspect-square rounded-lg overflow-hidden group"
          >
            <Image src={getDirectImageUrl(item.fileUrl)} alt={item.title || 'Media'} fill className="object-cover" />
            {item.fileType.toUpperCase() === 'VIDEO' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Play className="h-10 w-10 text-white" fill="white" />
              </div>
            )}
            {item.title && (
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                <span className="text-white text-xs">{item.title}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full"
          >
            <X className="h-6 w-6" />
          </button>

          {media[currentIndex].fileType.toUpperCase() === 'VIDEO' ? (
            <video
              src={getVideoUrl(media[currentIndex].fileUrl)}
              controls
              className="max-w-[90vw] max-h-[80vh]"
            />
          ) : (
            <div className="relative w-[80vw] h-[80vh]">
              <Image
                src={getDirectImageUrl(media[currentIndex].fileUrl)}
                alt=""
                fill
                className="object-contain"
              />
            </div>
          )}
        </div>
      )}
    </>
  )
}
