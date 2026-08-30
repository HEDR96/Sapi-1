'use client'

import { CattleFeedRecord } from '@/types'
import { formatDate } from '@/lib/utils/formatters'
import { Leaf, Wheat, Pill, Droplets, Apple, UtensilsCrossed } from 'lucide-react'

interface FeedHistoryTabProps {
  records: CattleFeedRecord[]
}

const feedIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Rumput Gajah': Leaf,
  'Rumput': Leaf,
  'Konsentrat': Wheat,
  'Vitamin': Pill,
  'Mineral': Pill,
  'Air': Droplets,
  'Hijauan': Apple,
  'Pakan': UtensilsCrossed,
  'default': Wheat,
}

const feedColors: Record<string, { bg: string; icon: string }> = {
  'Rumput Gajah': { bg: 'bg-green-50 border-green-200', icon: 'text-green-600' },
  'Rumput': { bg: 'bg-green-50 border-green-200', icon: 'text-green-600' },
  'Konsentrat': { bg: 'bg-amber-50 border-amber-200', icon: 'text-amber-600' },
  'Vitamin': { bg: 'bg-purple-50 border-purple-200', icon: 'text-purple-600' },
  'Mineral': { bg: 'bg-gray-50 border-gray-200', icon: 'text-gray-600' },
  'Air': { bg: 'bg-blue-50 border-blue-200', icon: 'text-blue-600' },
  'Hijauan': { bg: 'bg-green-50 border-green-200', icon: 'text-green-600' },
  'Pakan': { bg: 'bg-yellow-50 border-yellow-200', icon: 'text-yellow-600' },
}

export function FeedHistoryTab({ records }: FeedHistoryTabProps) {
  if (!records || records.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-[hsl(var(--cream))] rounded-full flex items-center justify-center">
          <Leaf className="h-8 w-8 text-[hsl(var(--forest))/40]" />
        </div>
        <h3 className="text-lg font-semibold text-[hsl(var(--forest))] mb-2">Belum Ada Data Pakan</h3>
        <p className="text-sm text-[hsl(var(--forest))/60]">
          Riwayat pakan sapi akan muncul setelah录入 data.
        </p>
      </div>
    )
  }

  // Sort by date (newest first)
  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
  )

  // Group by feed type
  const feedSummary = records.reduce((acc, record) => {
    if (!acc[record.feedType]) {
      acc[record.feedType] = { count: 0, types: new Set<string>() }
    }
    acc[record.feedType].count++
    acc[record.feedType].types.add(`${record.amount} - ${record.frequency}`)
    return acc
  }, {} as Record<string, { count: number; types: Set<string> }>)

  // Get unique feed types
  const feedTypes = Object.entries(feedSummary)

  return (
    <div className="space-y-6">
      {/* Feed Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {feedTypes.slice(0, 4).map(([feedType, data]) => {
          const Icon = feedIcons[feedType] || feedIcons.default
          const colors = feedColors[feedType] || { bg: 'bg-gray-50 border-gray-200', icon: 'text-gray-600' }

          return (
            <div key={feedType} className={`p-4 rounded-xl border ${colors.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-5 w-5 ${colors.icon}`} />
                <span className="text-sm font-semibold text-[hsl(var(--forest))]">{feedType}</span>
              </div>
              <div className="text-xs text-[hsl(var(--forest))/60]">
                {data.count} kali录入
              </div>
            </div>
          )
        })}
      </div>

      {/* Feed Records List */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-[hsl(var(--forest))]">Riwayat Pakan</h4>

        <div className="grid gap-3 md:grid-cols-2">
          {sortedRecords.map((record) => {
            const Icon = feedIcons[record.feedType] || feedIcons.default
            const colors = feedColors[record.feedType] || { bg: 'bg-gray-50 border-gray-200', icon: 'text-gray-600' }

            return (
              <div
                key={record.id}
                className={`p-4 rounded-xl border ${colors.bg} transition-all hover:shadow-md`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center ${colors.icon}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[hsl(var(--forest))]">{record.feedType}</span>
                      <span className="text-xs text-[hsl(var(--forest))/50]">
                        {formatDate(record.recordDate)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-sm text-[hsl(var(--forest))/70]">
                      <span className="font-medium">{record.amount}</span>
                      <span className="text-[hsl(var(--forest))/40">•</span>
                      <span>{record.frequency}</span>
                    </div>
                    {record.notes && (
                      <p className="mt-2 text-xs text-[hsl(var(--forest))/60] line-clamp-2">
                        {record.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
