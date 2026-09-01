'use client'

import { useState } from 'react'
import { CattleWithRelations } from '@/types'
import { SelectedCattleDetail } from './SelectedCattleDetail'
import { TrackingTabs } from './TrackingTabs'
import { CompareModal } from './CompareModal'

interface PantauPerkembanganSectionProps {
  cattle: CattleWithRelations | null
  allCattle?: CattleWithRelations[]
}

export function PantauPerkembanganSection({ cattle, allCattle = [] }: PantauPerkembanganSectionProps) {
  const [compareModalOpen, setCompareModalOpen] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState<CattleWithRelations[]>([])

  const handleOpenCompare = () => {
    setSelectedForCompare(cattle ? [cattle] : [])
    setCompareModalOpen(true)
  }

  return (
    <section className="tracking-section reveal mx-auto max-w-[1400px] px-4 pb-3 sm:px-5 lg:px-8">
      <div className="tracking-shell rounded-lg border border-[hsl(var(--line))] bg-white shadow-card">
        <div className="grid lg:grid-cols-[220px_1fr] lg:items-start">
          {/* Left Sidebar - Cattle Detail with QR */}
          <aside className="tracking-aside border-b border-[hsl(var(--line))] p-2.5 lg:border-b-0 lg:border-r">
            <SelectedCattleDetail
              cattle={cattle}
              onCompare={handleOpenCompare}
            />
          </aside>

          {/* Right Main - Tabs */}
          <div className="tracking-main p-2.5">
            <TrackingTabs cattle={cattle} />
          </div>
        </div>
      </div>

      {/* Compare Modal */}
      <CompareModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        selectedCattle={selectedForCompare}
        allCattle={allCattle}
        onSelectCattle={(c) => {
          setSelectedForCompare(prev => {
            if (prev.find(x => x.id === c.id)) {
              return prev.filter(x => x.id !== c.id)
            }
            if (prev.length >= 3) return prev
            return [...prev, c]
          })
        }}
      />
    </section>
  )
}
