'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface WeightRecord {
  id: string
  weight: number
  measurementDate: Date
}

interface WeightChartProps {
  weights: WeightRecord[]
}

export function WeightChart({ weights }: WeightChartProps) {
  if (weights.length === 0) {
    return (
      <div className="text-center py-8 text-[hsl(var(--forest))/60]">
        Belum ada data untuk grafik.
      </div>
    )
  }

  const data = [...weights]
    .sort((a, b) => new Date(a.measurementDate).getTime() - new Date(b.measurementDate).getTime())
    .map((w) => ({
      date: format(new Date(w.measurementDate), 'dd MMM', { locale: id }),
      fullDate: format(new Date(w.measurementDate), 'dd MMMM yyyy', { locale: id }),
      weight: w.weight,
    }))

  const dataWithGains = data.map((d, index) => ({
    ...d,
    gain: index > 0 ? d.weight - data[index - 1].weight : 0,
  }))

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dataWithGains} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#e5e5e5' }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#e5e5e5' }}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload
                return (
                  <div className="bg-white p-3 border rounded-lg shadow-lg">
                    <p className="font-medium text-[hsl(var(--forest))]">{d.fullDate}</p>
                    <p className="text-[hsl(var(--forest))]">Bobot: {d.weight} Kg</p>
                    {d.gain !== 0 && (
                      <p className={d.gain >= 0 ? 'text-green-600' : 'text-red-600'}>
                        Kenaikan: {d.gain >= 0 ? '+' : ''}{d.gain} Kg
                      </p>
                    )}
                  </div>
                )
              }
              return null
            }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#166534"
            strokeWidth={2}
            dot={{ fill: '#166534', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#166534' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
