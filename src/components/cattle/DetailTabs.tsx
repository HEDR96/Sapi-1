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
      <div className="h-full rounded-xl border border-dashed border-[hsl(var(--line))] bg-[hsl(var(--cream))/30] p-6 flex flex-col items-center justify-center text-center">
        {/* Skeleton animation placeholder */}
        <div className="w-full max-w-md space-y-4 animate-pulse">
          {/* Tab skeleton */}
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 w-16 bg-[hsl(var(--line))] rounded" />
            ))}
          </div>
          {/* Content skeleton */}
          <div className="space-y-3 pt-4">
            <div className="h-4 bg-[hsl(var(--line))] rounded w-3/4 mx-auto" />
            <div className="h-4 bg-[hsl(var(--line))] rounded w-1/2 mx-auto" />
            <div className="h-4 bg-[hsl(var(--line))] rounded w-2/3 mx-auto" />
          </div>
          {/* Card skeleton */}
          <div className="mt-6 p-4 bg-white rounded-lg border border-[hsl(var(--line))]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[hsl(var(--cream))] rounded-full" />
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-[hsl(var(--cream))] rounded w-1/3" />
                <div className="h-2 bg-[hsl(var(--cream))] rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>
        <p className="text-[hsl(var(--forest))/40] text-sm mt-6">
          Pilih sapi dari katalog untuk melihat detail perkembangan
        </p>
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
