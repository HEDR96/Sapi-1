'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { BadgeCheck, Clock3, ClipboardList, Shield, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { CattleWithRelations } from '@samadya/shared/types'
import { getDirectImageUrl } from '@samadya/shared/lib/utils/imageUrl'

interface HeroSectionProps {
  cattle: CattleWithRelations[]
  selectedCattle: CattleWithRelations | null
  onSelectCattle: (cattle: CattleWithRelations) => void
  isLoading?: boolean
}

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
    <div ref={ref} className="counter text-[16px] font-extrabold text-[hsl(var(--forest))]">
      {displayValue}{suffix}
    </div>
  )
}

const stats = [
  { value: 10, suffix: '', label: 'Sapi Terdaftar' },
  { value: 90, suffix: '%', label: 'Kepuasan %' },
  { value: 24, suffix: '/7', label: 'Jam Monitoring' },
  { value: 100, suffix: '%', label: 'Transparan %' },
]

const trustFeatures = [
  { icon: BadgeCheck, text: 'Sapi Pilihan Berkualitas' },
  { icon: Clock3, text: 'Dipantau Secara Berkala' },
  { icon: ClipboardList, text: 'Laporan Transparan' },
  { icon: Shield, text: 'InsyaAllah Sesuai Syariat' },
]

export function HeroSection({ cattle, selectedCattle, onSelectCattle, isLoading }: HeroSectionProps) {
  const heroRef = useRef<HTMLElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const isSliderChange = useRef(false)

  // Get available cattle with images
  const displayCattle = cattle.filter(c => c.mainImage)
  const currentCattle = displayCattle[currentIndex] || selectedCattle

  // Determine if we should show loading state
  const showLoading = isLoading || displayCattle.length === 0

  // Sync currentIndex when selectedCattle changes from outside (e.g., catalog card click)
  useEffect(() => {
    if (!selectedCattle || displayCattle.length === 0) return

    const index = displayCattle.findIndex(c => c.id === selectedCattle.id)
    if (index !== -1 && index !== currentIndex && !isSliderChange.current) {
      setCurrentIndex(index)
    }
    // Reset flag after use
    isSliderChange.current = false
  }, [selectedCattle, displayCattle, currentIndex])

  // Update selected cattle when slider changes (via arrows/dots)
  const handleSliderChange = useCallback((index: number) => {
    isSliderChange.current = true
    setCurrentIndex(index)
    if (displayCattle[index]) {
      onSelectCattle(displayCattle[index])
    }
  }, [displayCattle, onSelectCattle])

  const goToPrev = () => {
    if (displayCattle.length <= 1) return
    const newIndex = currentIndex === 0 ? displayCattle.length - 1 : currentIndex - 1
    handleSliderChange(newIndex)
  }

  const goToNext = () => {
    if (displayCattle.length <= 1) return
    const newIndex = currentIndex === displayCattle.length - 1 ? 0 : currentIndex + 1
    handleSliderChange(newIndex)
  }

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
    <section ref={heroRef} className="reveal mx-auto grid max-w-full grid-cols-1 items-stretch lg:grid-cols-[3.3fr_2.1fr_.9fr]">
      {/* Image Slider */}
      <div className="hero-photo relative min-h-[280px] sm:min-h-[400px] lg:min-h-[580px] overflow-hidden">
        {/* Loading Placeholder - Shows when data is being fetched */}
        {showLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[hsl(var(--cream))]">
            <Loader2 className="h-12 w-12 animate-spin text-[hsl(var(--forest))] mb-3" />
            <p className="text-sm font-semibold text-[hsl(var(--forest))]">Memuat...</p>
          </div>
        ) : currentCattle?.mainImage ? (
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              background: `url('${getDirectImageUrl(currentCattle.mainImage)}') center/cover no-repeat`,
            }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `url('https://images.unsplash.com/photo-1551750590-90f231373f73?auto=format&fit=crop&w=1600&q=85') center/cover no-repeat`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/12 via-transparent to-transparent" />

        {/* Slider Arrows - Only show when not loading and has multiple cattle */}
        {!showLoading && displayCattle.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-2 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[hsl(var(--forest))] shadow-lg transition-all hover:bg-white hover:scale-110"
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[hsl(var(--forest))] shadow-lg transition-all hover:bg-white hover:scale-110"
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              {displayCattle.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleSliderChange(index)}
                  className={`h-2.5 w-2.5 rounded-full transition-all ${
                    index === currentIndex
                      ? 'scale-125 bg-white'
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col justify-center bg-[#F4EFE2] px-4 py-5 sm:px-7 sm:py-8 lg:px-8">
        <h1 className="text-[31px] font-bold leading-[1] text-[hsl(var(--forest))] sm:text-[42px] lg:text-[34px] xl:text-[42px]">
          Sapi Anda, Amanah Kami.<br />
          Dipantau Transparan, Hingga Siap Dipilih.
        </h1>
        <p className="mt-3 max-w-[520px] text-[11px] leading-5 text-[hsl(var(--forest))/75] sm:text-[13px]">
          Setiap sapi pilihan dirawat dengan penuh perhatian di peternakan kami. Anda bisa memantau bobot, kesehatan, dan perawatannya secara berkala sebelum memutuskan membeli.
        </p>

        <div className="mt-4 flex flex-wrap gap-2.5">
          <Link href="#katalog" className="rounded-md bg-[hsl(var(--forest))] px-4 py-2.5 text-[11px] font-semibold text-white shadow-card">
            Pilih Sapi
          </Link>
          <Link href="#cara-kerja" className="rounded-md border border-[hsl(var(--forest))/25] bg-white px-4 py-2.5 text-[11px] font-semibold text-[hsl(var(--forest))]">
            Lihat Cara Kerja
          </Link>
        </div>

        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--line))] bg-white px-3 py-1.5 text-[10px] font-semibold text-[hsl(var(--forest))]">
          <BadgeCheck className="h-3.5 w-3.5 text-[hsl(var(--olive))]" />
          Semua foto di halaman ini khusus sapi
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2 rounded-xl border border-[hsl(var(--line))/80] bg-white/75 p-2.5 shadow-card backdrop-blur sm:max-w-[520px]">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              <div className="text-[10px] sm:text-[12px] text-[hsl(var(--forest))/55]">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] text-[hsl(var(--forest))/70] sm:flex sm:flex-wrap sm:gap-4 lg:grid lg:grid-cols-4 lg:gap-3 xl:flex">
          {trustFeatures.map((feature, index) => (
            <div key={index} className="text-[15px] flex items-center gap-1.5">
              <feature.icon className="h-6 w-6 text-[hsl(var(--olive))]" />
              {feature.text}
            </div>
          ))}
        </div>
      </div>

{/* Dynamic Tag Container */}
      <div className="relative flex items-start justify-center lg:justify-end overflow-hidden bg-[#F1EFE2] px-4 pt-0 py-2 lg:px-6 lg:pr-3">
        {/* 1. GANTUNGAN WOOD/METAL PIN (STATIK DI ATAS CONTAINER) */}
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 z-30 flex flex-col items-center">
          {/* Base Pin Kayu dengan Lis Gold & Shadow */}
          <div className="h-3 w-7 rounded-b-md bg-gradient-to-b from-[#5c4328] via-[#7a5c37] to-[#43301b] shadow-md border-x border-b border-[#302111]" />
          {/* Ring Pengait Kecil */}
          <div className="-mt-1 h-2 w-2 rounded-full border border-[#8B7355] bg-[#302111]" />
        </div>

        <div className="relative mr-1 lg:mr-0">
          {/* 2. WRAPPER ANIMASI (TALI LURUS + KERTAS TAG BERGERAK BERSAMAAN) */}
          <div
            key={currentCattle?.id || 'default'}
            className="paper-pull-up relative z-10 flex flex-col items-center pt-2"
          >
            {/* TALI RUSTIC LURUS (ESTETIK & ELEGAN) */}
            <div className="pointer-events-none relative -mb-1 z-20 flex flex-col items-center">
              <svg width="6" height="32" viewBox="0 0 6 32" fill="none" className="drop-shadow-sm">
                {/* Tali Utama */}
                <line x1="3" y1="0" x2="3" y2="32" stroke="#6E5030" strokeWidth="3.5" strokeLinecap="round" />
                {/* Ulir Tekstur Tali (Rustic Cord) */}
                <line x1="3" y1="0" x2="3" y2="32" stroke="#A88B63" strokeWidth="1.5" strokeDasharray="3 3" />
              </svg>
            </div>

            {/* KERTAS TAG */}
            <div
              className="relative w-[145px] sm:w-[175px] lg:w-[145px] xl:w-[175px] rounded-[20px] bg-gradient-to-b from-[#F7F3E9] via-[#F0EAD8] to-[#E3D9C2] px-3.5 pb-3.5 pt-6 shadow-2xl"
              style={{
                boxShadow: '0 12px 30px -8px rgba(40, 30, 15, 0.22)',
                border: '1.5px solid #D4C9B0'
              }}
            >
              {/* LUBANG METAL EYELET GOLD (TEMPAT TALI MASUK) */}
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-30">
                <div className="relative flex h-5 w-5 items-center justify-center rounded-full border-[2.5px] border-[#9E7B4F] bg-gradient-to-br from-[#D4AF37] via-[#AA7C11] to-[#5B430B] shadow-md">
                  {/* Lubang Dalam Metal */}
                  <div className="h-2 w-2 rounded-full bg-[#302111] shadow-inner" />
                </div>
              </div>

              {/* Teks Website & Label */}
              <div className="text-center text-[10px] font-extrabold tracking-[.02em] text-[hsl(var(--forest))] sm:text-[12px] pt-1">
                samadyafarm.id
              </div>
              <div className="text-center text-[6px] font-semibold uppercase tracking-[.16em] text-[hsl(var(--forest))/70] sm:text-[7px]">
                Sapi Pilihan
              </div>

              {/* Embossed Plate - Kode Sapi */}
              <div className="mt-1.5 rounded-[8px] border border-[#D4C9B0] bg-gradient-to-b from-[#FFFFFF] to-[#F4EFE2] px-1.5 py-1.5 text-center font-extrabold leading-none text-[18px] text-[hsl(var(--forest))] sm:text-[22px] shadow-sm">
                {currentCattle?.code || 'NF-0001'}
              </div>

              {/* Jenis & Gender */}
              <div className="mt-2 text-center text-[10px] font-bold uppercase leading-tight text-[hsl(var(--forest))] sm:text-[12px]">
                {currentCattle?.breed || 'LIMOUSIN'}
              </div>
              <div className="text-center text-[10px] font-bold uppercase leading-tight text-[hsl(var(--forest))/80] sm:text-[12px]">
                {currentCattle?.gender === 'FEMALE' ? 'BETINA' : 'JANTAN'}
              </div>

              {/* Container QR Code */}
              <div className="mx-auto mt-2 aspect-square h-[82px] w-[82px] shrink-0 rounded-[6px] border border-[#D4C9B0] bg-white p-1.5 sm:h-[105px] sm:w-[105px] shadow-sm">
                {showLoading ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--forest))/50]" />
                    <span className="text-[5px] text-[hsl(var(--forest))/50] mt-0.5">Memuat...</span>
                  </div>
                ) : currentCattle ? (
                  <div className="flex h-full items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`/sapi/${currentCattle.code}`)}`}
                      alt="QR Code"
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-center text-[6px] text-[hsl(var(--forest))/50]">
                    QR Code
                  </div>
                )}
              </div>

              <div className="mt-2 text-center text-[7px] font-bold uppercase tracking-[.04em] text-[hsl(var(--forest))/75] sm:text-[9px]">
                SCAN UNTUK PROFIL
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}