'use client'

import { useEffect, useRef, useState } from 'react'
import { HeroSection } from '../components/catalog/HeroSection'
import { JourneySection } from '../components/catalog/JourneySection'
import { TrustRow } from '../components/catalog/TrustRow'
import { CTASection } from '../components/catalog/CTASection'
import { CatalogSection } from '../components/catalog/CatalogSection'
import { PantauPerkembanganSection } from '../components/home/PantauPerkembanganSection'
import { RecentComments } from '../components/home/RecentComments'
import { CattleWithLatestWeight, CattleWithRelations } from '@samadya/shared/types'
import { Columns3, X } from 'lucide-react'
import { CompareModalWrapper } from '../components/home/CompareModalWrapper'

export default function HomePage() {
  const [cattle, setCattle] = useState<CattleWithLatestWeight[]>([])
  const [fullCattleData, setFullCattleData] = useState<CattleWithRelations[]>([])
  const [selectedCattle, setSelectedCattle] = useState<CattleWithRelations | null>(null)
  const [comparingCattle, setComparingCattle] = useState<CattleWithRelations[]>([])
  const [compareModalOpen, setCompareModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch cattle data
    fetch('/api/admin/cattle?status=AVAILABLE&limit=50')
      .then(res => res.json())
      .then(data => {
        // API returns { items: [...], total: number } directly
        const rawItems = Array.isArray(data) ? data : data.items || data.data?.items || []

        // Fall back to the first gallery item when no dedicated mainImage was
        // set (e.g. photos/videos added only via the Dokumentasi tab)
        const items = rawItems.map((c: any) => ({
          ...c,
          mainImage: c.mainImage || c.media?.[0]?.fileUrl || null,
        }))

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
        // Set first cattle as default for hero
        if (items.length > 0 && !selectedCattle) {
          setSelectedCattle(items[0])
        }
        setIsLoading(false)
      })
      .catch(() => {
        console.error('Failed to fetch cattle data')
        setIsLoading(false)
      })

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
  const handleSelectCattle = (c: any) => {
    const full = fullCattleData.find(x => x.id === c.id) || null
    setSelectedCattle(full)
  }

  // Handler for compare selection
  const handleCompareSelect = (cattle: CattleWithRelations) => {
    setComparingCattle(prev => {
      const exists = prev.find(x => x.id === cattle.id)
      if (exists) {
        return prev.filter(x => x.id !== cattle.id)
      }
      if (prev.length >= 3) {
        return prev
      }
      return [...prev, cattle]
    })
  }

  // Open compare modal
  const handleOpenCompare = () => {
    // Initialize with current comparing cattle or selected cattle
    if (comparingCattle.length > 0) {
      setComparingCattle(prev => prev)
    } else if (selectedCattle) {
      setComparingCattle([selectedCattle])
    }
    setCompareModalOpen(true)
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-[hsl(var(--cream2))]">
      <HeroSection
        cattle={fullCattleData}
        selectedCattle={selectedCattle}
        onSelectCattle={handleSelectCattle}
        isLoading={isLoading}
      />
      <JourneySection />
      {/* KATALOG - Combined Swiper/Grid with Toggle */}
      <CatalogSection
        cattle={cattle}
        onSelect={handleSelectCattle}
        selectedId={selectedCattle?.id}
        allCattle={fullCattleData}
        onCompareSelect={handleCompareSelect}
        comparingIds={comparingCattle.map(c => c.id)}
      />

      {/* Compare Drawer */}
      {comparingCattle.length > 0 && (
        <CompareDrawer
          selectedCattle={comparingCattle}
          onOpenModal={handleOpenCompare}
          onRemove={handleCompareSelect}
          onClear={() => setComparingCattle([])}
        />
      )}

      {/* PANTAU PERKEMBANGAN - Below Katalog */}
      <PantauPerkembanganSection
        cattle={selectedCattle}
        allCattle={fullCattleData}
        comparingCattle={comparingCattle}
        onCompareSelect={handleCompareSelect}
        onOpenCompare={handleOpenCompare}
      />
      <TrustRow />
      <RecentComments />
      <CTASection />

      {/* Compare Modal */}
      <CompareModalWrapper
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        selectedCattle={comparingCattle}
        allCattle={fullCattleData}
        onSelectCattle={handleCompareSelect}
      />
    </div>
  )
}

// Compare Drawer Component
function CompareDrawer({
  selectedCattle,
  onOpenModal,
  onRemove,
  onClear
}: {
  selectedCattle: CattleWithRelations[]
  onOpenModal: () => void
  onRemove: (cattle: CattleWithRelations) => void
  onClear: () => void
}) {
  return (
    <div
      id="compareDrawer"
      className="fixed bottom-3 left-1/2 z-[85] flex items-center gap-3 rounded-2xl border border-[hsl(var(--line))] bg-white p-3 shadow-2xl"
      style={{ width: 'min(760px, calc(100vw - 24px))', transform: 'translateX(-50%)' }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[hsl(var(--forest))]">
          <Columns3 className="h-3.5 w-3.5" />
          Bandingkan Sapi
        </div>
        <div className="text-[8px] text-[hsl(var(--forest))/50]">
          {selectedCattle.length} dari 3 sapi dipilih
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onClear}
          className="rounded-lg border border-[hsl(var(--line))] px-3 py-2 text-[8px] font-semibold text-[hsl(var(--forest))]"
        >
          Kosongkan
        </button>
        <button
          onClick={onOpenModal}
          disabled={selectedCattle.length < 2}
          className={`rounded-lg px-3 py-2 text-[8px] font-bold transition-colors ${
            selectedCattle.length >= 2
              ? 'bg-[hsl(var(--forest))] text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Lihat Perbandingan
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {selectedCattle.map(cattle => (
          <div
            key={cattle.id}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-[hsl(var(--line))] bg-[hsl(var(--cream))] px-2 py-1.5"
          >
            <div
              className="h-9 w-9 rounded bg-cover bg-center"
              style={{ backgroundImage: cattle.mainImage ? `url('${cattle.mainImage}')` : undefined }}
            />
            <div>
              <div className="text-[8px] font-bold text-[hsl(var(--forest))]">{cattle.name}</div>
              <div className="text-[7px] text-[hsl(var(--forest))/45]">{cattle.code}</div>
            </div>
            <button
              onClick={() => onRemove(cattle)}
              className="ml-1 grid h-6 w-6 place-items-center rounded-full bg-white text-[hsl(var(--forest))/55 hover:bg-red-100 hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
