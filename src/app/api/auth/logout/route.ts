import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth/jwt'

export const dynamic = 'force-dynamic'

export async function POST() {
  const cookie = clearAuthCookie()

  const response = NextResponse.json({
    success: true,
    message: 'Logout berhasil',
  })

  response.cookies.set(cookie.name, cookie.value, cookie.options as Parameters<typeof response.cookies.set>[2])

  return response
}
