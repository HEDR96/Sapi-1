'use client'

import { useEffect, useState } from 'react'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import { CattleCard } from '@/components/catalog/CattleCard'
import { CattleWithRelations } from '@/types'
import { Search, SlidersHorizontal, Grid3X3, LayoutGrid } from 'lucide-react'

export default function KatalogPage() {
  const [cattle, setCattle] = useState<CattleWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedBreed, setSelectedBreed] = useState<string>('all')

  useEffect(() => {
    fetchCattle()
  }, [])

  const fetchCattle = async () => {
    try {
      const res = await fetch('/api/admin/cattle?limit=100')
      const data = await res.json()
      const items = Array.isArray(data) ? data : data.items || data.data?.items || []
      setCattle(items)
    } catch (err) {
      console.error('Failed to fetch cattle:', err)
    } finally {
      setLoading(false)
    }
  }

  // Get unique breeds for filter
  const breeds = ['all', ...new Set(cattle.map(c => c.breed).filter(Boolean))]
  const statuses = [
    { value: 'all', label: 'Semua' },
    { value: 'AVAILABLE', label: 'Tersedia' },
    { value: 'BOOKED', label: 'Dipesan' },
    { value: 'SOLD', label: 'Terjual' },
  ]

  // Filter cattle
  const filteredCattle = cattle.filter(c => {
    const matchesSearch = searchQuery === '' ||
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.breed?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus
    const matchesBreed = selectedBreed === 'all' || c.breed === selectedBreed

    return matchesSearch && matchesStatus && matchesBreed
  })

  return (
    <div className="min-h-screen bg-[hsl(var(--cream2))]">
      {/* Header */}
      <div className="bg-[hsl(var(--forest))] text-white">
        <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[{ label: 'Beranda', href: '/' }, { label: 'Katalog' }]}
            lightMode
          />
          <h1 className="mt-4 text-2xl sm:text-3xl font-bold">Katalog Sapi</h1>
          <p className="mt-2 text-white/70">
            Temukan sapi terbaik untuk kebutuhan Anda
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-6 rounded-lg border border-[hsl(var(--line))] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--forest))/50]" />
              <input
                type="text"
                placeholder="Cari nama, kode, atau jenis sapi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-[hsl(var(--line))] py-2 pl-10 pr-4 text-sm focus:border-[hsl(var(--forest))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--forest))/20]"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-lg border border-[hsl(var(--line))] px-3 py-2 text-sm focus:border-[hsl(var(--forest))] focus:outline-none"
              >
                {statuses.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>

              {/* Breed Filter */}
              <select
                value={selectedBreed}
                onChange={(e) => setSelectedBreed(e.target.value)}
                className="rounded-lg border border-[hsl(var(--line))] px-3 py-2 text-sm focus:border-[hsl(var(--forest))] focus:outline-none"
              >
                <option value="all">Semua Jenis</option>
                {breeds.filter(b => b !== 'all').map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>

              {/* View Toggle */}
              <div className="flex rounded-lg border border-[hsl(var(--line))]">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-[hsl(var(--forest))] text-white' : 'text-[hsl(var(--forest))/70]'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-[hsl(var(--forest))] text-white' : 'text-[hsl(var(--forest))/70]'}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-[hsl(var(--forest))/70]">
            Menampilkan <strong>{filteredCattle.length}</strong> dari {cattle.length} sapi
          </p>
        </div>

        {/* Cattle Grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="animate-pulse rounded-lg border border-[hsl(var(--line))] bg-white p-4">
                <div className="aspect-[4/3] rounded-lg bg-[hsl(var(--cream))]" />
                <div className="mt-4 h-4 w-24 rounded bg-[hsl(var(--cream))]" />
                <div className="mt-2 h-3 w-16 rounded bg-[hsl(var(--cream))]" />
              </div>
            ))}
          </div>
        ) : filteredCattle.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[hsl(var(--line))] bg-white py-16 text-center">
            <img src="/images/cow-seeklogo.png" alt="Sapi" className="w-20 h-20 mb-4 opacity-30" />
            <h3 className="text-lg font-semibold text-[hsl(var(--forest))]">Sapi tidak ditemukan</h3>
            <p className="mt-2 text-sm text-[hsl(var(--forest))/60]">
              Coba ubah filter atau kata pencarian
            </p>
          </div>
        ) : (
          <div className={`grid gap-4 ${
            viewMode === 'grid'
              ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {filteredCattle.map(c => (
              <CattleCard
                key={c.id}
                id={c.id}
                code={c.code}
                name={c.name}
                breed={c.breed}
                status={c.status}
                price={Number(c.price)}
                lastWeight={c.weights?.[c.weights.length - 1]?.weight || null}
                mainImage={c.mainImage}
                quantity={c.quantity}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
