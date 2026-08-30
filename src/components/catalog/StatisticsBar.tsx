'use client'

import { useEffect, useState, useRef } from 'react'
import { Status } from '@/types'

interface Statistics {
  total: number
  available: number
  sold: number
}

interface CounterProps {
  end: number
  suffix: string
  duration?: number
}

function AnimatedCounter({ end, suffix, duration = 1200 }: CounterProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true
            const startTime = performance.now()

            const tick = (now: number) => {
              const elapsed = now - startTime
              const progress = Math.min(elapsed / duration, 1)
              const eased = 1 - Math.pow(1 - progress, 3)
              const current = Math.floor(end * eased)
              setCount(current)

              if (progress < 1) {
                requestAnimationFrame(tick)
              }
            }

            requestAnimationFrame(tick)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [end, duration])

  return (
    <div ref={ref} className="counter text-[18px] font-extrabold text-[hsl(var(--forest))]">
      {count}{suffix}
    </div>
  )
}

export function StatisticsBar() {
  const [stats, setStats] = useState<Statistics>({ total: 0, available: 0, sold: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/cattle')
        const data = await res.json()

        const items = data.items || []
        setStats({
          total: data.total || 0,
          available: items.filter((c: { status: Status }) => c.status === 'AVAILABLE').length,
          sold: items.filter((c: { status: Status }) => c.status === 'SOLD').length,
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <section className="bg-[hsl(var(--cream))]/50 py-8">
      <div className="container">
        <div className="grid grid-cols-3 gap-4 md:gap-8">
          {loading ? (
            <>
              <div className="text-center">
                <div className="mx-auto h-12 w-20 animate-pulse rounded bg-[hsl(var(--muted))]" />
                <div className="mt-1 h-4 w-16 mx-auto animate-pulse rounded bg-[hsl(var(--muted))]" />
              </div>
              <div className="text-center">
                <div className="mx-auto h-12 w-20 animate-pulse rounded bg-[hsl(var(--muted))]" />
                <div className="mt-1 h-4 w-16 mx-auto animate-pulse rounded bg-[hsl(var(--muted))]" />
              </div>
              <div className="text-center">
                <div className="mx-auto h-12 w-20 animate-pulse rounded bg-[hsl(var(--muted))]" />
                <div className="mt-1 h-4 w-16 mx-auto animate-pulse rounded bg-[hsl(var(--muted))]" />
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <AnimatedCounter end={stats.total} suffix="" />
                <p className="mt-1 text-sm text-[hsl(var(--forest))/60]">Total Sapi</p>
              </div>
              <div className="text-center">
                <AnimatedCounter end={stats.available} suffix="" />
                <p className="mt-1 text-sm text-emerald-600">Tersedia</p>
              </div>
              <div className="text-center">
                <AnimatedCounter end={stats.sold} suffix="" />
                <p className="mt-1 text-sm text-rose-600">Terjual</p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
