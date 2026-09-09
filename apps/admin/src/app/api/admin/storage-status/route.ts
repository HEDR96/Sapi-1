import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/auth/jwt'
import { getDriveStorageStatus } from '@/lib/storage/google-drive-oauth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { usageBytes, limitBytes } = await getDriveStorageStatus()
    return NextResponse.json({
      usageBytes,
      limitBytes,
      percentUsed: Math.min(100, Math.round((usageBytes / limitBytes) * 1000) / 10),
    })
  } catch (error: any) {
    console.error('[Storage Status] Error:', error.message)
    return NextResponse.json({ error: 'Gagal mengambil status penyimpanan' }, { status: 500 })
  }
}
