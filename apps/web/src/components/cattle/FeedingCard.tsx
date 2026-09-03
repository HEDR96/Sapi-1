'use client'

import { formatWeight } from '@samadya/shared/lib/utils/formatters'

interface FeedingEntry {
  date: string
  feedType: string
  quantity: number
  notes?: string
}

interface FeedingCardProps {
  entries: FeedingEntry[]
}

export function FeedingCard({ entries }: FeedingCardProps) {
  return (
    <div className="rounded-xl border border-[hsl(var(--line))] bg-white p-5 shadow-card">
      <h3 className="mb-4 text-[13px] font-bold text-[hsl(var(--forest))]">Pakan & Nutrisi</h3>

      <div className="space-y-3">
        {entries.slice(0, 5).map((entry, index) => (
          <div key={index} className="flex items-start justify-between gap-3 rounded-lg border border-[hsl(var(--line))] bg-[hsl(var(--cream))] p-3">
            <div>
              <div className="text-[9px] font-semibold text-[hsl(var(--forest))/55]">
                {new Date(entry.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              <div className="mt-1 text-[10px] font-semibold text-[hsl(var(--forest))]">{entry.feedType}</div>
              {entry.notes && (
                <p className="mt-0.5 text-[9px] text-[hsl(var(--forest))/60]">{entry.notes}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="text-[9px] text-[hsl(var(--forest))/50]">Jumlah</div>
              <div className="text-[11px] font-bold text-[hsl(var(--forest))]">{formatWeight(entry.quantity)}</div>
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-[10px] text-[hsl(var(--forest))/50] text-center py-4">Belum ada data pakan</p>
        )}
      </div>
    </div>
  )
}
