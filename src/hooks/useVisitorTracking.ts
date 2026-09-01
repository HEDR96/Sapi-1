'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function useVisitorTracking() {
  const pathname = usePathname()

  useEffect(() => {
    // Track page view
    fetch('/api/visitor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: pathname }),
    }).catch(() => {
      // Silently fail - tracking shouldn't break the app
    })
  }, [pathname])
}

// Track cattle view specifically
export function trackCattleView(cattleId: string, cattleCode: string) {
  fetch('/api/visitor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      page: `/sapi/${cattleCode}`,
      cattleId,
    }),
  }).catch(() => {
    // Silently fail
  })
}
