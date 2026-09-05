'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Loader2, Plus, Pencil, Trash2, Scale, Heart, UtensilsCrossed, Image as ImageIcon } from 'lucide-react'
import { Button } from '@samadya/shared/components/ui/button'
import { Input } from '@samadya/shared/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@samadya/shared/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@samadya/shared/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@samadya/shared/components/ui/select'
import { Label } from '@samadya/shared/components/ui/label'
import { format } from 'date-fns'
import { formatCurrency } from '@samadya/shared/lib/utils/formatters'
import { CattleStatusBadge as StatusBadge } from '@samadya/shared/components/ui/CattleStatusBadge'
import { ImageUploader } from '@/components/admin/ImageUploader'

interface CattleDetail {
  id: string
  code: string
  name: string
  breed: string
  status: string
  birthDate: string
  height: number | null
  price: number
  targetWeight: number | null
  description: string | null
  mainImage: string | null
  buyPrice: number | null
  sellPrice: number | null
  healthCost: number | null
  feedCost: number | null
  lastWeight?: number | null
  weightStats?: { avgWeight: number; minWeight: number; maxWeight: number; adg: number; totalRecords: number }
  weights?: { id: string; weight: number; measurementDate: string; notes: string | null }[]
  healthRecords?: { id: string; recordDate: string; healthType: string; status: string; notes: string | null }[]
  feedRecords?: { id: string; recordDate: string; feedType: string; amount: string; frequency: string; notes: string | null }[]
  media?: { id: string; fileUrl: string; fileType: string; category: string }[]
}

export default function CattleDetailPage() {
  const params = useParams()
  const cattleId = params.id as string
  const [cattle, setCattle] = useState<CattleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('summary')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ code: '', name: '', breed: '', status: 'AVAILABLE', birthDate: '', height: '', price: '', targetWeight: '', description: '', mainImage: '', buyPrice: '', sellPrice: '', healthCost: '', feedCost: '' })

  // Modal states
  const [weightModalOpen, setWeightModalOpen] = useState(false)
  const [weightForm, setWeightForm] = useState({ weight: '', measurementDate: '', notes: '' })
  const [healthModalOpen, setHealthModalOpen] = useState(false)
  const [healthForm, setHealthForm] = useState({ healthType: 'VACCINATION', status: 'SEHAT', recordDate: '', notes: '' })
  const [feedModalOpen, setFeedModalOpen] = useState(false)
  const [feedForm, setFeedForm] = useState({ feedType: '', amount: '', frequency: '', recordDate: '', notes: '' })

  useEffect(() => { fetchCattle() }, [cattleId])

  const fetchCattle = async () => {
    try {
      const res = await fetch(`/api/admin/cattle/${cattleId}`)
      const data = await res.json()
      if (res.ok && data.data) {
        setCattle(data.data)
        setForm({
          code: data.data.code || '', name: data.data.name || '', breed: data.data.breed || '', status: data.data.status || 'AVAILABLE',
          birthDate: data.data.birthDate ? format(new Date(data.data.birthDate), 'yyyy-MM-dd') : '',
          height: data.data.height?.toString() || '', price: data.data.price?.toString() || '',
          targetWeight: data.data.targetWeight?.toString() || '', description: data.data.description || '', mainImage: data.data.mainImage || '',
          buyPrice: data.data.buyPrice?.toString() || '', sellPrice: data.data.sellPrice?.toString() || '',
          healthCost: data.data.healthCost?.toString() || '', feedCost: data.data.feedCost?.toString() || '',
        })
      }
    } catch (error) { console.error('Failed to fetch cattle:', error) }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/cattle/${cattleId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          height: form.height ? parseFloat(form.height) : null,
          price: parseFloat(form.price),
          targetWeight: form.targetWeight ? parseFloat(form.targetWeight) : null,
          buyPrice: form.buyPrice ? parseFloat(form.buyPrice) : null,
          sellPrice: form.sellPrice ? parseFloat(form.sellPrice) : null,
          healthCost: form.healthCost ? parseFloat(form.healthCost) : null,
          feedCost: form.feedCost ? parseFloat(form.feedCost) : null,
        }),
      })
      if (res.ok) { setEditing(false); fetchCattle() }
    } catch (error) { console.error('Failed to save:', error) }
    finally { setSaving(false) }
  }

  const handleAddWeight = async () => {
    try {
      await fetch(`/api/admin/cattle/${cattleId}/weights`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ weight: parseFloat(weightForm.weight), measurementDate: weightForm.measurementDate, notes: weightForm.notes || null }) })
      setWeightModalOpen(false); setWeightForm({ weight: '', measurementDate: '', notes: '' }); fetchCattle()
    } catch (error) { console.error('Failed to add weight:', error) }
  }

  const handleAddHealth = async () => {
    try {
      await fetch(`/api/admin/cattle/${cattleId}/health`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ healthType: healthForm.healthType, status: healthForm.status, recordDate: healthForm.recordDate, notes: healthForm.notes || null }) })
      setHealthModalOpen(false); setHealthForm({ healthType: 'VACCINATION', status: 'SEHAT', recordDate: '', notes: '' }); fetchCattle()
    } catch (error) { console.error('Failed to add health record:', error) }
  }

  const handleAddFeed = async () => {
    try {
      await fetch(`/api/admin/cattle/${cattleId}/feed`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feedType: feedForm.feedType, amount: feedForm.amount, frequency: feedForm.frequency, recordDate: feedForm.recordDate, notes: feedForm.notes || null }) })
      setFeedModalOpen(false); setFeedForm({ feedType: '', amount: '', frequency: '', recordDate: '', notes: '' }); fetchCattle()
    } catch (error) { console.error('Failed to add feed record:', error) }
  }

  const handleDelete = async (type: string, id: string) => {
    if (!confirm(`Hapus ${type} ini?`)) return
    try {
      await fetch(`/api/admin/cattle/${cattleId}/${type}?id=${id}`, { method: 'DELETE' })
      fetchCattle()
    } catch (error) { console.error('Failed to delete:', error) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  if (!cattle) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Sapi tidak ditemukan</p></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/cattle"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{cattle.name}</h2>
          <p className="text-muted-foreground flex items-center gap-2"><span className="font-mono">{cattle.code}</span><span>•</span><StatusBadge status={cattle.status as any} /></p>
        </div>
        <Button variant="outline" onClick={() => setEditing(!editing)}><Pencil className="h-4 w-4 mr-2" />{editing ? 'Batal' : 'Edit'}</Button>
        {editing && <Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Simpan</Button>}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="weight"><Scale className="h-4 w-4 mr-1" />Timbang</TabsTrigger>
          <TabsTrigger value="health"><Heart className="h-4 w-4 mr-1" />Kesehatan</TabsTrigger>
          <TabsTrigger value="feed"><UtensilsCrossed className="h-4 w-4 mr-1" />Pakan</TabsTrigger>
          <TabsTrigger value="media"><ImageIcon className="h-4 w-4 mr-1" />Dokumentasi</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Informasi Dasar</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {editing ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Kode</Label><Input value={form.code} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, code: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Nama</Label><Input value={form.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Jenis</Label><Input value={form.breed} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, breed: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Status</Label><Select value={form.status} onValueChange={(v: string) => setForm({ ...form, status: v as any })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="AVAILABLE">Tersedia</SelectItem><SelectItem value="BOOKED">Dibooking</SelectItem><SelectItem value="SOLD">Terjual</SelectItem><SelectItem value="ARCHIVED">Diarchive</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label>Tanggal Lahir</Label><Input type="date" value={form.birthDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, birthDate: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Tinggi (cm)</Label><Input type="number" value={form.height} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, height: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Harga Jual (Rp)</Label><Input type="number" value={form.price} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, price: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Harga Beli (Rp)</Label><Input type="number" value={form.buyPrice} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, buyPrice: e.target.value })} placeholder="0" /></div>
                    <div className="space-y-2"><Label>Target Bobot (Kg)</Label><Input type="number" value={form.targetWeight} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, targetWeight: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Biaya Kesehatan (Rp)</Label><Input type="number" value={form.healthCost} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, healthCost: e.target.value })} placeholder="0" /></div>
                    <div className="space-y-2"><Label>Biaya Pakan (Rp)</Label><Input type="number" value={form.feedCost} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, feedCost: e.target.value })} placeholder="0" /></div>
                    <div className="col-span-2 space-y-2"><Label>Deskripsi</Label><textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={3} value={form.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })} /></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-muted-foreground">Jenis</p><p className="font-medium">{cattle.breed}</p></div>
                    <div><p className="text-xs text-muted-foreground">Tanggal Lahir</p><p className="font-medium">{cattle.birthDate ? format(new Date(cattle.birthDate), 'dd MMM yyyy') : '-'}</p></div>
                    <div><p className="text-xs text-muted-foreground">Tinggi</p><p className="font-medium">{cattle.height ? `${cattle.height} cm` : '-'}</p></div>
                    <div><p className="text-xs text-muted-foreground">Harga Jual</p><p className="font-medium">{formatCurrency(cattle.price)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Harga Beli</p><p className="font-medium">{cattle.buyPrice ? formatCurrency(cattle.buyPrice) : '-'}</p></div>
                    <div><p className="text-xs text-muted-foreground">Target Bobot</p><p className="font-medium">{cattle.targetWeight ? `${cattle.targetWeight} Kg` : '-'}</p></div>
                    <div><p className="text-xs text-muted-foreground">Bobot Terakhir</p><p className="font-medium">{cattle.lastWeight ? `${cattle.lastWeight} Kg` : '-'}</p></div>
                    <div><p className="text-xs text-muted-foreground">Biaya Kesehatan</p><p className="font-medium">{cattle.healthCost ? formatCurrency(cattle.healthCost) : '-'}</p></div>
                    <div><p className="text-xs text-muted-foreground">Biaya Pakan</p><p className="font-medium">{cattle.feedCost ? formatCurrency(cattle.feedCost) : '-'}</p></div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Statistik Bobot</CardTitle></CardHeader>
              <CardContent>
                {cattle.weightStats ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-muted-foreground">Rata-rata</p><p className="text-2xl font-bold">{cattle.weightStats.avgWeight} Kg</p></div>
                    <div><p className="text-xs text-muted-foreground">ADG</p><p className="text-2xl font-bold">{cattle.weightStats.adg.toFixed(2)} Kg/hari</p></div>
                    <div><p className="text-xs text-muted-foreground">Min</p><p className="font-medium">{cattle.weightStats.minWeight} Kg</p></div>
                    <div><p className="text-xs text-muted-foreground">Max</p><p className="font-medium">{cattle.weightStats.maxWeight} Kg</p></div>
                    <div className="col-span-2"><p className="text-xs text-muted-foreground">Total Records</p><p className="font-medium">{cattle.weightStats.totalRecords} kali pengukuran</p></div>
                  </div>
                ) : <p className="text-muted-foreground">Belum ada data timbang</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="weight" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>Riwayat Timbang</CardTitle><CardDescription>Daftar riwayat penimbangan bobot sapi</CardDescription></div>
              <Button size="sm" onClick={() => setWeightModalOpen(true)}><Plus className="h-4 w-4 mr-2" />Tambah</Button>
            </CardHeader>
            <CardContent>
              {cattle.weights && cattle.weights.length > 0 ? (
                <div className="space-y-2">{cattle.weights.map((w) => (
                  <div key={w.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div><p className="font-medium">{w.weight} Kg</p><p className="text-xs text-muted-foreground">{format(new Date(w.measurementDate), 'dd MMM yyyy')}{w.notes && ` • ${w.notes}`}</p></div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete('weights', w.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ))}</div>
              ) : <p className="text-muted-foreground text-center py-8">Belum ada riwayat timbang</p>}
            </CardContent>
          </Card>
          {weightModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardHeader><CardTitle>Tambah Riwayat Timbang</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label>Bobot (Kg) *</Label><Input type="number" step="0.1" value={weightForm.weight} onChange={e => setWeightForm({ ...weightForm, weight: e.target.value })} placeholder="500" /></div>
                  <div className="space-y-2"><Label>Tanggal *</Label><Input type="date" value={weightForm.measurementDate} onChange={e => setWeightForm({ ...weightForm, measurementDate: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Catatan</Label><Input value={weightForm.notes} onChange={e => setWeightForm({ ...weightForm, notes: e.target.value })} placeholder="Opsional" /></div>
                  <div className="flex justify-end gap-2 pt-4"><Button variant="outline" onClick={() => setWeightModalOpen(false)}>Batal</Button><Button onClick={handleAddWeight}>Simpan</Button></div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="health" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>Riwayat Kesehatan</CardTitle><CardDescription>Daftar riwayat kesehatan dan vaksinasi</CardDescription></div>
              <Button size="sm" onClick={() => setHealthModalOpen(true)}><Plus className="h-4 w-4 mr-2" />Tambah</Button>
            </CardHeader>
            <CardContent>
              {cattle.healthRecords && cattle.healthRecords.length > 0 ? (
                <div className="space-y-2">{cattle.healthRecords.map((h) => (
                  <div key={h.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div><p className="font-medium">{h.healthType}</p><p className="text-xs text-muted-foreground">{format(new Date(h.recordDate), 'dd MMM yyyy')} • Status: {h.status}{h.notes && ` • ${h.notes}`}</p></div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete('health', h.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ))}</div>
              ) : <p className="text-muted-foreground text-center py-8">Belum ada riwayat kesehatan</p>}
            </CardContent>
          </Card>
          {healthModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardHeader><CardTitle>Tambah Riwayat Kesehatan</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label>Jenis *</Label><Select value={healthForm.healthType} onValueChange={v => setHealthForm({ ...healthForm, healthType: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="VACCINATION">Vaksinasi</SelectItem><SelectItem value="CHECKUP">Checkup</SelectItem><SelectItem value="TREATMENT">Pengobatan</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Status *</Label><Select value={healthForm.status} onValueChange={v => setHealthForm({ ...healthForm, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="SEHAT">Sehat</SelectItem><SelectItem value="OBSERVASI">Observasi</SelectItem><SelectItem value="DALAM_PERAWATAN">Dalam Perawatan</SelectItem><SelectItem value="SEMBUH">Sembuh</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Tanggal *</Label><Input type="date" value={healthForm.recordDate} onChange={e => setHealthForm({ ...healthForm, recordDate: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Catatan</Label><Input value={healthForm.notes} onChange={e => setHealthForm({ ...healthForm, notes: e.target.value })} placeholder="Opsional" /></div>
                  <div className="flex justify-end gap-2 pt-4"><Button variant="outline" onClick={() => setHealthModalOpen(false)}>Batal</Button><Button onClick={handleAddHealth}>Simpan</Button></div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="feed" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>Riwayat Pakan</CardTitle><CardDescription>Daftar riwayat pemberian pakan</CardDescription></div>
              <Button size="sm" onClick={() => setFeedModalOpen(true)}><Plus className="h-4 w-4 mr-2" />Tambah</Button>
            </CardHeader>
            <CardContent>
              {cattle.feedRecords && cattle.feedRecords.length > 0 ? (
                <div className="space-y-2">{cattle.feedRecords.map((f) => (
                  <div key={f.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div><p className="font-medium">{f.feedType}</p><p className="text-xs text-muted-foreground">{format(new Date(f.recordDate), 'dd MMM yyyy')} • {f.amount} • {f.frequency}{f.notes && ` • ${f.notes}`}</p></div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete('feed', f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ))}</div>
              ) : <p className="text-muted-foreground text-center py-8">Belum ada riwayat pakan</p>}
            </CardContent>
          </Card>
          {feedModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardHeader><CardTitle>Tambah Riwayat Pakan</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label>Jenis Pakan *</Label><Input value={feedForm.feedType} onChange={e => setFeedForm({ ...feedForm, feedType: e.target.value })} placeholder="Rumput Gajah" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Jumlah *</Label><Input value={feedForm.amount} onChange={e => setFeedForm({ ...feedForm, amount: e.target.value })} placeholder="10 kg" /></div>
                    <div className="space-y-2"><Label>Frekuensi *</Label><Input value={feedForm.frequency} onChange={e => setFeedForm({ ...feedForm, frequency: e.target.value })} placeholder="2x sehari" /></div>
                  </div>
                  <div className="space-y-2"><Label>Tanggal *</Label><Input type="date" value={feedForm.recordDate} onChange={e => setFeedForm({ ...feedForm, recordDate: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Catatan</Label><Input value={feedForm.notes} onChange={e => setFeedForm({ ...feedForm, notes: e.target.value })} placeholder="Opsional" /></div>
                  <div className="flex justify-end gap-2 pt-4"><Button variant="outline" onClick={() => setFeedModalOpen(false)}>Batal</Button><Button onClick={handleAddFeed}>Simpan</Button></div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="media" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Dokumentasi</CardTitle><CardDescription>Foto dan video dokumentasi sapi</CardDescription></CardHeader>
            <CardContent>
              <div className="mb-6">
                <Label>Upload Foto/Video</Label>
                <ImageUploader folder="cattle" onChange={(url) => { console.log('Uploaded:', url); fetchCattle() }} />
              </div>
              {cattle.media && cattle.media.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{cattle.media.map((m) => (
                  <div key={m.id} className="relative aspect-square border rounded-lg overflow-hidden">
                    <img src={m.fileUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">{m.fileType}</div>
                  </div>
                ))}</div>
              ) : <p className="text-muted-foreground text-center py-8">Belum ada dokumentasi</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
