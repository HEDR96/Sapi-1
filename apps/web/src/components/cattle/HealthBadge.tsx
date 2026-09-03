import { cn } from '@samadya/shared/lib/utils/cn'

interface HealthBadgeProps {
  status: 'SEHAT' | 'SICK' | 'RECOVERING' | 'UNKNOWN'
  className?: string
}

const config: Record<string, { bg: string; text: string; label: string }> = {
  SEHAT: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Sehat' },
  SICK: { bg: 'bg-red-100', text: 'text-red-700', label: 'Sakit' },
  RECOVERING: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pemulihan' },
  UNKNOWN: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Tidak Diketahui' },
}

export function HealthBadge({ status, className }: HealthBadgeProps) {
  const cfg = config[status] || config.UNKNOWN
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide', cfg.bg, cfg.text, className)}>
      {cfg.label}
    </span>
  )
}
