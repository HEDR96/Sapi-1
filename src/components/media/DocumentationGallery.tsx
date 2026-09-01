'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play, X } from 'lucide-react'
import { CattleMedia } from '@/types'
import { cn } from '@/lib/utils/cn'
import { getDirectImageUrl } from '@/lib/utils/imageUrl'

interface DocumentationGalleryProps {
  media: CattleMedia[]
}

export function DocumentationGallery({ media }: DocumentationGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const imageMedia = media.filter((m) => m.fileType === 'IMAGE')
  const videoMedia = media.filter((m) => m.fileType === 'VIDEO')

  if (imageMedia.length === 0 && videoMedia.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Belum ada dokumentasi.
      </div>
    )
  }

  const allMedia = [...imageMedia, ...videoMedia]

  const closeLightbox = () => setSelectedIndex(null)

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {imageMedia.map((item, index) => (
          <button
            key={item.id}
            onClick={() => setSelectedIndex(index)}
            className="relative aspect-square overflow-hidden rounded-lg border bg-muted group"
          >
            <Image
              src={getDirectImageUrl(item.fileUrl)}
              alt={item.title || 'Documentation'}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </button>
        ))}

        {videoMedia.map((item, index) => (
          <button
            key={item.id}
            onClick={() => setSelectedIndex(imageMedia.length + index)}
            className="relative aspect-square overflow-hidden rounded-lg border bg-muted group"
          >
            <Image
              src={getDirectImageUrl(item.fileUrl)}
              alt={item.title || 'Video thumbnail'}
              fill
              className="object-cover opacity-70"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-black/50 p-3">
                <Play className="h-6 w-6 text-white fill-white" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 z-10"
          >
            <X className="h-6 w-6" />
          </button>

          {allMedia[selectedIndex]?.fileType === 'VIDEO' ? (
            <video
              src={getDirectImageUrl(allMedia[selectedIndex]?.fileUrl || '')}
              controls
              className="max-h-[80vh] max-w-[80vw]"
            />
          ) : (
            <div className="relative h-[80vh] w-[80vw]">
              <Image
                src={getDirectImageUrl(allMedia[selectedIndex]?.fileUrl || '')}
                alt="Full size image"
                fill
                className="object-contain"
                sizes="80vw"
              />
            </div>
          )}
        </div>
      )}
    </>
  )
}
