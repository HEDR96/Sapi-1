'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CattleSelect } from '@/components/admin/CattleSelect'
import { Pagination } from '@/components/ui/pagination'
import { VideoUploader } from '@/components/admin/VideoUploader'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { getVideoUrl } from '@/lib/utils/imageUrl'

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
  const [showImageForm, setShowImageForm] = useState(false)
  const [showVideoForm, setShowVideoForm] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => { fetchMedia() }, [selectedCattle, page])

  const fetchMedia = async () => {
    setLoading(true)
    const url = selectedCattle
      ? `/api/admin/media?cattleId=${selectedCattle}&page=${page}&limit=20`
      : `/api/admin/media?page=${page}&limit=20`
    const res = await fetch(url)
    const data = await res.json()
    setMedia(data.media || [])
    if (data.pagination) {
      setTotalPages(data.pagination.totalPages)
    }
    setLoading(false)
  }

  const saveMedia = async (url: string, fileType: string) => {
    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cattleId: selectedCattle,
          fileUrl: url,
          fileType,
          title: null,
        }),
      })
      if (res.ok) {
        setShowImageForm(false)
        setShowVideoForm(false)
        fetchMedia()
      }
    } catch (err) {
      console.error('Failed to save media:', err)
    }
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
        <div className="flex gap-2">
          <Button onClick={() => { setShowImageForm(!showImageForm); setShowVideoForm(false) }}>
            <ImageIcon className="h-4 w-4 mr-2" />Upload Foto
          </Button>
          <Button onClick={() => { setShowVideoForm(!showVideoForm); setShowImageForm(false) }}>
            <Plus className="h-4 w-4 mr-2" />Upload Video
          </Button>
        </div>
      </div>

      {showImageForm && (
        <Card>
          <CardHeader><CardTitle>Upload Foto</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <CattleSelect value={selectedCattle} onChange={setSelectedCattle} />
            <ImageUploader
              folder="cattle"
              maxSize={10}
              onChange={(url) => saveMedia(url, 'IMAGE')}
            />
          </CardContent>
        </Card>
      )}

      {showVideoForm && (
        <Card>
          <CardHeader><CardTitle>Upload Video</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <CattleSelect value={selectedCattle} onChange={setSelectedCattle} />
            <VideoUploader
              folder="video"
              maxSize={100}
              maxDuration={180}
              onUploadComplete={(url) => saveMedia(url, 'VIDEO')}
            />
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
                  {m.fileType.toUpperCase() === 'VIDEO' ? (
                    <video src={getVideoUrl(m.fileUrl)} className="w-full h-full object-cover" />
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
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
