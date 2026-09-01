'use client'

import { CattleWeightWithMedia } from '@/types'
import { formatWeight, formatDate } from '@/lib/utils/formatters'
import { TrendingUp } from 'lucide-react'

interface WeightHistoryProps {
  weights: CattleWeightWithMedia[]
}

export function WeightHistory({ weights }: WeightHistoryProps) {
  if (!weights || weights.length === 0) {
    return (
      <div className="text-center py-8 text-[hsl(var(--forest))/50]">
        <div className="text-4xl mb-2 flex justify-center">
  <img src="/images/21249315961639312271.svg" alt="weight" className="w-10 h-10 opacity-60" />
</div>
        <p>Belum ada data penimbangan</p>
      </div>
    )
  }

  // Sort by date descending
  const sorted = [...weights].sort((a, b) =>
    new Date(b.measurementDate).getTime() - new Date(a.measurementDate).getTime()
  )

  return (
    <div className="space-y-3">
      {/* Simple Chart */}
      <div className="h-32 flex items-end gap-1 p-4 bg-[hsl(var(--cream))] rounded-lg">
        {sorted.slice(0, 10).reverse().map((w) => {
          const maxWeight = Math.max(...sorted.map(x => x.weight))
          const height = maxWeight > 0 ? (w.weight / maxWeight) * 100 : 0
          return (
            <div key={w.id} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-[hsl(var(--forest))] rounded-t transition-all"
                style={{ height: `${height}%` }}
                title={`${formatWeight(w.weight)} - ${formatDate(w.measurementDate)}`}
              />
              <span className="text-[8px] text-[hsl(var(--forest))/60]">
                {new Date(w.measurementDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          )
        })}
      </div>

      {/* History List */}
      <div className="space-y-2">
        {sorted.map((weight, index) => (
          <div key={weight.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-[hsl(var(--line))]">
            <div>
              <p className="text-sm font-medium text-[hsl(var(--forest))]">
                {formatDate(weight.measurementDate)}
              </p>
              {weight.notes && (
                <p className="text-xs text-[hsl(var(--forest))/60]">{weight.notes}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-[hsl(var(--forest))]">
                {formatWeight(weight.weight)}
              </p>
              {index < sorted.length - 1 && (
                <p className="text-xs text-[hsl(var(--olive))] flex items-center gap-1 justify-end">
                  <TrendingUp className="h-3 w-3" />
                  +{formatWeight(weight.weight - sorted[index + 1].weight)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
