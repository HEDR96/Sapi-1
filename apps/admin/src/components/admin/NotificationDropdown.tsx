'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Check, CheckCheck } from 'lucide-react'
import Link from 'next/link'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  data?: string
}

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
  notifications: Notification[]
  unreadCount: number
  onMarkAllRead: () => void
  onMarkRead: (id: string) => void
}

export function NotificationDropdown({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkAllRead,
  onMarkRead,
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Baru saja'
    if (minutes < 60) return `${minutes}m lalu`
    if (hours < 24) return `${hours}j lalu`
    if (days < 7) return `${days}h lalu`
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BOOKING_REQUEST':
        return 'text-blue-600 bg-blue-50'
      case 'BOOKING_APPROVED':
        return 'text-green-600 bg-green-50'
      case 'BOOKING_REJECTED':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-[hsl(var(--line))] bg-white shadow-xl z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-[hsl(var(--line))] px-4 py-3">
        <h3 className="font-semibold text-[hsl(var(--forest))]">Notifikasi</h3>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-xs text-[hsl(var(--forest))/60 hover:text-[hsl(var(--forest))]"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Tandai semua baca
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[hsl(var(--forest))]/40">
            <Bell className="h-12 w-12 mb-2" />
            <p className="text-sm">Tidak ada notifikasi</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`relative border-b border-[hsl(var(--line))]/50 px-4 py-3 hover:bg-[hsl(var(--cream))]/50 transition-colors ${
                !notification.isRead ? 'bg-[hsl(var(--forest))]/5' : ''
              }`}
            >
              <div className="flex gap-3">
                <div className={`mt-0.5 rounded-full p-1.5 ${getTypeColor(notification.type)}`}>
                  <Bell className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[hsl(var(--forest))] truncate">
                    {notification.title}
                  </p>
                  <p className="text-xs text-[hsl(var(--forest))/60 mt-0.5 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-[10px] text-[hsl(var(--forest))/40 mt-1">
                    {formatTime(notification.createdAt)}
                  </p>
                </div>
                {!notification.isRead && (
                  <button
                    onClick={() => onMarkRead(notification.id)}
                    className="flex-shrink-0 rounded-full p-1 hover:bg-[hsl(var(--forest))]/10 text-[hsl(var(--forest))]/40 hover:text-[hsl(var(--forest))]"
                    title="Tandai baca"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Link
        href="/admin/notifications"
        className="block border-t border-[hsl(var(--line))] px-4 py-3 text-center text-sm font-medium text-[hsl(var(--forest))] hover:bg-[hsl(var(--cream))]/50 transition-colors"
        onClick={onClose}
      >
        Lihat semua notifikasi
      </Link>
    </div>
  )
}

// Hook for managing notifications
export function useNotifications(enabled: boolean = true) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const fetchUnreadCount = async () => {
    if (!enabled) return
    try {
      const res = await fetch('/api/notifications/unread-count')
      const data = await res.json()
      setUnreadCount(data.count || 0)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const fetchNotifications = async () => {
    if (!enabled) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/notifications?limit=10')
      const data = await res.json()
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    if (!enabled) return
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!enabled) return
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  useEffect(() => {
    if (enabled) {
      fetchUnreadCount()
      fetchNotifications()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  }
}
