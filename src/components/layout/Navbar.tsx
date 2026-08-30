'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShieldCheck, Phone, Menu, X, Bell, LogOut, User } from 'lucide-react'
import { AuthModal } from '@/components/auth/AuthModal'

const navLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/#katalog', label: 'Sapi Qurban' },
  { href: '/#cara-kerja', label: 'Cara Kerja' },
  { href: '/#tentang', label: 'Tentang Kami' },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [user, setUser] = useState<{ name?: string; email?: string; role?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch {
      // Not logged in
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      window.location.reload()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF'

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[hsl(var(--line))] bg-[hsl(var(--cream2))]/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1500px] items-center justify-between px-3 sm:px-5 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 text-[hsl(var(--forest))] shrink-0">
            <div className="grid h-8 w-8 place-items-center rounded-full border border-[hsl(var(--forest))/30] bg-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="text-[12px] font-extrabold tracking-[.08em] sm:text-[14px]">NUSA FARM</div>
              <div className="text-[8px] text-[hsl(var(--forest))/60]">KURBAN BERKUALITAS</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 text-[11px] font-medium text-[hsl(var(--forest))/85 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-[hsl(var(--forest))] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-2 md:flex">
            {/* Phone */}
            <a
              href="tel:0812-3456-7890"
              className="rounded-md border border-[hsl(var(--forest))/30 bg-white px-3 py-2 text-[10px] font-semibold text-[hsl(var(--forest))] flex items-center gap-1.5 hover:bg-[hsl(var(--cream))] transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">0812-3456-7890</span>
            </a>

            {/* User Menu */}
            {loading ? (
              <div className="h-9 w-20 animate-pulse rounded-md bg-gray-200" />
            ) : user ? (
              <div className="flex items-center gap-2">
                {/* Notification Bell */}
                <button className="relative grid h-9 w-9 place-items-center rounded-md border border-[hsl(var(--forest))/20 text-[hsl(var(--forest))] hover:bg-[hsl(var(--cream))] transition-colors">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
                </button>

                {/* User Avatar */}
                <div className="flex items-center gap-2 rounded-md border border-[hsl(var(--forest))/20 bg-white px-3 py-2">
                  <div className="h-6 w-6 rounded-full bg-[hsl(var(--forest))] flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-[10px] font-medium text-[hsl(var(--forest))] max-w-[80px] truncate">
                    {user.name || user.email || 'User'}
                  </span>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="grid h-9 w-9 place-items-center rounded-md border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>

                {/* Admin Link */}
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="rounded-md bg-[hsl(var(--forest))] px-3 py-2 text-[10px] font-bold text-white hover:bg-[hsl(var(--forest2))] transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="rounded-md bg-[hsl(var(--forest))] px-4 py-2 text-[11px] font-bold text-white hover:bg-[hsl(var(--forest2))] transition-colors"
              >
                Masuk / Daftar
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="grid h-9 w-9 place-items-center rounded-md border border-[hsl(var(--forest))/20 text-[hsl(var(--forest))] md:hidden"
            aria-label="menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div id="mobileMenu" className={`border-t border-[hsl(var(--line))] px-4 py-3 md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <nav className="grid gap-1 text-[12px] font-medium text-[hsl(var(--forest))/90">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 hover:bg-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <a
                href="tel:0812-3456-7890"
                className="rounded-md border border-[hsl(var(--forest))/30 bg-white px-3 py-2 text-center text-[11px] font-semibold text-[hsl(var(--forest))]"
              >
                0812-3456-7890
              </a>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-center text-[11px] font-semibold text-red-600"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setAuthModalOpen(true)
                  }}
                  className="rounded-md bg-[hsl(var(--forest))] px-3 py-2 text-center text-[11px] font-bold text-white"
                >
                  Masuk / Daftar
                </button>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  )
}
