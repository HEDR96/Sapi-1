'use client'

import { useState, useEffect } from 'react'

interface CattleOption {
  id: string
  code: string
  name: string
  breed: string
  status: string
}

interface CattleSelectProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function CattleSelect({ value, onChange, className = '' }: CattleSelectProps) {
  const [cattle, setCattle] = useState<CattleOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/cattle/select')
      .then(res => res.json())
      .then(data => {
        setCattle(data.cattle || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-lg border border-[hsl(var(--line))] bg-white px-3 py-2 text-[hsl(var(--forest))] focus:ring-2 focus:ring-[hsl(var(--forest))] focus:border-transparent ${className}`}
      disabled={loading}
    >
      <option value="">Pilih Sapi</option>
      {cattle.map(c => (
        <option key={c.id} value={c.id}>
          {c.name} ({c.code}) - {c.breed}
        </option>
      ))}
    </select>
  )
}
