'use client'

import Image from 'next/image'
import { CattleHealthRecordWithMedia, HealthStatus } from '@/types'
import { formatDate } from '@/lib/utils/formatters'
import { HEALTH_STATUS_LABELS } from '@/types'

interface HealthTimelineProps {
  records: CattleHealthRecordWithMedia[]
}

const statusColors: Record<HealthStatus, string> = {
  SEHAT: 'bg-green-100 text-green-700',
  DALAM_PERAWATAN: 'bg-yellow-100 text-yellow-700',
  OBSERVASI: 'bg-orange-100 text-orange-700',
  SAKIT: 'bg-red-100 text-red-700',
  SEMBUH: 'bg-blue-100 text-blue-700',
}

export function HealthTimeline({ records }: HealthTimelineProps) {
  if (!records || records.length === 0) {
    return (
      <div className="text-center py-8 text-[hsl(var(--forest))/50]">
        <div className="mb-2 flex justify-center">
          <div className="relative w-14 h-14">
            <Image src="/images/21433058761642998739.svg" alt="Kesehatan" fill className="object-contain opacity-50" unoptimized />
          </div>
        </div>
        <p>Belum ada data kesehatan</p>
      </div>
    )
  }

  const sorted = [...records].sort((a, b) =>
    new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
  )

  return (
    <div className="space-y-4">
      {sorted.map((record) => (
        <div key={record.id} className="relative pl-6 pb-4 border-l-2 border-[hsl(var(--line))] last:border-0">
          {/* Timeline dot */}
          <div className={`absolute left-[-5px] top-0 w-2 h-2 rounded-full ${
            record.status === 'SEHAT' ? 'bg-green-500' :
            record.status === 'SAKIT' ? 'bg-red-500' :
            'bg-amber-500'
          }`} />

          <div className="p-3 bg-white rounded-lg border border-[hsl(var(--line))]">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--forest))]">
                  {formatDate(record.recordDate)}
                </p>
                <p className="text-xs text-[hsl(var(--forest))/60]">{record.healthType}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[record.status]}`}>
                {HEALTH_STATUS_LABELS[record.status]}
              </span>
            </div>
            {record.notes && (
              <p className="text-sm text-[hsl(var(--forest))/70]">{record.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
