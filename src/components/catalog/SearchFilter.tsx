'use client'

import { useState, useCallback } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Status, BREED_OPTIONS } from '@/types'
import { cn } from '@/lib/utils/cn'

interface SearchFilterProps {
  onSearch: (filters: Filters) => void
  initialFilters?: Filters
}

export interface Filters {
  search: string
  status: Status | 'ALL'
  breed: string
}

export function SearchFilter({ onSearch, initialFilters }: SearchFilterProps) {
  const [filters, setFilters] = useState<Filters>({
    search: initialFilters?.search || '',
    status: initialFilters?.status || 'ALL',
    breed: initialFilters?.breed || 'ALL',
  })
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = useCallback(
    (newFilters: Filters) => {
      setFilters(newFilters)
      onSearch(newFilters)
    },
    [onSearch]
  )

  const handleReset = () => {
    const resetFilters = { search: '', status: 'ALL' as const, breed: 'ALL' }
    setFilters(resetFilters)
    onSearch(resetFilters)
  }

  const hasActiveFilters = filters.status !== 'ALL' || filters.breed !== 'ALL'

  return (
    <div className="bg-card rounded-lg border p-4 md:p-6 space-y-4">
      {/* Main Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau kode sapi..."
            value={filters.search}
            onChange={(e) =>
              handleSearch({ ...filters, search: e.target.value })
            }
            className="pl-10"
          />
          {filters.search && (
            <button
              onClick={() => handleSearch({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(showFilters && 'bg-muted')}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
          {hasActiveFilters && (
            <span className="ml-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              !
            </span>
          )}
        </Button>
      </div>

      {/* Extended Filters */}
      <div
        className={cn(
          'grid gap-4 md:grid-cols-4 transition-all',
          showFilters ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 md:hidden'
        )}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              handleSearch({ ...filters, status: value as Status | 'ALL' })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="AVAILABLE">Tersedia</SelectItem>
              <SelectItem value="SOLD">Terjual</SelectItem>
              <SelectItem value="RESERVED">Diboeking</SelectItem>
              <SelectItem value="ARCHIVED">Diarchive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Jenis Sapi</label>
          <Select
            value={filters.breed}
            onValueChange={(value) =>
              handleSearch({ ...filters, breed: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Semua Jenis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Jenis</SelectItem>
              {BREED_OPTIONS.map((breed) => (
                <SelectItem key={breed} value={breed}>
                  {breed}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-end">
            <Button variant="ghost" onClick={handleReset} className="w-full">
              Reset Filter
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
