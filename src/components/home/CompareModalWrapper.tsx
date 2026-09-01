'use client'

import { CompareModal } from './CompareModal'
import { CattleWithRelations } from '@/types'

interface CompareModalWrapperProps {
  isOpen: boolean
  onClose: () => void
  selectedCattle: CattleWithRelations[]
  allCattle: CattleWithRelations[]
  onSelectCattle: (cattle: CattleWithRelations) => void
}

export function CompareModalWrapper({
  isOpen,
  onClose,
  selectedCattle,
  allCattle,
  onSelectCattle
}: CompareModalWrapperProps) {
  return (
    <CompareModal
      isOpen={isOpen}
      onClose={onClose}
      selectedCattle={selectedCattle}
      allCattle={allCattle}
      onSelectCattle={onSelectCattle}
    />
  )
}
