'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { VerificationForm } from './VerificationForm'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthView = 'login' | 'register' | 'verify'

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [view, setView] = useState<AuthView>('login')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login gagal')
        return
      }

      onClose()
      window.location.reload()
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
          name: formData.get('name'),
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registrasi gagal')
        return
      }

      setEmail(formData.get('email') as string)
      setView('verify')
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setError('')
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--line))]">
          <h2 className="text-lg font-bold text-[hsl(var(--forest))]">
            {view === 'login' && 'Masuk'}
            {view === 'register' && 'Daftar Akun Baru'}
            {view === 'verify' && 'Verifikasi Email'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[hsl(var(--cream))] rounded-full transition-colors">
            <X className="h-5 w-5 text-[hsl(var(--forest))]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--forest))]">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="mt-1 w-full rounded-lg border border-[hsl(var(--line))] px-3 py-2.5 focus:ring-2 focus:ring-[hsl(var(--forest))] focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--forest))]">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  className="mt-1 w-full rounded-lg border border-[hsl(var(--line))] px-3 py-2.5 focus:ring-2 focus:ring-[hsl(var(--forest))] focus:border-transparent transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[hsl(var(--forest))] text-white py-2.5 rounded-lg font-semibold hover:bg-[hsl(var(--forest2))] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                Masuk
              </button>
              <p className="text-center text-sm text-[hsl(var(--forest))/60]">
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => { setView('register'); resetForm(); }}
                  className="text-[hsl(var(--forest))] font-semibold hover:underline"
                >
                  Daftar sekarang
                </button>
              </p>
            </form>
          )}

          {view === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--forest))]">Nama</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="mt-1 w-full rounded-lg border border-[hsl(var(--line))] px-3 py-2.5 focus:ring-2 focus:ring-[hsl(var(--forest))] focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--forest))]">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="mt-1 w-full rounded-lg border border-[hsl(var(--line))] px-3 py-2.5 focus:ring-2 focus:ring-[hsl(var(--forest))] focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--forest))]">Password</label>
                <input
                  name="password"
                  type="password"
                  minLength={6}
                  required
                  className="mt-1 w-full rounded-lg border border-[hsl(var(--line))] px-3 py-2.5 focus:ring-2 focus:ring-[hsl(var(--forest))] focus:border-transparent transition-all"
                />
                <p className="text-xs text-[hsl(var(--forest))/50] mt-1">Minimal 6 karakter</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[hsl(var(--forest))] text-white py-2.5 rounded-lg font-semibold hover:bg-[hsl(var(--forest2))] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                Daftar
              </button>
              <p className="text-center text-sm text-[hsl(var(--forest))/60]">
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => { setView('login'); resetForm(); }}
                  className="text-[hsl(var(--forest))] font-semibold hover:underline"
                >
                  Masuk
                </button>
              </p>
            </form>
          )}

          {view === 'verify' && (
            <VerificationForm
              email={email}
              onSuccess={() => {
                onClose()
                window.location.reload()
              }}
              onBack={() => { setView('login'); resetForm(); }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
