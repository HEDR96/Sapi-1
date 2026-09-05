'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react'
import { Button } from '@samadya/shared/components/ui/button'
import { Input } from '@samadya/shared/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@samadya/shared/components/ui/card'
import { Label } from '@samadya/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@samadya/shared/components/ui/select'
import { formatCurrency, formatDate } from '@samadya/shared/lib/utils/formatters'

interface Sale {
  id: string
  cattleId: string
  customerId: string
  quantity: number
  price: number
  margin: number | null
  status: string
  notes: string | null
  createdAt: string
  cattle: { code: string; name: string; breed: string; mainImage: string | null; buyPrice: string | null }
  customer: { id: string; name: string; phone: string | null }
}

interface Customer {
  id: string
  name: string
}

interface Cattle {
  id: string
  code: string
  name: string
  breed: string
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [cattle, setCattle] = useState<Cattle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ cattleId: '', customerId: '', quantity: '1', price: '', margin: '', status: 'PENDING', notes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [search])

  const fetchData = async () => {
    try {
      const [salesRes, customersRes, cattleRes] = await Promise.all([
        fetch(`/api/admin/sales?search=${search}`),
        fetch('/api/admin/customers'),
        fetch('/api/admin/cattle'),
      ])
      const salesData = await salesRes.json()
      const customersData = await customersRes.json()
      const cattleData = await cattleRes.json()
      setSales(salesData.sales || [])
      setCustomers(customersData.customers || [])
      setCattle(cattleData.items || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setModalOpen(false)
        setForm({ cattleId: '', customerId: '', quantity: '1', price: '', margin: '', status: 'PENDING', notes: '' })
        fetchData()
      }
    } catch (error) {
      console.error('Failed to save sale:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus penjualan ini?')) return
    try {
      await fetch(`/api/admin/sales/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Failed to delete sale:', error)
    }
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Penjualan</h2>
          <p className="text-muted-foreground">Kelola penjualan sapi</p>
        </div>
        <Button onClick={() => { setForm({ cattleId: '', customerId: '', quantity: '1', price: '', margin: '', status: 'PENDING', notes: '' }); setModalOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Penjualan
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cari penjualan..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : sales.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Belum ada penjualan</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 text-sm font-medium">Tanggal</th>
                <th className="text-left p-3 text-sm font-medium">Sapi</th>
                <th className="text-left p-3 text-sm font-medium">Pelanggan</th>
                <th className="text-right p-3 text-sm font-medium">Jumlah</th>
                <th className="text-right p-3 text-sm font-medium">Harga</th>
                <th className="text-right p-3 text-sm font-medium">Margin</th>
                <th className="text-center p-3 text-sm font-medium">Status</th>
                <th className="text-right p-3 text-sm font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-t">
                  <td className="p-3 text-sm">{formatDate(new Date(sale.createdAt))}</td>
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{sale.cattle.name}</p>
                      <p className="text-xs text-muted-foreground">{sale.cattle.code}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{sale.customer.name}</p>
                      {sale.customer.phone && <p className="text-xs text-muted-foreground">{sale.customer.phone}</p>}
                    </div>
                  </td>
                  <td className="p-3 text-right">{sale.quantity}</td>
                  <td className="p-3 text-right font-medium">{formatCurrency(sale.price)}</td>
                  <td className="p-3 text-right text-green-600">{sale.margin ? formatCurrency(sale.margin) : '-'}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[sale.status]}`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(sale.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tambah Penjualan</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Sapi *</Label>
                  <Select value={form.cattleId} onValueChange={(v: string) => setForm({ ...form, cattleId: v })}>
                    <SelectTrigger><SelectValue placeholder="Pilih sapi" /></SelectTrigger>
                    <SelectContent>
                      {cattle.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name} ({c.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pelanggan *</Label>
                  <Select value={form.customerId} onValueChange={(v: string) => setForm({ ...form, customerId: v })}>
                    <SelectTrigger><SelectValue placeholder="Pilih pelanggan" /></SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Jumlah *</Label>
                    <Input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Harga *</Label>
                    <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="25000000" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Margin</Label>
                    <Input type="number" value={form.margin} onChange={(e) => setForm({ ...form, margin: e.target.value })} placeholder="2500000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v: string) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Catatan</Label>
                  <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Catatan optional" />
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
