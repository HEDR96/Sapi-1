'use client'

import { useState } from 'react'
import { X, Loader2, Phone, Package, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  cattle: {
    id: string
    name: string
    code: string
    price: number
    quantity: number
  }
  onSuccess?: () => void
}

export function BookingModal({ isOpen, onClose, cattle, onSuccess }: BookingModalProps) {
  const [phone, setPhone] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate phone format
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      setError('Format nomor telepon tidak valid')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cattleId: cattle.id,
          phone: phone.trim(),
          quantity,
          notes: notes.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat booking')
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
        onClose()
        setPhone('')
        setQuantity(1)
        setNotes('')
        setSuccess(false)
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--line))]">
          <h2 className="text-lg font-bold text-[hsl(var(--forest))]">
            Booking Sekarang
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[hsl(var(--cream))] rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-[hsl(var(--forest))]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-[hsl(var(--forest))] mb-2">
                Booking Terkirim!
              </h3>
              <p className="text-sm text-[hsl(var(--forest))/70]">
                Permintaan booking Anda sedang diproses. Admin akan menghubungi Anda soon.
              </p>
            </div>
          ) : (
            <>
              {/* Cattle Info */}
              <div className="bg-[hsl(var(--cream))] rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-[hsl(var(--forest))]">{cattle.name}</p>
                    <p className="text-xs text-[hsl(var(--forest))/60]">{cattle.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[hsl(var(--forest))]">{formatCurrency(cattle.price)}</p>
                    <p className="text-xs text-[hsl(var(--forest))/60]">Stok: {cattle.quantity}</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Phone */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--forest))] mb-1.5">
                    <Phone className="h-4 w-4" />
                    Nomor Telepon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    required
                    className="w-full rounded-lg border border-[hsl(var(--line))] px-3 py-2.5 text-sm text-[hsl(var(--forest))] placeholder:text-[hsl(var(--forest))/50] focus:border-[hsl(var(--forest))] focus:ring-2 focus:ring-[hsl(var(--forest))] focus:outline-none"
                  />
                  <p className="text-xs text-[hsl(var(--forest))/50] mt-1">
                    Admin akan menghubungi Anda via WhatsApp/telepon
                  </p>
                </div>

                {/* Quantity */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--forest))] mb-1.5">
                    <Package className="h-4 w-4" />
                    Jumlah
                  </label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full rounded-lg border border-[hsl(var(--line))] px-3 py-2.5 text-sm text-[hsl(var(--forest))] bg-white focus:border-[hsl(var(--forest))] focus:ring-2 focus:ring-[hsl(var(--forest))] focus:outline-none"
                  >
                    {Array.from({ length: cattle.quantity }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--forest))] mb-1.5">
                    <FileText className="h-4 w-4" />
                    Catatan <span className="text-[hsl(var(--forest))/50]">(opsional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Catatan tambahan untuk admin..."
                    rows={3}
                    maxLength={500}
                    className="w-full rounded-lg border border-[hsl(var(--line))] px-3 py-2.5 text-sm text-[hsl(var(--forest))] placeholder:text-[hsl(var(--forest))/50] focus:border-[hsl(var(--forest))] focus:ring-2 focus:ring-[hsl(var(--forest))] focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !phone}
                  className="w-full bg-[hsl(var(--gold))] text-[hsl(var(--forest))] py-3 rounded-lg font-bold hover:bg-[hsl(var(--gold))/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Kirim Permintaan Booking'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
