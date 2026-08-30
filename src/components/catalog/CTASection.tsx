'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )

    const revealElements = sectionRef.current?.querySelectorAll('.reveal')
    revealElements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="reveal mx-auto max-w-[1400px] px-4 pb-0 sm:px-5 lg:px-8"
    >
      <div className="overflow-hidden sm:rounded-t-lg">
        <div className="grid items-center gap-3 bg-cta-grad px-4 py-3 sm:px-5 lg:grid-cols-[170px_1fr_auto] lg:px-5">
          {/* Decorative image (hidden on mobile) */}
          <div className="hidden h-16 rounded bg-cover bg-center lg:block" style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1718554073115-a711e724b3eb?auto=format&fit=crop&w=1600&q=85')"
          }} />

          {/* Content */}
          <div>
            <h3 className="text-[22px] font-bold leading-none text-white sm:text-[26px]">
              Temukan Sapi Terbaik Anda Bersama Nusa Farm
            </h3>
            <p className="mt-1.5 text-[11px] text-white/80">
              Pilih sapi terbaik, pantau perkembangannya, dan beli dengan lebih tenang.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-2">
            <Link
              href="/#katalog"
              className="rounded-md bg-[#D7A73D] px-4 py-2.5 text-[11px] font-semibold text-[hsl(var(--forest))]"
            >
              Pilih Sapi Sekarang
            </Link>
            <Link
              href="https://wa.me/6281234567890"
              className="rounded-md border border-white/25 px-4 py-2.5 text-[11px] font-semibold text-white flex items-center gap-1.5"
            >
              <MessageCircle className="h-4 w-4" />
              Konsultasi via WhatsApp
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
