import { formatDateShort } from '@/lib/utils/formatters'
import { HealthStatus, HEALTH_STATUS_LABELS } from '@/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import { Check, AlertCircle, Activity, Heart, RefreshCw } from 'lucide-react'

interface HealthRecord {
  id: string
  recordDate: Date
  healthType: string
  status: HealthStatus
  notes: string | null
}

interface HealthTimelineProps {
  records: HealthRecord[]
}

const statusStyles: Record<HealthStatus, string> = {
  SEHAT: 'bg-green-100 text-green-800 border-green-200',
  DALAM_PERAWATAN: 'bg-purple-100 text-purple-800 border-purple-200',
  OBSERVASI: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  SAKIT: 'bg-red-100 text-red-800 border-red-200',
  SEMBUH: 'bg-blue-100 text-blue-800 border-blue-200',
}

const statusIcons: Record<HealthStatus, React.ReactNode> = {
  SEHAT: <Check className="h-4 w-4" />,
  DALAM_PERAWATAN: <Heart className="h-4 w-4" />,
  OBSERVASI: <Activity className="h-4 w-4" />,
  SAKIT: <AlertCircle className="h-4 w-4" />,
  SEMBUH: <RefreshCw className="h-4 w-4" />,
}

const healthTypeLabels: Record<string, string> = {
  PEMERIKSAAN_RUTIN: 'Pemeriksaan Rutin',
  VAKSINASI: 'Vaksinasi',
  PENGOBATAN: 'Pengobatan',
  OPERASI: 'Operasi',
  LAINNYA: 'Lainnya',
}

export function HealthTimeline({ records }: HealthTimelineProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Belum ada riwayat kesehatan.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <div
          key={record.id}
          className="border rounded-lg p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn('gap-1', statusStyles[record.status])}>
                {statusIcons[record.status]}
                {HEALTH_STATUS_LABELS[record.status]}
              </Badge>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatDateShort(record.recordDate)}
            </span>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Jenis Pemeriksaan</p>
            <p className="font-medium">
              {healthTypeLabels[record.healthType] || record.healthType}
            </p>
          </div>

          {record.notes && (
            <div>
              <p className="text-sm text-muted-foreground">Catatan</p>
              <p className="text-sm">{record.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
