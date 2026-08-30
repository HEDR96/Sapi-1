'use client'

import { useEffect, useRef } from 'react'
import { HeroSection } from '@/components/catalog/HeroSection'
import { JourneySection } from '@/components/catalog/JourneySection'
import { CattleGrid } from '@/components/catalog/CattleGrid'
import { TrustRow } from '@/components/catalog/TrustRow'
import { CTASection } from '@/components/catalog/CTASection'

export default function HomePage() {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll reveal observer
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

    const revealElements = pageRef.current?.querySelectorAll('.reveal')
    revealElements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={pageRef} className="mx-auto my-2 max-w-[1500px] overflow-hidden border border-black/30 bg-[hsl(var(--cream2))] shadow-2xl">
      <HeroSection />
      <JourneySection />
      <CattleGrid />
      <TrustRow />
      <CTASection />
    </div>
  )
}
