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

export default function NewCattlePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    code: '',
    name: '',
    breed: '',
    status: 'AVAILABLE',
    birthDate: '',
    height: '',
    price: '',
    targetWeight: '',
    description: '',
    mainImage: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
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
                <Label htmlFor="code">Kode Sapi *</Label>
                <Input
                  id="code"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="NF-26001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nama Sapi *</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Brahman Alpha"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="breed">Jenis Sapi *</Label>
                <Input
                  id="breed"
                  name="breed"
                  value={form.breed}
                  onChange={handleChange}
                  placeholder="Limousin"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Tersedia</SelectItem>
                    <SelectItem value="SOLD">Terjual</SelectItem>
                    <SelectItem value="RESERVED">Diboeking</SelectItem>
                    <SelectItem value="ARCHIVED">Diarchive</SelectItem>
                  </SelectContent>
                </Select>
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
                  placeholder="45000000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetWeight">Target Bobot (Kg)</Label>
                <Input
                  id="targetWeight"
                  name="targetWeight"
                  type="number"
                  value={form.targetWeight}
                  onChange={handleChange}
                  placeholder="650"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="mainImage">URL Foto Utama</Label>
                <Input
                  id="mainImage"
                  name="mainImage"
                  value={form.mainImage}
                  onChange={handleChange}
                  placeholder="https://..."
                />
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
