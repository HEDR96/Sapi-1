'use client'

import { useEffect, useRef, useState } from 'react'
import { HeroSection } from '@/components/catalog/HeroSection'
import { JourneySection } from '@/components/catalog/JourneySection'
import { CattleGrid } from '@/components/catalog/CattleGrid'
import { TrustRow } from '@/components/catalog/TrustRow'
import { CTASection } from '@/components/catalog/CTASection'
import { CatalogSwiper } from '@/components/catalog/CatalogSwiper'
import { PantauPerkembanganSection } from '@/components/home/PantauPerkembanganSection'
import { RecentComments } from '@/components/home/RecentComments'
import { CattleWithLatestWeight, CattleWithRelations } from '@/types'

export default function HomePage() {
  const [selectedCattle, setSelectedCattle] = useState<CattleWithLatestWeight | null>(null)
  const [cattle, setCattle] = useState<CattleWithLatestWeight[]>([])
  const [fullCattleData, setFullCattleData] = useState<CattleWithRelations[]>([])
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch cattle data
    fetch('/api/admin/cattle?status=AVAILABLE&limit=20')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.items) {
          // Map to CattleWithLatestWeight
          const mapped: CattleWithLatestWeight[] = data.data.items.map((c: CattleWithRelations) => ({
            id: c.id,
            code: c.code,
            name: c.name,
            breed: c.breed,
            status: c.status,
            price: c.price,
            mainImage: c.mainImage,
            quantity: c.quantity,
            lastWeight: c.weights?.[0]?.weight || null
          }))
          setCattle(mapped)
          setFullCattleData(data.data.items)
        }
      })
      .catch(console.error)

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
      <section className="py-6 bg-[hsl(var(--cream2))]">
        <div className="px-4">
          <h2 className="text-lg font-bold text-[hsl(var(--forest))] mb-4">Pilihan Kami</h2>
          <CatalogSwiper
            cattle={cattle}
            onSelect={setSelectedCattle}
            selectedId={selectedCattle?.id}
          />
        </div>
      </section>
      <PantauPerkembanganSection cattle={fullCattleData} />
      <RecentComments />
      <JourneySection />
      <CattleGrid />
      <TrustRow />
      <CTASection />
    </div>
  )
}
