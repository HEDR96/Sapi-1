'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, Phone, Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/katalog', label: 'Katalog' },
  { href: '/tentang-kami', label: 'Tentang Kami' },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[hsl(var(--forest))/30] bg-[hsl(var(--forest))] backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1500px] items-center justify-between px-3 sm:px-5 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2 text-white sm:gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-full border border-white/30 bg-white/10">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="text-[12px] font-extrabold tracking-[.08em] sm:text-[14px]">samadyafarm.id</div>
            <div className="text-[8px] text-white/60">KURBAN BERKUALITAS</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 text-[11px] font-medium text-white/85 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions - Phone only */}
        <div className="hidden items-center gap-2 md:flex">
          <a
            href="tel:0859-3561-0197"
            className="flex items-center gap-1.5 rounded-md border border-white/30 bg-white/10 px-3 py-2 text-[10px] font-semibold text-white transition-colors hover:bg-white/20"
          >
            <Phone className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">0859-3561-0197</span>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="grid h-9 w-9 place-items-center rounded-md border border-white/20 text-white md:hidden"
          aria-label="menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobileMenu"
        className={`border-t border-white/20 bg-[hsl(var(--forest))] px-4 py-3 md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}
      >
        <nav className="grid gap-1 text-[12px] font-medium text-white/90">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md px-3 py-2 transition-colors hover:bg-white/10"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2">
            <a
              href="https://api.whatsapp.com/send?phone=6285935610197&text=Halo%2C%20saya%20ingin%20bertanya%20mengenai%20sapi"
              className="flex items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-3 py-2 text-center text-[11px] font-semibold text-white"
            >
              <Phone className="h-3.5 w-3.5" />
              0859-3561-0197
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}