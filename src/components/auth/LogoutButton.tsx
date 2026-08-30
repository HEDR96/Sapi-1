// D:\Sapi\src\components\auth\LogoutButton.tsx
'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

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

export function LogoutButton() {
  const { handleLogout } = useLogout()

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
    >
      <LogOut className="h-4 w-4" />
      Keluar
    </button>
  )
}