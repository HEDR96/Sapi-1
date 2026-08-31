'use client'

import { useState } from 'react'
import { CatalogSwiper } from './CatalogSwiper'
import { CattleCard } from './CattleCard'
import { CattleWithLatestWeight, CattleWithRelations } from '@/types'
import { LayoutGrid, Columns3 } from 'lucide-react'

interface CatalogSectionProps {
  cattle: CattleWithLatestWeight[]
  onSelect: (cattle: CattleWithLatestWeight) => void
  selectedId?: string
}

export function CatalogSection({ cattle, onSelect, selectedId }: CatalogSectionProps) {
  const [viewMode, setViewMode] = useState<'swiper' | 'grid'>('swiper')

  return (
    <section id="katalog" className="py-6 bg-[hsl(var(--cream2))]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[hsl(var(--forest))]">Katalog Sapi</h2>
            <p className="text-sm text-[hsl(var(--forest))/60]">
              {viewMode === 'swiper'
                ? 'Geser untuk melihat sapi lainnya'
                : `Menampilkan ${cattle.length} sapi`}
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-[hsl(var(--line))] bg-white p-1">
            <button
              onClick={() => setViewMode('swiper')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'swiper'
                  ? 'bg-[hsl(var(--forest))] text-white'
                  : 'text-[hsl(var(--forest))/60] hover:bg-[hsl(var(--cream))]'
              }`}
            >
              <Columns3 className="h-4 w-4" />
              <span className="hidden sm:inline">Swiper</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[hsl(var(--forest))] text-white'
                  : 'text-[hsl(var(--forest))/60] hover:bg-[hsl(var(--cream))]'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {cattle.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-[hsl(var(--forest))/50]">
            Belum ada sapi tersedia
          </div>
        ) : viewMode === 'swiper' ? (
          <CatalogSwiper
            cattle={cattle}
            onSelect={onSelect}
            selectedId={selectedId}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {cattle.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelect(c)}
                className={`cursor-pointer rounded-xl border-2 transition-all ${
                  selectedId === c.id
                    ? 'border-[hsl(var(--forest))] ring-2 ring-[hsl(var(--forest))] ring-offset-2'
                    : 'border-transparent hover:border-[hsl(var(--line))]'
                }`}
              >
                <CattleCard
                  id={c.id}
                  code={c.code}
                  name={c.name}
                  breed={c.breed}
                  status={c.status}
                  price={Number(c.price)}
                  lastWeight={c.lastWeight}
                  mainImage={c.mainImage}
                  quantity={c.quantity}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
