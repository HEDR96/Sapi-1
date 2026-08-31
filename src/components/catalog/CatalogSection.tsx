'use client'

import { useState, useMemo } from 'react'
import { CatalogSwiper } from './CatalogSwiper'
import { CattleCard } from './CattleCard'
import { CattleWithLatestWeight, CattleWithRelations } from '@/types'
import { LayoutGrid, Columns3 } from 'lucide-react'
import { SearchFilter, Filters } from './SearchFilter'

interface CatalogSectionProps {
  cattle: CattleWithLatestWeight[]
  onSelect: (cattle: CattleWithLatestWeight) => void
  selectedId?: string
}

export function CatalogSection({ cattle, onSelect, selectedId }: CatalogSectionProps) {
  const [viewMode, setViewMode] = useState<'swiper' | 'grid'>('swiper')
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: 'ALL',
    breed: 'ALL',
  })

  const handleSearch = (newFilters: Filters) => {
    setFilters(newFilters)
  }

  const filteredCattle = useMemo(() => {
    return cattle.filter(c => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          c.name.toLowerCase().includes(searchLower) ||
          c.code.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }
      if (filters.status !== 'ALL' && c.status !== filters.status) return false
      if (filters.breed !== 'ALL' && c.breed !== filters.breed) return false
      if (filters.minPrice && Number(c.price) < filters.minPrice) return false
      if (filters.maxPrice && Number(c.price) > filters.maxPrice) return false
      if (filters.minWeight && (!c.lastWeight || c.lastWeight < filters.minWeight)) return false
      if (filters.maxWeight && (!c.lastWeight || c.lastWeight > filters.maxWeight)) return false
      return true
    })
  }, [cattle, filters])

  return (
    <section id="katalog" className="py-6 bg-[hsl(var(--cream2))]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[hsl(var(--forest))]">Katalog Sapi</h2>
            <p className="text-sm text-[hsl(var(--forest))/60]">
              Menampilkan {filteredCattle.length} dari {cattle.length} sapi
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

        {/* Search Filter */}
        <div className="mb-4">
          <SearchFilter onSearch={handleSearch} initialFilters={filters} />
        </div>

        {/* Content */}
        {filteredCattle.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-[hsl(var(--forest))/50]">
            <div className="text-4xl mb-2">🔍</div>
            <p>Tidak ada sapi yang sesuai filter</p>
            <button
              onClick={() => setFilters({ search: '', status: 'ALL', breed: 'ALL' })}
              className="mt-2 text-sm text-[hsl(var(--forest))] hover:underline"
            >
              Reset filter
            </button>
          </div>
        ) : viewMode === 'swiper' ? (
          <CatalogSwiper
            cattle={filteredCattle}
            onSelect={onSelect}
            selectedId={selectedId}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredCattle.map((c) => (
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
