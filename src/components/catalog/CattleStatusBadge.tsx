import { Status } from '@/types'
import { cn } from '@/lib/utils/cn'

interface StatusBadgeProps {
  status: Status
  className?: string
}

const statusConfig: Record<Status, { bg: string; label: string }> = {
  AVAILABLE: { bg: 'bg-emerald-700', label: 'TERSEDIA' },
  SOLD: { bg: 'bg-rose-700', label: 'SOLD' },
  BOOKED: { bg: 'bg-amber-500', label: 'DIBOOKING' },
  ARCHIVED: { bg: 'bg-gray-500', label: 'DIARCHIVE' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.AVAILABLE

  return (
    <span
      className={cn(
        'rounded px-1.5 py-0.5 text-[8px] font-bold text-white',
        config.bg,
        className
      )}
    >
      {config.label}
    </span>
  )
}
