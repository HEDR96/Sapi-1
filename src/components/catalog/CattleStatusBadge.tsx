import { cn } from '@/lib/utils/cn'
import { Status, STATUS_LABELS } from '@/types'

interface StatusBadgeProps {
  status: Status
  className?: string
}

const statusStyles: Record<Status, string> = {
  AVAILABLE: 'bg-green-100 text-green-800 border-green-200',
  SOLD: 'bg-red-100 text-red-800 border-red-200',
  RESERVED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ARCHIVED: 'bg-gray-100 text-gray-800 border-gray-200',
}

const statusDots: Record<Status, string> = {
  AVAILABLE: 'bg-green-500',
  SOLD: 'bg-red-500',
  RESERVED: 'bg-yellow-500',
  ARCHIVED: 'bg-gray-500',
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
        statusStyles[status],
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', statusDots[status])} />
      {STATUS_LABELS[status]}
    </span>
  )
}
