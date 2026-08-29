'use client'

import { useEffect, useState } from 'react'
import { Package, TrendingUp, CheckCircle, XCircle, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/formatters'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface DashboardStats {
  totalCattle: number
  availableCattle: number
  soldCattle: number
  reservedCattle: number
  totalValue: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/cattle?limit=1000')
        const data = await res.json()

        const items = data.items || []
        setStats({
          totalCattle: data.total || 0,
          availableCattle: items.filter((c: { status: string }) => c.status === 'AVAILABLE').length,
          soldCattle: items.filter((c: { status: string }) => c.status === 'SOLD').length,
          reservedCattle: items.filter((c: { status: string }) => c.status === 'RESERVED').length,
          totalValue: items.reduce((sum: number, c: { price: number }) => sum + Number(c.price), 0),
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    {
      title: 'Total Sapi',
      value: stats?.totalCattle || 0,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Tersedia',
      value: stats?.availableCattle || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Terjual',
      value: stats?.soldCattle || 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Diboeking',
      value: stats?.reservedCattle || 0,
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Ringkasan data katalog sapi</p>
        </div>
        <Link href="/admin/cattle/new">
          <Button>Tambah Sapi Baru</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className={`text-3xl font-bold ${loading ? 'animate-pulse' : ''}`}>
                      {loading ? '-' : stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Total Value Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Total Nilai Kandang
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-3xl font-bold text-primary ${loading ? 'animate-pulse' : ''}`}>
            {loading ? 'Memuat...' : formatCurrency(stats?.totalValue || 0)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Nilai total seluruh sapi dalam katalog
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/cattle">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <Package className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold">Kelola Sapi</h3>
              <p className="text-sm text-muted-foreground">Lihat dan edit data sapi</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <TrendingUp className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold">Lihat Katalog</h3>
              <p className="text-sm text-muted-foreground">Lihat tampilan publik katalog</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/cattle/new">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <Package className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold">Tambah Sapi</h3>
              <p className="text-sm text-muted-foreground">Tambah sapi baru ke katalog</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
