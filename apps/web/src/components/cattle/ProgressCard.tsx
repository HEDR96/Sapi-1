'use client'

import { cn } from '@samadya/shared/lib/utils/cn'
import { formatWeight } from '@samadya/shared/lib/utils/formatters'

interface ProgressCardProps {
  lastWeight: number | null
  avgDailyGain: number | null
  latestWeightDate: string | null
  className?: string
}

export function ProgressCard({ lastWeight, avgDailyGain, latestWeightDate, className }: ProgressCardProps) {
  const weightGainPercent = avgDailyGain ? Math.min(100, avgDailyGain * 50) : 0

  return (
    <div className={cn('rounded-xl border border-[hsl(var(--line))] bg-white p-5 shadow-card', className)}>
      <h3 className="mb-4 text-[13px] font-bold text-[hsl(var(--forest))]">Progress Sapi</h3>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-[10px] text-[hsl(var(--forest))/60]">
            <span>Bobot Sekarang</span>
            <span className="font-bold text-[hsl(var(--forest))]">{lastWeight ? formatWeight(lastWeight) : '-'}</span>
          </div>
          {latestWeightDate && (
            <p className="mt-0.5 text-[9px] text-[hsl(var(--forest))/40]">
              Update: {new Date(latestWeightDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between text-[10px] text-[hsl(var(--forest))/60]">
            <span>ADG (Rata-rata)</span>
            <span className="font-bold text-[hsl(var(--forest))]">
              {avgDailyGain ? `${avgDailyGain.toFixed(2)} kg/hari` : '-'}
            </span>
          </div>
        </div>

        {avgDailyGain !== null && (
          <div>
            <div className="mb-1.5 flex items-center justify-between text-[9px] text-[hsl(var(--forest))/55]">
              <span>Target Qurban</span>
              <span>Ideal</span>
            </div>
            <div className="relative h-3 overflow-hidden rounded-full bg-[hsl(var(--cream))]">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[hsl(var(--forest))] to-[hsl(var(--olive))] transition-all duration-500"
                style={{ width: `${weightGainPercent}%` }}
              />
            </div>
            <p className="mt-1 text-[8px] text-[hsl(var(--forest))/45]">
              {weightGainPercent >= 80 ? 'Sapi dalam kondisi optimal' : 'Sapi masih dalam tahap pertumbuhan'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
