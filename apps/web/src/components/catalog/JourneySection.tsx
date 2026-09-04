'use client'

import { useEffect, useRef } from 'react'
import { Beef, CreditCard, TrendingUp, FileText, Sparkles, ShieldCheck } from 'lucide-react'

const steps = [
  { icon: Beef, title: 'Pilih Sapi Pilihan', description: 'Pilih sapi sesuai kebutuhan dan preferensi Anda.' },
  { icon: CreditCard, title: 'Diberi ID & Dicatat', description: 'Setiap sapi diberi ID unik dan data awal tercatat.' },
  { icon: ShieldCheck, title: 'Perawatan Terbaik', description: 'Pakan berkualitas, vitamin, dan perawatan rutin.' },
  { icon: TrendingUp, title: 'Dipantau Berkala', description: 'Bobot, kesehatan, dan aktivitas update secara berkala.' },
  { icon: FileText, title: 'Laporan Transparan', description: 'Anda menerima laporan dan dokumentasi rutin.' },
  { icon: Sparkles, title: 'Siap Qurban', description: 'InsyaAllah siap untuk hari kemenangan.' },
]

export function JourneySection() {
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
    <section id="cara-kerja" ref={sectionRef} className="reveal mx-auto max-w-[1400px] px-4 pb-5 pt-4 sm:px-5 lg:px-8 lg:pt-3">
      <div className="text-center">
        <h2 className="text-[28px] font-bold text-[hsl(var(--forest))] sm:text-[32px] lg:text-[28px]">Perjalanan Qurban yang Transparan</h2>
        <p className="text-[12px] text-[hsl(var(--forest))/60]">Dari kandang hingga hari raya, Anda selalu terinformasi.</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {steps.map((step, index) => (
          <div key={index} className="reveal flex items-start gap-2 rounded-full border border-[hsl(var(--line))] bg-white px-3 py-2.5">
            <span className="icon-orb grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[hsl(var(--line))] bg-[hsl(var(--cream))] text-[hsl(var(--forest))]">
              <step.icon className="h-4 w-4" />
            </span>
            <div>
              <div className="text-[12px] font-semibold text-[hsl(var(--forest))]">{step.title}</div>
              <p className="text-[10px] leading-4 text-[hsl(var(--forest))/65]">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
