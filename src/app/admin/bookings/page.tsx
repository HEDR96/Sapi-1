'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { Check, X, Clock, Filter } from 'lucide-react'

interface Booking {
  id: string
  quantity: number
  notes: string | null
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  createdAt: string
  cattle: {
    id: string
    code: string
    name: string
    mainImage: string | null
    price: number
    quantity: number
  }
  user: {
    id: string
    name: string | null
    email: string
  }
}

const statusConfig = {
  PENDING: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  CONFIRMED: { label: 'Diterima', color: 'bg-green-100 text-green-700', icon: Check },
  CANCELLED: { label: 'Ditolak', color: 'bg-red-100 text-red-700', icon: X },
  COMPLETED: { label: 'Selesai', color: 'bg-blue-100 text-blue-700', icon: Check },
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [statusFilter])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const url = `/api/admin/bookings${statusFilter !== 'ALL' ? `?status=${statusFilter}` : ''}`
      const res = await fetch(url)
      const data = await res.json()
      setBookings(data.bookings || [])
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    if (!confirm(action === 'approve' ? 'Terima booking ini?' : 'Tolak booking ini?')) return

    setProcessingId(id)
    try {
      const res = await fetch(`/api/admin/bookings?id=${id}&action=${action}`, {
        method: 'PUT',
      })

      if (res.ok) {
        fetchBookings()
      }
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[hsl(var(--forest))]">Manajemen Booking</h1>
        <p className="text-[hsl(var(--forest))/60]">Kelola permintaan booking dari pelanggan</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[hsl(var(--forest))/60]" />
          <span className="text-sm font-medium text-[hsl(var(--forest))]">Status:</span>
        </div>
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-[hsl(var(--forest))] text-white'
                  : 'bg-white border border-[hsl(var(--line))] text-[hsl(var(--forest))/70] hover:bg-[hsl(var(--cream))]'
              }`}
            >
              {status === 'ALL' ? 'Semua' : statusConfig[status as keyof typeof statusConfig]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(statusConfig).map(([key, config]) => {
          const count = bookings.filter(b => b.status === key).length
          return (
            <div key={key} className="bg-white rounded-lg border border-[hsl(var(--line))] p-4">
              <div className="flex items-center gap-2 mb-2">
                <config.icon className="h-4 w-4 text-[hsl(var(--forest))/60]" />
                <span className="text-sm text-[hsl(var(--forest))/60]">{config.label}</span>
              </div>
              <p className="text-2xl font-bold text-[hsl(var(--forest))]">{count}</p>
            </div>
          )
        })}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-white rounded-lg border border-[hsl(var(--line))] p-4 h-32" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-[hsl(var(--line))]">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-[hsl(var(--forest))/60]">Belum ada booking</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-lg border border-[hsl(var(--line))] overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Cattle Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-[hsl(var(--cream))] flex-shrink-0">
                    {booking.cattle.mainImage ? (
                      <Image
                        src={booking.cattle.mainImage}
                        alt={booking.cattle.name}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[hsl(var(--forest))/30]">
                        🐂
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-[hsl(var(--forest))]">
                          {booking.cattle.name}
                        </h3>
                        <p className="text-xs text-[hsl(var(--forest))/60]">
                          {booking.cattle.code}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[booking.status].color}`}>
                        {statusConfig[booking.status].label}
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div>
                        <span className="text-[hsl(var(--forest))/60]">Qty: </span>
                        <span className="font-medium">{booking.quantity}</span>
                      </div>
                      <div>
                        <span className="text-[hsl(var(--forest))/60]">Total: </span>
                        <span className="font-medium">{formatCurrency(Number(booking.cattle.price) * booking.quantity)}</span>
                      </div>
                    </div>

                    {booking.notes && (
                      <p className="mt-2 text-xs text-[hsl(var(--forest))/70] bg-[hsl(var(--cream))] p-2 rounded">
                        Catatan: {booking.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* User & Actions */}
              <div className="px-4 py-3 bg-[hsl(var(--cream))]/50 border-t border-[hsl(var(--line))]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[hsl(var(--forest))]">
                      {booking.user.name || 'User'}
                    </p>
                    <p className="text-xs text-[hsl(var(--forest))/60]">{booking.user.email}</p>
                    <p className="text-xs text-[hsl(var(--forest))/50] mt-1">
                      {formatDate(booking.createdAt)}
                    </p>
                  </div>

                  {booking.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(booking.id, 'reject')}
                        disabled={processingId === booking.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Tolak
                      </button>
                      <button
                        onClick={() => handleAction(booking.id, 'approve')}
                        disabled={processingId === booking.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-sm font-medium hover:bg-green-100 disabled:opacity-50 transition-colors"
                      >
                        <Check className="h-4 w-4" />
                        Terima
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
