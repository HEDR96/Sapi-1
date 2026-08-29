'use client'

import { useEffect, useState } from 'react'
import { User } from 'lucide-react'

interface Admin {
  id: string
  name: string
  email: string
  role: string
}

export function AdminHeader() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAdmin() {
      try {
        const res = await fetch('/api/admin/auth/me')
        const data = await res.json()
        if (data.success) {
          setAdmin(data.admin)
        }
      } catch (error) {
        console.error('Failed to fetch admin:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAdmin()
  }, [])

  if (loading) {
    return (
      <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      </header>
    )
  }

  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Kelola katalog sapi Anda</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium">{admin?.name}</p>
          <p className="text-xs text-muted-foreground">{admin?.email}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </header>
  )
}
