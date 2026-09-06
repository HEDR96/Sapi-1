import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const count = await prisma.cattle.count()

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error fetching cattle count:', error)
    return NextResponse.json({ count: 0 }, { status: 500 })
  }
}
