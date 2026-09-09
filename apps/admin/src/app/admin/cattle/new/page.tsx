'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Plus, X, Trash2, CheckCircle2, Star } from 'lucide-react'
import { Button } from '@samadya/shared/components/ui/button'
import { Input } from '@samadya/shared/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@samadya/shared/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@samadya/shared/components/ui/select'
import { Label } from '@samadya/shared/components/ui/label'
import Link from 'next/link'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { MultiMediaUploader } from '@/components/admin/MultiMediaUploader'
import { getDirectImageUrl, getVideoUrl } from '@samadya/shared/lib/utils/imageUrl'

interface MasterData {
  id: string
  category: string
  key: string
  value: string
}

interface CattleMediaItem {
  id: string
  fileUrl: string
  fileType: string
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

  // Set after the cattle record itself is created - unlocks the media gallery step
  const [createdCattle, setCreatedCattle] = useState<{ id: string; code: string; name: string; mainImage: string | null } | null>(null)
  const [media, setMedia] = useState<CattleMediaItem[]>([])
  const [uploadedMediaUrls, setUploadedMediaUrls] = useState<string[]>([''])
  const [mediaSaving, setMediaSaving] = useState(false)
  const [settingMainImageId, setSettingMainImageId] = useState<string | null>(null)

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

      // Cattle record now exists - reveal the media gallery step instead of
      // navigating away immediately, so photos/videos can be added right away.
      setCreatedCattle({ id: data.data.id, code: data.data.code, name: data.data.name, mainImage: data.data.mainImage || null })
      router.refresh()
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const fetchMedia = async (cattleId: string) => {
    try {
      const res = await fetch(`/api/admin/media?cattleId=${cattleId}`)
      if (res.ok) {
        const data = await res.json()
        setMedia(data.media || [])
      }
    } catch (err) {
      console.error('Failed to fetch media:', err)
    }
  }

  const handleSaveMedia = async () => {
    if (!createdCattle) return
    const validUrls = uploadedMediaUrls.filter((u) => u)
    if (validUrls.length === 0) return

    setMediaSaving(true)
    try {
      for (const url of validUrls) {
        const isVideo = url.includes('/api/stream')
        const res = await fetch('/api/admin/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cattleId: createdCattle.id,
            fileUrl: url,
            fileType: isVideo ? 'VIDEO' : 'IMAGE',
            category: 'GENERAL',
          }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Gagal menyimpan media')
        }
      }
      setUploadedMediaUrls([''])
      await fetchMedia(createdCattle.id)
    } catch (err: any) {
      console.error('Failed to save media:', err)
      alert(err.message || 'Terjadi kesalahan saat menyimpan media')
    } finally {
      setMediaSaving(false)
    }
  }

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('Hapus media ini?')) return
    try {
      const res = await fetch(`/api/admin/media?id=${mediaId}`, { method: 'DELETE' })
      if (res.ok && createdCattle) {
        await fetchMedia(createdCattle.id)
      } else {
        const data = await res.json()
        alert(data.error || 'Gagal hapus media')
      }
    } catch (err) {
      console.error('Delete media error:', err)
      alert('Gagal hapus media')
    }
  }

  const handleSetMainImage = async (mediaId: string, fileUrl: string) => {
    if (!createdCattle) return
    setSettingMainImageId(mediaId)
    try {
      const res = await fetch(`/api/admin/cattle/${createdCattle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mainImage: fileUrl }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Gagal menjadikan foto/video utama')
      }
      setCreatedCattle({ ...createdCattle, mainImage: fileUrl })
    } catch (err: any) {
      console.error('Failed to set main image:', err)
      alert(err.message || 'Gagal menjadikan foto/video utama')
    } finally {
      setSettingMainImageId(null)
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

      {createdCattle && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-md text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Data sapi <strong>{createdCattle.name}</strong> ({createdCattle.code}) berhasil disimpan. Sekarang tambahkan foto/video dokumentasi di bawah.
        </div>
      )}

      {!createdCattle && (
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
      )}

      {createdCattle && (
        <Card>
          <CardHeader>
            <CardTitle>Dokumentasi</CardTitle>
            <CardDescription>Foto dan video dokumentasi sapi (opsional, bisa ditambah kapan saja lewat halaman edit)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 space-y-4">
              <Label>Upload Beberapa Foto/Video Sekaligus</Label>
              <MultiMediaUploader cattleId={createdCattle.id} onUploaded={() => fetchMedia(createdCattle.id)} />
            </div>

            <div className="mb-6 space-y-4">
              <Label>Atau Upload Satu per Satu</Label>
              {uploadedMediaUrls.map((url, index) => (
                <div key={index} className="relative">
                  <ImageUploader
                    folder="cattle"
                    value={url}
                    onChange={(newUrl) => {
                      const updated = [...uploadedMediaUrls]
                      updated[index] = newUrl
                      setUploadedMediaUrls(updated)
                    }}
                  />
                  {uploadedMediaUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setUploadedMediaUrls(uploadedMediaUrls.filter((_, i) => i !== index))}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      title="Hapus"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUploadedMediaUrls([...uploadedMediaUrls, ''])}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />Tambah Foto/Video Lain
              </Button>
              {uploadedMediaUrls.filter((u) => u).length > 0 && (
                <Button onClick={handleSaveMedia} disabled={mediaSaving}>
                  {mediaSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan Semua Media
                </Button>
              )}
            </div>

            {media.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {media.map((m) => {
                  const isMain = createdCattle?.mainImage === m.fileUrl
                  return (
                  <div key={m.id} className={`relative aspect-square border rounded-lg overflow-hidden group ${isMain ? 'ring-2 ring-[hsl(var(--gold))]' : ''}`}>
                    {m.fileType === 'VIDEO' || m.fileUrl.includes('/api/stream') ? (
                      <video src={getVideoUrl(m.fileUrl)} className="w-full h-full object-cover" controls preload="metadata" />
                    ) : (
                      <img src={getDirectImageUrl(m.fileUrl)} alt="" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">{m.fileType}</div>
                    {isMain && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-[hsl(var(--gold))] px-2 py-0.5 text-[10px] font-bold text-white shadow">
                        <Star className="h-3 w-3 fill-current" />Utama
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!isMain && (
                        <button
                          type="button"
                          onClick={() => handleSetMainImage(m.id, m.fileUrl)}
                          disabled={settingMainImageId === m.id}
                          className="p-2 bg-white text-[hsl(var(--forest))] rounded-full hover:bg-[hsl(var(--cream))] shadow-lg disabled:opacity-50"
                          title="Jadikan foto/video utama"
                        >
                          {settingMainImageId === m.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteMedia(m.id)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                        title="Hapus media"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  )
                })}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <Button onClick={() => { router.push('/admin/cattle'); router.refresh() }}>
                Selesai
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
