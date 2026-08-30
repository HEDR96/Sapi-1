'use client'

import { useState } from 'react'
import { CattleWithRelations } from '@/types'
import { SummaryTab } from './SummaryTab'
import { WeightHistory } from './WeightHistory'
import { HealthTimeline } from './HealthTimeline'
import { FeedSchedule } from './FeedSchedule'
import { MediaGallery } from './MediaGallery'

interface DetailTabsProps {
  cattle: CattleWithRelations | null
}

type TabKey = 'summary' | 'weights' | 'health' | 'feed' | 'media'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'summary', label: 'Ringkasan' },
  { key: 'weights', label: 'Timbang' },
  { key: 'health', label: 'Kesehatan' },
  { key: 'feed', label: 'Pakan' },
  { key: 'media', label: 'Dokumentasi' },
]

export function DetailTabs({ cattle }: DetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('summary')

  if (!cattle) {
    return (
      <div className="h-full flex items-center justify-center text-[hsl(var(--forest))/50]">
        Pilih sapi untuk melihat detail
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col rounded-xl border border-[hsl(var(--line))] bg-white overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b border-[hsl(var(--line))] overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'text-[hsl(var(--forest))] border-b-2 border-[hsl(var(--forest))]'
                : 'text-[hsl(var(--forest))/60] hover:text-[hsl(var(--forest))]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'summary' && <SummaryTab cattle={cattle} />}
        {activeTab === 'weights' && <WeightHistory weights={cattle.weights || []} />}
        {activeTab === 'health' && <HealthTimeline records={cattle.healthRecords || []} />}
        {activeTab === 'feed' && <FeedSchedule records={cattle.feedRecords || []} />}
        {activeTab === 'media' && <MediaGallery media={cattle.media || []} />}
      </div>
    </div>
  )
}
