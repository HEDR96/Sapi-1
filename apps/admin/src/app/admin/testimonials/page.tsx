'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Star, Quote, GripVertical } from 'lucide-react'
import { Button } from '@samadya/shared/components/ui/button'
import { Input } from '@samadya/shared/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@samadya/shared/components/ui/card'
import { Label } from '@samadya/shared/components/ui/label'
import { Textarea } from '@samadya/shared/components/ui/textarea'

interface Testimonial {
  id: string
  customerName: string
  content: string
  rating: number
  isActive: boolean
  order: number
  cattleId: string | null
  cattle: { id: string; code: string; name: string } | null
  createdAt: string
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [form, setForm] = useState({
    customerName: '',
    content: '',
    rating: 5,
    isActive: true,
    order: 0,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [draggedId, setDraggedId] = useState<string | null>(null)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/admin/testimonials')
      const data = await res.json()
      setTestimonials(data.testimonials || [])
    } catch (err) {
      console.error('Failed to fetch testimonials:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const url = editingTestimonial
        ? `/api/admin/testimonials?id=${editingTestimonial.id}`
        : '/api/admin/testimonials'
      const method = editingTestimonial ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (res.ok) {
        setModalOpen(false)
        setEditingTestimonial(null)
        setForm({ customerName: '', content: '', rating: 5, isActive: true, order: 0 })
        fetchTestimonials()
      } else {
        setError(data.error || 'Gagal menyimpan')
      }
    } catch (err) {
      console.error('Failed to save testimonial:', err)
      setError('Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setForm({
      customerName: testimonial.customerName,
      content: testimonial.content,
      rating: testimonial.rating,
      isActive: testimonial.isActive,
      order: testimonial.order,
    })
    setError('')
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus testimoni ini?')) return
    try {
      await fetch(`/api/admin/testimonials?id=${id}`, { method: 'DELETE' })
      fetchTestimonials()
    } catch (err) {
      console.error('Failed to delete testimonial:', err)
    }
  }

  const handleToggleActive = async (testimonial: Testimonial) => {
    try {
      await fetch(`/api/admin/testimonials?id=${testimonial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: testimonial.customerName,
          content: testimonial.content,
          rating: testimonial.rating,
          isActive: !testimonial.isActive,
          order: testimonial.order,
        }),
      })
      fetchTestimonials()
    } catch (err) {
      console.error('Failed to toggle testimonial:', err)
    }
  }

  const activeCount = testimonials.filter(t => t.isActive).length

  const handleDrop = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null)
      return
    }

    const current = [...testimonials]
    const fromIndex = current.findIndex(t => t.id === draggedId)
    const toIndex = current.findIndex(t => t.id === targetId)
    if (fromIndex === -1 || toIndex === -1) {
      setDraggedId(null)
      return
    }

    const [moved] = current.splice(fromIndex, 1)
    current.splice(toIndex, 0, moved)

    // Re-number order sequentially and reflect it immediately in the UI
    const reordered = current.map((t, i) => ({ ...t, order: i }))
    setTestimonials(reordered)
    setDraggedId(null)

    // Persist the new sequential order for every item (the list is small,
    // simplest to just re-save all of them rather than diffing positions)
    try {
      await Promise.all(
        reordered.map(t =>
          fetch(`/api/admin/testimonials?id=${t.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerName: t.customerName,
              content: t.content,
              rating: t.rating,
              isActive: t.isActive,
              order: t.order,
            }),
          })
        )
      )
    } catch (err) {
      console.error('Failed to persist testimonial order:', err)
      fetchTestimonials()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Testimoni</h2>
          <p className="text-muted-foreground">
            Kelola testimoni yang ditampilkan di website ({activeCount} aktif)
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTestimonial(null)
            setForm({ customerName: '', content: '', rating: 5, isActive: true, order: 0 })
            setError('')
            setModalOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Testimoni
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : testimonials.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Quote className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Belum ada testimoni</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              draggable
              onDragStart={() => setDraggedId(testimonial.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                handleDrop(testimonial.id)
              }}
              onDragEnd={() => setDraggedId(null)}
              className={`relative transition-opacity ${!testimonial.isActive ? 'opacity-60' : ''} ${
                draggedId === testimonial.id ? 'opacity-40' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing" />
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < testimonial.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      testimonial.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {testimonial.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-4 mb-3">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                <div className="border-t pt-3">
                  <p className="font-semibold text-sm">{testimonial.customerName}</p>
                  {testimonial.cattle && (
                    <p className="text-xs text-muted-foreground">
                      Tentang {testimonial.cattle.name} ({testimonial.cattle.code})
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(testimonial)}
                    className="flex-1"
                  >
                    {testimonial.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(testimonial)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(testimonial.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg bg-white shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {editingTestimonial ? 'Edit Testimoni' : 'Tambah Testimoni'}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Nama Pelanggan *</Label>
                  <Input
                    value={form.customerName}
                    onChange={(e) =>
                      setForm({ ...form, customerName: e.target.value })
                    }
                    placeholder="Nama lengkap pelanggan"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Testimoni *</Label>
                  <Textarea
                    value={form.content}
                    onChange={(e) =>
                      setForm({ ...form, content: e.target.value })
                    }
                    placeholder="Isi testimoni dari pelanggan..."
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setForm({ ...form, rating: star })}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= form.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Urutan Tampilan</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.order}
                    onChange={(e) =>
                      setForm({ ...form, order: parseInt(e.target.value) || 0 })
                    }
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Urutan lebih kecil ditampilkan lebih dulu
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isActive" className="font-normal">
                    Aktifkan testimoni ini
                  </Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={saving}>
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
