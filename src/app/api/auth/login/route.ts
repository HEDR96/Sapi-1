import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'
import { generateToken, setAuthCookie } from '@/lib/auth/jwt'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password diperlukan' },
        { status: 400 }
      )
    }

    // Check Admin first
    const admin = await prisma.admin.findUnique({
      where: { email },
    })

    if (admin) {
      const isValidPassword = await bcrypt.compare(password, admin.password)

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Email atau password salah' },
          { status: 401 }
        )
      }

      const token = generateToken({
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
      })

      const cookie = setAuthCookie(token)

      const response = NextResponse.json({
        success: true,
        message: 'Login berhasil',
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      })

      response.cookies.set(cookie.name, cookie.value, cookie.options as Parameters<typeof response.cookies.set>[2])

      return response
    }

    // Check User
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Email belum diverifikasi. Silakan cek email untuk kode verifikasi.' },
        { status: 403 }
      )
    }

    // Check password
    if (user.password) {
      const isValidPassword = await bcrypt.compare(password, user.password)

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Email atau password salah' },
          { status: 401 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Akun ini login dengan Google. Gunakan metode login tersebut.' },
        { status: 401 }
      )
    }

    const token = generateToken({
      adminId: user.id,
      email: user.email,
      role: user.role,
    })

    const cookie = setAuthCookie(token)

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })

    response.cookies.set(cookie.name, cookie.value, cookie.options as Parameters<typeof response.cookies.set>[2])

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
