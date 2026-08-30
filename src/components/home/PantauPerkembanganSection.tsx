'use client'

import { useState } from 'react'
import { CattleWithRelations, CattleWithLatestWeight } from '@/types'
import { CatalogSwiper } from '@/components/catalog/CatalogSwiper'
import { SelectedCattleDetail } from './SelectedCattleDetail'
import { DetailTabs } from '@/components/cattle/DetailTabs'

interface PantauPerkembanganSectionProps {
  cattle: CattleWithRelations[]
}

export function PantauPerkembanganSection({ cattle }: PantauPerkembanganSectionProps) {
  const [selectedCattle, setSelectedCattle] = useState<CattleWithRelations | null>(null)

  // Transform for CatalogSwiper (add lastWeight)
  const cattleForSwiper: CattleWithLatestWeight[] = cattle.map(c => ({
    ...c,
    lastWeight: c.weights?.[0]?.weight || null
  }))

  return (
    <section className="py-12 bg-[hsl(var(--cream2))]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--forest))]">
            Pantau Perkembangan Sapi Anda 🐂
          </h2>
          <p className="text-[hsl(var(--forest))/60] mt-2">
            Pilih sapi untuk melihat detail perkembangan
          </p>
        </div>

        {/* Catalog Swiper */}
        <div className="mb-8">
          <CatalogSwiper
            cattle={cattleForSwiper}
            onSelect={(c) => {
              const full = cattle.find(x => x.id === c.id)
              if (full) setSelectedCattle(full)
            }}
            selectedId={selectedCattle?.id}
          />
        </div>

        {/* Detail Panel */}
        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          <SelectedCattleDetail cattle={selectedCattle} />
          <DetailTabs cattle={selectedCattle} />
        </div>
      </div>
    </section>
  )
}
