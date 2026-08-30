'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ImageUploader } from '@/components/admin/ImageUploader'

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
    targetWeight: '',
    description: '',
    mainImage: '',
    quantity: '1',
  })

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
          targetWeight: form.targetWeight ? parseFloat(form.targetWeight) : null,
          quantity: parseInt(form.quantity) || 1,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan')
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
                <Select value={form.breed} onValueChange={(v) => setForm({ ...form, breed: v })}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Pilih jenis sapi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Limousin">Limousin</SelectItem>
                    <SelectItem value="Simental">Simental</SelectItem>
                    <SelectItem value="Brahman">Brahman</SelectItem>
                    <SelectItem value="Angus">Angus</SelectItem>
                    <SelectItem value="PO">Peranakan Ongole (PO)</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Tersedia</SelectItem>
                    <SelectItem value="BOOKED">Diboeking</SelectItem>
                    <SelectItem value="SOLD">Terjual</SelectItem>
                    <SelectItem value="ARCHIVED">Diarchive</SelectItem>
                  </SelectContent>
                </Select>
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
                <p className="text-xs text-muted-foreground">
                  Jumlah sapi yang tersedia
                </p>
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
                  step="0.1"
                  value={form.height}
                  onChange={handleChange}
                  placeholder="145"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Harga (Rp) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="26500000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetWeight">Target Bobot (Kg)</Label>
                <Input
                  id="targetWeight"
                  name="targetWeight"
                  type="number"
                  step="0.1"
                  value={form.targetWeight}
                  onChange={handleChange}
                  placeholder="610"
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
