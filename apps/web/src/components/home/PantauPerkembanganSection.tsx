'use client'

import { useState } from 'react'
import { CattleWithRelations } from '@samadya/shared/types'
import { SelectedCattleDetail } from './SelectedCattleDetail'
import { TrackingTabs } from './TrackingTabs'
import { CompareModal } from './CompareModal'

interface PantauPerkembanganSectionProps {
  cattle: CattleWithRelations | null
  allCattle?: CattleWithRelations[]
  comparingCattle?: CattleWithRelations[]
  onCompareSelect?: (cattle: CattleWithRelations) => void
  onOpenCompare?: () => void
}

export function PantauPerkembanganSection({
  cattle,
  allCattle = [],
  comparingCattle = [],
  onCompareSelect,
  onOpenCompare
}: PantauPerkembanganSectionProps) {
  const [compareModalOpen, setCompareModalOpen] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState<CattleWithRelations[]>([])

  const handleOpenCompare = () => {
    const initial = cattle ? [cattle] : comparingCattle.slice(0, 3)
    setSelectedForCompare(initial)
    setCompareModalOpen(true)
  }

  const handleSelectCattle = (c: CattleWithRelations) => {
    if (onCompareSelect) {
      onCompareSelect(c)
    } else {
      setSelectedForCompare(prev => {
        if (prev.find(x => x.id === c.id)) {
          return prev.filter(x => x.id !== c.id)
        }
        if (prev.length >= 3) return prev
        return [...prev, c]
      })
    }
  }

  const handleClose = () => {
    setCompareModalOpen(false)
  }

  const activeComparingCattle = onCompareSelect ? comparingCattle : selectedForCompare

  return (
    <section className="tracking-section reveal mx-auto max-w-[1400px] px-4 pb-3 sm:px-5 lg:px-8">
      <div className="tracking-shell rounded-lg border border-[hsl(var(--line))] bg-white shadow-card">
        <div className="grid lg:grid-cols-[220px_1fr] lg:items-start">
          {/* Left Sidebar - Cattle Detail with QR */}
          <aside className="tracking-aside border-b border-[hsl(var(--line))] p-2.5 lg:border-b-0 lg:border-r">
            <SelectedCattleDetail
              cattle={cattle}
              onCompare={onOpenCompare || handleOpenCompare}
              isComparing={cattle ? comparingCattle.some(c => c.id === cattle.id) : false}
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
        onClose={handleClose}
        selectedCattle={activeComparingCattle}
        allCattle={allCattle}
        onSelectCattle={handleSelectCattle}
      />
    </section>
  )
}
