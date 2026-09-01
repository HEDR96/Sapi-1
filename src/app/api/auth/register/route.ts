import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'
import { generateVerificationCode } from '@/lib/auth/jwt'
import { sendVerificationEmail } from '@/lib/email/resend'

export const dynamic = 'force-dynamic'

function generate6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password diperlukan' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      )
    }

    // Check if email already exists in Admin or User
    const existingAdmin = await prisma.admin.findUnique({ where: { email } })
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar sebagai admin' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      // Check if email is already verified
      if (existingUser.emailVerified) {
        return NextResponse.json(
          { error: 'Email sudah terdaftar' },
          { status: 400 }
        )
      }

      // If email exists but NOT verified, delete the unverified record
      // This allows the user to register fresh with a new verification code
      await prisma.user.delete({ where: { id: existingUser.id } })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate verification code
    const verificationCode = generate6DigitCode()
    const verificationExpiry = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    // Create user (unverified) - wrapped in try/catch for race condition with unique email
    try {
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null,
          emailVerified: false,
          verificationCode,
          verificationExpiry,
        },
      })
    } catch (error: any) {
      // Handle race condition where another request created the user with same email
      if (error.code === 'P2002') {
        const newUser = await prisma.user.findUnique({ where: { email } })
        if (newUser?.emailVerified) {
          return NextResponse.json(
            { error: 'Email sudah terdaftar' },
            { status: 400 }
          )
        }
        // If unverified, delete and retry (should be rare)
        if (newUser) {
          await prisma.user.delete({ where: { id: newUser.id } })
          await prisma.user.create({
            data: {
              email,
              password: hashedPassword,
              name: name || null,
              emailVerified: false,
              verificationCode,
              verificationExpiry,
            },
          })
        }
      } else {
        throw error
      }
    }

    // Send verification email
    await sendVerificationEmail(email, verificationCode)

    // In development, still log the code for testing
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Verification code for ${email}: ${verificationCode}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Akun berhasil dibuat. Silakan verifikasi email Anda.',
      // For development only - remove in production
      verificationCode,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
