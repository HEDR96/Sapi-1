import { Progress } from '@/components/ui/progress'
import { formatWeight } from '@/lib/utils/formatters'

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
    <section className="bg-muted/50 rounded-lg p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
        <StatItem label="Bobot Terakhir" value={formatWeight(lastWeight)} />
        <StatItem label="ADG" value={adg ? `${adg} Kg/Hari` : '-'} />
        <StatItem label="Target" value={targetWeight ? formatWeight(targetWeight) : '-'} />
        <StatItem label="Progress" value={`${progressPercentage}%`} />
      </div>

      {targetWeight && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{formatWeight(lastWeight)}</span>
            <span>Target: {formatWeight(targetWeight)}</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>
      )}
    </section>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl md:text-3xl font-bold text-primary">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
