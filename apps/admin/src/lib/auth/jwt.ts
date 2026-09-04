import jwt, { SignOptions } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { JWTPayload } from '@samadya/shared/types'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  return jwt.sign(payload, JWT_SECRET, options)
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies()
  // Check both cookie names for backward compatibility
  const token = cookieStore.get('auth_token')?.value || cookieStore.get('admin_token')?.value
  return token || null
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  const token = await getTokenFromCookies()
  if (!token) return null
  return verifyToken(token)
}

// Alias for backward compatibility with admin routes
export const getCurrentAdmin = getCurrentUser

export function setAuthCookie(token: string): { name: string; value: string; options: object } {
  return {
    name: 'auth_token',
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24,
      path: '/',
    },
  }
}

export function clearAuthCookie(): { name: string; value: string; options: object } {
  return {
    name: 'auth_token',
    value: '',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 0,
      path: '/',
    },
  }
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
