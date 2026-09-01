'use client'

import { CattleWeightWithMedia } from '@/types'
import { formatWeight } from '@/lib/utils/formatters'

interface WeightChartProps {
  weights: CattleWeightWithMedia[]
  height?: number
}

export function WeightChart({ weights, height = 138 }: WeightChartProps) {
  // Sort weights by date ascending for chart
  const sorted = [...weights]
    .sort((a, b) => new Date(a.measurementDate).getTime() - new Date(b.measurementDate).getTime())
    .slice(0, 10)

  if (sorted.length < 2) {
    return (
      <div
        className="flex items-center justify-center text-[hsl(var(--forest))/40] text-xs"
        style={{ height }}
      >
        Minimal 2 data untuk menampilkan grafik
      </div>
    )
  }

  const minWeight = Math.min(...sorted.map(w => w.weight)) - 20
  const maxWeight = Math.max(...sorted.map(w => w.weight)) + 20
  const weightRange = maxWeight - minWeight || 1

  const chartWidth = 420
  const chartHeight = 160
  const padding = { top: 20, right: 20, bottom: 35, left: 45 }

  const plotWidth = chartWidth - padding.left - padding.right
  const plotHeight = chartHeight - padding.top - padding.bottom

  const xScale = (index: number) => padding.left + (index / Math.max(sorted.length - 1, 1)) * plotWidth
  const yScale = (weight: number) => padding.top + plotHeight - ((weight - minWeight) / weightRange) * plotHeight

  // Create SVG path
  const linePath = sorted
    .map((w, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(w.weight)}`)
    .join(' ')

  // Create area path
  const areaPath = `
    ${linePath}
    L ${xScale(sorted.length - 1)} ${chartHeight - padding.bottom}
    L ${padding.left} ${chartHeight - padding.bottom}
    Z
  `

  // Grid lines
  const gridLines = []
  const numLines = 5
  for (let i = 0; i <= numLines; i++) {
    const y = padding.top + (i / numLines) * plotHeight
    const weight = maxWeight - (i / numLines) * weightRange
    gridLines.push(
      <g key={i}>
        <line
          x1={padding.left}
          y1={y}
          x2={chartWidth - padding.right}
          y2={y}
          stroke="#eee7da"
          strokeWidth="1"
        />
        <text
          x={padding.left - 5}
          y={y + 3}
          textAnchor="end"
          fontSize="8"
          fill="#425445"
          fontFamily="Inter, sans-serif"
        >
          {Math.round(weight)} kg
        </text>
      </g>
    )
  }

  // X-axis labels (dates)
  const xLabels = sorted.map((w, i) => {
    const date = new Date(w.measurementDate)
    const label = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    return (
      <text
        key={i}
        x={xScale(i)}
        y={chartHeight - 10}
        textAnchor="middle"
        fontSize="8"
        fill="#2a3d30"
        fontFamily="Inter, sans-serif"
      >
        {label}
      </text>
    )
  })

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full">
      <defs>
        <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#77b47c" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#77b47c" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {gridLines}

      {/* Area fill */}
      <path d={areaPath} fill="url(#areaFill)" />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke="#68A66B"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {sorted.map((w, i) => (
        <circle
          key={w.id}
          cx={xScale(i)}
          cy={yScale(w.weight)}
          r="4"
          fill="#68A66B"
          stroke="#fff"
          strokeWidth="2"
        />
      ))}

      {/* X-axis labels */}
      {xLabels}

      {/* Y-axis label */}
      <text
        x={10}
        y={chartHeight / 2}
        textAnchor="middle"
        fontSize="7"
        fill="#425445"
        fontFamily="Inter, sans-serif"
        transform={`rotate(-90, 10, ${chartHeight / 2})`}
      >
        kg
      </text>
    </svg>
  )
}
