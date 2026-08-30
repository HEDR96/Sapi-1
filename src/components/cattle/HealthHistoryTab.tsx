'use client'

import { CattleHealthRecordWithMedia } from '@/types'
import { formatDate } from '@/lib/utils/formatters'
import { HEALTH_STATUS_LABELS, HealthStatus } from '@/types'
import { Heart, Pill, Stethoscope, Activity } from 'lucide-react'

interface HealthHistoryTabProps {
  records: CattleHealthRecordWithMedia[]
}

const statusColors: Record<HealthStatus, { bg: string; text: string; icon: React.ReactNode }> = {
  SEHAT: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    icon: <Heart className="h-4 w-4" />
  },
  DALAM_PERAWATAN: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    icon: <Pill className="h-4 w-4" />
  },
  OBSERVASI: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    icon: <Stethoscope className="h-4 w-4" />
  },
  SAKIT: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    icon: <Activity className="h-4 w-4" />
  },
  SEMBUH: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    icon: <Heart className="h-4 w-4" />
  },
}

export function HealthHistoryTab({ records }: HealthHistoryTabProps) {
  if (!records || records.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-[hsl(var(--cream))] rounded-full flex items-center justify-center">
          <Heart className="h-8 w-8 text-[hsl(var(--forest))/40]" />
        </div>
        <h3 className="text-lg font-semibold text-[hsl(var(--forest))] mb-2">Belum Ada Riwayat Kesehatan</h3>
        <p className="text-sm text-[hsl(var(--forest))/60]">
          Riwayat kesehatan sapi akan muncul setelah pemeriksaan.
        </p>
      </div>
    )
  }

  // Sort by date (newest first)
  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
  )

  // Count by status
  const statusCounts = records.reduce((acc, record) => {
    acc[record.status] = (acc[record.status] || 0) + 1
    return acc
  }, {} as Record<HealthStatus, number>)

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(Object.keys(HEALTH_STATUS_LABELS) as HealthStatus[]).map((status) => {
          const count = statusCounts[status] || 0
          const colors = statusColors[status]

          return (
            <div
              key={status}
              className={`p-3 rounded-xl border border-[hsl(var(--line))] ${count > 0 ? colors.bg : 'bg-gray-50'}`}
            >
              <div className={`flex items-center gap-2 ${colors.text}`}>
                {colors.icon}
                <span className="text-xs font-medium">{HEALTH_STATUS_LABELS[status]}</span>
              </div>
              <div className="text-2xl font-bold mt-1">{count}x</div>
            </div>
          )
        })}
      </div>

      {/* Health Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[hsl(var(--line))]" />

        <div className="space-y-4">
          {sortedRecords.map((record) => {
            const colors = statusColors[record.status]

            return (
              <div key={record.id} className="relative pl-10">
                {/* Timeline dot */}
                <div className={`absolute left-2.5 top-4 w-3 h-3 rounded-full ${colors.bg} border-2 border-white shadow-sm`} />

                <div className={`p-4 rounded-xl border ${colors.bg.replace('100', '50').replace('bg-', 'border-')} bg-white`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
                          {colors.icon}
                          {HEALTH_STATUS_LABELS[record.status]}
                        </span>
                      </div>
                      <div className="text-sm text-[hsl(var(--forest))/60] mt-1">
                        {formatDate(record.recordDate)}
                      </div>
                    </div>
                  </div>

                  {record.healthType && (
                    <div className="mb-2">
                      <span className="text-xs font-medium text-[hsl(var(--forest))/60]">Jenis Pemeriksaan: </span>
                      <span className="text-sm text-[hsl(var(--forest))]">{record.healthType}</span>
                    </div>
                  )}

                  {record.notes && (
                    <div className="p-3 bg-[hsl(var(--cream))] rounded-lg">
                      <p className="text-sm text-[hsl(var(--forest))/80]">{record.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
