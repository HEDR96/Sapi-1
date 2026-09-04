'use client'

import { useEffect, useState } from 'react'
import { Eye, Monitor, Smartphone, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@samadya/shared/components/ui/card'
import { formatDate } from '@samadya/shared/lib/utils/formatters'

interface Visitor {
  id: string
  page: string
  ipAddress: string | null
  device: string | null
  browser: string | null
  os: string | null
  country: string | null
  city: string | null
  createdAt: string
}

interface Stats {
  today: number
  week: number
  month: number
  total: number
}

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [stats, setStats] = useState<Stats>({ today: 0, week: 0, month: 0, total: 0 })
  const [pageViews, setPageViews] = useState<{ page: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVisitors()
  }, [])

  const fetchVisitors = async () => {
    try {
      const res = await fetch('/api/admin/visitors')
      const data = await res.json()
      setVisitors(data.visitors || [])
      setStats(data.stats || { today: 0, week: 0, month: 0, total: 0 })
      setPageViews(data.pageViews || [])
    } catch (error) {
      console.error('Failed to fetch visitors:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDeviceIcon = (device: string | null) => {
    if (device === 'mobile') return <Smartphone className="h-4 w-4" />
    if (device === 'tablet') return <Smartphone className="h-4 w-4" />
    return <Monitor className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pengunjung</h2>
        <p className="text-muted-foreground">Statistik pengunjung website</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hari Ini</p>
                <p className="text-3xl font-bold mt-1">{stats.today}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">7 Hari Terakhir</p>
                <p className="text-3xl font-bold mt-1">{stats.week}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">30 Hari Terakhir</p>
                <p className="text-3xl font-bold mt-1">{stats.month}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Eye className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Views */}
        <Card>
          <CardHeader>
            <CardTitle>Halaman Populer</CardTitle>
          </CardHeader>
          <CardContent>
            {pageViews.length > 0 ? (
              <div className="space-y-3">
                {pageViews.map((item, i) => (
                  <div key={item.page} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {i + 1}
                      </span>
                      <span className="font-mono text-sm">{item.page}</span>
                    </div>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Belum ada data</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Visitors */}
        <Card>
          <CardHeader>
            <CardTitle>Pengunjung Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {visitors.length > 0 ? (
              <div className="space-y-3">
                {visitors.slice(0, 10).map((visitor) => (
                  <div key={visitor.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(visitor.device)}
                      <div>
                        <p className="font-medium text-sm">{visitor.page}</p>
                        <p className="text-xs text-muted-foreground">
                          {visitor.browser} • {visitor.os}
                          {visitor.country && ` • ${visitor.country}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(new Date(visitor.createdAt))}
                      </p>
                      {visitor.ipAddress && (
                        <p className="text-xs text-muted-foreground font-mono">{visitor.ipAddress}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Belum ada data</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
