'use client'

import { useEffect, useRef, useState } from 'react'
import { HeroSection } from '@/components/catalog/HeroSection'
import { JourneySection } from '@/components/catalog/JourneySection'
import { TrustRow } from '@/components/catalog/TrustRow'
import { CTASection } from '@/components/catalog/CTASection'
import { CatalogSection } from '@/components/catalog/CatalogSection'
import { PantauPerkembanganSection } from '@/components/home/PantauPerkembanganSection'
import { RecentComments } from '@/components/home/RecentComments'
import { CattleWithLatestWeight, CattleWithRelations } from '@/types'

export default function HomePage() {
  const [cattle, setCattle] = useState<CattleWithLatestWeight[]>([])
  const [fullCattleData, setFullCattleData] = useState<CattleWithRelations[]>([])
  const [selectedCattle, setSelectedCattle] = useState<CattleWithRelations | null>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch cattle data
    fetch('/api/admin/cattle?status=AVAILABLE&limit=20')
      .then(res => res.json())
      .then(data => {
        // API returns { items: [...], total: number } directly
        const items = Array.isArray(data) ? data : data.items || data.data?.items || []

        // Map to CattleWithLatestWeight
        const mapped: CattleWithLatestWeight[] = items.map((c: any) => ({
          id: c.id,
          code: c.code,
          name: c.name,
          breed: c.breed,
          status: c.status,
          price: c.price,
          mainImage: c.mainImage,
          quantity: c.quantity,
          lastWeight: c.lastWeight || c.weights?.[0]?.weight || null
        }))
        setCattle(mapped)
        setFullCattleData(items)
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

  // Handler when user selects a cow from catalog
  const handleSelectCattle = (c: CattleWithLatestWeight) => {
    const full = fullCattleData.find(x => x.id === c.id) || null
    setSelectedCattle(full)
  }

  return (
    <div ref={pageRef} className="mx-auto my-2 max-w-[1500px] overflow-hidden border border-black/30 bg-[hsl(var(--cream2))] shadow-2xl">
      <HeroSection />
      <JourneySection />
      <TrustRow />
      {/* KATALOG - Combined Swiper/Grid with Toggle */}
      <CatalogSection
        cattle={cattle}
        onSelect={handleSelectCattle}
        selectedId={selectedCattle?.id}
      />

      {/* PANTAU PERKEMBANGAN - Below Katalog */}
      <PantauPerkembanganSection cattle={selectedCattle} allCattle={fullCattleData} />

      <RecentComments />
      <CTASection />
    </div>
  )
}
