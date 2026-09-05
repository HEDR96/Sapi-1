'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Trash2, X, Check, ChevronDown } from 'lucide-react'
import { Button } from '@samadya/shared/components/ui/button'
import { Input } from '@samadya/shared/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@samadya/shared/components/ui/card'
import { Label } from '@samadya/shared/components/ui/label'
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
  phone: string | null
}

interface Cattle {
  id: string
  code: string
  name: string
  breed: string
  buyPrice: number | null
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [cattle, setCattle] = useState<Cattle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ cattleId: '', customerIds: [] as string[], quantity: '1', price: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [calculatedMargin, setCalculatedMargin] = useState<number | null>(null)

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

  // Calculate margin when cattle or price changes
  useEffect(() => {
    if (form.cattleId && form.price) {
      const selectedCattle = cattle.find(c => c.id === form.cattleId)
      if (selectedCattle?.buyPrice) {
        const margin = parseFloat(form.price) - selectedCattle.buyPrice
        setCalculatedMargin(margin)
      } else {
        setCalculatedMargin(parseFloat(form.price))
      }
    } else {
      setCalculatedMargin(null)
    }
  }, [form.cattleId, form.price, cattle])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.customerIds.length === 0) {
      alert('Pilih minimal 1 pelanggan')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setModalOpen(false)
        setForm({ cattleId: '', customerIds: [], quantity: '1', price: '', notes: '' })
        setCalculatedMargin(null)
        fetchData()
      } else {
        const data = await res.json()
        alert(data.error || 'Gagal menyimpan')
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

  const toggleCustomer = (customerId: string) => {
    setForm(prev => ({
      ...prev,
      customerIds: prev.customerIds.includes(customerId)
        ? prev.customerIds.filter(id => id !== customerId)
        : [...prev.customerIds, customerId]
    }))
  }

  const selectedCustomers = customers.filter(c => form.customerIds.includes(c.id))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Penjualan</h2>
          <p className="text-muted-foreground">Kelola penjualan sapi</p>
        </div>
        <Button onClick={() => { setForm({ cattleId: '', customerIds: [], quantity: '1', price: '', notes: '' }); setCalculatedMargin(null); setModalOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Penjualan
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cari penjualan..." value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} className="pl-10" />
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
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4 bg-white shadow-xl">
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
                  <select
                    value={form.cattleId}
                    onChange={(e) => setForm({ ...form, cattleId: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    required
                  >
                    <option value="">Pilih sapi</option>
                    {cattle.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code}) {c.buyPrice ? `- Beli: ${formatCurrency(c.buyPrice)}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Pelanggan * (pilih satu atau lebih)</Label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-left flex items-center justify-between"
                    >
                      <span>
                        {selectedCustomers.length === 0
                          ? 'Pilih pelanggan'
                          : `${selectedCustomers.length} pelanggan dipilih`}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {showCustomerDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                        {customers.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => toggleCustomer(c.id)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center justify-between"
                          >
                            <div>
                              <p className="font-medium">{c.name}</p>
                              {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
                            </div>
                            {form.customerIds.includes(c.id) && <Check className="h-4 w-4 text-green-600" />}
                          </button>
                        ))}
                        {customers.length === 0 && (
                          <p className="px-3 py-2 text-sm text-muted-foreground">Belum ada pelanggan</p>
                        )}
                      </div>
                    )}
                  </div>
                  {selectedCustomers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedCustomers.map((c) => (
                        <span
                          key={c.id}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                        >
                          {c.name}
                          <button
                            type="button"
                            onClick={() => toggleCustomer(c.id)}
                            className="hover:text-green-900"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Jumlah *</Label>
                    <Input type="number" min="1" step="1" value={form.quantity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, quantity: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Harga Jual *</Label>
                    <Input type="number" step="1" value={form.price} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, price: e.target.value })} placeholder="25000000" required />
                  </div>
                </div>

                {calculatedMargin !== null && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">
                      <span className="font-medium">Margin:</span> {formatCurrency(calculatedMargin)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Dihitung dari harga jual - harga beli
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Catatan</Label>
                  <Input value={form.notes} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, notes: e.target.value })} placeholder="Catatan optional" />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={saving || form.customerIds.length === 0}>
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
