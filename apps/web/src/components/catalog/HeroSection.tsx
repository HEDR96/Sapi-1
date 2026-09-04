'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { BadgeCheck, Clock3, ClipboardList, Shield, ChevronLeft, ChevronRight } from 'lucide-react'
import { CattleWithRelations } from '@samadya/shared/types'

interface HeroSectionProps {
  cattle: CattleWithRelations[]
  selectedCattle: CattleWithRelations | null
  onSelectCattle: (cattle: CattleWithRelations) => void
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
  { value: 2450, suffix: '', label: 'Sapi Terdaftar' },
  { value: 98, suffix: '%', label: 'Kepuasan %' },
  { value: 24, suffix: '/7', label: 'Jam Monitoring' },
  { value: 100, suffix: '%', label: 'Transparan %' },
]

const trustFeatures = [
  { icon: BadgeCheck, text: 'Sapi Pilihan Berkualitas' },
  { icon: Clock3, text: 'Dipantau Secara Berkala' },
  { icon: ClipboardList, text: 'Laporan Transparan' },
  { icon: Shield, text: 'InsyaAllah Sesuai Syariat' },
]

export function HeroSection({ cattle, selectedCattle, onSelectCattle }: HeroSectionProps) {
  const heroRef = useRef<HTMLElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const isSliderChange = useRef(false)
  const tagRef = useRef<HTMLDivElement>(null)
  const [tagOpen, setTagOpen] = useState(false)
  const [tagSettled, setTagSettled] = useState(false)
  const tagAnimated = useRef(false)

  useEffect(() => {
    const el = tagRef.current
    if (!el || tagAnimated.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !tagAnimated.current) {
            tagAnimated.current = true
            setTagOpen(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Get available cattle with images
  const displayCattle = cattle.filter(c => c.mainImage)
  const currentCattle = displayCattle[currentIndex] || selectedCattle

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
    <section ref={heroRef} className="reveal mx-auto grid max-w-[1400px] grid-cols-1 items-stretch lg:grid-cols-[1.3fr_1.2fr_.55fr]">
      {/* Image Slider */}
      <div className="hero-photo relative min-h-[220px] sm:min-h-[350px] lg:min-h-[500px] overflow-hidden">
        {/* Current Image */}
        {currentCattle?.mainImage ? (
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              background: `url('${currentCattle.mainImage}') center/cover no-repeat`,
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

        {/* Slider Arrows */}
        {displayCattle.length > 1 && (
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
              <div className="text-[7px] text-[hsl(var(--forest))/55]">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[9px] text-[hsl(var(--forest))/70] sm:flex sm:flex-wrap sm:gap-4 lg:grid lg:grid-cols-4 lg:gap-3 xl:flex">
          {trustFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <feature.icon className="h-3.5 w-3.5 text-[hsl(var(--olive))]" />
              {feature.text}
            </div>
          ))}
        </div>
      </div>

            {/* Dynamic Tag with Cattle Info */}
      <div className="relative flex items-end justify-end overflow-hidden bg-[#F4EFE2] px-4 py-6 lg:px-6 lg:pr-3">
        <div className="tag-leaf" />

        {/* Wooden peg with metal ring, mounted on the hero frame */}
        <div className="peg-wrap pointer-events-none absolute right-9 top-5 z-20 lg:right-5">
          <div className="peg-dowel" />
          <div className="peg-ring" />
        </div>

        <div ref={tagRef} className="tag-perspective relative mr-2 w-[156px] sm:w-[198px] lg:w-[156px] xl:w-[198px] lg:mr-0">
          {/* Ground shadow to sell depth / distance from the wall */}
          <div className="tag-shadow-blob" />

          {/* Twisted jute rope, sags naturally from peg to tag eyelet */}
          <svg
            className="rope-svg pointer-events-none absolute -top-16 right-5 z-10 sm:-top-[4.6rem]"
            width="56"
            height="78"
            viewBox="0 0 56 78"
            fill="none"
          >
            {/* main sagging strand (catenary-like curve) */}
            <path
              d="M28 3 C 14 22, 40 34, 22 48 C 10 58, 34 62, 27 74"
              stroke="#7a5c34"
              strokeWidth="3.4"
              strokeLinecap="round"
              fill="none"
            />
            {/* twist highlight, offset ticks along the same path */}
            <path
              d="M28 3 C 14 22, 40 34, 22 48 C 10 58, 34 62, 27 74"
              stroke="#e0c48a"
              strokeWidth="1"
              strokeDasharray="2.5 3.5"
              fill="none"
              opacity="0.85"
            />
            {/* knot just above the eyelet */}
            <ellipse cx="27" cy="70" rx="4.5" ry="3.5" fill="#5f4726" />
            <ellipse cx="27" cy="70" rx="2.2" ry="1.6" fill="#8a6a3d" />
          </svg>

          <div
            onAnimationEnd={() => setTagSettled(true)}
            className={`nusa-tag tag-shape tag-fold relative rounded-[22px] px-4 pb-4 pt-11 ${
              tagOpen ? 'tag-fold-open' : ''
            } ${tagSettled ? 'tag-settled' : ''}`}
          >
            {/* Metal eyelet the rope threads through */}
            <div className="tag-eyelet" />

            <div className="text-center text-[10px] font-extrabold tracking-[.02em] text-[hsl(var(--forest))] sm:text-[12px]">
              samadyafarm.id
            </div>
            <div className="text-center text-[6px] font-semibold uppercase tracking-[.16em] text-[hsl(var(--forest))/70] sm:text-[7px]">
              Sapi Pilihan
            </div>

            {/* Embossed plate, dot-matrix style like a real livestock tag printer */}
            <div className="plate plate-embossed mt-2 rounded-[8px] px-2 py-2 text-center font-extrabold leading-none sm:text-[24px] text-[18px]">
              {currentCattle?.code || 'NF-0001'}
            </div>

            <div className="tag-subtitle mt-2 text-center text-[10px] font-bold uppercase leading-tight text-[hsl(var(--forest))] sm:text-[13px]">
              {currentCattle?.breed || 'LIMOUSIN'}
            </div>
            <div className="tag-subtitle text-center text-[10px] font-bold uppercase leading-tight text-[hsl(var(--forest))] sm:text-[13px]">
              {currentCattle?.gender === 'FEMALE' ? 'BETINA' : 'JANTAN'}
            </div>

            <div className="qr-box mx-auto mt-3 aspect-square h-[92px] w-[92px] shrink-0 rounded-[3px] bg-white p-1.5 sm:h-[116px] sm:w-[116px]">
              {currentCattle ? (
                <div className="flex h-full items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`/sapi/${currentCattle.code}`)}`}
                    alt="QR Code"
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-[6px] text-[hsl(var(--forest))/50] text-center">
                  QR Code
                </div>
              )}
            </div>
            <div className="mt-2 text-center text-[7px] font-bold uppercase tracking-[.02em] text-[hsl(var(--forest))/80] sm:text-[9px]">
              SCAN UNTUK PROFIL SAPI
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
