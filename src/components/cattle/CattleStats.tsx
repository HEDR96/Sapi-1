import { formatWeight, formatADG } from '@/lib/utils/formatters'

interface CattleStatsProps {
  lastWeight: number
  adg: number | null
  targetWeight: number | null
  progressPercentage: number
}

export function CattleStats({
  lastWeight,
  adg,
  targetWeight,
  progressPercentage,
}: CattleStatsProps) {
  return (
    <div className="rounded-xl border border-[hsl(var(--line))] bg-white p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <StatItem label="Bobot Terakhir" value={formatWeight(lastWeight)} />
        <StatItem label="ADG" value={formatADG(adg ?? 0)} />
        <StatItem label="Target" value={formatWeight(targetWeight)} />
        <StatItem label="Progress" value={`${progressPercentage.toFixed(0)}%`} />
      </div>

      {targetWeight && (
        <div className="space-y-2">
          <div className="flex justify-between text-[12px]">
            <span className="text-[hsl(var(--forest))/70]">{formatWeight(lastWeight)}</span>
            <span className="text-[hsl(var(--forest))/70]">Target: {formatWeight(targetWeight)}</span>
          </div>
          <div className="h-3 bg-[hsl(var(--cream))] rounded-full overflow-hidden">
            <div
              className="h-full bg-[hsl(var(--olive))] transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[14px] md:text-[18px] font-bold text-[hsl(var(--forest))]">{value}</p>
      <p className="text-[10px] text-[hsl(var(--forest))/60] mt-1">{label}</p>
    </div>
  )
}
