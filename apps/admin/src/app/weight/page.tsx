'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, TrendingUp } from 'lucide-react'
import { Button } from '@samadya/shared/components/ui/button'
import { Input } from '@samadya/shared/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@samadya/shared/components/ui/card'
import { CattleSelect } from '@/components/admin/CattleSelect'
import { Pagination } from '@samadya/shared/components/ui/pagination'
import { formatDate, formatWeight } from '@samadya/shared/lib/utils/formatters'

interface WeightRecord {
  id: string
  cattleId: string
  weight: number
  measurementDate: string
  notes: string | null
  cattle: { id: string; code: string; name: string }
}

export default function WeightPage() {
  const [records, setRecords] = useState<WeightRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCattle, setSelectedCattle] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ weight: '', date: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchRecords()
  }, [selectedCattle, page])

  const fetchRecords = async () => {
    setLoading(true)
    const url = selectedCattle
      ? `/api/admin/weights?cattleId=${selectedCattle}&page=${page}&limit=20`
      : `/api/admin/weights?page=${page}&limit=20`
    const res = await fetch(url)
    const data = await res.json()
    setRecords(data.weights || [])
    if (data.pagination) {
      setTotalPages(data.pagination.totalPages)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCattle || !form.weight || !form.date) return

    setSaving(true)
    try {
      const res = await fetch('/api/admin/weights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cattleId: selectedCattle,
          weight: form.weight,
          measurementDate: form.date,
          notes: form.notes || null,
        }),
      })

      if (res.ok) {
        setForm({ weight: '', date: '', notes: '' })
        setShowForm(false)
        fetchRecords()
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus data ini?')) return
    await fetch(`/api/admin/weights?id=${id}`, { method: 'DELETE' })
    fetchRecords()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Riwayat Penimbangan</h1>
          <p className="text-muted-foreground">Kelola data penimbangan sapi</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Data
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Tambah Penimbangan</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <CattleSelect
                value={selectedCattle}
                onChange={setSelectedCattle}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Berat (kg) *</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    placeholder="450"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tanggal *</label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Catatan</label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Catatan tambahan..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving || !selectedCattle}>
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Records */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Penimbangan</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Memuat...</p>
          ) : records.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Belum ada data</p>
          ) : (
            <div className="space-y-2">
              {records.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{r.cattle.name} ({r.cattle.code})</p>
                    <p className="text-sm text-muted-foreground">{formatDate(r.measurementDate)}</p>
                    {r.notes && <p className="text-xs text-muted-foreground mt-1">{r.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatWeight(r.weight)}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
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
