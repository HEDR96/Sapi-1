// D:\Sapi\src\components\auth\LogoutButton.tsx
'use client'

import { useRouter } from 'next/navigation'

export function useLogout() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return { handleLogout }
}