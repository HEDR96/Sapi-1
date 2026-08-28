'use client'

import { useEffect, useState } from 'react'

interface Statistics {
  total: number
  available: number
  sold: number
}

export function StatisticsBar() {
  const [stats, setStats] = useState<Statistics>({ total: 0, available: 0, sold: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/cattle')
        const data = await res.json()

        const items = data.items || []
        setStats({
          total: data.total || 0,
          available: items.filter((c: { status: string }) => c.status === 'AVAILABLE').length,
          sold: items.filter((c: { status: string }) => c.status === 'SOLD').length,
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statItems = [
    { label: 'Total Sapi', value: stats.total, color: 'text-primary' },
    { label: 'Tersedia', value: stats.available, color: 'text-green-600' },
    { label: 'Terjual', value: stats.sold, color: 'text-red-600' },
  ]

  return (
    <section className="bg-muted/50 py-8">
      <div className="container">
        <div className="grid grid-cols-3 gap-4 md:gap-8">
          {statItems.map((stat) => (
            <div key={stat.label} className="text-center">
              {loading ? (
                <div className="h-12 w-20 mx-auto bg-muted animate-pulse rounded" />
              ) : (
                <p className={`text-3xl md:text-4xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
