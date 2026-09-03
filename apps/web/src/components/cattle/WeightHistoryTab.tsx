'use client'

import { CattleWeightWithMedia } from '@samadya/shared/types'
import { formatWeight, formatDate } from '@samadya/shared/lib/utils/formatters'
import { TrendingUp, Scale, Calendar } from 'lucide-react'

interface WeightHistoryTabProps {
  weights: CattleWeightWithMedia[]
}

export function WeightHistoryTab({ weights }: WeightHistoryTabProps) {
  if (!weights || weights.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-[hsl(var(--cream))] rounded-full flex items-center justify-center">
          <Scale className="h-8 w-8 text-[hsl(var(--forest))/40]" />
        </div>
        <h3 className="text-lg font-semibold text-[hsl(var(--forest))] mb-2">Belum Ada Data Penimbangan</h3>
        <p className="text-sm text-[hsl(var(--forest))/60]">
          Data penimbangan akan muncul setelah sapi ditimbang.
        </p>
      </div>
    )
  }

  // Sort weights by date (newest first)
  const sortedWeights = [...weights].sort(
    (a, b) => new Date(b.measurementDate).getTime() - new Date(a.measurementDate).getTime()
  )

  // Calculate statistics
  const latestWeight = sortedWeights[0]?.weight || 0
  const initialWeight = sortedWeights[sortedWeights.length - 1]?.weight || 0
  const totalGain = latestWeight - initialWeight
  const daysDiff = sortedWeights.length > 1
    ? Math.ceil((new Date(sortedWeights[0].measurementDate).getTime() - new Date(sortedWeights[sortedWeights.length - 1].measurementDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0
  const avgDailyGain = daysDiff > 0 ? totalGain / daysDiff : 0

  // Group by month
  const groupedByMonth = sortedWeights.reduce((acc, weight) => {
    const date = new Date(weight.measurementDate)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

    if (!acc[monthKey]) {
      acc[monthKey] = { label: monthLabel, weights: [] }
    }
    acc[monthKey].weights.push(weight)
    return acc
  }, {} as Record<string, { label: string; weights: CattleWeightWithMedia[] }>)

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-xl border border-[hsl(var(--line))]">
          <div className="flex items-center gap-2 text-[hsl(var(--forest))/60] mb-1">
            <Scale className="h-4 w-4" />
            <span className="text-xs">Berat Sekarang</span>
          </div>
          <div className="text-xl font-bold text-[hsl(var(--forest))]">
            {formatWeight(latestWeight)}
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-[hsl(var(--line))]">
          <div className="flex items-center gap-2 text-[hsl(var(--forest))/60] mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">Total Kenaikan</span>
          </div>
          <div className="text-xl font-bold text-[hsl(var(--olive))]">
            +{formatWeight(totalGain)}
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-[hsl(var(--line))]">
          <div className="flex items-center gap-2 text-[hsl(var(--forest))/60] mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Rata-rata/Hari</span>
          </div>
          <div className="text-xl font-bold text-[hsl(var(--forest))]">
            {avgDailyGain.toFixed(2)} kg
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-[hsl(var(--line))]">
          <div className="flex items-center gap-2 text-[hsl(var(--forest))/60] mb-1">
            <Scale className="h-4 w-4" />
            <span className="text-xs">Total Penimbangan</span>
          </div>
          <div className="text-xl font-bold text-[hsl(var(--forest))]">
            {weights.length}x
          </div>
        </div>
      </div>

      {/* Weight List by Month */}
      <div className="space-y-6">
        {Object.entries(groupedByMonth).map(([monthKey, { label, weights: monthWeights }]) => (
          <div key={monthKey}>
            <h4 className="text-sm font-semibold text-[hsl(var(--forest))] mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[hsl(var(--forest))]" />
              {label}
            </h4>
            <div className="space-y-2">
              {monthWeights.map((weight, idx) => {
                const prevWeight = monthWeights[idx + 1]?.weight
                const gain = prevWeight ? weight.weight - prevWeight : 0

                return (
                  <div
                    key={weight.id}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-[hsl(var(--line))] hover:border-[hsl(var(--forest))/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[hsl(var(--cream))] flex items-center justify-center">
                        <Scale className="h-5 w-5 text-[hsl(var(--forest))]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[hsl(var(--forest))]">
                          {formatDate(weight.measurementDate)}
                        </div>
                        {weight.notes && (
                          <div className="text-xs text-[hsl(var(--forest))/60]">
                            {weight.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[hsl(var(--forest))]">
                        {formatWeight(weight.weight)}
                      </div>
                      {gain !== 0 && (
                        <div className={`text-xs font-medium ${gain > 0 ? 'text-[hsl(var(--olive))]' : 'text-red-500'}`}>
                          {gain > 0 ? '+' : ''}{gain.toFixed(1)} kg
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
