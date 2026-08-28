import { formatDateShort } from '@/lib/utils/formatters'
import { Badge } from '@/components/ui/badge'

interface FeedRecord {
  id: string
  recordDate: Date
  feedType: string
  amount: string
  frequency: string
  notes: string | null
}

interface FeedHistoryProps {
  records: FeedRecord[]
}

export function FeedHistory({ records }: FeedHistoryProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Belum ada riwayat pakan.
      </div>
    )
  }

  const parseFeedTypes = (feedType: string): string[] => {
    try {
      const parsed = JSON.parse(feedType)
      return Array.isArray(parsed) ? parsed : [feedType]
    } catch {
      return [feedType]
    }
  }

  return (
    <div className="space-y-4">
      {records.map((record) => {
        const feedTypes = parseFeedTypes(record.feedType)

        return (
          <div
            key={record.id}
            className="border rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {formatDateShort(record.recordDate)}
              </span>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Jenis Pakan</p>
              <div className="flex flex-wrap gap-2">
                {feedTypes.map((type, index) => (
                  <Badge key={index} variant="secondary">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Jumlah</p>
                <p className="font-medium">{record.amount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Frekuensi</p>
                <p className="font-medium">{record.frequency}</p>
              </div>
            </div>

            {record.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Catatan</p>
                <p className="text-sm">{record.notes}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
