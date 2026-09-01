'use client'

import { ShieldCheck, Menu, User, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useLogout } from '@/components/auth/LogoutButton'
import { useState } from 'react'
import { NotificationDropdown, useNotifications } from './NotificationDropdown'

interface AdminHeaderProps {
  onMenuClick?: () => void
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { handleLogout } = useLogout()
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[hsl(var(--line))] bg-white px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1 rounded hover:bg-gray-100"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5 text-[hsl(var(--forest))]" />
        </button>
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-full border border-[hsl(var(--forest))/30] bg-[hsl(var(--forest))]">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <span className="hidden sm:block text-[13px] font-extrabold tracking-[.08em] text-[hsl(var(--forest))]">
            samadyafarm.id
          </span>
          <span className="hidden sm:block text-[8px] text-[hsl(var(--forest))/60]">ADMIN</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-[hsl(var(--cream))]"
            aria-label="Notifications"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[hsl(var(--forest))]"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <NotificationDropdown
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAllRead={markAllAsRead}
            onMarkRead={markAsRead}
          />
        </div>

        <button className="flex items-center gap-2 rounded-full hover:bg-[hsl(var(--cream))] p-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-[hsl(var(--cream))]">
            <User className="h-4 w-4 text-[hsl(var(--forest))]" />
          </div>
          <span className="hidden md:block text-[11px] font-medium text-[hsl(var(--forest))]">Admin</span>
        </button>
        <button
          onClick={handleLogout}
          className="grid h-9 w-9 place-items-center rounded-full hover:bg-red-50 text-[hsl(var(--forest))/60] hover:text-red-600"
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
