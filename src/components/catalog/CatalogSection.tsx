'use client'

import { useState, useMemo } from 'react'
import { CatalogSwiper } from './CatalogSwiper'
import { CattleCard } from './CattleCard'
import { CattleWithLatestWeight, CattleWithRelations } from '@/types'
import { LayoutGrid, Columns3, ChevronLeft, ChevronRight } from 'lucide-react'
import { SearchFilter, Filters } from './SearchFilter'

interface CatalogSectionProps {
  cattle: CattleWithLatestWeight[]
  onSelect: (cattle: CattleWithLatestWeight) => void
  selectedId?: string
  allCattle?: CattleWithRelations[]
  onCompareSelect?: (cattle: CattleWithRelations) => void
  comparingIds?: string[]
}

const ITEMS_PER_PAGE = 10

export function CatalogSection({
  cattle,
  onSelect,
  selectedId,
  allCattle = [],
  onCompareSelect,
  comparingIds = []
}: CatalogSectionProps) {
  const [viewMode, setViewMode] = useState<'swiper' | 'grid'>('swiper')
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: 'ALL',
    breed: 'ALL',
  })
  const [currentPage, setCurrentPage] = useState(1)

  const handleSearch = (newFilters: Filters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
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

  // Pagination
  const totalPages = Math.ceil(filteredCattle.length / ITEMS_PER_PAGE)
  const paginatedCattle = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredCattle.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredCattle, currentPage])

  const handleCompare = (cattleItem: CattleWithLatestWeight) => {
    const fullData = allCattle.find(c => c.id === cattleItem.id)
    if (fullData && onCompareSelect) {
      onCompareSelect(fullData)
    }
  }

  return (
    <section id="katalog" className="catalog-section reveal mx-auto max-w-[1400px] px-4 pb-5 sm:px-5 lg:px-8">
      {/* Header */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="font-display text-[26px] font-bold text-[hsl(var(--forest))] lg:text-[28px]">
            Temukan Sapi yang Tepat
          </h3>
          <p className="text-[9px] text-[hsl(var(--forest))/60]">
            Cari, filter, booking, lalu pantau perkembangan sapi secara transparan.
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
      <div className="catalog-filter-panel mb-3 rounded-xl border border-[hsl(var(--line))] bg-white p-3 shadow-sm">
        <SearchFilter onSearch={handleSearch} initialFilters={filters} />
      </div>

      {/* Results Info */}
      <div className="mb-2 flex items-center justify-between text-[9px] text-[hsl(var(--forest))/60]">
        <span>
          {viewMode === 'grid' && totalPages > 1
            ? `${paginatedCattle.length} dari ${filteredCattle.length} sapi (halaman ${currentPage}/${totalPages})`
            : `${filteredCattle.length} sapi ditemukan`}
        </span>
        <span>Maks. bandingkan 3 sapi</span>
      </div>

      {/* Content */}
      {filteredCattle.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--line))] bg-white px-4 py-8 text-center">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-[11px] font-bold text-[hsl(var(--forest))]">Sapi tidak ditemukan</p>
          <p className="mt-1 text-[9px] text-[hsl(var(--forest))/55]">
            Coba ubah filter atau kata pencarian.
          </p>
        </div>
      ) : viewMode === 'swiper' ? (
        <CatalogSwiper
          cattle={filteredCattle}
          onSelect={onSelect}
          selectedId={selectedId}
          allCattle={allCattle}
          onCompareSelect={onCompareSelect}
          comparingIds={comparingIds}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {paginatedCattle.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelect(c)}
                className={`cursor-pointer rounded-xl transition-all ${
                  selectedId === c.id
                    ? 'border-2 border-[hsl(var(--forest))] ring-2 ring-[hsl(var(--forest))] ring-offset-2'
                    : ''
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
                  isSelected={selectedId === c.id}
                  isComparing={comparingIds.includes(c.id)}
                  onCompare={() => handleCompare(c)}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="pager-btn rounded border border-[hsl(var(--line))] bg-white px-2.5 py-1.5 text-[9px] font-semibold text-[hsl(var(--forest))] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-3 w-3 inline" />
              </button>
              <span className="min-w-[54px] text-center text-[9px] font-semibold text-[hsl(var(--forest))/60]">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="pager-btn rounded border border-[hsl(var(--line))] bg-white px-2.5 py-1.5 text-[9px] font-semibold text-[hsl(var(--forest))] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-3 w-3 inline" />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
