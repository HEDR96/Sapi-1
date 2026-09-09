'use client'

import { useRef, useEffect, useState } from 'react'
import { CatalogSwiperCard } from './CatalogSwiperCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CattleWithLatestWeight, CattleWithRelations } from '@samadya/shared/types'
import { calculateWeightStats, estimateTargetCompletion } from '@samadya/shared/lib/utils/calculations'

interface CatalogSwiperProps {
  cattle: CattleWithLatestWeight[]
  onSelect: (cattle: CattleWithLatestWeight) => void
  selectedId?: string
  allCattle?: CattleWithRelations[]
  onCompareSelect?: (cattle: CattleWithRelations) => void
  comparingIds?: string[]
}

export function CatalogSwiper({
  cattle,
  onSelect,
  selectedId,
  allCattle = [],
  onCompareSelect,
  comparingIds = []
}: CatalogSwiperProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setShowLeftArrow(scrollLeft > 0)
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll)
      window.addEventListener('resize', checkScroll)
      return () => {
        el.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', checkScroll)
      }
    }
  }, [cattle])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = 320
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  const handleCompare = (cattleItem: CattleWithLatestWeight) => {
    const fullData = allCattle.find(c => c.id === cattleItem.id)
    if (fullData && onCompareSelect) {
      onCompareSelect(fullData)
    }
  }

  if (!cattle || cattle.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-[hsl(var(--forest))/50]">
        Belum ada sapi tersedia
      </div>
    )
  }

  return (
    <div className="relative group">
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors hidden sm:flex"
        >
          <ChevronLeft className="h-5 w-5 text-[hsl(var(--forest))]" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth scroll-snap-x-mandatory pb-4 px-4 sm:px-12
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
      >
        {cattle.map((c) => {
          const fullData = allCattle.find((x) => x.id === c.id)
          const weightStats = calculateWeightStats(fullData?.weights || [])
          const targetEstimation = fullData?.targetWeight && weightStats.lastWeight
            ? estimateTargetCompletion(fullData.targetWeight, weightStats.lastWeight, weightStats.adg)
            : null
          return (
          <CatalogSwiperCard
            key={c.id}
            id={c.id}
            code={c.code}
            name={c.name}
            breed={c.breed}
            status={c.status}
            price={Number(c.price)}
            lastWeight={c.lastWeight}
            mainImage={c.mainImage}
            quantity={c.quantity}
            adg={weightStats.adg}
            progressPercentage={targetEstimation?.progressPercentage ?? null}
            isSelected={selectedId === c.id}
            isComparing={comparingIds.includes(c.id)}
            onClick={() => onSelect(c)}
            onCompare={() => handleCompare(c)}
          />
          )
        })}
      </div>

      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors hidden sm:flex"
        >
          <ChevronRight className="h-5 w-5 text-[hsl(var(--forest))]" />
        </button>
      )}

      <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-[hsl(var(--cream2))] to-transparent pointer-events-none hidden sm:block" />
      <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-[hsl(var(--cream2))] to-transparent pointer-events-none hidden sm:block" />
    </div>
  )
}
