'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { CattleMedia } from '@/types'

interface CattleGalleryProps {
  mainImage: string | null
  media: CattleMedia[]
}

export function CattleGallery({ mainImage, media }: CattleGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const allImages = [
    mainImage,
    ...media
      .filter((m) => m.fileType === 'IMAGE')
      .map((m) => m.fileUrl),
  ].filter(Boolean) as string[]

  if (allImages.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
        <span className="text-muted-foreground">Tidak ada foto</span>
      </div>
    )
  }

  const openLightbox = (index: number) => setSelectedIndex(index)
  const closeLightbox = () => setSelectedIndex(null)

  const goNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % allImages.length)
    }
  }

  const goPrev = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + allImages.length) % allImages.length)
    }
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div
          className="relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-muted"
          onClick={() => openLightbox(0)}
        >
          <Image
            src={allImages[0]}
            alt="Cattle main image"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        {/* Thumbnails */}
        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {allImages.slice(1).map((image, index) => (
              <button
                key={index}
                onClick={() => openLightbox(index + 1)}
                className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 border-transparent hover:border-primary transition-colors"
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            onClick={goPrev}
            className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div className="relative h-[80vh] w-[80vw]">
            <Image
              src={allImages[selectedIndex]}
              alt="Full size image"
              fill
              className="object-contain"
              sizes="80vw"
            />
          </div>

          <button
            onClick={goNext}
            className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-4 text-white text-sm">
            {selectedIndex + 1} / {allImages.length}
          </div>
        </div>
      )}
    </>
  )
}
