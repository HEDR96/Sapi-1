'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Beef, Eye, TrendingUp, Users, ArrowUpRight, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@samadya/shared/components/ui/card'
import { Button } from '@samadya/shared/components/ui/button'
import { formatCurrency } from '@samadya/shared/lib/utils/formatters'

interface DashboardStats {
  stats: {
    cattle: { total: number; available: number; sold: number; booked: number }
    sales: { total: number; revenue: number; margin: number }
    customers: { total: number }
    visitors: { today: number; week: number; month: number }
  }
  recentSales: any[]
  recentCattle: any[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard/stats')
      const json = await res.json()
      if (res.ok) {
        setData(json)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const stats = data?.stats

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 mt-1">Selamat datang di panel admin</p>
        </div>
        <Button
          onClick={fetchDashboardData}
          variant="outline"
          size="sm"
          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
        >
          Refresh Data
        </Button>
      </div>

      {/* Stats Grid - Colorful Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cattle Card */}
        <Link href="/admin/cattle">
          <Card className="group h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-500 to-blue-600 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Sapi</p>
                  <p className="text-4xl font-bold text-white mt-2">{stats?.cattle.total || 0}</p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-white/20 text-white text-xs font-medium">
                      {stats?.cattle.available || 0} Tersedia
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-white/20 text-white text-xs font-medium">
                      {stats?.cattle.booked || 0} Dibooking
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur">
                  <Beef className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-blue-100 text-sm group-hover:text-white transition-colors">
                <span>Lihat detail</span>
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Sales Card */}
        <Link href="/admin/sales">
          <Card className="group h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-emerald-500 to-emerald-600 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Total Penjualan</p>
                  <p className="text-4xl font-bold text-white mt-2">{stats?.sales.total || 0}</p>
                  <div className="flex items-center gap-1 mt-3 text-emerald-100">
                    <ArrowUpRight className="h-4 w-4" />
                    <span className="text-sm font-medium">{formatCurrency(stats?.sales.revenue || 0)}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-emerald-100 text-sm group-hover:text-white transition-colors">
                <span>Lihat detail</span>
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Customers Card */}
        <Link href="/admin/customers">
          <Card className="group h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-500 to-purple-600 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Pelanggan</p>
                  <p className="text-4xl font-bold text-white mt-2">{stats?.customers.total || 0}</p>
                  <p className="text-purple-100 text-xs mt-3">Pelanggan terdaftar</p>
                </div>
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-purple-100 text-sm group-hover:text-white transition-colors">
                <span>Lihat detail</span>
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Visitors Card */}
        <Link href="/admin/visitors">
          <Card className="group h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-orange-500 to-orange-600 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Pengunjung Hari Ini</p>
                  <p className="text-4xl font-bold text-white mt-2">{stats?.visitors.today || 0}</p>
                  <div className="flex gap-3 mt-3 text-orange-100 text-xs">
                    <span>{stats?.visitors.week || 0} minggu ini</span>
                    <span>-</span>
                    <span>{stats?.visitors.month || 0} bulan ini</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur">
                  <Eye className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-orange-100 text-sm group-hover:text-white transition-colors">
                <span>Lihat statistik</span>
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Financial Stats - Clean White Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 bg-gray-50/50 border-b border-gray-100">
            <CardTitle className="text-sm font-semibold text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.sales.revenue || 0)}</div>
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
              Pendapatan dari penjualan
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 bg-emerald-50/50 border-b border-emerald-100">
            <CardTitle className="text-sm font-semibold text-emerald-700">Total Margin</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(stats?.sales.margin || 0)}</div>
            <p className="text-xs text-emerald-600 mt-2 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
              Keuntungan bersih
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 bg-blue-50/50 border-b border-blue-100">
            <CardTitle className="text-sm font-semibold text-blue-700">Margin Rata-rata</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">
              {stats?.sales.total && stats.sales.total > 0 && stats.sales.revenue > 0
                ? `${Math.round((stats.sales.margin / stats.sales.revenue) * 100)}%`
                : '0%'}
            </div>
            <p className="text-xs text-blue-600 mt-2 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
              Persentase keuntungan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between bg-gray-50/50 border-b border-gray-100">
            <CardTitle className="text-gray-800 font-semibold">Penjualan Terbaru</CardTitle>
            <Link href="/admin/sales" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
              Lihat semua
            </Link>
          </CardHeader>
          <CardContent className="p-4">
            {data?.recentSales && data.recentSales.length > 0 ? (
              <div className="space-y-3">
                {data.recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl bg-cover bg-center shadow-sm"
                        style={{
                          backgroundImage: sale.cattle.mainImage
                            ? `url(${sale.cattle.mainImage})`
                            : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                        }}
                      />
                      <div>
                        <p className="font-semibold text-gray-800">{sale.cattle.name}</p>
                        <p className="text-xs text-gray-500">
                          {sale.customer.name} - <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${
                            sale.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                            sale.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                            sale.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>{sale.status}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(Number(sale.price))}</p>
                      {sale.margin && (
                        <p className="text-xs text-emerald-600 font-medium">+{formatCurrency(Number(sale.margin))}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-3">Belum ada penjualan</p>
                <Link href="/admin/sales">
                  <Button variant="outline" size="sm" className="border-emerald-300 text-emerald-600 hover:bg-emerald-50">
                    Tambah Penjualan
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Cattle */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between bg-gray-50/50 border-b border-gray-100">
            <CardTitle className="text-gray-800 font-semibold">Sapi Terbaru</CardTitle>
            <Link href="/admin/cattle" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
              Lihat semua
            </Link>
          </CardHeader>
          <CardContent className="p-4">
            {data?.recentCattle && data.recentCattle.length > 0 ? (
              <div className="space-y-3">
                {data.recentCattle.map((cattle) => (
                  <Link
                    key={cattle.id}
                    href={`/admin/cattle/${cattle.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-emerald-50/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl bg-cover bg-center shadow-sm"
                        style={{
                          backgroundImage: cattle.mainImage
                            ? `url(${cattle.mainImage})`
                            : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                        }}
                      />
                      <div>
                        <p className="font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors">{cattle.name}</p>
                        <p className="text-xs text-gray-500">{cattle.code} - {cattle.breed}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      cattle.status === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-700'
                        : cattle.status === 'BOOKED'
                        ? 'bg-yellow-100 text-yellow-700'
                        : cattle.status === 'SOLD'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {cattle.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-3">Belum ada sapi</p>
                <Link href="/admin/cattle/new">
                  <Button variant="outline" size="sm" className="border-emerald-300 text-emerald-600 hover:bg-emerald-50">
                    Tambah Sapi Baru
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
