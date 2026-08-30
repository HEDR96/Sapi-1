'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Beef,
  Scale,
  Heart,
  UtensilsCrossed,
  Image as ImageIcon,
  Users,
  Settings,
  X,
} from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/cattle', icon: Beef, label: 'Manajemen Sapi' },
  { href: '/admin/weight', icon: Scale, label: 'Riwayat Timbang' },
  { href: '/admin/health', icon: Heart, label: 'Riwayat Kesehatan' },
  { href: '/admin/feed', icon: UtensilsCrossed, label: 'Riwayat Pakan' },
  { href: '/admin/media', icon: ImageIcon, label: 'Dokumentasi' },
  { href: '/admin/users', icon: Users, label: 'Pengguna' },
  { href: '/admin/settings', icon: Settings, label: 'Pengaturan' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Overlay */}
      <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" />

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-60 transform overflow-y-auto bg-white shadow-xl transition-transform lg:static lg:translate-x-0">
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-[hsl(var(--line))] px-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[hsl(var(--forest))]">
              <span className="text-sm font-bold text-white">NF</span>
            </div>
            <div>
              <div className="text-[12px] font-extrabold tracking-[.06em] text-[hsl(var(--forest))]">
                samadyafarm.id
              </div>
              <div className="text-[7px] text-[hsl(var(--forest))/60]">ADMIN PANEL</div>
            </div>
          </Link>
          <button className="lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5 text-[hsl(var(--forest))]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-[11px] font-medium transition-colors ${
                      isActive
                        ? 'bg-[hsl(var(--forest))] text-white'
                        : 'text-[hsl(var(--forest))/70] hover:bg-[hsl(var(--cream))] hover:text-[hsl(var(--forest))]'
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
        <div className="absolute bottom-0 left-0 right-0 border-t border-[hsl(var(--line))] p-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-[10px] font-medium text-[hsl(var(--forest))/60] hover:bg-[hsl(var(--cream))] hover:text-[hsl(var(--forest))]"
          >
            ← Kembali ke Website
          </Link>
        </div>
      </aside>
    </>
  )
}
