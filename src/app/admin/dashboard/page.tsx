'use client'

import { useEffect, useState, useCallback } from 'react'
import { Package, TrendingUp, CheckCircle, XCircle, DollarSign, ArrowRight, RefreshCw } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import Link from 'next/link'

interface DashboardStats {
  totalCattle: number
  availableCattle: number
  soldCattle: number
  bookedCattle: number
  totalValue: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      // Use admin API for dashboard to avoid pagination limits
      const res = await fetch('/api/admin/cattle')
      const data = await res.json()

      const items = data.items || []
      setStats({
        totalCattle: data.total || 0,
        availableCattle: items.filter((c: { status: string }) => c.status === 'AVAILABLE').length,
        soldCattle: items.filter((c: { status: string }) => c.status === 'SOLD').length,
        bookedCattle: items.filter((c: { status: string }) => c.status === 'BOOKED').length,
        totalValue: items.reduce((sum: number, c: { price: number }) => sum + Number(c.price), 0),
      })
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [fetchStats])

  const statCards = [
    {
      title: 'Total Sapi',
      value: stats?.totalCattle || 0,
      icon: Package,
      color: 'bg-[hsl(var(--forest))]/10 text-[hsl(var(--forest))]',
    },
    {
      title: 'Tersedia',
      value: stats?.availableCattle || 0,
      icon: CheckCircle,
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      title: 'Terjual',
      value: stats?.soldCattle || 0,
      icon: XCircle,
      color: 'bg-rose-100 text-rose-600',
    },
    {
      title: 'Dibooking',
      value: stats?.bookedCattle || 0,
      icon: TrendingUp,
      color: 'bg-amber-100 text-amber-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[hsl(var(--forest))]">Dashboard</h2>
          <div className="flex items-center gap-2">
            <p className="text-sm text-[hsl(var(--forest))/60]">Ringkasan data katalog sapi</p>
            {lastUpdated && (
              <span className="text-xs text-[hsl(var(--forest))/40]">
                • Update: {lastUpdated.toLocaleTimeString('id-ID')}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border border-[hsl(var(--line))] bg-white px-3 py-2 text-sm font-medium text-[hsl(var(--forest))] hover:bg-[hsl(var(--cream))] transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/admin/cattle/new"
            className="inline-flex items-center gap-2 rounded-md bg-[hsl(var(--forest))] px-4 py-2 text-sm font-semibold text-white hover:bg-[hsl(var(--forest2))] transition-colors"
          >
            + Tambah Sapi Baru
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.title}
              className="rounded-xl border border-[hsl(var(--line))] bg-white p-5 shadow-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-[hsl(var(--forest))/55]">{stat.title}</p>
                  <p className={`text-3xl font-bold text-[hsl(var(--forest))] ${loading ? 'animate-pulse' : ''}`}>
                    {loading ? '-' : stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Total Value Card */}
      <div className="rounded-xl border border-[hsl(var(--line))] bg-white p-5 shadow-card">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-full bg-[hsl(var(--gold))/20 text-[hsl(var(--gold))]">
            <DollarSign className="h-5 w-5" />
          </div>
          <h3 className="text-[13px] font-bold text-[hsl(var(--forest))]">Total Nilai Kandang</h3>
        </div>
        <p className={`text-3xl font-bold text-[hsl(var(--forest))] ${loading ? 'animate-pulse' : ''}`}>
          {loading ? 'Memuat...' : formatCurrency(stats?.totalValue || 0)}
        </p>
        <p className="text-[11px] text-[hsl(var(--forest))/55] mt-1">
          Nilai total seluruh sapi dalam katalog
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/cattle">
          <div className="cow-card rounded-xl border border-[hsl(var(--line))] bg-white p-5 shadow-card cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-[hsl(var(--forest))]/10 text-[hsl(var(--forest))]">
                <Package className="h-5 w-5" />
              </div>
              <h3 className="text-[12px] font-bold text-[hsl(var(--forest))]">Kelola Sapi</h3>
            </div>
            <p className="text-[10px] text-[hsl(var(--forest))/60] mb-3">Lihat dan edit data sapi</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[hsl(var(--forest))]">
              Lihat <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </Link>
        <Link href="/">
          <div className="cow-card rounded-xl border border-[hsl(var(--line))] bg-white p-5 shadow-card cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-[hsl(var(--olive))/20 text-[hsl(var(--olive))]">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-[12px] font-bold text-[hsl(var(--forest))]">Lihat Katalog</h3>
            </div>
            <p className="text-[10px] text-[hsl(var(--forest))/60] mb-3">Lihat tampilan publik katalog</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[hsl(var(--forest))]">
              Buka <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </Link>
        <Link href="/admin/cattle/new">
          <div className="cow-card rounded-xl border border-[hsl(var(--line))] bg-white p-5 shadow-card cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-[hsl(var(--gold))/20 text-[hsl(var(--gold))]">
                <Package className="h-5 w-5" />
              </div>
              <h3 className="text-[12px] font-bold text-[hsl(var(--forest))]">Tambah Sapi</h3>
            </div>
            <p className="text-[10px] text-[hsl(var(--forest))/60] mb-3">Tambah sapi baru ke katalog</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[hsl(var(--forest))]">
              Tambah <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </Link>
      </div>
    </div>
  )
}
