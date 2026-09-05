'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Pencil, Trash2, Phone, Mail, X } from 'lucide-react'
import { Button } from '@samadya/shared/components/ui/button'
import { Input } from '@samadya/shared/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@samadya/shared/components/ui/card'
import { Label } from '@samadya/shared/components/ui/label'
import { formatDate } from '@samadya/shared/lib/utils/formatters'

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  purchasePercentage: number | null
  createdAt: string
  sales: any[]
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', purchasePercentage: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [search])

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`/api/admin/customers?search=${search}`)
      const data = await res.json()
      setCustomers(data.customers || [])
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingCustomer
        ? `/api/admin/customers/${editingCustomer.id}`
        : '/api/admin/customers'
      const method = editingCustomer ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setModalOpen(false)
        setEditingCustomer(null)
        setForm({ name: '', email: '', phone: '', address: '', purchasePercentage: '' })
        fetchCustomers()
      }
    } catch (error) {
      console.error('Failed to save customer:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setForm({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      purchasePercentage: customer.purchasePercentage?.toString() || '',
    })
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pelanggan ini?')) return
    try {
      await fetch(`/api/admin/customers/${id}`, { method: 'DELETE' })
      fetchCustomers()
    } catch (error) {
      console.error('Failed to delete customer:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pelanggan</h2>
          <p className="text-muted-foreground">Kelola data pelanggan</p>
        </div>
        <Button onClick={() => { setEditingCustomer(null); setForm({ name: '', email: '', phone: '', address: '', purchasePercentage: '' }); setModalOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pelanggan
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari pelanggan..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Belum ada pelanggan</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {customers.map((customer) => (
            <Card key={customer.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{customer.name}</h3>
                      {customer.purchasePercentage && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                          {customer.purchasePercentage}%
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      {customer.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </span>
                      )}
                      {customer.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </span>
                      )}
                    </div>
                    {customer.address && (
                      <p className="mt-1 text-sm text-muted-foreground">{customer.address}</p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {customer.sales?.length || 0} transaksi • Terdaftar {formatDate(new Date(customer.createdAt))}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(customer)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(customer.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 bg-white shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nama *</Label>
                  <Input value={form.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })} placeholder="Nama lengkap" required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Telepon</Label>
                  <Input value={form.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, phone: e.target.value })} placeholder="08xx-xxxx-xxxx" />
                </div>
                <div className="space-y-2">
                  <Label>Alamat</Label>
                  <Input value={form.address} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, address: e.target.value })} placeholder="Alamat lengkap" />
                </div>
                <div className="space-y-2">
                  <Label>% Pembelian</Label>
                  <Input type="number" min="0" max="100" step="0.01" value={form.purchasePercentage} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, purchasePercentage: e.target.value })} placeholder="100" />
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
