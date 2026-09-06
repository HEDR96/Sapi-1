'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Loader2, Plus, Pencil, Trash2, Scale, Heart, UtensilsCrossed, Image as ImageIcon, X } from 'lucide-react'
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
import { getDirectImageUrl, getVideoUrl } from '@samadya/shared/lib/utils/imageUrl'

// Format number with thousand separator
const formatNumber = (num: number): string => {
  return num.toLocaleString('id-ID')
}

// Format float with max 2 decimal places
const formatFloat = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '-'
  return Number(num.toFixed(2)).toLocaleString('id-ID')
}

interface MasterData {
  id: string
  category: string
  key: string
  value: string
}

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
  const [uploadedMediaUrls, setUploadedMediaUrls] = useState<string[]>([])
  const [mediaSaving, setMediaSaving] = useState(false)

  // Master data states
  const [feedTypes, setFeedTypes] = useState<MasterData[]>([])
  const [healthStatuses, setHealthStatuses] = useState<MasterData[]>([])
  const [healthTypes, setHealthTypes] = useState<MasterData[]>([])
  const [cattleBreeds, setCattleBreeds] = useState<MasterData[]>([])
  const [cattleStatuses, setCattleStatuses] = useState<MasterData[]>([])
  const [loadingMasterData, setLoadingMasterData] = useState(false)

  // Modal states
  const [weightModalOpen, setWeightModalOpen] = useState(false)
  const [weightForm, setWeightForm] = useState({ weight: '', measurementDate: '', notes: '' })
  const [weightSaving, setWeightSaving] = useState(false)
  const [healthModalOpen, setHealthModalOpen] = useState(false)
  const [healthForm, setHealthForm] = useState({ healthType: 'VACCINATION', status: 'SEHAT', recordDate: '', notes: '' })
  const [healthSaving, setHealthSaving] = useState(false)
  const [feedModalOpen, setFeedModalOpen] = useState(false)
  const [feedForm, setFeedForm] = useState({ feedType: '', amount: '', frequency: '', recordDate: '', notes: '' })
  const [feedSaving, setFeedSaving] = useState(false)

  // Fetch master data
  const fetchMasterData = async () => {
    try {
      setLoadingMasterData(true)
      // Add cache-busting timestamp
      const res = await fetch(`/api/admin/master-data?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      if (res.ok) {
        const data = await res.json()
        const items = data.items || []
        setFeedTypes(items.filter((m: MasterData) => m.category === 'JENIS_PAKAN'))
        setHealthStatuses(items.filter((m: MasterData) => m.category === 'STATUS_KESEHATAN'))
        setHealthTypes(items.filter((m: MasterData) => m.category === 'JENIS_KESEHATAN'))
        setCattleBreeds(items.filter((m: MasterData) => m.category === 'JENIS_SAPI'))
        setCattleStatuses(items.filter((m: MasterData) => m.category === 'STATUS_SAPI'))
      }
    } catch (error) {
      console.error('Failed to fetch master data:', error)
    } finally {
      setLoadingMasterData(false)
    }
  }

  useEffect(() => { fetchCattle(); fetchMasterData() }, [cattleId])

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
    setWeightSaving(true)
    try {
      await fetch(`/api/admin/cattle/${cattleId}/weights`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ weight: parseFloat(weightForm.weight), measurementDate: weightForm.measurementDate, notes: weightForm.notes || null }) })
      setWeightModalOpen(false); setWeightForm({ weight: '', measurementDate: '', notes: '' }); fetchCattle()
    } catch (error) { console.error('Failed to add weight:', error) } finally {
      setWeightSaving(false)
    }
  }

  const handleAddHealth = async () => {
    setHealthSaving(true)
    try {
      await fetch(`/api/admin/cattle/${cattleId}/health`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ healthType: healthForm.healthType, status: healthForm.status, recordDate: healthForm.recordDate, notes: healthForm.notes || null }) })
      setHealthModalOpen(false); setHealthForm({ healthType: 'VACCINATION', status: 'SEHAT', recordDate: '', notes: '' }); fetchCattle()
    } catch (error) { console.error('Failed to add health record:', error) } finally {
      setHealthSaving(false)
    }
  }

  const handleAddFeed = async () => {
    setFeedSaving(true)
    try {
      await fetch(`/api/admin/cattle/${cattleId}/feed`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feedType: feedForm.feedType, amount: feedForm.amount, frequency: feedForm.frequency, recordDate: feedForm.recordDate, notes: feedForm.notes || null }) })
      setFeedModalOpen(false); setFeedForm({ feedType: '', amount: '', frequency: '', recordDate: '', notes: '' }); fetchCattle()
    } catch (error) { console.error('Failed to add feed record:', error) } finally {
      setFeedSaving(false)
    }
  }

  const handleDelete = async (type: string, id: string) => {
    if (!confirm(`Hapus ${type} ini?`)) return
    try {
      const url = `/api/admin/cattle/${cattleId}/${type}?id=${id}`
      console.log('[handleDelete] URL:', url)
      const res = await fetch(url, { method: 'DELETE' })
      const data = await res.json()
      console.log('[handleDelete] Response:', data)
      if (!res.ok) {
        alert(`Gagal hapus: ${data.error}`)
      }
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
                    <div className="space-y-2"><Label>Jenis</Label>
                      <Select value={form.breed} onValueChange={(v: string) => setForm({ ...form, breed: v })} disabled={loadingMasterData || editing}>
                        <SelectTrigger><SelectValue placeholder={loadingMasterData ? 'Memuat...' : 'Pilih jenis sapi'} /></SelectTrigger>
                        <SelectContent>{cattleBreeds.map((b) => <SelectItem key={b.id} value={b.key}>{b.value}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>Status</Label>
                      <Select value={form.status} onValueChange={(v: string) => setForm({ ...form, status: v })} disabled={loadingMasterData || editing}>
                        <SelectTrigger><SelectValue placeholder={loadingMasterData ? 'Memuat...' : 'Pilih status'} /></SelectTrigger>
                        <SelectContent>{cattleStatuses.map((s) => <SelectItem key={s.id} value={s.key}>{s.value}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
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
                    <div><p className="text-xs text-muted-foreground">Tinggi</p><p className="font-medium">{cattle.height ? `${formatFloat(cattle.height)} cm` : '-'}</p></div>
                    <div><p className="text-xs text-muted-foreground">Harga Jual</p><p className="font-medium">{formatCurrency(cattle.price)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Harga Beli</p><p className="font-medium">{cattle.buyPrice ? formatCurrency(cattle.buyPrice) : '-'}</p></div>
                    <div><p className="text-xs text-muted-foreground">Target Bobot</p><p className="font-medium">{cattle.targetWeight ? `${formatFloat(cattle.targetWeight)} Kg` : '-'}</p></div>
                    <div><p className="text-xs text-muted-foreground">Bobot Terakhir</p><p className="font-medium">{cattle.lastWeight ? `${formatFloat(cattle.lastWeight)} Kg` : '-'}</p></div>
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
                    <div><p className="text-xs text-muted-foreground">Rata-rata</p><p className="text-2xl font-bold">{formatFloat(cattle.weightStats.avgWeight)} Kg</p></div>
                    <div><p className="text-xs text-muted-foreground">ADG</p><p className="text-2xl font-bold">{formatFloat(cattle.weightStats.adg)} Kg/hari</p></div>
                    <div><p className="text-xs text-muted-foreground">Min</p><p className="font-medium">{formatFloat(cattle.weightStats.minWeight)} Kg</p></div>
                    <div><p className="text-xs text-muted-foreground">Max</p><p className="font-medium">{formatFloat(cattle.weightStats.maxWeight)} Kg</p></div>
                    <div className="col-span-2"><p className="text-xs text-muted-foreground">Total Records</p><p className="font-medium">{formatNumber(cattle.weightStats.totalRecords)} kali pengukuran</p></div>
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
                    <div><p className="font-medium">{formatFloat(w.weight)} Kg</p><p className="text-xs text-muted-foreground">{format(new Date(w.measurementDate), 'dd MMM yyyy')}{w.notes && ` • ${w.notes}`}</p></div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete('weights', w.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ))}</div>
              ) : <p className="text-muted-foreground text-center py-8">Belum ada riwayat timbang</p>}
            </CardContent>
          </Card>
          {weightModalOpen && (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4 bg-white shadow-xl">
                <CardHeader><CardTitle>Tambah Riwayat Timbang</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label>Bobot (Kg) *</Label><Input type="number" step="0.01" min="0" value={weightForm.weight} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeightForm({ ...weightForm, weight: e.target.value })} placeholder="500.00" /></div>
                  <div className="space-y-2"><Label>Tanggal *</Label><Input type="date" value={weightForm.measurementDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeightForm({ ...weightForm, measurementDate: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Catatan</Label><Input value={weightForm.notes} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeightForm({ ...weightForm, notes: e.target.value })} placeholder="Opsional" /></div>
                  <div className="flex justify-end gap-2 pt-4"><Button variant="outline" onClick={() => setWeightModalOpen(false)} disabled={weightSaving}>Batal</Button><Button onClick={handleAddWeight} disabled={weightSaving}>{weightSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Simpan</Button></div>
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
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4 bg-white shadow-xl">
                <CardHeader><CardTitle>Tambah Riwayat Kesehatan</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Jenis *</Label>
                    {loadingMasterData ? (
                      <Input disabled placeholder="Memuat..." />
                    ) : (
                      <Select value={healthForm.healthType} onValueChange={(v: string) => setHealthForm({ ...healthForm, healthType: v })}>
                        <SelectTrigger><SelectValue placeholder="Pilih jenis kesehatan" /></SelectTrigger>
                        <SelectContent>
                          {healthTypes.map((t) => <SelectItem key={t.id} value={t.key}>{t.value}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Status *</Label>
                    {loadingMasterData ? (
                      <Input disabled placeholder="Memuat..." />
                    ) : (
                      <Select value={healthForm.status} onValueChange={(v: string) => setHealthForm({ ...healthForm, status: v })}>
                        <SelectTrigger><SelectValue placeholder="Pilih status kesehatan" /></SelectTrigger>
                        <SelectContent>
                          {healthStatuses.map((s) => <SelectItem key={s.id} value={s.key}>{s.value}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-2"><Label>Tanggal *</Label><Input type="date" value={healthForm.recordDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHealthForm({ ...healthForm, recordDate: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Catatan</Label><Input value={healthForm.notes} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHealthForm({ ...healthForm, notes: e.target.value })} placeholder="Opsional" /></div>
                  <div className="flex justify-end gap-2 pt-4"><Button variant="outline" onClick={() => setHealthModalOpen(false)} disabled={healthSaving}>Batal</Button><Button onClick={handleAddHealth} disabled={healthSaving}>{healthSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Simpan</Button></div>
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
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4 bg-white shadow-xl">
                <CardHeader><CardTitle>Tambah Riwayat Pakan</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Jenis Pakan *</Label>
                    {loadingMasterData ? (
                      <Input disabled placeholder="Memuat..." />
                    ) : feedTypes.length > 0 ? (
                      <Select value={feedForm.feedType} onValueChange={(v: string) => setFeedForm({ ...feedForm, feedType: v })}>
                        <SelectTrigger><SelectValue placeholder="Pilih jenis pakan" /></SelectTrigger>
                        <SelectContent>
                          {feedTypes.map((f) => (
                            <SelectItem key={f.id} value={f.key}>{f.value}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        Tambahkan data di menu Master Data
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Jumlah *</Label><Input value={feedForm.amount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFeedForm({ ...feedForm, amount: e.target.value })} placeholder="10 kg" /></div>
                    <div className="space-y-2"><Label>Frekuensi *</Label><Input value={feedForm.frequency} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFeedForm({ ...feedForm, frequency: e.target.value })} placeholder="2x sehari" /></div>
                  </div>
                  <div className="space-y-2"><Label>Tanggal *</Label><Input type="date" value={feedForm.recordDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFeedForm({ ...feedForm, recordDate: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Catatan</Label><Input value={feedForm.notes} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFeedForm({ ...feedForm, notes: e.target.value })} placeholder="Opsional" /></div>
                  <div className="flex justify-end gap-2 pt-4"><Button variant="outline" onClick={() => setFeedModalOpen(false)} disabled={feedSaving}>Batal</Button><Button onClick={handleAddFeed} disabled={feedSaving}>{feedSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Simpan</Button></div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="media" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Dokumentasi</CardTitle><CardDescription>Foto dan video dokumentasi sapi</CardDescription></CardHeader>
            <CardContent>
              <div className="mb-6 space-y-4">
                <Label>Upload Foto/Video</Label>
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
                    <button
                      type="button"
                      onClick={() => setUploadedMediaUrls(uploadedMediaUrls.filter((_, i) => i !== index))}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      title="Hapus"
                    >
                      <X className="h-4 w-4" />
                    </button>
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
                {uploadedMediaUrls.filter(u => u).length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      onClick={async () => {
                        const validUrls = uploadedMediaUrls.filter(u => u)
                        if (validUrls.length === 0) return
                        setMediaSaving(true)
                        try {
                          for (const url of validUrls) {
                            const isVideo = url.includes('/api/stream')
                            const res = await fetch('/api/admin/media', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                cattleId: cattleId,
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
                          setUploadedMediaUrls([])
                          fetchCattle()
                          alert('Media berhasil disimpan!')
                        } catch (err: any) {
                          console.error('Failed to save media:', err)
                          alert(err.message || 'Terjadi kesalahan saat menyimpan media')
                        } finally {
                          setMediaSaving(false)
                        }
                      }}
                      disabled={mediaSaving}
                    >
                      {mediaSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Simpan Semua Media
                    </Button>
                  </div>
                )}
              </div>
              {cattle.media && cattle.media.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{cattle.media.map((m) => (
                  <div key={m.id} className="relative aspect-square border rounded-lg overflow-hidden group">
                    {m.fileType === 'VIDEO' || m.fileUrl.includes('/api/stream') || m.fileUrl.includes('/api/videos') ? (
                      <video
                        src={getVideoUrl(m.fileUrl)}
                        className="w-full h-full object-cover"
                        controls
                        preload="metadata"
                      />
                    ) : (
                      <img src={getDirectImageUrl(m.fileUrl)} alt="" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">{m.fileType}</div>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm('Hapus media ini?')) return
                        try {
                          const res = await fetch(`/api/admin/media?id=${m.id}`, { method: 'DELETE' })
                          if (res.ok) {
                            fetchCattle()
                          } else {
                            const data = await res.json()
                            alert(data.error || 'Gagal hapus media')
                          }
                        } catch (err) {
                          console.error('Delete media error:', err)
                          alert('Gagal hapus media')
                        }
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      title="Hapus media"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
