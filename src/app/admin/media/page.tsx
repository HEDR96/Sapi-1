'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Image as ImageIcon, Video } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CattleSelect } from '@/components/admin/CattleSelect'

interface MediaItem {
  id: string
  cattleId: string
  fileUrl: string
  fileType: string
  title: string | null
  cattle: { id: string; code: string; name: string }
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCattle, setSelectedCattle] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchMedia() }, [selectedCattle])

  const fetchMedia = async () => {
    setLoading(true)
    const url = selectedCattle ? `/api/admin/media?cattleId=${selectedCattle}` : '/api/admin/media'
    const res = await fetch(url)
    const data = await res.json()
    setMedia(data.media || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedCattle || !fileRef.current?.files?.[0]) return

    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('cattleId', selectedCattle)
      formData.append('file', fileRef.current.files[0])

      const res = await fetch('/api/admin/media', { method: 'POST', body: formData })
      if (res.ok) {
        setShowForm(false)
        if (fileRef.current) fileRef.current.value = ''
        fetchMedia()
      }
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus media ini?')) return
    await fetch(`/api/admin/media?id=${id}`, { method: 'DELETE' })
    fetchMedia()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dokumentasi</h1>
          <p className="text-muted-foreground">Kelola foto dan video sapi</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" />Upload Media</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Upload Media</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <CattleSelect value={selectedCattle} onChange={setSelectedCattle} />
              <div>
                <label className="text-sm font-medium">File (Foto/Video)</label>
                <input ref={fileRef} type="file" accept="image/*,video/*" className="w-full mt-1" required />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving || !selectedCattle}>{saving ? 'Mengupload...' : 'Upload'}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Galeri Media</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-center py-8 text-muted-foreground">Memuat...</p>
          : media.length === 0 ? <p className="text-center py-8 text-muted-foreground">Belum ada media</p>
          : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {media.map((m) => (
                <div key={m.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  {m.fileType === 'VIDEO' ? (
                    <video src={m.fileUrl} className="w-full h-full object-cover" />
                  ) : (
                    <Image src={m.fileUrl} alt={m.title || ''} fill className="object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)}>
                      <Trash2 className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70">
                    <p className="text-white text-xs truncate">{m.cattle.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
