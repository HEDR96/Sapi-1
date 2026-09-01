'use client'

import { useState } from 'react'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { useNotifications } from '@/components/admin/NotificationDropdown'

export default function AdminNotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.isRead)
    : notifications

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTypeBadge = (type: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      BOOKING_REQUEST: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Permintaan Booking' },
      BOOKING_APPROVED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Booking Disetujui' },
      BOOKING_REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Booking Ditolak' },
      INFO: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Info' },
    }
    const style = styles[type] || styles.INFO
    return (
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    )
  }

  const getNotificationLink = (data: string | undefined) => {
    if (!data) return '#'
    try {
      const parsed = JSON.parse(data)
      if (parsed?.bookingId) return '/admin/bookings'
    } catch {}
    return '#'
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--forest))]">Notifikasi</h1>
          <p className="text-sm text-[hsl(var(--forest))]/60 mt-1">
            {unreadCount > 0
              ? `${unreadCount} notifikasi belum dibaca`
              : 'Semua notifikasi sudah dibaca'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 rounded-lg border border-[hsl(var(--forest))]/20 bg-white px-4 py-2 text-sm font-medium text-[hsl(var(--forest))] transition-colors hover:bg-[hsl(var(--cream))]"
          >
            <CheckCheck className="h-4 w-4" />
            Tandai semua baca
          </button>
        )}
      </div>

      <div className="mb-4 flex items-center gap-2 border-b border-[hsl(var(--line))]">
        <button
          onClick={() => setFilter('all')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'border-[hsl(var(--forest))] text-[hsl(var(--forest))]'
              : 'border-transparent text-[hsl(var(--forest))]/60 hover:text-[hsl(var(--forest))]'
          }`}
        >
          Semua
          <span className="rounded-full bg-[hsl(var(--cream))] px-2 py-0.5 text-xs">
            {notifications.length}
          </span>
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            filter === 'unread'
              ? 'border-[hsl(var(--forest))] text-[hsl(var(--forest))]'
              : 'border-transparent text-[hsl(var(--forest))]/60 hover:text-[hsl(var(--forest))]'
          }`}
        >
          Belum dibaca
          {unreadCount > 0 && (
            <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-50 px-1.5 text-xs text-red-600">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--line))] py-16 text-center">
            <Bell className="h-16 w-16 text-[hsl(var(--forest))]/20 mb-4" />
            <p className="text-lg font-medium text-[hsl(var(--forest))]/60">
              {filter === 'unread' ? 'Tidak ada notifikasi belum dibaca' : 'Belum ada notifikasi'}
            </p>
            <p className="text-sm text-[hsl(var(--forest))]/40 mt-1">
              Notifikasi akan muncul ketika ada permintaan booking baru
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`group relative rounded-xl border transition-all ${
                !notification.isRead
                  ? 'border-[hsl(var(--forest))]/20 bg-[hsl(var(--forest))]/5'
                  : 'border-[hsl(var(--line))] bg-white hover:border-[hsl(var(--forest))]/30'
              }`}
            >
              {!notification.isRead && (
                <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-[hsl(var(--forest))]" />
              )}
              <div className="flex gap-4 p-4">
                <div
                  className={`mt-1 flex-shrink-0 rounded-full p-2 ${
                    !notification.isRead ? 'bg-[hsl(var(--forest))]/10' : 'bg-[hsl(var(--cream))]'
                  }`}
                >
                  <Bell
                    className={`h-5 w-5 ${
                      !notification.isRead ? 'text-[hsl(var(--forest))]' : 'text-[hsl(var(--forest))]/50'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`font-medium ${
                            !notification.isRead
                              ? 'text-[hsl(var(--forest))]'
                              : 'text-[hsl(var(--forest))]/80'
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {getTypeBadge(notification.type)}
                      </div>
                      <p
                        className={`mt-1 text-sm ${
                          !notification.isRead
                            ? 'text-[hsl(var(--forest))]/70'
                            : 'text-[hsl(var(--forest))]/50'
                        }`}
                      >
                        {notification.message}
                      </p>
                      <p className="mt-2 text-xs text-[hsl(var(--forest))]/40">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="rounded-full p-2 text-[hsl(var(--forest))]/40 hover:bg-[hsl(var(--forest))]/10 hover:text-[hsl(var(--forest))] transition-colors"
                          title="Tandai baca"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <a
                        href={getNotificationLink(notification.data)}
                        className="rounded-full px-3 py-1.5 text-xs font-medium text-[hsl(var(--forest))] hover:bg-[hsl(var(--cream))] transition-colors"
                      >
                        Lihat
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
