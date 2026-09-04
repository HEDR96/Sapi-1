'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { BadgeCheck, Clock3, ClipboardList, Shield } from 'lucide-react'

interface CounterProps {
  end: number
  suffix: string
  duration?: number
}

function AnimatedCounter({ end, suffix, duration = 1200 }: CounterProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true
            const startTime = performance.now()

            const tick = (now: number) => {
              const elapsed = now - startTime
              const progress = Math.min(elapsed / duration, 1)
              const eased = 1 - Math.pow(1 - progress, 3)
              const current = Math.floor(end * eased)
              setCount(current)

              if (progress < 1) {
                requestAnimationFrame(tick)
              }
            }

            requestAnimationFrame(tick)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [end, duration])

  const displayValue = end >= 1000 ? count.toLocaleString('id-ID') + '+' : count

  return (
    <div ref={ref} className="counter text-[16px] font-extrabold text-white">
      {displayValue}{suffix}
    </div>
  )
}

const stats = [
  { value: 2450, suffix: '', label: 'Sapi Terdaftar' },
  { value: 98, suffix: '%', label: 'Kepuasan' },
  { value: 24, suffix: '/7', label: 'Jam Monitoring' },
  { value: 100, suffix: '%', label: 'Transparan' },
]

const trustFeatures = [
  { icon: BadgeCheck, text: 'Sapi Pilihan Berkualitas' },
  { icon: Clock3, text: 'Dipantau Secara Berkala' },
  { icon: ClipboardList, text: 'Laporan Transparan' },
  { icon: Shield, text: 'InsyaAllah Sesuai Syariat' },
]

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null)

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

    const revealElements = heroRef.current?.querySelectorAll('.reveal')
    revealElements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={heroRef}
      className="reveal relative flex min-h-screen w-full flex-col overflow-hidden"
    >
      {/* Background image with overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `url('https://images.unsplash.com/photo-1551750590-90f231373f73?auto=format&fit=crop&w=2400&q=90') center/cover no-repeat`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a3a25]/75 via-[#1a3a25]/55 to-[#1a3a25]/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col justify-center px-6 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-[1400px]">

          {/* Top trust badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-[10px] font-semibold text-white backdrop-blur-sm sm:text-[11px]">
            <BadgeCheck className="h-4 w-4 shrink-0 text-[hsl(var(--gold))]" />
            Semua foto di halaman ini khusus sapi asli dari peternakan kami
          </div>

          {/* Main headline */}
          <h1 className="text-[36px] font-black leading-[1.05] text-white sm:text-[52px] lg:text-[64px] xl:text-[72px]">
            Sapi Anda,<br />
            <span className="text-[hsl(var(--gold))]">Amanah Kami.</span><br />
            Dipantau Transparan,<br />
            <span className="text-[hsl(var(--olive))]">Hingga Siap Dipilih.</span>
          </h1>

          {/* Sub text */}
          <p className="mt-6 max-w-[560px] text-[13px] leading-6 text-white/80 sm:text-[15px] lg:text-[16px]">
            Setiap sapi pilihan dirawat dengan penuh perhatian di peternakan kami. Anda bisa memantau bobot, kesehatan, dan perawatannya secara berkala sebelum memutuskan membeli.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#katalog"
              className="rounded-xl bg-[hsl(var(--forest))] px-6 py-3.5 text-[12px] font-bold text-white shadow-lg transition-all hover:bg-[hsl(var(--forest2))] hover:-translate-y-0.5 hover:shadow-xl sm:text-[14px]"
            >
              Pilih Sapi
            </Link>
            <Link
              href="#cara-kerja"
              className="rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-[12px] font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:-translate-y-0.5 sm:text-[14px]"
            >
              Lihat Cara Kerja
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-10 grid w-fit grid-cols-4 gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md sm:gap-6 sm:p-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                <div className="mt-1 text-[7px] text-white/60 sm:text-[9px]">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Trust features */}
          <div className="mt-8 grid max-w-[600px] grid-cols-2 gap-x-8 gap-y-3 text-[10px] text-white/80 sm:grid-cols-4 sm:text-[11px] lg:gap-x-12">
            {trustFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <feature.icon className="h-4 w-4 shrink-0 text-[hsl(var(--olive))]" />
                {feature.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating barcode tag - bottom right */}
      <div className="absolute bottom-0 right-0 z-20 flex items-end justify-end px-6 pb-8 sm:px-10 lg:px-16">
        <div className="relative">
          <div className="tag-leaf" />
          <div className="nusa-tag tag-shape animate-float-tag relative w-[170px] rounded-[22px] px-4 pb-4 pt-10 rotate-[7deg] sm:w-[210px] lg:w-[180px] xl:w-[210px]">
            <div className="tag-rope"><span /></div>
            <div className="hole" />
            <div className="text-center text-[10px] font-extrabold tracking-[.02em] text-[hsl(var(--forest))] sm:text-[12px]">samadyafarm.id</div>
            <div className="text-center text-[6px] font-semibold uppercase tracking-[.16em] text-[hsl(var(--forest))/70] sm:text-[7px]">Sapi Pilihan</div>
            <div className="plate mt-2 rounded-[8px] px-2 py-2 text-center text-[18px] font-extrabold leading-none text-[hsl(var(--forest))] sm:text-[24px]">NF-26001</div>
            <div className="tag-subtitle mt-2 text-center text-[10px] font-bold uppercase leading-tight text-[hsl(var(--forest))] sm:text-[13px]">LIMOUSIN</div>
            <div className="tag-subtitle text-center text-[10px] font-bold uppercase leading-tight text-[hsl(var(--forest))] sm:text-[13px]">JANTAN</div>
            <div className="qr-box mx-auto mt-3 aspect-square h-[92px] w-[92px] shrink-0 rounded-[3px] bg-white p-1.5 sm:h-[116px] sm:w-[116px]">
              <div className="flex h-full items-center justify-center text-center text-[6px] text-[hsl(var(--forest))/50]">QR Code</div>
            </div>
            <div className="mt-2 text-center text-[7px] font-bold uppercase tracking-[.02em] text-[hsl(var(--forest))/80] sm:text-[9px]">SCAN UNTUK PROFIL SAPI</div>
          </div>
        </div>
      </div>
    </section>
  )
}
