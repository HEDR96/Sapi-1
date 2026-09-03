import { formatWeight, formatDateShort } from '@samadya/shared/lib/utils/formatters'

interface WeightRecord {
  id: string
  weight: number
  measurementDate: Date
  notes: string | null
}

interface WeightHistoryProps {
  weights: WeightRecord[]
}

export function WeightHistory({ weights }: WeightHistoryProps) {
  if (weights.length === 0) {
    return (
      <div className="text-center py-8 text-[hsl(var(--forest))/60]">
        Belum ada data penimbangan.
      </div>
    )
  }

  const sortedWeights = [...weights].sort(
    (a, b) => new Date(a.measurementDate).getTime() - new Date(b.measurementDate).getTime()
  )

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-[hsl(var(--cream))]">
            <th className="text-left px-4 py-3 font-semibold text-[hsl(var(--forest))]">Tanggal</th>
            <th className="text-left px-4 py-3 font-semibold text-[hsl(var(--forest))]">Bobot</th>
            <th className="text-left px-4 py-3 font-semibold text-[hsl(var(--forest))]">Kenaikan</th>
          </tr>
        </thead>
        <tbody>
          {sortedWeights.map((weight, index) => {
            const previousWeight = index > 0 ? sortedWeights[index - 1].weight : null
            const gain = previousWeight ? weight.weight - previousWeight : null

            return (
              <tr key={weight.id} className="border-b last:border-b-0 hover:bg-[hsl(var(--cream))/50]">
                <td className="px-4 py-3 text-[hsl(var(--forest))/70]">{formatDateShort(weight.measurementDate)}</td>
                <td className="px-4 py-3 font-medium text-[hsl(var(--forest))]">{formatWeight(weight.weight)}</td>
                <td className="px-4 py-3">
                  {gain !== null ? (
                    <span className={gain >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {gain >= 0 ? '+' : ''}{formatWeight(gain)}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
