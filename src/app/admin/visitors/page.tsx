'use client'

import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils/formatters'
import { Eye, Users, TrendingUp, Monitor, Smartphone, Globe, Activity } from 'lucide-react'

interface DailyStat {
  date: string
  pageViews: number
  uniqueVisitors: number
  cattleViews: number
}

interface Visitor {
  id: string
  page: string
  device: string
  browser: string
  os: string
  createdAt: string
}

interface PageView {
  page: string
  views: number
}

interface Stats {
  summary: {
    totalPageViews: number
    totalVisitors: number
    totalCattleViews: number
  }
  dailyStats: DailyStat[]
  recentVisitors: Visitor[]
  pageBreakdown: PageView[]
  deviceBreakdown: { device: string; count: number }[]
  browserBreakdown: { browser: string; count: number }[]
}

export default function VisitorsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7')

  useEffect(() => {
    fetchStats()
  }, [period])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/visitor?period=${period}`)
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return <Smartphone className="h-4 w-4" />
      case 'tablet': return <Monitor className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[hsl(var(--forest))]">Statistik Pengunjung</h1>
        <p className="text-[hsl(var(--forest))/60]">Lacak aktivitas pengunjung website</p>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2 mb-6">
        {['7', '14', '30'].map(days => (
          <button
            key={days}
            onClick={() => setPeriod(days)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === days
                ? 'bg-[hsl(var(--forest))] text-white'
                : 'bg-white border border-[hsl(var(--line))] text-[hsl(var(--forest))/70] hover:bg-[hsl(var(--cream))]'
            }`}
          >
            {days} Hari
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse h-32 bg-white rounded-lg border border-[hsl(var(--line))]" />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-[hsl(var(--line))] p-4">
              <div className="flex items-center gap-2 text-[hsl(var(--forest))/60] mb-2">
                <Eye className="h-4 w-4" />
                <span className="text-sm">Total Page Views</span>
              </div>
              <p className="text-3xl font-bold text-[hsl(var(--forest))]">
                {stats.summary.totalPageViews.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-lg border border-[hsl(var(--line))] p-4">
              <div className="flex items-center gap-2 text-[hsl(var(--forest))/60] mb-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">Total Pengunjung</span>
              </div>
              <p className="text-3xl font-bold text-[hsl(var(--forest))]">
                {stats.summary.totalVisitors.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-lg border border-[hsl(var(--line))] p-4">
              <div className="flex items-center gap-2 text-[hsl(var(--forest))/60] mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Dilihat Sapi</span>
              </div>
              <p className="text-3xl font-bold text-[hsl(var(--forest))]">
                {stats.summary.totalCattleViews.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-lg border border-[hsl(var(--line))] p-4">
              <div className="flex items-center gap-2 text-[hsl(var(--forest))/60] mb-2">
                <Activity className="h-4 w-4" />
                <span className="text-sm">Rata-rata/Hari</span>
              </div>
              <p className="text-3xl font-bold text-[hsl(var(--forest))]">
                {Math.round(stats.summary.totalPageViews / parseInt(period))}
              </p>
            </div>
          </div>

          {/* Charts & Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Chart */}
            <div className="bg-white rounded-lg border border-[hsl(var(--line))] p-4">
              <h3 className="font-semibold text-[hsl(var(--forest))] mb-4">Tren Harian</h3>
              <div className="space-y-2">
                {stats.dailyStats.slice(-14).reverse().map((day, idx) => {
                  const maxViews = Math.max(...stats.dailyStats.map(d => d.pageViews), 1)
                  const height = (day.pageViews / maxViews) * 100
                  return (
                    <div key={day.date} className="flex items-center gap-3">
                      <span className="text-xs text-[hsl(var(--forest))/60] w-20">
                        {new Date(day.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                      <div className="flex-1 h-6 bg-[hsl(var(--cream))] rounded overflow-hidden">
                        <div
                          className="h-full bg-[hsl(var(--forest))] transition-all"
                          style={{ width: `${height}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-[hsl(var(--forest))] w-12 text-right">
                        {day.pageViews}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Device Breakdown */}
            <div className="bg-white rounded-lg border border-[hsl(var(--line))] p-4">
              <h3 className="font-semibold text-[hsl(var(--forest))] mb-4">Perangkat</h3>
              <div className="space-y-3">
                {stats.deviceBreakdown.map(d => {
                  const total = stats.deviceBreakdown.reduce((acc, curr) => acc + curr.count, 0)
                  const percent = total > 0 ? Math.round((d.count / total) * 100) : 0
                  return (
                    <div key={d.device}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(d.device)}
                          <span className="text-sm text-[hsl(var(--forest))]">{d.device}</span>
                        </div>
                        <span className="text-sm font-medium">{percent}%</span>
                      </div>
                      <div className="h-2 bg-[hsl(var(--cream))] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[hsl(var(--forest))] rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Browser Breakdown */}
            <div className="bg-white rounded-lg border border-[hsl(var(--line))] p-4">
              <h3 className="font-semibold text-[hsl(var(--forest))] mb-4">Browser</h3>
              <div className="space-y-3">
                {stats.browserBreakdown.map(b => {
                  const total = stats.browserBreakdown.reduce((acc, curr) => acc + curr.count, 0)
                  const percent = total > 0 ? Math.round((b.count / total) * 100) : 0
                  return (
                    <div key={b.browser}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-[hsl(var(--forest))]">{b.browser}</span>
                        <span className="text-sm font-medium">{percent}%</span>
                      </div>
                      <div className="h-2 bg-[hsl(var(--cream))] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[hsl(var(--forest))] rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Page Breakdown */}
            <div className="bg-white rounded-lg border border-[hsl(var(--line))] p-4">
              <h3 className="font-semibold text-[hsl(var(--forest))] mb-4">Halaman Populer</h3>
              <div className="space-y-2">
                {stats.pageBreakdown.slice(0, 5).map((p, idx) => (
                  <div key={p.page} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[hsl(var(--cream))] flex items-center justify-center text-xs font-medium text-[hsl(var(--forest))]">
                      {idx + 1}
                    </span>
                    <span className="flex-1 text-sm text-[hsl(var(--forest))] truncate">{p.page}</span>
                    <span className="text-sm font-medium text-[hsl(var(--forest))]">{p.views}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Visitors */}
          <div className="mt-6 bg-white rounded-lg border border-[hsl(var(--line))] p-4">
            <h3 className="font-semibold text-[hsl(var(--forest))] mb-4">Pengunjung Terbaru</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[hsl(var(--forest))/60] border-b border-[hsl(var(--line))]">
                    <th className="pb-2">Waktu</th>
                    <th className="pb-2">Halaman</th>
                    <th className="pb-2">Perangkat</th>
                    <th className="pb-2">Browser</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentVisitors.slice(0, 10).map(v => (
                    <tr key={v.id} className="border-b border-[hsl(var(--line))/50">
                      <td className="py-2 text-[hsl(var(--forest))/70]">
                        {new Date(v.createdAt).toLocaleString('id-ID')}
                      </td>
                      <td className="py-2 text-[hsl(var(--forest))]">{v.page}</td>
                      <td className="py-2">
                        <span className="px-2 py-0.5 rounded-full bg-[hsl(var(--cream))] text-xs">
                          {v.device}
                        </span>
                      </td>
                      <td className="py-2 text-[hsl(var(--forest))/70]">{v.browser}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-[hsl(var(--forest))/60]">
          Gagal memuat statistik
        </div>
      )}
    </div>
  )
}
