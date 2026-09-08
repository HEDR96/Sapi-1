'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Beef,
  Eye,
  X,
  TrendingUp,
  UserCheck,
  Database,
  ChevronDown,
  MessageSquareQuote,
} from 'lucide-react'

// Consolidated nav - per redesign plan
const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/visitors', icon: Eye, label: 'Pengunjung' },
  { href: '/admin/cattle', icon: Beef, label: 'Manajemen Sapi', hasSubmenu: true },
  { href: '/admin/sales', icon: TrendingUp, label: 'Penjualan' },
  { href: '/admin/customers', icon: UserCheck, label: 'Pelanggan' },
  { href: '/admin/testimonials', icon: MessageSquareQuote, label: 'Testimoni' },
  { href: '/admin/master-data', icon: Database, label: 'Master Data' },
]

// Submenu items for cattle management - consolidated per plan
// All tabs: Riwayat Timbang, Riwayat Kesehatan, Riwayat Pakan, Dokumentasi are now inside cattle detail page
const cattleSubmenu = [
  { href: '/admin/cattle', label: 'Daftar Sapi' },
  { href: '/admin/cattle/new', label: 'Tambah Sapi' },
]

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const [pendingBookingsCount, setPendingBookingsCount] = useState(0)
  const [cattleSubmenuOpen, setCattleSubmenuOpen] = useState(false)

  useEffect(() => {
    fetch('/api/admin/bookings?status=PENDING')
      .then(res => res.json())
      .then(data => setPendingBookingsCount(data.bookings?.length || 0))
      .catch(() => {})
  }, [])

  // Check if current path is under cattle management
  useEffect(() => {
    if (pathname?.startsWith('/admin/cattle')) {
      setCattleSubmenuOpen(true)
    }
  }, [pathname])

  const handleLinkClick = () => {
    if (onClose && window.innerWidth < 1024) {
      onClose()
    }
  }

  const isCattleActive = pathname?.startsWith('/admin/cattle')

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-60 overflow-y-auto bg-white shadow-xl
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:shadow-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700">
          <Link href="/admin/dashboard" className="flex items-center gap-3" onClick={handleLinkClick}>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/20 backdrop-blur shadow-lg">
              <span className="text-sm font-bold text-white">NF</span>
            </div>
            <div>
              <div className="text-[13px] font-bold tracking-wide text-white">
                samadyafarm.id
              </div>
              <div className="text-[8px] text-emerald-200 font-medium">ADMIN PANEL</div>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              // Skip bookings from main nav (not in plan)
              if (item.href === '/admin/bookings') return null

              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

              // Special handling for cattle management with submenu
              if (item.hasSubmenu) {
                return (
                  <li key={item.href}>
                    <button
                      onClick={() => setCattleSubmenuOpen(!cattleSubmenuOpen)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[11px] font-semibold transition-all duration-200 ${
                        isCattleActive
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                          : 'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${cattleSubmenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Submenu */}
                    {cattleSubmenuOpen && (
                      <ul className="ml-6 mt-1 space-y-0.5">
                        {cattleSubmenu.map((subItem) => (
                          <li key={subItem.href}>
                            <Link
                              href={subItem.href}
                              onClick={handleLinkClick}
                              className={`block rounded-lg px-3 py-2 text-[10px] font-medium transition-all duration-200 ${
                                pathname === subItem.href
                                  ? 'bg-emerald-100 text-emerald-800 font-semibold border-l-2 border-emerald-500'
                                  : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                              }`}
                            >
                              {subItem.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )
              }

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[11px] font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                        : 'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-3 bg-gray-50/50">
          <Link
            href="/"
            onClick={handleLinkClick}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-[10px] font-medium text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-200"
          >
            <span className="text-gray-400">←</span>
            Kembali ke Website
          </Link>
        </div>
      </aside>
    </>
  )
}
