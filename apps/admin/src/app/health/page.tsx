'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@samadya/shared/components/ui/button'
import { Input } from '@samadya/shared/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@samadya/shared/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@samadya/shared/components/ui/select'
import { CattleSelect } from '@/components/admin/CattleSelect'
import { Pagination } from '@samadya/shared/components/ui/pagination'
import { formatDate } from '@samadya/shared/lib/utils/formatters'
import { HEALTH_STATUS_LABELS, HealthStatus } from '@samadya/shared/types'

interface HealthRecord {
  id: string
  cattleId: string
  recordDate: string
  healthType: string
  status: HealthStatus
  notes: string | null
  cattle: { id: string; code: string; name: string }
}

export default function HealthPage() {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCattle, setSelectedCattle] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ date: '', healthType: '', status: 'SEHAT' as HealthStatus, notes: '' })
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => { fetchRecords() }, [selectedCattle, page])

  const fetchRecords = async () => {
    setLoading(true)
    const url = selectedCattle
      ? `/api/admin/health?cattleId=${selectedCattle}&page=${page}&limit=20`
      : `/api/admin/health?page=${page}&limit=20`
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
    if (!selectedCattle || !form.date || !form.healthType) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cattleId: selectedCattle, ...form }),
      })
      if (res.ok) {
        setForm({ date: '', healthType: '', status: 'SEHAT', notes: '' })
        setShowForm(false)
        fetchRecords()
      }
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus data ini?')) return
    await fetch(`/api/admin/health?id=${id}`, { method: 'DELETE' })
    fetchRecords()
  }

  const statusColors: Record<HealthStatus, string> = {
    SEHAT: 'bg-green-100 text-green-700',
    DALAM_PERAWATAN: 'bg-yellow-100 text-yellow-700',
    OBSERVASI: 'bg-orange-100 text-orange-700',
    SAKIT: 'bg-red-100 text-red-700',
    SEMBUH: 'bg-blue-100 text-blue-700',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Riwayat Kesehatan</h1>
          <p className="text-muted-foreground">Kelola data kesehatan sapi</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" />Tambah Data</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Tambah Record Kesehatan</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <CattleSelect value={selectedCattle} onChange={setSelectedCattle} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tanggal *</label>
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium">Jenis Pemeriksaan *</label>
                  <Input value={form.healthType} onChange={(e) => setForm({ ...form, healthType: e.target.value })} placeholder="Pemeriksaan rutin" required />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Status Kesehatan</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as HealthStatus })}
                  className="w-full rounded-lg border border-[hsl(var(--line))] bg-white px-3 py-2"
                >
                  {Object.entries(HEALTH_STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
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
        <CardHeader><CardTitle>Daftar Record Kesehatan</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-center py-8 text-muted-foreground">Memuat...</p>
          : records.length === 0 ? <p className="text-center py-8 text-muted-foreground">Belum ada data</p>
          : (
            <div className="space-y-2">
              {records.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{r.cattle.name} ({r.cattle.code})</p>
                    <p className="text-sm text-muted-foreground">{formatDate(r.recordDate)} - {r.healthType}</p>
                    {r.notes && <p className="text-xs text-muted-foreground mt-1">{r.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                      {HEALTH_STATUS_LABELS[r.status]}
                    </span>
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
