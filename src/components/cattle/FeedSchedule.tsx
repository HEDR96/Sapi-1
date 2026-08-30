'use client'

import { CattleFeedRecord } from '@/types'
import { formatDate } from '@/lib/utils/formatters'
import { Sprout, Wheat, Pill, Droplets } from 'lucide-react'

interface FeedScheduleProps {
  records: CattleFeedRecord[]
}

const feedIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Rumput': Sprout,
  'Konsentrat': Wheat,
  'Vitamin': Pill,
  'Air': Droplets,
  'default': Sprout,
}

export function FeedSchedule({ records }: FeedScheduleProps) {
  if (!records || records.length === 0) {
    return (
      <div className="text-center py-8 text-[hsl(var(--forest))/50]">
        <div className="text-4xl mb-2">🌿</div>
        <p>Belum ada data pakan</p>
      </div>
    )
  }

  const sorted = [...records].sort((a, b) =>
    new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {sorted.map((record) => {
        const Icon = feedIcons[record.feedType] || feedIcons.default
        return (
          <div key={record.id} className="p-4 bg-white rounded-lg border border-[hsl(var(--line))]">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[hsl(var(--cream))] rounded-lg">
                <Icon className="h-5 w-5 text-[hsl(var(--forest))]" />
              </div>
              <div>
                <p className="font-medium text-[hsl(var(--forest))]">{record.feedType}</p>
                <p className="text-sm text-[hsl(var(--forest))/60]">
                  {record.amount} - {record.frequency}
                </p>
              </div>
            </div>
            <p className="text-xs text-[hsl(var(--forest))/60]">
              {formatDate(record.recordDate)}
            </p>
            {record.notes && (
              <p className="text-xs text-[hsl(var(--forest))/70] mt-2">{record.notes}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
