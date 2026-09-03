'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
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
import { CattleWithRelations } from '@samadya/shared/types'

export default function AdminCattlePage() {
  const [cattle, setCattle] = useState<CattleWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchCattle = async () => {
    try {
      // Use admin API which returns all cattle without pagination limit
      const res = await fetch('/api/admin/cattle')
      const data = await res.json()
      let items = data.items || []

      // Filter by search if provided
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
    } catch (error) {
      console.error('Failed to fetch cattle:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCattle()
  }, [search])

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
          <h2 className="text-2xl font-bold">Data Sapi</h2>
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
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama atau kode sapi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

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
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cattle.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.code}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.breed}</TableCell>
                  <TableCell>
                    <StatusBadge status={c.status} />
                  </TableCell>
                  <TableCell>{formatCurrency(Number(c.price))}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(c.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/cattle/${c.id}`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/sapi/${c.code}`} target="_blank">
                        <Button variant="ghost" size="sm">
                          View
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
