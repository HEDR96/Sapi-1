'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Beef, Loader2, LayoutDashboard, ShieldCheck } from 'lucide-react'
import { Button } from '@samadya/shared/components/ui/button'
import { Input } from '@samadya/shared/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@samadya/shared/components/ui/card'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login gagal')
        return
      }

      router.push('/admin/dashboard')
      router.refresh()
    } catch {
      setError('Terjadi kesalahan saat login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile Navbar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[hsl(var(--line))] bg-white px-4 lg:hidden">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-full border border-[hsl(var(--forest))/30] bg-[hsl(var(--forest))]">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <span className="text-[13px] font-extrabold tracking-[.08em] text-[hsl(var(--forest))]">
            samadyafarm.id
          </span>
          <span className="text-[8px] text-[hsl(var(--forest))/60]">ADMIN</span>
        </Link>
        <Link href="/admin/dashboard">
          <Button variant="outline" size="sm" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
        </Link>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center bg-muted/50 px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary p-3">
                <Beef className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl">Admin Login</CardTitle>
              <CardDescription>
                Masuk untuk mengelola katalog sapi
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="......"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Masuk
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>Default: admin@sapikatalog.com / admin123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
