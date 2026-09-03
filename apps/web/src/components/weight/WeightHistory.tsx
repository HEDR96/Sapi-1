import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@samadya/shared/components/ui/table'
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
      <div className="text-center py-8 text-muted-foreground">
        Belum ada data penimbangan.
      </div>
    )
  }

  const sortedWeights = [...weights].sort(
    (a, b) => new Date(a.measurementDate).getTime() - new Date(b.measurementDate).getTime()
  )

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Bobot</TableHead>
            <TableHead>Kenaikan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedWeights.map((weight, index) => {
            const previousWeight = index > 0 ? sortedWeights[index - 1].weight : null
            const gain = previousWeight ? weight.weight - previousWeight : null

            return (
              <TableRow key={weight.id}>
                <TableCell>{formatDateShort(weight.measurementDate)}</TableCell>
                <TableCell className="font-medium">{formatWeight(weight.weight)}</TableCell>
                <TableCell>
                  {gain !== null ? (
                    <span className={gain >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {gain >= 0 ? '+' : ''}{formatWeight(gain)}
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
