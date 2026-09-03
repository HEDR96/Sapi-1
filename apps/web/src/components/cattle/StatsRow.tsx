'use client'

import { formatWeight } from '@samadya/shared/lib/utils/formatters'

interface StatsRowProps {
  weight: number | null
  age: string | null
  breed: string | null
  gender: string | null
}

export function StatsRow({ weight, age, breed, gender }: StatsRowProps) {
  const items = [
    { label: 'Bobot', value: weight ? formatWeight(weight) : '-' },
    { label: 'Usia', value: age || '-' },
    { label: 'Ras', value: breed || '-' },
    { label: 'Gender', value: gender || '-' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(item => (
        <div key={item.label} className="rounded-lg border border-[hsl(var(--line))] bg-[hsl(var(--cream))] p-3 text-center">
          <div className="text-[9px] font-semibold uppercase tracking-wide text-[hsl(var(--forest))/60]">{item.label}</div>
          <div className="mt-1 text-[13px] font-bold text-[hsl(var(--forest))]">{item.value}</div>
        </div>
      ))}
    </div>
  )
}
