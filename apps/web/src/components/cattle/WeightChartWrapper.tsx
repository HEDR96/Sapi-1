'use client'

import { useEffect, useRef } from 'react'
import { WeightChart } from '@samadya/shared/components/weight/WeightChart'

interface WeightRecord {
  id: string
  weight: number
  measurementDate: Date | string
}

interface WeightChartWrapperProps {
  weights: WeightRecord[]
  className?: string
}

export function WeightChartWrapper({ weights, className }: WeightChartWrapperProps) {
  return (
    <div className="rounded-xl border border-[hsl(var(--line))] bg-white p-5 shadow-card">
      <h3 className="mb-4 text-[13px] font-bold text-[hsl(var(--forest))]">Grafik Bobot</h3>
      <WeightChart weights={weights} />
    </div>
  )
}
