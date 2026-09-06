'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@samadya/shared/components/ui/button'
import { Input } from '@samadya/shared/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@samadya/shared/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@samadya/shared/components/ui/select'
import { Label } from '@samadya/shared/components/ui/label'
import Link from 'next/link'
import { ImageUploader } from '@/components/admin/ImageUploader'

interface MasterData {
  id: string
  category: string
  key: string
  value: string
}

export default function NewCattlePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    breed: '',
    status: 'AVAILABLE',
    birthDate: '',
    height: '',
    price: '',
    buyPrice: '',
    sellPrice: '',
    healthCost: '',
    feedCost: '',
    targetWeight: '',
    description: '',
    mainImage: '',
    quantity: '1',
  })

  // Master data
  const [cattleBreeds, setCattleBreeds] = useState<MasterData[]>([])
  const [cattleStatuses, setCattleStatuses] = useState<MasterData[]>([])
  const [loadingMasterData, setLoadingMasterData] = useState(true)

  useEffect(() => {
    fetchMasterData()
  }, [])

  // Refresh master data when page becomes visible (e.g., after returning from master data page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchMasterData()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const fetchMasterData = async () => {
    try {
      // Add cache-busting timestamp to ensure fresh data
      const res = await fetch(`/api/admin/master-data?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      if (res.ok) {
        const data = await res.json()
        const items = data.items || []
        setCattleBreeds(items.filter((m: MasterData) => m.category === 'JENIS_SAPI'))
        setCattleStatuses(items.filter((m: MasterData) => m.category === 'STATUS_SAPI'))
      }
    } catch (error) {
      console.error('Failed to fetch master data:', error)
    } finally {
      setLoadingMasterData(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImageChange = (url: string) => {
    setForm({ ...form, mainImage: url })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/cattle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          height: form.height ? parseFloat(form.height) : null,
          price: parseFloat(form.price),
          buyPrice: form.buyPrice ? parseFloat(form.buyPrice) : null,
          sellPrice: form.sellPrice ? parseFloat(form.sellPrice) : null,
          healthCost: form.healthCost ? parseFloat(form.healthCost) : null,
          feedCost: form.feedCost ? parseFloat(form.feedCost) : null,
          targetWeight: form.targetWeight ? parseFloat(form.targetWeight) : null,
          quantity: parseInt(form.quantity) || 1,
        }),
      })

      const data = await res.json()
      console.log('[New Cattle] API Response:', data)

      if (!res.ok) {
        setError(data.details || data.error || 'Gagal menyimpan')
        return
      }

      router.push('/admin/cattle')
      router.refresh()
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/cattle">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Tambah Sapi Baru</h2>
          <p className="text-muted-foreground">Tambah sapi baru ke katalog</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Sapi</CardTitle>
          <CardDescription>
            Lengkapi form di bawah untuk menambahkan sapi baru
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Sapi *</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Bima"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Kode sapi akan dibuat otomatis
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="breed">Jenis Sapi *</Label>
                {loadingMasterData ? (
                  <Input disabled placeholder="Memuat..." />
                ) : (
                  <Select value={form.breed} onValueChange={(v: string) => setForm({ ...form, breed: v })}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder={cattleBreeds.length === 0 ? "Tidak ada data master" : "Pilih jenis sapi"} />
                    </SelectTrigger>
                    <SelectContent>
                      {cattleBreeds.length > 0 ? (
                        cattleBreeds.map((b) => (
                          <SelectItem key={b.id} value={b.key}>{b.value}</SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          Tambahkan data di menu Master Data
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                {loadingMasterData ? (
                  <Input disabled placeholder="Memuat..." />
                ) : (
                  <Select value={form.status} onValueChange={(v: string) => setForm({ ...form, status: v })}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder={cattleStatuses.length === 0 ? "Tidak ada data master" : "Pilih status"} />
                    </SelectTrigger>
                    <SelectContent>
                      {cattleStatuses.length > 0 ? (
                        cattleStatuses.map((s) => (
                          <SelectItem key={s.id} value={s.key}>{s.value}</SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          Tambahkan data di menu Master Data
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Jumlah Stok *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">Tanggal Lahir *</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={form.birthDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Tinggi Badan (cm)</Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  step="0.01"
                  value={form.height}
                  onChange={handleChange}
                  placeholder="145.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Harga Jual (Rp) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="1"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="26500000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyPrice">Harga Beli (Rp)</Label>
                <Input
                  id="buyPrice"
                  name="buyPrice"
                  type="number"
                  step="1"
                  value={form.buyPrice}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sellPrice">Harga Jual 2 (Rp)</Label>
                <Input
                  id="sellPrice"
                  name="sellPrice"
                  type="number"
                  step="1"
                  value={form.sellPrice}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="healthCost">Biaya Kesehatan (Rp)</Label>
                <Input
                  id="healthCost"
                  name="healthCost"
                  type="number"
                  step="1"
                  value={form.healthCost}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedCost">Biaya Pakan (Rp)</Label>
                <Input
                  id="feedCost"
                  name="feedCost"
                  type="number"
                  step="1"
                  value={form.feedCost}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetWeight">Target Bobot (Kg)</Label>
                <Input
                  id="targetWeight"
                  name="targetWeight"
                  type="number"
                  step="0.01"
                  value={form.targetWeight}
                  onChange={handleChange}
                  placeholder="610.00"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Foto Utama</Label>
                <ImageUploader
                  value={form.mainImage}
                  onChange={handleImageChange}
                  folder="cattle"
                />
                <p className="text-xs text-muted-foreground">
                  Upload gambar JPG atau PNG. Maksimal 5MB.
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Deskripsi</Label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Deskripsi sapi..."
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/admin/cattle">
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
