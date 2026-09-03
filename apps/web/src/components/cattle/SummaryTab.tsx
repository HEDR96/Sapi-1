'use client'

import { CattleWithRelations } from '@samadya/shared/types'
import { formatWeight, formatADG } from '@samadya/shared/lib/utils/formatters'
import { calculateWeightStats } from '@samadya/shared/lib/utils/calculations'
import { TrendingUp, Target, Scale, Calendar } from 'lucide-react'

interface SummaryTabProps {
  cattle: CattleWithRelations
}

export function SummaryTab({ cattle }: SummaryTabProps) {
  const weights = cattle.weights || []
  const weightStats = calculateWeightStats(weights)
  const lastWeight = weights[0]?.weight
  const weightProgress = cattle.targetWeight && lastWeight
    ? Math.min(100, (lastWeight / cattle.targetWeight) * 100)
    : null

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-[hsl(var(--cream))] rounded-lg">
          <div className="flex items-center gap-2 text-[hsl(var(--forest))/60] text-xs mb-1">
            <Scale className="h-3 w-3" />
            Bobot Terakhir
          </div>
          <p className="text-lg font-bold text-[hsl(var(--forest))]">
            {formatWeight(lastWeight || null)}
          </p>
        </div>

        <div className="p-3 bg-[hsl(var(--cream))] rounded-lg">
          <div className="flex items-center gap-2 text-[hsl(var(--forest))/60] text-xs mb-1">
            <TrendingUp className="h-3 w-3" />
            ADG
          </div>
          <p className="text-lg font-bold text-[hsl(var(--forest))]">
            {formatADG(weightStats.adg || 0)}
          </p>
        </div>

        <div className="p-3 bg-[hsl(var(--cream))] rounded-lg">
          <div className="flex items-center gap-2 text-[hsl(var(--forest))/60] text-xs mb-1">
            <Target className="h-3 w-3" />
            Target
          </div>
          <p className="text-lg font-bold text-[hsl(var(--forest))]">
            {formatWeight(cattle.targetWeight)}
          </p>
        </div>

        <div className="p-3 bg-[hsl(var(--cream))] rounded-lg">
          <div className="flex items-center gap-2 text-[hsl(var(--forest))/60] text-xs mb-1">
            <Calendar className="h-3 w-3" />
            Total Timbang
          </div>
          <p className="text-lg font-bold text-[hsl(var(--forest))]">
            {weights.length}x
          </p>
        </div>
      </div>

      {/* Progress */}
      {cattle.targetWeight && weightProgress !== null && (
        <div className="p-4 bg-[hsl(var(--cream))] rounded-lg">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-[hsl(var(--forest))]">Progress Target</span>
            <span className="text-[hsl(var(--forest))]">{weightProgress.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-white rounded-full overflow-hidden">
            <div
              className="h-full bg-[hsl(var(--forest))] rounded-full transition-all"
              style={{ width: `${weightProgress}%` }}
            />
          </div>
          <p className="text-xs text-[hsl(var(--forest))/60] mt-2">
            {formatWeight(lastWeight)} / {formatWeight(cattle.targetWeight)}
          </p>
        </div>
      )}

      {/* Health Summary */}
      {cattle.healthRecords && cattle.healthRecords.length > 0 && (
        <div className="p-4 bg-[hsl(var(--cream))] rounded-lg">
          <h4 className="text-sm font-semibold text-[hsl(var(--forest))] mb-2">Kesehatan</h4>
          <p className="text-sm text-[hsl(var(--forest))/70]">
            {cattle.healthRecords[0].status} - {cattle.healthRecords[0].healthType}
          </p>
        </div>
      )}
    </div>
  )
}
