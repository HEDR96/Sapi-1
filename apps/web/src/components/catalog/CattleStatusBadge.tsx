import { Status } from '@samadya/shared/types'
import { cn } from '@samadya/shared/lib/utils/cn'

interface StatusBadgeProps {
  status: Status
  className?: string
  showDot?: boolean
}

const statusConfig: Record<Status, { bg: string; label: string; dotColor?: string; textColor?: string; showDot?: boolean }> = {
  AVAILABLE: { bg: 'bg-emerald-100', label: 'TERSEDIA', dotColor: 'bg-emerald-500', textColor: 'text-emerald-700' },
  SOLD: { bg: 'bg-[#FADCE0]', label: 'TERJUAL', dotColor: 'bg-red-600', textColor: 'text-red-700', showDot: true },
  BOOKED: { bg: 'bg-amber-100', label: 'BOOKING', dotColor: 'bg-amber-500', textColor: 'text-amber-700', showDot: true },
  MENINGGAL: { bg: 'bg-gray-100', label: 'MENINGGAL', dotColor: 'bg-gray-500', textColor: 'text-gray-600', showDot: true },
}

export function StatusBadge({ status, className, showDot }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.AVAILABLE
  const useDot = showDot !== undefined ? showDot : config.showDot

  if (useDot) {
    return (
      <span className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1 font-bold text-[9px] uppercase tracking-wide shadow-sm', config.bg, config.textColor, className)}>
        <span className={cn('h-2 w-2 rounded-full', config.dotColor)}></span>
        {config.label}
      </span>
    )
  }

  return (
    <span className={cn('rounded px-1.5 py-0.5 text-[8px] font-bold text-white', config.bg, className)}>
      {config.label}
    </span>
  )
}
