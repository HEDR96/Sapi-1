'use client'

import { useEffect, useState, useCallback } from 'react'
import { CattleCard } from './CattleCard'
import { SearchFilter, Filters } from './SearchFilter'
import { EmptyState } from '@/components/shared/EmptyState'
import { CattleCardSkeleton } from '@/components/shared/LoadingSkeleton'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { Status, PaginatedResponse, CattleWithRelations } from '@/types'

export function CattleGrid() {
  const [cattle, setCattle] = useState<CattleWithRelations[]>([])
  const [loading, setLoading] = useState(true)
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
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', pagination.limit.toString())
      if (filterParams.search) params.set('search', filterParams.search)
      if (filterParams.status !== 'ALL') params.set('status', filterParams.status)
      if (filterParams.breed !== 'ALL') params.set('breed', filterParams.breed)

      const res = await fetch(`/api/cattle?${params.toString()}`)
      const data: PaginatedResponse<CattleWithRelations> = await res.json()

      setCattle(data.items)
      setPagination({
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        total: data.total,
      })
    } catch (error) {
      console.error('Failed to fetch cattle:', error)
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
    <section id="catalog" className="py-12">
      <div className="container">
        <SearchFilter onSearch={handleSearch} initialFilters={filters} />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {[...Array(8)].map((_, i) => (
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
            <p className="text-sm text-muted-foreground mt-6 mb-4">
              Menampilkan {cattle.length} dari {pagination.total} sapi
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cattle.map((c) => {
                const item = c as CattleWithRelations & { lastWeight?: number | null }
                return (
                  <CattleCard
                    key={c.id}
                    code={c.code}
                    name={c.name}
                    breed={c.breed}
                    status={c.status}
                    price={Number(c.price)}
                    lastWeight={item.lastWeight || null}
                    mainImage={c.mainImage}
                  />
                )
              })}
            </div>

            {pagination.totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                    >
                      Previous
                    </button>
                  </PaginationItem>
                  {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                    const page = i + 1
                    return (
                      <PaginationItem key={page}>
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`flex h-10 w-10 items-center justify-center rounded-md border border-input text-sm font-medium ring-offset-background transition-colors ${
                            pagination.page === page
                              ? 'bg-background text-foreground'
                              : 'hover:bg-accent hover:text-accent-foreground'
                          }`}
                        >
                          {page}
                        </button>
                      </PaginationItem>
                    )
                  })}
                  <PaginationItem>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                    >
                      Next
                    </button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </section>
  )
}
