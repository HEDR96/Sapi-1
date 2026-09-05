'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Search, RefreshCw } from 'lucide-react'
import { Button } from '@samadya/shared/components/ui/button'
import { Input } from '@samadya/shared/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@samadya/shared/components/ui/table'
import { CattleStatusBadge as StatusBadge } from '@samadya/shared/components/ui/CattleStatusBadge'
import { EmptyState } from '@samadya/shared/components/EmptyState'
import { formatCurrency, formatDate } from '@samadya/shared/lib/utils/formatters'
import { getDirectImageUrl } from '@samadya/shared/lib/utils/imageUrl'

interface CattleWithRelations {
  id: string
  code: string
  name: string
  breed: string
  status: string
  price: number
  buyPrice: number | null
  sellPrice: number | null
  mainImage: string | null
  quantity: number
  createdAt: string
  lastWeight?: number | null
}

export default function AdminCattlePage() {
  const [cattle, setCattle] = useState<CattleWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchCattle = async () => {
    try {
      setError(null)
      const res = await fetch('/api/admin/cattle')
      const data = await res.json()
      console.log('[Cattle Page] API Response:', data)

      if (!res.ok) {
        setError(data.error || data.details || 'Failed to fetch cattle')
        return
      }

      let items = data.items || data.data?.items || []
      console.log(`[Cattle Page] Found ${items.length} cattle`)

      if (search) {
        const searchLower = search.toLowerCase()
        items = items.filter(
          (c: CattleWithRelations) =>
            c.name.toLowerCase().includes(searchLower) ||
            c.code.toLowerCase().includes(searchLower) ||
            c.breed.toLowerCase().includes(searchLower)
        )
      }

      setCattle(items)
    } catch (error: any) {
      console.error('Failed to fetch cattle:', error)
      setError(error.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCattle()
  }, [])

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Hapus sapi ${code}?`)) return

    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/cattle/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setCattle((prev) => prev.filter((c) => c.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete:', error)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manajemen Sapi</h2>
          <p className="text-muted-foreground">Kelola semua sapi dalam katalog</p>
        </div>
        <Link href="/admin/cattle/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Sapi
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau kode sapi..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon" onClick={fetchCattle} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : cattle.length === 0 ? (
        <EmptyState
          title="Belum ada sapi"
          description="Tambahkan sapi pertama ke katalog"
          action={{
            label: 'Tambah Sapi',
            onClick: () => (window.location.href = '/admin/cattle/new'),
          }}
        />
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Foto</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bobot</TableHead>
                <TableHead className="text-right">Harga Beli</TableHead>
                <TableHead className="text-right">Harga Jual</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cattle.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div
                      className="w-12 h-12 rounded-lg bg-cover bg-center"
                      style={{
                        backgroundImage: c.mainImage
                          ? `url(${getDirectImageUrl(c.mainImage)})`
                          : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-mono font-medium">{c.code}</TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.breed}</TableCell>
                  <TableCell>
                    <StatusBadge status={c.status as any} />
                  </TableCell>
                  <TableCell>{c.lastWeight ? `${c.lastWeight} Kg` : '-'}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {c.buyPrice ? formatCurrency(c.buyPrice) : '-'}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(Number(c.price))}
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    {c.buyPrice ? formatCurrency(Number(c.price) - c.buyPrice) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/cattle/${c.id}`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(c.id, c.code)}
                        disabled={deleting === c.id}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
