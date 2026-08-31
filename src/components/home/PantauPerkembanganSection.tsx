'use client'

import { CattleWithRelations } from '@/types'
import { SelectedCattleDetail } from './SelectedCattleDetail'
import { DetailTabs } from '@/components/cattle/DetailTabs'

interface PantauPerkembanganSectionProps {
  cattle: CattleWithRelations | null
}

export function PantauPerkembanganSection({ cattle }: PantauPerkembanganSectionProps) {
  return (
    <section className="py-12 bg-[hsl(var(--cream2))]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--forest))]">
            Pantau Perkembangan Sapi Anda 🐂
          </h2>
          <p className="text-[hsl(var(--forest))/60] mt-2">
            {cattle ? `${cattle.name} - ${cattle.code}` : 'Pilih sapi dari katalog untuk melihat detail perkembangan'}
          </p>
        </div>

        {/* Detail Panel */}
        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          <SelectedCattleDetail cattle={cattle} />
          <DetailTabs cattle={cattle} />
        </div>
      </div>
    </section>
  )
}
