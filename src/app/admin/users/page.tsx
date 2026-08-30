'use client'

import { useState, useEffect } from 'react'
import { Search, Trash2, Shield, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils/formatters'

interface UserData {
  id: string
  name: string | null
  email: string
  role: string
  emailVerified: boolean
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchUsers() }, [search])

  const fetchUsers = async () => {
    setLoading(true)
    const url = search ? `/api/admin/users?search=${encodeURIComponent(search)}` : '/api/admin/users'
    const res = await fetch(url)
    const data = await res.json()
    setUsers(data.users || [])
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus user ini?')) return
    await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' })
    fetchUsers()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen User</h1>
          <p className="text-muted-foreground">Kelola akun user</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Memuat...</p>
          ) : users.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Belum ada user</p>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[hsl(var(--cream))] rounded-full">
                      {u.role === 'ADMIN' ? (
                        <Shield className="h-5 w-5 text-[hsl(var(--forest))]" />
                      ) : (
                        <User className="h-5 w-5 text-[hsl(var(--forest))]" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{u.name || 'Tanpa Nama'}</p>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Bergabung {formatDate(u.createdAt)} • {u.emailVerified ? 'Terverifikasi' : 'Belum verifikasi'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {u.role}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(u.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
