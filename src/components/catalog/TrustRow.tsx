'use client'

import { useEffect, useRef } from 'react'
import { ShieldCheck, CircleCheck, FolderLock, Users, Home, BadgeCheck } from 'lucide-react'

const trustItems = [
  {
    icon: CircleCheck,
    title: 'Sesuai Syariat',
    description: 'Proses tertib dan amanah.',
  },
  {
    icon: FolderLock,
    title: 'Transparan',
    description: 'Bobot, kesehatan & pakan jelas.',
  },
  {
    icon: Users,
    title: 'Peternak Ahli',
    description: 'Ditangani tim berpengalaman.',
  },
  {
    icon: Home,
    title: 'Kandang Sehat',
    description: 'Bersih, nyaman, dan terawat.',
  },
  {
    icon: BadgeCheck,
    title: 'Layanan Amanah',
    description: 'Update cepat dan bertanggung jawab.',
  },
]

export function TrustRow() {
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
      className="reveal mx-auto max-w-[1400px] px-4 pb-3 sm:px-5 lg:px-8"
    >
      <div className="rounded-xl border border-[hsl(var(--line))] bg-[#FCFAF4] px-3 py-3 sm:px-4">
        <div className="grid gap-3 lg:grid-cols-[220px_1fr] lg:items-center">
          {/* Left side */}
          <div className="border-b border-[hsl(var(--line))] pb-3 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
            <div className="flex items-center gap-2 text-[9px] font-semibold text-[hsl(var(--forest))/65]">
              <ShieldCheck className="h-3.5 w-3.5 text-[hsl(var(--olive))]" />
              Komitmen samadyafarm.id
            </div>
            <h3 className="mt-1.5 text-[22px] font-bold leading-[1.02] text-[hsl(var(--forest))] sm:text-[24px]">
              Transparansi & Kepercayaan
            </h3>
            <p className="mt-1 text-[8px] leading-4 text-[hsl(var(--forest))/55]">
              Data sapi jelas, perawatan tercatat, dan mudah dipantau.
            </p>
          </div>

          {/* Right side - Trust items */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-4">
            {trustItems.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[hsl(var(--line))] bg-[hsl(var(--cream))] text-[hsl(var(--olive))]">
                  <item.icon className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-[10px] font-bold text-[hsl(var(--forest))]">{item.title}</h4>
                  <p className="mt-0.5 text-[8px] leading-4 text-[hsl(var(--forest))/55]">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
