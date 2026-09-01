'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CattleSelect } from '@/components/admin/CattleSelect'
import { Pagination } from '@/components/ui/pagination'
import { formatDate } from '@/lib/utils/formatters'

interface FeedRecord {
  id: string
  cattleId: string
  recordDate: string
  feedType: string
  amount: string
  frequency: string
  notes: string | null
  cattle: { id: string; code: string; name: string }
}

export default function FeedPage() {
  const [records, setRecords] = useState<FeedRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCattle, setSelectedCattle] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ date: '', feedType: '', amount: '', frequency: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => { fetchRecords() }, [selectedCattle, page])

  const fetchRecords = async () => {
    setLoading(true)
    const url = selectedCattle
      ? `/api/admin/feed?cattleId=${selectedCattle}&page=${page}&limit=20`
      : `/api/admin/feed?page=${page}&limit=20`
    const res = await fetch(url)
    const data = await res.json()
    setRecords(data.records || [])
    if (data.pagination) {
      setTotalPages(data.pagination.totalPages)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCattle || !form.date || !form.feedType) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cattleId: selectedCattle, ...form }),
      })
      if (res.ok) {
        setForm({ date: '', feedType: '', amount: '', frequency: '', notes: '' })
        setShowForm(false)
        fetchRecords()
      }
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus data ini?')) return
    await fetch(`/api/admin/feed?id=${id}`, { method: 'DELETE' })
    fetchRecords()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Riwayat Pakan</h1>
          <p className="text-muted-foreground">Kelola data pakan sapi</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" />Tambah Data</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Tambah Record Pakan</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <CattleSelect value={selectedCattle} onChange={setSelectedCattle} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tanggal *</label>
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium">Jenis Pakan *</label>
                  <Input value={form.feedType} onChange={(e) => setForm({ ...form, feedType: e.target.value })} placeholder="Rumput, Konsentrat..." required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Jumlah</label>
                  <Input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="10 kg" />
                </div>
                <div>
                  <label className="text-sm font-medium">Frekuensi</label>
                  <Input value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} placeholder="2x sehari" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Catatan</label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Catatan..." />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving || !selectedCattle}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Daftar Record Pakan</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-center py-8 text-muted-foreground">Memuat...</p>
          : records.length === 0 ? <p className="text-center py-8 text-muted-foreground">Belum ada data</p>
          : (
            <div className="space-y-2">
              {records.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{r.cattle.name} ({r.cattle.code})</p>
                    <p className="text-sm text-muted-foreground">{formatDate(r.recordDate)} - {r.feedType}</p>
                    <p className="text-xs text-muted-foreground">{r.amount} - {r.frequency}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
