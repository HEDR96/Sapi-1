'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface VerificationFormProps {
  email: string
  onSuccess: () => void
  onBack: () => void
}

export function VerificationForm({ email, onSuccess, onBack }: VerificationFormProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resending, setResending] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Verifikasi gagal')
        return
      }

      setSuccess(true)
      setTimeout(onSuccess, 1500)
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await fetch('/api/auth/resend-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } catch {
      // Silent fail
    } finally {
      setResending(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-[hsl(var(--forest))]">Email Diverifikasi!</h3>
        <p className="text-[hsl(var(--forest))/60] mt-2">Akun Anda sudah aktif.</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-[hsl(var(--forest))/70] mb-6">
        Kami telah mengirim kode verifikasi ke <strong className="text-[hsl(var(--forest))]">{email}</strong>
      </p>
      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--forest))] mb-2">Kode Verifikasi</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            placeholder="000000"
            required
            className="w-full rounded-lg border border-[hsl(var(--line))] px-3 py-3 text-center text-2xl tracking-widest focus:ring-2 focus:ring-[hsl(var(--forest))] focus:border-transparent transition-all"
            style={{ fontFamily: 'monospace' }}
          />
        </div>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full bg-[hsl(var(--forest))] text-white py-3 rounded-lg font-semibold hover:bg-[hsl(var(--forest2))] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verifikasi'}
        </button>
      </form>
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          onClick={handleResend}
          disabled={resending}
          className="text-sm text-[hsl(var(--forest))] hover:underline disabled:opacity-50"
        >
          {resending ? 'Mengirim...' : 'Kirim ulang kode'}
        </button>
        <span className="text-[hsl(var(--forest))/30]">|</span>
        <button onClick={onBack} className="text-sm text-[hsl(var(--forest))/60] hover:underline">
          Kembali
        </button>
      </div>
    </div>
  )
}
