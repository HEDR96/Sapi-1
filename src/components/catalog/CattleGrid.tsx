'use client'

import { useEffect, useState, useCallback } from 'react'
import { CattleCard } from './CattleCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { CattleCardSkeleton } from '@/components/shared/LoadingSkeleton'
import { SearchFilter, Filters } from './SearchFilter'
import { Status, PaginatedResponse, CattleWithRelations } from '@/types'

export function CattleGrid() {
  const [cattle, setCattle] = useState<CattleWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalPages: 1,
    total: 0,
  })
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: 'ALL',
    breed: 'ALL',
  })

  const fetchCattle = useCallback(async (filterParams: Filters, page: number) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', pagination.limit.toString())
      if (filterParams.search) params.set('search', filterParams.search)
      if (filterParams.status !== 'ALL') params.set('status', filterParams.status)
      if (filterParams.breed !== 'ALL') params.set('breed', filterParams.breed)
      if (filterParams.minPrice !== undefined) params.set('minPrice', filterParams.minPrice.toString())
      if (filterParams.maxPrice !== undefined) params.set('maxPrice', filterParams.maxPrice.toString())
      if (filterParams.minWeight !== undefined) params.set('minWeight', filterParams.minWeight.toString())
      if (filterParams.maxWeight !== undefined) params.set('maxWeight', filterParams.maxWeight.toString())

      const res = await fetch(`/api/cattle?${params.toString()}`)
      const data = await res.json()

      // Handle API errors
      if (!res.ok) {
        if (data.issues) {
          const messages = data.issues.map((i: { message: string }) => i.message).join(', ')
          setError(`Gagal memuat data: ${messages}`)
        } else {
          setError(data.error || 'Gagal memuat data sapi')
        }
        setCattle([])
        return
      }

      setCattle(data.items || [])
      setPagination({
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        total: data.total,
      })
    } catch (error) {
      console.error('Failed to fetch cattle:', error)
      setError('Terjadi kesalahan saat memuat data')
    } finally {
      setLoading(false)
    }
  }, [pagination.limit])

  useEffect(() => {
    fetchCattle(filters, pagination.page)
  }, [filters, pagination.page, fetchCattle])

  const handleSearch = (newFilters: Filters) => {
    setFilters(newFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section id="katalog" className="reveal mx-auto max-w-[1500px] px-4 pb-5 sm:px-5 lg:px-8">
      {/* Search & Filter */}
      <div className="mb-4">
        <SearchFilter onSearch={handleSearch} initialFilters={filters} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Results Info */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] text-[hsl(var(--forest))/60]">
          {loading ? 'Memuat...' : `Menampilkan ${cattle.length} dari ${pagination.total} sapi`}
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <CattleCardSkeleton key={i} />
          ))}
        </div>
      ) : cattle.length === 0 ? (
        <EmptyState
          title="Tidak ada sapi ditemukan"
          description="Coba ubah filter atau kata kunci pencarian Anda."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {cattle.map((c) => {
              const item = c as CattleWithRelations & { lastWeight?: number | null; quantity?: number }
              return (
                <CattleCard
                  key={c.id}
                  id={c.id}
                  code={c.code}
                  name={c.name}
                  breed={c.breed}
                  status={c.status}
                  price={Number(c.price)}
                  lastWeight={item.lastWeight || null}
                  mainImage={c.mainImage}
                  quantity={c.quantity || 1}
                />
              )
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="rounded-md border border-[hsl(var(--line))] bg-white px-4 py-2 text-[11px] font-semibold text-[hsl(var(--forest))] disabled:opacity-35 disabled:cursor-not-allowed hover:bg-[hsl(var(--cream))] transition-colors"
              >
                ← Sebelumnya
              </button>
              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                  let pageNum = i + 1
                  if (pagination.totalPages > 5) {
                    if (pagination.page > 3) {
                      pageNum = pagination.page - 2 + i
                    }
                    if (pagination.page > pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i
                    }
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handlePageChange(pageNum)}
                      className={`h-9 w-9 rounded-md text-[11px] font-semibold transition-colors ${
                        pagination.page === pageNum
                          ? 'bg-[hsl(var(--forest))] text-white'
                          : 'border border-[hsl(var(--line))] bg-white text-[hsl(var(--forest))] hover:bg-[hsl(var(--cream))]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="rounded-md border border-[hsl(var(--line))] bg-white px-4 py-2 text-[11px] font-semibold text-[hsl(var(--forest))] disabled:opacity-35 disabled:cursor-not-allowed hover:bg-[hsl(var(--cream))] transition-colors"
              >
                Selanjutnya →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
