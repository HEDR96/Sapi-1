'use client'

import { useState, useCallback } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { cn } from '@samadya/shared/lib/utils/cn'

export interface Filters {
  search: string
  status: string
  breed: string
  minPrice?: number
  maxPrice?: number
  minWeight?: number
  maxWeight?: number
}

const BREED_OPTIONS = ['Limousin', 'Simental', 'Brahman', 'Angus', 'Lainnya']

interface SearchFilterProps {
  onSearch: (filters: Filters) => void
  initialFilters?: Filters
}

export function SearchFilter({ onSearch, initialFilters }: SearchFilterProps) {
  const [filters, setFilters] = useState<Filters>({
    search: initialFilters?.search || '',
    status: initialFilters?.status || 'ALL',
    breed: initialFilters?.breed || 'ALL',
    minPrice: initialFilters?.minPrice,
    maxPrice: initialFilters?.maxPrice,
    minWeight: initialFilters?.minWeight,
    maxWeight: initialFilters?.maxWeight,
  })
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = useCallback((newFilters: Filters) => {
    setFilters(newFilters)
    onSearch(newFilters)
  }, [onSearch])

  const handleReset = () => {
    const resetFilters: Filters = { search: '', status: 'ALL', breed: 'ALL' }
    setFilters(resetFilters)
    onSearch(resetFilters)
  }

  const hasActiveFilters =
    filters.status !== 'ALL' || filters.breed !== 'ALL' ||
    filters.minPrice !== undefined || filters.maxPrice !== undefined ||
    filters.minWeight !== undefined || filters.maxWeight !== undefined

  return (
    <div className="bg-white rounded-lg border border-[hsl(var(--line))] p-4 md:p-6">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--forest))/50]" />
          <input
            type="text"
            placeholder="Cari nama atau kode sapi..."
            value={filters.search}
            onChange={(e) => handleSearch({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-10 py-2.5 rounded-md border border-[hsl(var(--line))] bg-white text-[11px] text-[hsl(var(--forest))] placeholder:text-[hsl(var(--forest))/50] focus:border-[hsl(var(--forest))] focus:outline-none"
          />
          {filters.search && (
            <button onClick={() => handleSearch({ ...filters, search: '' })} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-[hsl(var(--forest))/50]" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn('flex items-center gap-2 rounded-md border border-[hsl(var(--line))] bg-white px-4 py-2.5 text-[11px] font-medium text-[hsl(var(--forest))] transition-colors hover:bg-[hsl(var(--cream))]', showFilters && 'bg-[hsl(var(--cream))]')}
        >
          <Filter className="h-4 w-4" />
          Filter
          {hasActiveFilters && (
            <span className="ml-1 h-5 w-5 rounded-full bg-[hsl(var(--forest))] text-white text-[10px] flex items-center justify-center font-bold">!</span>
          )}
        </button>
      </div>

      <div className={cn('grid gap-4 mt-4 md:grid-cols-3 lg:grid-cols-6 transition-all', showFilters ? 'block' : 'hidden')}>
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-[hsl(var(--forest))/70]">Status</label>
          <select value={filters.status} onChange={(e) => handleSearch({ ...filters, status: e.target.value })}
            className="w-full rounded-md border border-[hsl(var(--line))] bg-white px-3 py-2 text-[11px] text-[hsl(var(--forest))] focus:border-[hsl(var(--forest))] focus:outline-none">
            <option value="ALL">Semua Status</option>
            <option value="AVAILABLE">Tersedia</option>
            <option value="SOLD">Terjual</option>
            <option value="BOOKED">Dibooking</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-[hsl(var(--forest))/70]">Jenis Sapi</label>
          <select value={filters.breed} onChange={(e) => handleSearch({ ...filters, breed: e.target.value })}
            className="w-full rounded-md border border-[hsl(var(--line))] bg-white px-3 py-2 text-[11px] text-[hsl(var(--forest))] focus:border-[hsl(var(--forest))] focus:outline-none">
            <option value="ALL">Semua Jenis</option>
            {BREED_OPTIONS.map((breed) => <option key={breed} value={breed}>{breed}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-[hsl(var(--forest))/70]">Harga Min (Rp)</label>
          <input type="number" placeholder="Contoh: 10000000" value={filters.minPrice || ''}
            onChange={(e) => handleSearch({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-md border border-[hsl(var(--line))] bg-white px-3 py-2 text-[11px] text-[hsl(var(--forest))] placeholder:text-[hsl(var(--forest))/40] focus:border-[hsl(var(--forest))] focus:outline-none" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-[hsl(var(--forest))/70]">Harga Max (Rp)</label>
          <input type="number" placeholder="Contoh: 50000000" value={filters.maxPrice || ''}
            onChange={(e) => handleSearch({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-md border border-[hsl(var(--line))] bg-white px-3 py-2 text-[11px] text-[hsl(var(--forest))] placeholder:text-[hsl(var(--forest))/40] focus:border-[hsl(var(--forest))] focus:outline-none" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-[hsl(var(--forest))/70]">Bobot Min (Kg)</label>
          <input type="number" placeholder="Contoh: 400" value={filters.minWeight || ''}
            onChange={(e) => handleSearch({ ...filters, minWeight: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-md border border-[hsl(var(--line))] bg-white px-3 py-2 text-[11px] text-[hsl(var(--forest))] placeholder:text-[hsl(var(--forest))/40] focus:border-[hsl(var(--forest))] focus:outline-none" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-[hsl(var(--forest))/70]">Bobot Max (Kg)</label>
          <input type="number" placeholder="Contoh: 600" value={filters.maxWeight || ''}
            onChange={(e) => handleSearch({ ...filters, maxWeight: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-md border border-[hsl(var(--line))] bg-white px-3 py-2 text-[11px] text-[hsl(var(--forest))] placeholder:text-[hsl(var(--forest))/40] focus:border-[hsl(var(--forest))] focus:outline-none" />
        </div>
        {hasActiveFilters && (
          <div className="flex items-end">
            <button onClick={handleReset}
              className="w-full rounded-md border border-[hsl(var(--line))] bg-white px-3 py-2 text-[11px] font-medium text-[hsl(var(--forest))] hover:bg-[hsl(var(--cream))] transition-colors">
              Reset Filter
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
