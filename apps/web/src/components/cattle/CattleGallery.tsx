'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { getDirectImageUrl, isVideoUrl } from '@samadya/shared/lib/utils/imageUrl'

interface CattleGalleryProps {
  images: string[]
  videos?: string[]
}

export function CattleGallery({ images, videos = [] }: CattleGalleryProps) {
  const [selected, setSelected] = useState<number | null>(null)

  const allItems = [
    ...(videos || []).map(v => ({ type: 'video' as const, url: v })),
    ...(images || []).map(i => ({ type: 'image' as const, url: i })),
  ]

  if (allItems.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-[hsl(var(--line))] bg-[hsl(var(--cream))]">
        <span className="text-[11px] text-[hsl(var(--forest))/50]">Tidak ada media</span>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-2">
        {allItems.slice(0, 8).map((item, index) => (
          <button
            key={index}
            onClick={() => setSelected(index)}
            className="relative aspect-square overflow-hidden rounded-lg border border-[hsl(var(--line))] bg-[hsl(var(--cream))] group"
          >
            {item.type === 'video' ? (
              <div className="flex h-full items-center justify-center">
                <Play className="h-6 w-6 text-[hsl(var(--forest))/50]" />
              </div>
            ) : (
              <Image src={getDirectImageUrl(item.url)} alt="" fill className="object-cover" sizes="100px" />
            )}
            {index === 7 && allItems.length > 8 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="text-white font-bold text-lg">+{allItems.length - 8}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {selected !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={() => setSelected(null)}>
          <button onClick={() => setSelected(null)} className="absolute right-4 top-4 text-white"><X className="h-6 w-6" /></button>
          {selected > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setSelected(selected - 1) }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white">
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}
          {selected < allItems.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setSelected(selected + 1) }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white">
              <ChevronRight className="h-8 w-8" />
            </button>
          )}
          <div onClick={(e) => e.stopPropagation()} className="relative max-h-[85vh] max-w-[85vw]">
            {allItems[selected].type === 'video' ? (
              <video src={allItems[selected].url} controls className="max-h-[85vh] max-w-[85vw] rounded-lg" />
            ) : (
              <Image src={getDirectImageUrl(allItems[selected].url)} alt="" width={900} height={675} className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain" />
            )}
          </div>
          <div className="absolute bottom-4 text-white text-[11px]">{selected + 1} / {allItems.length}</div>
        </div>
      )}
    </>
  )
}
