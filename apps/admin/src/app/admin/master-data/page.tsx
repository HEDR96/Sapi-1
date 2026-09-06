'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Search, Loader2, X } from 'lucide-react'
import { Button } from '@samadya/shared/components/ui/button'
import { Input } from '@samadya/shared/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@samadya/shared/components/ui/card'
import { Label } from '@samadya/shared/components/ui/label'

interface MasterData {
  id: string
  category: string
  key: string
  value: string
  isActive: boolean
  order: number
}

const CATEGORIES = [
  { value: 'JENIS_SAPI', label: 'Jenis Sapi' },
  { value: 'JENIS_PAKAN', label: 'Jenis Pakan' },
  { value: 'JENIS_KESEHATAN', label: 'Jenis Kesehatan' },
  { value: 'STATUS_SAPI', label: 'Status Sapi' },
  { value: 'STATUS_KESEHATAN', label: 'Status Kesehatan' },
]

export default function MasterDataPage() {
  const [items, setItems] = useState<MasterData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MasterData | null>(null)
  const [form, setForm] = useState({ category: 'JENIS_SAPI', key: '', value: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [categoryFilter])

  const fetchData = async () => {
    try {
      setLoading(true)
      const url = categoryFilter ? `/api/admin/master-data?category=${categoryFilter}` : '/api/admin/master-data'
      const res = await fetch(url)
      const data = await res.json()
      setItems(data.items || [])
    } catch (error) {
      console.error('Failed to fetch master data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form.category is set
    if (!form.category || !form.key || !form.value) {
      alert('Semua field harus diisi!')
      return
    }

    console.log('[MasterData] Submitting with:', { category: form.category, key: form.key, value: form.value })

    setSaving(true)
    try {
      const url = editingItem ? '/api/admin/master-data' : '/api/admin/master-data'
      const method = editingItem ? 'PUT' : 'POST'

      const body: { category: string; key: string; value: string; id?: string } = {
        category: form.category,
        key: form.key,
        value: form.value,
      }
      if (editingItem) body.id = editingItem.id

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      console.log('[MasterData] Response:', data)

      if (res.ok) {
        setModalOpen(false)
        setEditingItem(null)
        setForm({ category: 'JENIS_SAPI', key: '', value: '' })
        fetchData()
      } else {
        alert(data.error || data.details || 'Gagal menyimpan')
      }
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Terjadi kesalahan saat menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item: MasterData) => {
    setEditingItem(item)
    setForm({ category: item.category, key: item.key, value: item.value })
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus data ini?')) return
    try {
      const res = await fetch(`/api/admin/master-data?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
      } else {
        const data = await res.json()
        alert(data.error || 'Gagal menghapus data')
      }
    } catch (error) {
      console.error('Failed to delete:', error)
      alert('Terjadi kesalahan saat menghapus data')
    }
  }

  const filteredItems = items.filter(item =>
    item.value.toLowerCase().includes(search.toLowerCase()) ||
    item.key.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Master Data</h2>
          <p className="text-muted-foreground">Kelola data referensi (jenis sapi, pakan, status)</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setEditingItem(null); setForm({ category: 'JENIS_SAPI', key: '', value: '' }); setModalOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Data
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari..." value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-10 px-3 rounded-md border border-input bg-background">
          <option value="">Semua Kategori</option>
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Belum ada data. Klik &quot;Tambah Data&quot; untuk menambahkan data master.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 text-sm font-medium">Kategori</th>
                <th className="text-left p-3 text-sm font-medium">Key</th>
                <th className="text-left p-3 text-sm font-medium">Value</th>
                <th className="text-center p-3 text-sm font-medium">Order</th>
                <th className="text-right p-3 text-sm font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-3 text-sm">{CATEGORIES.find(c => c.value === item.category)?.label || item.category}</td>
                  <td className="p-3 text-sm font-mono">{item.key}</td>
                  <td className="p-3 text-sm font-medium">{item.value}</td>
                  <td className="p-3 text-center text-sm">{item.order}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 bg-white shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingItem ? 'Edit Data' : 'Tambah Data'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Kategori *</Label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    required
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Key *</Label>
                  <Input value={form.key} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, key: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_') })} placeholder="CONTOH_KEY" required />
                  <p className="text-xs text-muted-foreground">Huruf besar, angka, dan underscore saja</p>
                </div>
                <div className="space-y-2">
                  <Label>Value *</Label>
                  <Input value={form.value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, value: e.target.value })} placeholder="Contoh Value" required />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
