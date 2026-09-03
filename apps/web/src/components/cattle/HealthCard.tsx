'use client'

import { HealthBadge } from './HealthBadge'
import { formatWeight } from '@samadya/shared/lib/utils/formatters'

interface HealthEntry {
  date: string
  status: 'SEHAT' | 'SICK' | 'RECOVERING' | 'UNKNOWN'
  notes?: string
  weight?: number | null
}

interface HealthCardProps {
  entries: HealthEntry[]
  latestStatus: 'SEHAT' | 'SICK' | 'RECOVERING' | 'UNKNOWN'
  latestWeight?: number | null
}

export function HealthCard({ entries, latestStatus, latestWeight }: HealthCardProps) {
  return (
    <div className="rounded-xl border border-[hsl(var(--line))] bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[13px] font-bold text-[hsl(var(--forest))]">Kesehatan</h3>
        <HealthBadge status={latestStatus} />
      </div>

      <div className="space-y-3">
        {entries.slice(0, 5).map((entry, index) => (
          <div key={index} className="flex items-start justify-between gap-3 rounded-lg border border-[hsl(var(--line))] bg-[hsl(var(--cream))] p-3">
            <div>
              <div className="text-[9px] font-semibold text-[hsl(var(--forest))/55]">
                {new Date(entry.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              <div className="mt-1 text-[10px] font-semibold text-[hsl(var(--forest))]">
                <HealthBadge status={entry.status} />
              </div>
              {entry.notes && (
                <p className="mt-1 text-[9px] text-[hsl(var(--forest))/60]">{entry.notes}</p>
              )}
            </div>
            {entry.weight && (
              <div className="text-right shrink-0">
                <div className="text-[9px] text-[hsl(var(--forest))/50]">Bobot</div>
                <div className="text-[11px] font-bold text-[hsl(var(--forest))]">{formatWeight(entry.weight)}</div>
              </div>
            )}
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-[10px] text-[hsl(var(--forest))/50] text-center py-4">Belum ada data kesehatan</p>
        )}
      </div>
    </div>
  )
}
