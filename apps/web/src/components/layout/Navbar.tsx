'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, Phone, Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/katalog', label: 'Katalog' },
  { href: '/#tentang', label: 'Tentang Kami' },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[hsl(var(--line))] bg-[hsl(var(--cream2))]/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1500px] items-center justify-between px-3 sm:px-5 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2 text-[hsl(var(--forest))] sm:gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-full border border-[hsl(var(--forest))/30] bg-white">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="text-[12px] font-extrabold tracking-[.08em] sm:text-[14px]">samadyafarm.id</div>
            <div className="text-[8px] text-[hsl(var(--forest))/60]">KURBAN BERKUALITAS</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 text-[11px] font-medium text-[hsl(var(--forest))/85 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-[hsl(var(--forest))]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions - Phone only */}
        <div className="hidden items-center gap-2 md:flex">
          <a
            href="tel:0812-3456-7890"
            className="flex items-center gap-1.5 rounded-md border border-[hsl(var(--forest))/30] bg-white px-3 py-2 text-[10px] font-semibold text-[hsl(var(--forest))] transition-colors hover:bg-[hsl(var(--cream))]"
          >
            <Phone className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">0812-3456-7890</span>
          </a>
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
      <div
        id="mobileMenu"
        className={`border-t border-[hsl(var(--line))] px-4 py-3 md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}
      >
        <nav className="grid gap-1 text-[12px] font-medium text-[hsl(var(--forest))/90">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md px-3 py-2 transition-colors hover:bg-white"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2">
            <a
              href="tel:0812-3456-7890"
              className="flex items-center justify-center gap-2 rounded-md border border-[hsl(var(--forest))/30] bg-white px-3 py-2 text-center text-[11px] font-semibold text-[hsl(var(--forest))]"
            >
              <Phone className="h-3.5 w-3.5" />
              0812-3456-7890
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}